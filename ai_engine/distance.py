"""
FrameSense AI - Subject Framing Scale Evaluator
Assesses subject distance based on face width to frame width proportion.
Adheres strictly to FrameSense AI PRD Section 8.4.
"""

import math
from typing import Tuple, Optional
from ai_engine.contract import EvaluatorResult, EvaluationStatus

# Biometric framing scale thresholds for portrait composition
DEFAULT_TOO_FAR_THRESHOLD = 0.10     # Subject face occupies < 10% of frame width
DEFAULT_TOO_CLOSE_THRESHOLD = 0.52   # Subject face occupies > 52% of frame width

# Relaxed group shot threshold (multiple faces naturally occupy smaller individual widths)
GROUP_TOO_FAR_THRESHOLD = 0.04


def evaluate_subject_distance(
    face_width: float,
    frame_width: float,
    face_count: int = 1,
) -> Tuple[float, float, Optional[str]]:
    """
    Evaluates subject distance ratio: face_width / frame_width.
    Maintains 100% backward-compatible return signature.

    Returns:
        score (float): Distance score [0.0, 1.0].
        ratio (float): face_width / frame_width ratio.
        message (str | None): Actionable guidance prompt.
    """
    result = evaluate_subject_distance_contract(face_width, frame_width, face_count=face_count)
    return result.score, result.measured_value, result.recommendation


def evaluate_subject_distance_contract(
    face_width: float,
    frame_width: float,
    face_count: int = 1,
) -> EvaluatorResult:
    """
    Evaluates subject framing scale and returns standardized EvaluatorResult contract.
    Supports single portraits and group scenarios without false 'step closer' alarms.
    """
    try:
        fw = float(face_width)
        frm_w = float(frame_width)
        if math.isnan(fw) or math.isinf(fw) or math.isnan(frm_w) or math.isinf(frm_w):
            return EvaluatorResult.unavailable("Non-finite distance inputs")
    except (ValueError, TypeError):
        return EvaluatorResult.unavailable("Invalid distance input types")

    if frm_w <= 0.0 or fw <= 0.0:
        return EvaluatorResult(
            score=0.0,
            measured_value=0.0,
            status=EvaluationStatus.UNAVAILABLE,
            recommendation="Invalid frame dimensions",
            confidence=0.0,
        )

    ratio = max(0.0, fw / frm_w)
    far_threshold = GROUP_TOO_FAR_THRESHOLD if face_count >= 2 else DEFAULT_TOO_FAR_THRESHOLD

    if ratio > DEFAULT_TOO_CLOSE_THRESHOLD:
        score = 0.4
        msg = "Step back slightly (subject too close)"
        status = EvaluationStatus.SUBOPTIMAL
    elif ratio < far_threshold:
        score = 0.4
        msg = "Step closer (subject too far)"
        status = EvaluationStatus.SUBOPTIMAL
    else:
        score = 1.0
        msg = None
        status = EvaluationStatus.OPTIMAL

    return EvaluatorResult(
        score=round(score, 3),
        measured_value=round(ratio, 3),
        status=status,
        recommendation=msg,
        confidence=1.0,
        diagnostics={
            "face_width_px": round(fw, 1),
            "frame_width_px": round(frm_w, 1),
            "face_count": face_count,
        },
    )
