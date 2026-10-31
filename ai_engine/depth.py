"""
FrameSense AI - Monocular Depth & Metric Distance Estimation Engine
Estimates physical metric distance (in feet and meters) between camera lens and subjects
using optical pinhole geometry and face scale, generating precise directional cues like
"Step back 2.5 feet" or "Step closer 1.5 feet".
Adheres to Core Solution & Objective 1 of FrameSense AI.
"""

from typing import Tuple, Optional, List
from ai_engine.contract import EvaluatorResult, EvaluationStatus

# Average human bi-zygomatic (ear-to-ear / cheekbone) facial width in meters
AVERAGE_HUMAN_FACE_WIDTH_M = 0.15  # 15.0 cm ~ 5.9 inches
METERS_TO_FEET = 3.28084

# Calibrated effective focal length for standard 640x480 webcam & front-facing smartphone camera
DEFAULT_FOCAL_LENGTH_PX = 750.0

# Ideal portrait distance boundaries in feet (calibrated for desktop webcam & handheld mobile selfie)
IDEAL_PORTRAIT_DISTANCE_MIN_FT = 1.4  # ~0.42 meters
IDEAL_PORTRAIT_DISTANCE_MAX_FT = 6.2  # ~1.89 meters


def estimate_metric_face_distance(
    face_box: Optional[List[float]],
    frame_width: float = 640.0,
    frame_height: float = 480.0,
    focal_length_px: float = DEFAULT_FOCAL_LENGTH_PX,
) -> Tuple[Optional[float], Optional[float], float, Optional[str]]:
    """
    Computes metric physical distance to subject in meters and feet using pinhole optical geometry.
    Maintains 100% backward-compatible return signature.

    Returns:
        distance_meters (float | None): Distance to face in meters.
        distance_feet (float | None): Distance to face in feet.
        score (float): Distance score [0.0, 1.0].
        message (str | None): Metric guidance prompt (e.g. "Step back 2.0 feet").
    """
    result = estimate_metric_face_distance_contract(
        face_box=face_box,
        frame_width=frame_width,
        frame_height=frame_height,
        focal_length_px=focal_length_px,
    )
    dist_m = result.diagnostics.get("distance_m")
    dist_ft = result.measured_value if result.status != EvaluationStatus.UNAVAILABLE else None
    return dist_m, dist_ft, result.score, result.recommendation


def estimate_metric_face_distance_contract(
    face_box: Optional[List[float]],
    frame_width: float = 640.0,
    frame_height: float = 480.0,
    focal_length_px: float = DEFAULT_FOCAL_LENGTH_PX,
) -> EvaluatorResult:
    """
    Estimates metric distance and returns standardized EvaluatorResult contract.
    """
    if not face_box or len(face_box) < 4 or frame_width <= 0.0:
        return EvaluatorResult(
            score=0.0,
            measured_value=0.0,
            status=EvaluationStatus.UNAVAILABLE,
            recommendation=None,
            confidence=0.0,
        )

    x1, y1, x2, y2 = face_box
    face_pixel_w = abs(x2 - x1)

    if face_pixel_w <= 5.0:
        return EvaluatorResult(
            score=0.3,
            measured_value=0.0,
            status=EvaluationStatus.CRITICAL,
            recommendation="Subject too far for accurate depth",
            confidence=0.2,
        )

    # Pinhole formula: D = (f * W_real) / W_pixel
    # Scale focal length according to actual frame width relative to 640 standard
    f_effective = focal_length_px * (frame_width / 640.0)
    distance_m = (f_effective * AVERAGE_HUMAN_FACE_WIDTH_M) / face_pixel_w
    distance_ft = distance_m * METERS_TO_FEET

    # Evaluate distance quality
    if IDEAL_PORTRAIT_DISTANCE_MIN_FT <= distance_ft <= IDEAL_PORTRAIT_DISTANCE_MAX_FT:
        score = 1.0
        msg = None
        status = EvaluationStatus.OPTIMAL
    elif distance_ft < IDEAL_PORTRAIT_DISTANCE_MIN_FT:
        delta_ft = IDEAL_PORTRAIT_DISTANCE_MIN_FT - distance_ft
        score = max(0.2, 1.0 - (delta_ft / 2.0))
        delta_rounded = max(0.5, round(delta_ft * 2.0) / 2.0)
        msg = f"Step back {delta_rounded:.1f} feet (camera too close)"
        status = EvaluationStatus.SUBOPTIMAL
    else:
        delta_ft = distance_ft - IDEAL_PORTRAIT_DISTANCE_MAX_FT
        score = max(0.2, 1.0 - (delta_ft / 4.0))
        delta_rounded = max(0.5, round(delta_ft * 2.0) / 2.0)
        msg = f"Step closer {delta_rounded:.1f} feet (camera too far)"
        status = EvaluationStatus.SUBOPTIMAL

    return EvaluatorResult(
        score=round(score, 2),
        measured_value=round(distance_ft, 1),
        status=status,
        recommendation=msg,
        confidence=1.0,
        diagnostics={
            "distance_m": round(distance_m, 2),
            "face_pixel_w": round(face_pixel_w, 1),
            "f_effective": round(f_effective, 1),
        },
    )
