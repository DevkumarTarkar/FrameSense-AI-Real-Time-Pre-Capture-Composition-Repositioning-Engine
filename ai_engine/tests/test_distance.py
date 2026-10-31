"""
Unit tests for ai_engine.distance module.
Validates framing scale thresholds, single portrait vs group framing,
boundary conditions, and non-finite guards.
"""

import pytest
from ai_engine.contract import EvaluationStatus
from ai_engine.distance import (
    evaluate_subject_distance,
    evaluate_subject_distance_contract,
    DEFAULT_TOO_FAR_THRESHOLD,
    DEFAULT_TOO_CLOSE_THRESHOLD,
    GROUP_TOO_FAR_THRESHOLD,
)


def test_distance_ideal_portrait():
    """Face width 25% of frame width is ideal -> Score 1.0, status OPTIMAL."""
    res = evaluate_subject_distance_contract(150.0, 600.0, face_count=1)
    assert res.score == 1.0
    assert res.measured_value == 0.25
    assert res.status == EvaluationStatus.OPTIMAL
    assert res.recommendation is None


def test_distance_too_close():
    """Face width > 52% of frame -> Prompt to step back."""
    res = evaluate_subject_distance_contract(330.0, 600.0, face_count=1)  # 55%
    assert res.score == 0.4
    assert res.status == EvaluationStatus.SUBOPTIMAL
    assert "Step back" in res.recommendation


def test_distance_too_far_solo():
    """Face width < 10% in solo portrait -> Prompt to step closer."""
    res = evaluate_subject_distance_contract(48.0, 600.0, face_count=1)  # 8%
    assert res.score == 0.4
    assert res.status == EvaluationStatus.SUBOPTIMAL
    assert "Step closer" in res.recommendation


def test_distance_group_shot_tolerance():
    """
    In group shots (face_count >= 2), individual faces are naturally smaller.
    8% width should NOT trigger false 'step closer' alarm in a group photo.
    """
    res = evaluate_subject_distance_contract(48.0, 600.0, face_count=3)  # 8% width
    assert res.score == 1.0
    assert res.status == EvaluationStatus.OPTIMAL
    assert res.recommendation is None


def test_distance_invalid_inputs():
    """Zero or negative dimensions return UNAVAILABLE with score 0.0."""
    res_zero = evaluate_subject_distance_contract(0.0, 600.0)
    assert res_zero.status == EvaluationStatus.UNAVAILABLE

    res_neg = evaluate_subject_distance_contract(100.0, -500.0)
    assert res_neg.status == EvaluationStatus.UNAVAILABLE


def test_distance_backward_compatibility():
    """Validates legacy tuple return: score, ratio, msg."""
    score, ratio, msg = evaluate_subject_distance(150.0, 600.0)
    assert score == 1.0
    assert ratio == 0.25
    assert msg is None
