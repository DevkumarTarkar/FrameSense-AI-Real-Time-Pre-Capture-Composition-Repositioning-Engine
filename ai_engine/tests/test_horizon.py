"""
Unit tests for ai_engine.horizon module.
Validates mathematical slope-to-roll relationships, positive/negative tilt guidance,
near-zero tolerance deadband, boundary thresholds, and non-finite guards.
"""

import math
import pytest
from ai_engine.contract import EvaluationStatus
from ai_engine.horizon import (
    score_horizon_tilt,
    score_horizon_tilt_contract,
    LEVEL_TOLERANCE_DEG,
    MAX_TILT_TOLERANCE_DEG,
)


def test_horizon_near_zero_level():
    """Tilt within +/- 2.0 degrees is optimal and produces NO corrective recommendation."""
    for angle in [0.0, 0.5, -0.8, 1.9, -2.0]:
        res = score_horizon_tilt_contract(angle)
        assert res.score == 1.0
        assert res.status == EvaluationStatus.OPTIMAL
        assert res.recommendation is None
        assert res.confidence == 1.0


def test_horizon_positive_tilt_direction():
    """
    Positive tilt angle (downward slope to the right in sensor coordinates):
    Camera is rolled counter-clockwise (tilted left).
    Correction: Must prompt user to tilt right.
    """
    # Moderate tilt (e.g. +6.5 degrees)
    res_mod = score_horizon_tilt_contract(6.5)
    assert 0.0 < res_mod.score < 1.0
    assert res_mod.status == EvaluationStatus.SUBOPTIMAL
    assert res_mod.recommendation == "Level camera: tilt right slightly"

    # Severe tilt (e.g. +16.0 degrees >= 15.0)
    res_severe = score_horizon_tilt_contract(16.0)
    assert res_severe.score == 0.0
    assert res_severe.status == EvaluationStatus.CRITICAL
    assert res_severe.recommendation == "Level camera: tilt right"


def test_horizon_negative_tilt_direction():
    """
    Negative tilt angle (upward slope to the right in sensor coordinates):
    Camera is rolled clockwise (tilted right).
    Correction: Must prompt user to tilt left.
    """
    # Moderate tilt (e.g. -6.5 degrees)
    res_mod = score_horizon_tilt_contract(-6.5)
    assert 0.0 < res_mod.score < 1.0
    assert res_mod.status == EvaluationStatus.SUBOPTIMAL
    assert res_mod.recommendation == "Level camera: tilt left slightly"

    # Severe tilt (e.g. -18.0 degrees <= -15.0)
    res_severe = score_horizon_tilt_contract(-18.0)
    assert res_severe.score == 0.0
    assert res_severe.status == EvaluationStatus.CRITICAL
    assert res_severe.recommendation == "Level camera: tilt left"


def test_horizon_exact_boundaries():
    """Exact boundary conditions at 2.0 and 15.0 degrees."""
    # Boundary at tolerance limit (2.0 deg)
    res_2 = score_horizon_tilt_contract(LEVEL_TOLERANCE_DEG)
    assert res_2.score == 1.0
    assert res_2.recommendation is None

    # Boundary at max tolerance limit (15.0 deg)
    res_15 = score_horizon_tilt_contract(MAX_TILT_TOLERANCE_DEG)
    assert res_15.score == 0.0
    assert res_15.recommendation == "Level camera: tilt right"

    res_neg_15 = score_horizon_tilt_contract(-MAX_TILT_TOLERANCE_DEG)
    assert res_neg_15.score == 0.0
    assert res_neg_15.recommendation == "Level camera: tilt left"


def test_horizon_no_detection():
    """When tilt_degrees is None (no horizon visible in frame), status is UNAVAILABLE without penalty."""
    res = score_horizon_tilt_contract(None)
    assert res.score == 1.0
    assert res.measured_value == 0.0
    assert res.status == EvaluationStatus.UNAVAILABLE
    assert res.recommendation is None
    assert res.confidence == 0.0
    assert res.diagnostics.get("detected") is False


def test_horizon_non_finite_inputs():
    """Guards against NaN and Infinity values."""
    res_nan = score_horizon_tilt_contract(float("nan"))
    assert res_nan.status == EvaluationStatus.UNAVAILABLE
    assert res_nan.score == 0.0

    res_inf = score_horizon_tilt_contract(float("inf"))
    assert res_inf.status == EvaluationStatus.UNAVAILABLE
    assert res_inf.score == 0.0


def test_horizon_backward_compatibility_tuple_api():
    """Validates legacy score_horizon_tilt returning (score, angle, msg)."""
    score, angle, msg = score_horizon_tilt(1.0)
    assert score == 1.0
    assert angle == 1.0
    assert msg is None

    score_pos, angle_pos, msg_pos = score_horizon_tilt(8.0)
    assert 0.0 < score_pos < 1.0
    assert angle_pos == 8.0
    assert msg_pos == "Level camera: tilt right slightly"

    score_none, angle_none, msg_none = score_horizon_tilt(None)
    assert score_none == 1.0
    assert angle_none is None
    assert msg_none is None
