"""
Unit tests for ai_engine.lighting module.
Validates background masking without ROI contamination, harsh backlighting,
underexposed silhouettes, overexposed glare, and unavailable signal handling.
"""

import numpy as np
import pytest
from ai_engine.contract import EvaluationStatus
from ai_engine.lighting import (
    evaluate_face_lighting,
    evaluate_face_lighting_contract,
    MIN_FACE_LUMINANCE,
    HARSH_GLARE_LUMINANCE,
)


def test_lighting_balanced():
    """Face and background both well-lit and balanced -> Score 1.0, status balanced."""
    frame = np.full((400, 400, 3), 130, dtype=np.uint8)
    face_box = [100.0, 100.0, 300.0, 300.0]
    frame[100:300, 100:300] = 120

    res = evaluate_face_lighting_contract(frame, face_box)
    assert res.score == 1.0
    assert res.status == EvaluationStatus.OPTIMAL
    assert res.diagnostics.get("lighting_status") == "balanced"
    assert res.recommendation is None


def test_lighting_backlight_with_face_masking():
    """
    Face is in dark shadow (lum 50) while background is bright (lum 200).
    Verifies that background luminance calculation masks out the face so the face does
    not drag down the background metric.
    """
    frame = np.full((400, 400, 3), 200, dtype=np.uint8)
    face_box = [100.0, 100.0, 300.0, 300.0]
    frame[100:300, 100:300] = 50

    res = evaluate_face_lighting_contract(frame, face_box)
    assert res.score < 0.7
    assert res.diagnostics.get("lighting_status") == "backlight"
    assert res.recommendation is not None
    assert "Backlight warning" in res.recommendation
    assert res.diagnostics.get("bg_lum") == 200.0


def test_lighting_underexposed_dark():
    """Entire scene and face are dark (< 52 luminance) -> Prompt to increase lighting."""
    frame = np.full((400, 400, 3), 30, dtype=np.uint8)
    face_box = [100.0, 100.0, 250.0, 250.0]

    res = evaluate_face_lighting_contract(frame, face_box)
    assert res.score <= 0.5
    assert res.diagnostics.get("lighting_status") == "dark"
    assert "Scene too dark" in res.recommendation


def test_lighting_harsh_glare():
    """Face is blown out (> 218 luminance or clipped pixels) -> Prompt to soften light."""
    frame = np.full((400, 400, 3), 120, dtype=np.uint8)
    face_box = [100.0, 100.0, 250.0, 250.0]
    frame[100:250, 100:250] = 235

    res = evaluate_face_lighting_contract(frame, face_box)
    assert res.score <= 0.65
    assert res.diagnostics.get("lighting_status") == "glare"
    assert "Harsh glare" in res.recommendation


def test_lighting_missing_inputs_unavailable():
    """Missing or invalid frame/box returns UNAVAILABLE with 0 score (no fake passes)."""
    # Empty box
    res_none = evaluate_face_lighting_contract(np.zeros((100, 100, 3), dtype=np.uint8), None)
    assert res_none.status == EvaluationStatus.UNAVAILABLE
    assert res_none.score == 0.0

    # None frame
    res_no_frame = evaluate_face_lighting_contract(None, [10, 10, 50, 50])
    assert res_no_frame.status == EvaluationStatus.UNAVAILABLE
    assert res_no_frame.score == 0.0


def test_lighting_backward_compatibility():
    """Validates legacy tuple return: score, lum, status, msg."""
    frame = np.full((400, 400, 3), 130, dtype=np.uint8)
    face_box = [100.0, 100.0, 300.0, 300.0]
    frame[100:300, 100:300] = 120

    score, lum, status, msg = evaluate_face_lighting(frame, face_box)
    assert score == 1.0
    assert round(lum, 1) == 120.0
    assert status == "balanced"
    assert msg is None
