"""
FrameSense AI - Horizon Tilt Evaluator
Pure mathematical scoring for horizon levelness without any direct OpenCV dependency.
Adheres strictly to FrameSense AI PRD Section 8.3.
"""

from typing import Tuple, Optional
from ai_engine.contract import EvaluatorResult, EvaluationStatus

LEVEL_TOLERANCE_DEG = 2.0
MAX_TILT_TOLERANCE_DEG = 15.0


def score_horizon_tilt(
    tilt_degrees: Optional[float],
) -> Tuple[float, Optional[float], Optional[str]]:
    """
    Evaluates horizon tilt angle theta in degrees.
    Maintains 100% backward-compatible return signature.

    Returns:
        score (float): Horizon level score [0.0, 1.0].
        angle (float | None): Reported angle in degrees.
        message (str | None): Actionable guidance prompt.
    """
    result = score_horizon_tilt_contract(tilt_degrees)
    angle = result.measured_value if result.status != EvaluationStatus.UNAVAILABLE else None
    return result.score, angle, result.recommendation


def score_horizon_tilt_contract(
    tilt_degrees: Optional[float],
) -> EvaluatorResult:
    """
    Evaluates horizon tilt and returns standardized EvaluatorResult contract.
    """
    if tilt_degrees is None:
        # PRD §8.3: No confident horizon found (e.g. tight portrait) -> do NOT penalize
        return EvaluatorResult(
            score=1.0,
            measured_value=0.0,
            status=EvaluationStatus.UNAVAILABLE,
            recommendation=None,
            confidence=0.5,
            diagnostics={"detected": False},
        )

    abs_tilt = abs(tilt_degrees)

    if abs_tilt <= LEVEL_TOLERANCE_DEG:
        return EvaluatorResult(
            score=1.0,
            measured_value=round(tilt_degrees, 1),
            status=EvaluationStatus.OPTIMAL,
            recommendation=None,
            confidence=1.0,
            diagnostics={"abs_tilt": round(abs_tilt, 2)},
        )

    if abs_tilt >= MAX_TILT_TOLERANCE_DEG:
        msg = "Level camera: tilt left" if tilt_degrees > 0 else "Level camera: tilt right"
        return EvaluatorResult(
            score=0.0,
            measured_value=round(tilt_degrees, 1),
            status=EvaluationStatus.CRITICAL,
            recommendation=msg,
            confidence=1.0,
            diagnostics={"abs_tilt": round(abs_tilt, 2)},
        )

    # Linear falloff between 2.0 and 15.0 degrees
    span = MAX_TILT_TOLERANCE_DEG - LEVEL_TOLERANCE_DEG
    excess = abs_tilt - LEVEL_TOLERANCE_DEG
    score = max(0.0, 1.0 - (excess / span))
    msg = "Level camera: tilt left slightly" if tilt_degrees > 0 else "Level camera: tilt right slightly"

    return EvaluatorResult(
        score=round(score, 3),
        measured_value=round(tilt_degrees, 1),
        status=EvaluationStatus.SUBOPTIMAL,
        recommendation=msg,
        confidence=1.0,
        diagnostics={"abs_tilt": round(abs_tilt, 2), "excess_deg": round(excess, 2)},
    )
