"""
Unit tests for ai_engine.contract module.
Validates numerical clamping, non-finite guards, enum normalization,
legacy unpacking compatibility, and immutability.
"""

import math
import pytest
from dataclasses import FrozenInstanceError
from ai_engine.contract import EvaluationStatus, EvaluatorResult


def test_evaluator_result_valid_initialization():
    result = EvaluatorResult(
        score=0.85,
        measured_value=12.4,
        status=EvaluationStatus.OPTIMAL,
        recommendation=None,
        confidence=0.95,
        target_coordinates=(0.33, 0.33),
        diagnostics={"detector": "test"},
    )
    assert result.score == 0.85
    assert result.measured_value == 12.4
    assert result.status == EvaluationStatus.OPTIMAL
    assert result.recommendation is None
    assert result.confidence == 0.95
    assert result.target_coordinates == (0.33, 0.33)
    assert result.diagnostics == {"detector": "test"}


def test_evaluator_result_score_clamping():
    # Clamping upper bound
    res_high = EvaluatorResult(score=1.5, measured_value=1.0, status=EvaluationStatus.OPTIMAL)
    assert res_high.score == 1.0

    # Clamping lower bound
    res_low = EvaluatorResult(score=-0.2, measured_value=1.0, status=EvaluationStatus.SUBOPTIMAL)
    assert res_low.score == 0.0


def test_evaluator_result_confidence_clamping():
    res_high_conf = EvaluatorResult(score=0.5, measured_value=1.0, status=EvaluationStatus.OPTIMAL, confidence=2.0)
    assert res_high_conf.confidence == 1.0

    res_low_conf = EvaluatorResult(score=0.5, measured_value=1.0, status=EvaluationStatus.OPTIMAL, confidence=-0.5)
    assert res_low_conf.confidence == 0.0


def test_evaluator_result_nan_and_inf_guards():
    # NaN score should be converted to 0.0 and mark status UNAVAILABLE
    res_nan_score = EvaluatorResult(score=float("nan"), measured_value=5.0, status=EvaluationStatus.OPTIMAL)
    assert res_nan_score.score == 0.0
    assert res_nan_score.status == EvaluationStatus.UNAVAILABLE

    # Inf score
    res_inf_score = EvaluatorResult(score=float("inf"), measured_value=5.0, status=EvaluationStatus.OPTIMAL)
    assert res_inf_score.score == 0.0
    assert res_inf_score.status == EvaluationStatus.UNAVAILABLE

    # NaN measured_value
    res_nan_val = EvaluatorResult(score=0.8, measured_value=float("nan"), status=EvaluationStatus.OPTIMAL)
    assert res_nan_val.measured_value == 0.0
    assert res_nan_val.status == EvaluationStatus.UNAVAILABLE

    # Inf confidence
    res_inf_conf = EvaluatorResult(score=0.8, measured_value=1.0, status=EvaluationStatus.OPTIMAL, confidence=float("inf"))
    assert res_inf_conf.confidence == 0.0


def test_evaluator_result_status_string_normalization():
    # Pass plain string instead of enum
    res = EvaluatorResult(score=0.7, measured_value=2.0, status="optimal")
    assert isinstance(res.status, EvaluationStatus)
    assert res.status == EvaluationStatus.OPTIMAL

    # Invalid status string fallback to UNAVAILABLE
    res_invalid = EvaluatorResult(score=0.7, measured_value=2.0, status="unknown_status")
    assert res_invalid.status == EvaluationStatus.UNAVAILABLE


def test_evaluator_result_unavailable_constructor():
    unavail = EvaluatorResult.unavailable(reason="No subject detected", diagnostics={"frame_id": 42})
    assert unavail.score == 0.0
    assert unavail.measured_value == 0.0
    assert unavail.status == EvaluationStatus.UNAVAILABLE
    assert unavail.recommendation == "No subject detected"
    assert unavail.confidence == 0.0
    assert unavail.diagnostics["unavailable_reason"] == "No subject detected"
    assert unavail.diagnostics["frame_id"] == 42


def test_evaluator_result_backward_compatibility_unpacking():
    res = EvaluatorResult(
        score=0.82,
        measured_value=4.5,
        status=EvaluationStatus.SUBOPTIMAL,
        recommendation="Adjust slightly",
    )
    # 1. Tuple unpacking: score, measured_value, recommendation
    score, val, rec = res
    assert score == 0.82
    assert val == 4.5
    assert rec == "Adjust slightly"

    # 2. Index-based access
    assert res[0] == 0.82
    assert res[1] == 4.5
    assert res[2] == "Adjust slightly"

    # 3. Length check
    assert len(res) == 3


def test_evaluator_result_immutability():
    res = EvaluatorResult(score=0.9, measured_value=1.0, status=EvaluationStatus.OPTIMAL)
    with pytest.raises(FrozenInstanceError):
        res.score = 0.5
