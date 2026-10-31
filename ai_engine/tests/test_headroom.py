"""
Unit tests for ai_engine.headroom module.
Validates physical camera tilt directions, contextual headroom bands,
anatomical cranial compensation, boundary conditions, and non-finite guards.
"""

import math
import pytest
from ai_engine.contract import EvaluationStatus
from ai_engine.headroom import (
    evaluate_headroom,
    evaluate_headroom_contract,
    get_contextual_headroom_bands,
    DEFAULT_IDEAL_HEADROOM_MIN,
    DEFAULT_IDEAL_HEADROOM_MAX,
    DEFAULT_MAX_ACCEPTABLE_HEADROOM,
)


def test_headroom_optimal():
    """Within [0.10, 0.18] for standard portrait, score is 1.0 with no correction message."""
    frame_h = 1000.0
    head_y = 140.0  # 14% headroom

    res = evaluate_headroom_contract(head_y, frame_h)
    assert res.score == 1.0
    assert res.measured_value == 0.14
    assert res.status == EvaluationStatus.OPTIMAL
    assert res.recommendation is None
    assert res.confidence == 1.0


def test_headroom_exact_boundaries():
    """Exact boundary values 0.10 and 0.18 should both score 1.0 with no message."""
    frame_h = 1000.0
    res_min = evaluate_headroom_contract(100.0, frame_h)
    assert res_min.score == 1.0
    assert res_min.status == EvaluationStatus.OPTIMAL
    assert res_min.recommendation is None

    res_max = evaluate_headroom_contract(180.0, frame_h)
    assert res_max.score == 1.0
    assert res_max.status == EvaluationStatus.OPTIMAL
    assert res_max.recommendation is None


def test_headroom_insufficient_direction():
    """
    Head too close to frame top (< 0.10):
    Physics: Tilting camera UP shifts viewfinder down, creating needed headroom above head.
    """
    frame_h = 1000.0
    head_y = 40.0  # 4% headroom

    res = evaluate_headroom_contract(head_y, frame_h)
    assert res.score < 0.5
    assert res.measured_value == 0.04
    assert res.status == EvaluationStatus.CRITICAL  # < 0.04 is critical
    assert res.recommendation is not None
    assert "Tilt camera up" in res.recommendation
    assert "headroom too tight" in res.recommendation


def test_headroom_excessive_direction_mild():
    """
    Head slightly too low (e.g. 22% headroom):
    Physics: Tilting camera DOWN shifts viewfinder up, reducing excessive dead headroom.
    """
    frame_h = 1000.0
    head_y = 220.0  # 22% headroom

    res = evaluate_headroom_contract(head_y, frame_h)
    assert res.score < 1.0
    assert res.status == EvaluationStatus.SUBOPTIMAL
    assert res.recommendation == "Tilt camera down slightly"


def test_headroom_excessive_direction_severe():
    """
    Head severely too low (> 25% headroom):
    Prompts user to tilt down or step closer.
    """
    frame_h = 1000.0
    head_y = 300.0  # 30% headroom

    res = evaluate_headroom_contract(head_y, frame_h)
    assert res.score < 0.5
    assert res.recommendation is not None
    assert "Tilt camera down or step closer" in res.recommendation


def test_headroom_cranial_compensation():
    """
    Cranial compensation shifts top-of-head estimation up by ~20% of face height.
    Eyebrows at 150px on 1000px frame with 200px face -> cranial top is at 110px.
    """
    frame_h = 1000.0
    eyebrow_y = 150.0
    face_h = 200.0

    res_raw = evaluate_headroom_contract(eyebrow_y, frame_h, face_height=face_h, apply_cranial_compensation=False)
    assert res_raw.measured_value == 0.15

    res_comp = evaluate_headroom_contract(eyebrow_y, frame_h, face_height=face_h, apply_cranial_compensation=True)
    assert res_comp.measured_value == 0.11
    assert res_comp.status == EvaluationStatus.OPTIMAL


def test_headroom_contextual_bands():
    """Close-up portraits require tighter headroom, wide shots allow more headroom."""
    # Close-up (face ratio = 0.45)
    c_min, c_max, _ = get_contextual_headroom_bands(0.45)
    assert c_min == 0.05
    assert c_max == 0.12

    # Wide shot (face ratio = 0.08)
    w_min, w_max, _ = get_contextual_headroom_bands(0.08)
    assert w_min == 0.12
    assert w_max == 0.22

    # Default / None
    d_min, d_max, _ = get_contextual_headroom_bands(None)
    assert d_min == DEFAULT_IDEAL_HEADROOM_MIN
    assert d_max == DEFAULT_IDEAL_HEADROOM_MAX


def test_headroom_invalid_and_non_finite_inputs():
    """Guards against frame_height <= 0, NaN, and Inf."""
    # Non-positive frame height
    res_zero_h = evaluate_headroom_contract(50.0, 0.0)
    assert res_zero_h.status == EvaluationStatus.UNAVAILABLE
    assert res_zero_h.confidence == 0.0

    res_neg_h = evaluate_headroom_contract(50.0, -100.0)
    assert res_neg_h.status == EvaluationStatus.UNAVAILABLE

    # NaN / Inf coordinates
    res_nan = evaluate_headroom_contract(float("nan"), 1000.0)
    assert res_nan.status == EvaluationStatus.UNAVAILABLE

    res_inf = evaluate_headroom_contract(100.0, float("inf"))
    assert res_inf.status == EvaluationStatus.UNAVAILABLE


def test_headroom_backward_compatibility_tuple_api():
    """Validates legacy evaluate_headroom returning (score, ratio, msg)."""
    score, ratio, msg = evaluate_headroom(140.0, 1000.0)
    assert score == 1.0
    assert ratio == 0.14
    assert msg is None

    score_tight, ratio_tight, msg_tight = evaluate_headroom(40.0, 1000.0)
    assert score_tight < 0.5
    assert ratio_tight == 0.04
    assert "Tilt camera up" in msg_tight
