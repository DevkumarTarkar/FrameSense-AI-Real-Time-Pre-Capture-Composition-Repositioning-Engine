"""
FrameSense AI - Headroom & Vertical Framing Intelligence Engine
Calculates anatomical top-of-skull clearance, evaluates negative cranial space,
and generates context-adaptive vertical framing and camera tilt guidance.
Adheres strictly to FrameSense AI PRD Section 8.2 and Cinematography Standards.
"""

import math
from typing import Tuple, Optional
from ai_engine.contract import EvaluatorResult, EvaluationStatus

# Biometric cranial scaling factor: MediaPipe bbox starts near eyebrows/upper forehead.
# Average human cranial height above eyebrows represents ~20% of facial vertical length.
DEFAULT_CRANIAL_SCALING_FACTOR = 0.20

# Standard PRD Section 8.2 headroom thresholds for portraiture
DEFAULT_IDEAL_HEADROOM_MIN = 0.10
DEFAULT_IDEAL_HEADROOM_MAX = 0.18
DEFAULT_MAX_ACCEPTABLE_HEADROOM = 0.35


def get_contextual_headroom_bands(face_height_ratio: Optional[float]) -> Tuple[float, float, float]:
    """
    Selects mathematically optimal headroom boundaries according to shot scale.

    Parameters:
        face_height_ratio (float | None): Ratio of face height to total frame height.

    Returns:
        ideal_min (float), ideal_max (float), max_acceptable (float)
    """
    if face_height_ratio is None:
        return DEFAULT_IDEAL_HEADROOM_MIN, DEFAULT_IDEAL_HEADROOM_MAX, DEFAULT_MAX_ACCEPTABLE_HEADROOM

    # 1. Extreme Close-up portrait (face occupies > 38% of frame height)
    if face_height_ratio > 0.38:
        return 0.05, 0.12, 0.25

    # 2. Wide / Environmental / Full body shot (face occupies < 12% of frame height)
    if face_height_ratio < 0.12:
        return 0.12, 0.22, 0.40

    # 3. Standard portrait / Torso shot (PRD default)
    return DEFAULT_IDEAL_HEADROOM_MIN, DEFAULT_IDEAL_HEADROOM_MAX, DEFAULT_MAX_ACCEPTABLE_HEADROOM


def evaluate_headroom(
    head_top_y: float,
    frame_height: float,
    face_height: Optional[float] = None,
    apply_cranial_compensation: bool = False,
) -> Tuple[float, float, Optional[str]]:
    """
    Evaluates vertical headroom ratio and actionable tilt recommendations.
    Maintains 100% backward-compatible signature.

    Parameters:
        head_top_y (float): Y pixel coordinate of face bounding box top (0 is top of frame).
        frame_height (float): Total height of the frame in pixels.
        face_height (float | None): Height of the face bounding box in pixels.
        apply_cranial_compensation (bool): Apply anatomical cranial scaling above eyebrows.

    Returns:
        score (float): Normalized headroom score [0.0, 1.0].
        ratio (float): Measured clearance ratio relative to frame height.
        message (str | None): Actionable guidance prompt or None if optimal.
    """
    result = evaluate_headroom_contract(
        head_top_y=head_top_y,
        frame_height=frame_height,
        face_height=face_height,
        apply_cranial_compensation=apply_cranial_compensation,
    )
    return result.score, result.measured_value, result.recommendation


def evaluate_headroom_contract(
    head_top_y: float,
    frame_height: float,
    face_height: Optional[float] = None,
    apply_cranial_compensation: bool = False,
) -> EvaluatorResult:
    """
    Evaluates headroom and returns standardized EvaluatorResult contract.

    Physics and Coordinate Conventions:
    - Image Y-axis originates at top (0.0) and increases downwards.
    - If headroom is insufficient (head_top_y near 0):
      Tilting the camera UP shifts the viewfinder scene downward, restoring positive clearance.
    - If headroom is excessive (head_top_y too large):
      Tilting the camera DOWN shifts the viewfinder scene upward, reducing wasted dead space.
    """
    try:
        head_y = float(head_top_y)
        f_height = float(frame_height)
        if math.isnan(head_y) or math.isinf(head_y) or math.isnan(f_height) or math.isinf(f_height):
            return EvaluatorResult.unavailable("Non-finite input coordinates")
    except (ValueError, TypeError):
        return EvaluatorResult.unavailable("Invalid input types")

    if f_height <= 0.0:
        return EvaluatorResult.unavailable("Invalid frame height (<= 0)", {"error": "frame_height <= 0"})

    # Estimate anatomical top of head (hair vertex) when cranial compensation is requested with face height
    if apply_cranial_compensation and face_height is not None:
        try:
            fh = float(face_height)
            if not (math.isnan(fh) or math.isinf(fh)) and fh > 0.0:
                cranial_offset = DEFAULT_CRANIAL_SCALING_FACTOR * fh
                true_skull_top_y = max(0.0, head_y - cranial_offset)
            else:
                true_skull_top_y = head_y
        except (ValueError, TypeError):
            true_skull_top_y = head_y
    else:
        true_skull_top_y = head_y

    ratio = max(0.0, true_skull_top_y / f_height)
    face_ratio = None
    if face_height is not None:
        try:
            fh = float(face_height)
            if not (math.isnan(fh) or math.isinf(fh)) and fh > 0.0:
                face_ratio = fh / f_height
        except (ValueError, TypeError):
            pass

    ideal_min, ideal_max, max_acceptable = get_contextual_headroom_bands(face_ratio)

    # Optimal range: no corrective action required
    if ideal_min <= ratio <= ideal_max:
        return EvaluatorResult(
            score=1.0,
            measured_value=round(ratio, 3),
            status=EvaluationStatus.OPTIMAL,
            recommendation=None,
            confidence=1.0,
            diagnostics={
                "band": (ideal_min, ideal_max),
                "true_skull_top_y": round(true_skull_top_y, 1),
                "face_ratio": round(face_ratio, 3) if face_ratio else None,
            },
        )

    # Headroom too tight / head clipped at top: instruct camera to tilt UP
    if ratio < ideal_min:
        score = max(0.0, ratio / ideal_min)
        status = EvaluationStatus.CRITICAL if ratio < (ideal_min * 0.4) else EvaluationStatus.SUBOPTIMAL
        msg = "Tilt camera up (headroom too tight)"
        return EvaluatorResult(
            score=round(score, 3),
            measured_value=round(ratio, 3),
            status=status,
            recommendation=msg,
            confidence=1.0,
            diagnostics={"reason": "insufficient_headroom", "deficit": round(ideal_min - ratio, 3)},
        )

    # Excessive headroom / dead space above head: instruct camera to tilt DOWN
    excess = ratio - ideal_max
    span = max(0.01, max_acceptable - ideal_max)
    score = max(0.0, 1.0 - (excess / span))
    status = EvaluationStatus.SUBOPTIMAL if score > 0.4 else EvaluationStatus.CRITICAL

    if ratio > 0.25:
        msg = "Tilt camera down or step closer (excessive headroom)"
    else:
        msg = "Tilt camera down slightly"

    return EvaluatorResult(
        score=round(score, 3),
        measured_value=round(ratio, 3),
        status=status,
        recommendation=msg,
        confidence=1.0,
        diagnostics={"reason": "excessive_headroom", "excess": round(excess, 3)},
    )
