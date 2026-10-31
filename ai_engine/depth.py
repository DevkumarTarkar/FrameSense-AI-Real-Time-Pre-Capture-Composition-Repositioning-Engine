"""
FrameSense AI - Monocular Depth & Metric Distance Estimation Engine
Estimates physical metric distance (in feet and meters) between camera lens and subjects
using optical pinhole geometry, camera intrinsic calibration, facial anthropometry,
and yaw-foreshortening compensation.
Generates context-adaptive directional cues for selfies, portraits, full-body, and group shots.
Adheres to Core Solution & Objective 1 of FrameSense AI.
"""

import math
from dataclasses import dataclass, field
from enum import Enum
from typing import Tuple, Optional, List, Dict, Any
from ai_engine.contract import EvaluatorResult, EvaluationStatus

# Anthropometric face width: 50th percentile adult bizygomatic diameter (ANSUR II / CDC)
AVERAGE_HUMAN_FACE_WIDTH_M = 0.150  # 15.0 cm ~ 5.91 inches
ANTHROPOMETRIC_UNCERTAINTY_RATIO = 0.10  # +/- 10% standard biometric variance (13.5 cm to 16.5 cm)

# Unit conversion constant (exact international foot definition: 1 ft = 0.3048 m)
METERS_TO_FEET = 3.280839895013123

# Default fallback focal length for standard uncalibrated 640x480 webcam (~55 deg HFOV)
DEFAULT_FOCAL_LENGTH_PX = 750.0


class PortraitPreset(str, Enum):
    """Photography distance presets defining context-adaptive framing boundaries."""
    SELFIE = "selfie"
    CLOSE_UP = "close_up"
    MEDIUM_PORTRAIT = "medium_portrait"
    FULL_BODY = "full_body"
    GROUP = "group"


# Ideal distance boundaries per photography preset: (min_meters, max_meters)
PRESET_DISTANCE_BOUNDARIES: Dict[str, Tuple[float, float]] = {
    PortraitPreset.SELFIE.value: (0.35, 0.75),           # ~1.1 - 2.5 ft
    PortraitPreset.CLOSE_UP.value: (0.65, 1.25),         # ~2.1 - 4.1 ft
    PortraitPreset.MEDIUM_PORTRAIT.value: (0.85, 1.95),  # ~2.8 - 6.4 ft (Standard PRD ideal portraiture)
    PortraitPreset.FULL_BODY.value: (2.50, 4.50),        # ~8.2 - 14.8 ft
    PortraitPreset.GROUP.value: (2.00, 4.00),            # ~6.6 - 13.1 ft
}


@dataclass(frozen=True)
class CameraCalibration:
    """
    Pinhole camera intrinsic calibration model.

    Attributes:
        fx (float): Horizontal focal length in pixels.
        fy (float): Vertical focal length in pixels.
        cx (float): Principal point X coordinate in pixels.
        cy (float): Principal point Y coordinate in pixels.
        image_width (float): Sensor / image width in pixels.
        image_height (float): Sensor / image height in pixels.
        is_calibrated (bool): True if derived from physical calibration; False if approximated.
    """
    fx: float
    fy: float
    cx: float
    cy: float
    image_width: float
    image_height: float
    is_calibrated: bool = True

    @classmethod
    def from_hfov(
        cls,
        hfov_degrees: float,
        width: float,
        height: float,
        is_calibrated: bool = False,
    ) -> "CameraCalibration":
        """Constructs calibration model from horizontal field-of-view angle."""
        if hfov_degrees <= 0.0 or hfov_degrees >= 180.0 or width <= 0.0 or height <= 0.0:
            f_fallback = 750.0 * (width / 640.0) if width > 0 else 750.0
            return cls(f_fallback, f_fallback, width / 2.0, height / 2.0, width, height, False)

        hfov_rad = math.radians(hfov_degrees)
        fx = width / (2.0 * math.tan(hfov_rad / 2.0))
        return cls(
            fx=fx,
            fy=fx,
            cx=width / 2.0,
            cy=height / 2.0,
            image_width=width,
            image_height=height,
            is_calibrated=is_calibrated,
        )

    def scale_uniform(self, scale_factor: float) -> "CameraCalibration":
        """Scales camera intrinsic parameters when an image is resized uniformly."""
        if scale_factor <= 0.0:
            return self
        return CameraCalibration(
            fx=self.fx * scale_factor,
            fy=self.fy * scale_factor,
            cx=self.cx * scale_factor,
            cy=self.cy * scale_factor,
            image_width=self.image_width * scale_factor,
            image_height=self.image_height * scale_factor,
            is_calibrated=self.is_calibrated,
        )

    def apply_crop(
        self,
        crop_x: float,
        crop_y: float,
        cropped_width: float,
        cropped_height: float,
    ) -> "CameraCalibration":
        """Updates principal point when an image is cropped (focal length remains unchanged)."""
        return CameraCalibration(
            fx=self.fx,
            fy=self.fy,
            cx=max(0.0, self.cx - crop_x),
            cy=max(0.0, self.cy - crop_y),
            image_width=cropped_width,
            image_height=cropped_height,
            is_calibrated=self.is_calibrated,
        )


@dataclass(frozen=True)
class MetricDistanceResult:
    """Comprehensive structured result of metric distance evaluation."""
    distance_meters: Optional[float]
    distance_feet: Optional[float]
    uncertainty_meters: Optional[float]
    uncertainty_feet: Optional[float]
    score: float
    status: EvaluationStatus
    recommendation: Optional[str]
    confidence: float
    target_preset: str
    target_distance_range_m: Tuple[float, float]
    diagnostics: Dict[str, Any] = field(default_factory=dict)


def estimate_metric_face_distance(
    face_box: Optional[List[float]],
    frame_width: float = 640.0,
    frame_height: float = 480.0,
    focal_length_px: float = DEFAULT_FOCAL_LENGTH_PX,
    calibration: Optional[CameraCalibration] = None,
    subject_yaw: Optional[float] = None,
    target_preset: str = "medium_portrait",
) -> Tuple[Optional[float], Optional[float], float, Optional[str]]:
    """
    Computes metric physical distance to subject in meters and feet using pinhole optical geometry.
    Maintains 100% backward-compatible return signature: (dist_m, dist_ft, score, recommendation).

    Returns:
        distance_meters (float | None): Estimated metric distance in meters.
        distance_feet (float | None): Estimated metric distance in feet.
        score (float): Normalized composition framing distance score [0.0, 1.0].
        message (str | None): Actionable guidance prompt (e.g. "Step back 2.0 feet").
    """
    detailed = estimate_metric_distance_detailed(
        face_box=face_box,
        frame_width=frame_width,
        frame_height=frame_height,
        focal_length_px=focal_length_px,
        calibration=calibration,
        subject_yaw=subject_yaw,
        target_preset=target_preset,
    )
    return (
        detailed.distance_meters,
        detailed.distance_feet,
        detailed.score,
        detailed.recommendation,
    )


def estimate_metric_face_distance_contract(
    face_box: Optional[List[float]],
    frame_width: float = 640.0,
    frame_height: float = 480.0,
    focal_length_px: float = DEFAULT_FOCAL_LENGTH_PX,
    calibration: Optional[CameraCalibration] = None,
    subject_yaw: Optional[float] = None,
    target_preset: str = "medium_portrait",
) -> EvaluatorResult:
    """
    Estimates metric distance and returns standardized EvaluatorResult contract.
    """
    detailed = estimate_metric_distance_detailed(
        face_box=face_box,
        frame_width=frame_width,
        frame_height=frame_height,
        focal_length_px=focal_length_px,
        calibration=calibration,
        subject_yaw=subject_yaw,
        target_preset=target_preset,
    )
    return EvaluatorResult(
        score=detailed.score,
        measured_value=detailed.distance_feet if detailed.distance_feet is not None else 0.0,
        status=detailed.status,
        recommendation=detailed.recommendation,
        confidence=detailed.confidence,
        diagnostics=detailed.diagnostics,
    )


def estimate_metric_distance_detailed(
    face_box: Optional[List[float]],
    frame_width: float = 640.0,
    frame_height: float = 480.0,
    focal_length_px: float = DEFAULT_FOCAL_LENGTH_PX,
    calibration: Optional[CameraCalibration] = None,
    subject_yaw: Optional[float] = None,
    target_preset: str = "medium_portrait",
) -> MetricDistanceResult:
    """
    Full-featured, mathematically rigorous metric distance estimation engine.
    Supports camera calibration, yaw foreshortening correction, and scenario-aware bounds.
    """
    # 1. Input Validation & Degenerate Handling
    if not face_box or len(face_box) < 4 or frame_width <= 0.0 or frame_height <= 0.0:
        return MetricDistanceResult(
            distance_meters=None,
            distance_feet=None,
            uncertainty_meters=None,
            uncertainty_feet=None,
            score=0.0,
            status=EvaluationStatus.UNAVAILABLE,
            recommendation=None,
            confidence=0.0,
            target_preset=target_preset,
            target_distance_range_m=(0.85, 1.95),
            diagnostics={"error": "invalid_inputs_or_empty_face_box"},
        )

    try:
        x1, y1, x2, y2 = [float(v) for v in face_box[:4]]
    except (ValueError, TypeError):
        return MetricDistanceResult(
            distance_meters=None,
            distance_feet=None,
            uncertainty_meters=None,
            uncertainty_feet=None,
            score=0.0,
            status=EvaluationStatus.UNAVAILABLE,
            recommendation="Invalid coordinate format",
            confidence=0.0,
            target_preset=target_preset,
            target_distance_range_m=(0.85, 1.95),
            diagnostics={"error": "non_numeric_coordinates"},
        )

    # Check for NaN / Infinity / Inverted coordinates
    if any(math.isnan(v) or math.isinf(v) for v in (x1, y1, x2, y2)):
        return MetricDistanceResult(
            distance_meters=None,
            distance_feet=None,
            uncertainty_meters=None,
            uncertainty_feet=None,
            score=0.0,
            status=EvaluationStatus.UNAVAILABLE,
            recommendation=None,
            confidence=0.0,
            target_preset=target_preset,
            target_distance_range_m=(0.85, 1.95),
            diagnostics={"error": "nan_or_inf_in_coordinates"},
        )

    x_min, x_max = min(x1, x2), max(x1, x2)
    y_min, y_max = min(y1, y2), max(y1, y2)
    face_pixel_w = x_max - x_min
    face_pixel_h = y_max - y_min

    if face_pixel_w <= 6.0 or face_pixel_h <= 6.0:
        return MetricDistanceResult(
            distance_meters=None,
            distance_feet=None,
            uncertainty_meters=None,
            uncertainty_feet=None,
            score=0.2,
            status=EvaluationStatus.CRITICAL,
            recommendation="Subject too far for accurate depth",
            confidence=0.15,
            target_preset=target_preset,
            target_distance_range_m=(0.85, 1.95),
            diagnostics={"reason": "face_bounding_box_too_small"},
        )

    # 2. Camera Focal Length Determination
    if calibration is not None and calibration.fx > 0.0:
        f_effective = calibration.fx
        calib_confidence = 1.0 if calibration.is_calibrated else 0.85
    else:
        # Pinhole scaling relative to 640px reference frame
        f_effective = focal_length_px * (frame_width / 640.0)
        calib_confidence = 0.75

    # 3. Head Pose Foreshortening Correction
    # Projected width shrinks as cos(yaw). Clamp yaw to +/- 50 deg (~0.87 rad)
    yaw_factor = 1.0
    if subject_yaw is not None and not math.isnan(subject_yaw):
        clamped_yaw = max(-0.75, min(0.75, float(subject_yaw)))
        yaw_factor = max(0.65, math.cos(clamped_yaw * (math.pi / 2.0) * 0.7))

    corrected_pixel_w = face_pixel_w / yaw_factor

    # 4. Pinhole Metric Distance Formula
    distance_m = (f_effective * AVERAGE_HUMAN_FACE_WIDTH_M) / corrected_pixel_w
    distance_ft = distance_m * METERS_TO_FEET

    # Anthropometric uncertainty margin (+/- 10%)
    uncertainty_m = distance_m * ANTHROPOMETRIC_UNCERTAINTY_RATIO
    uncertainty_ft = uncertainty_m * METERS_TO_FEET

    # Overall signal measurement confidence
    resolution_conf = min(1.0, face_pixel_w / 70.0)
    overall_confidence = round(calib_confidence * resolution_conf * (0.95 if subject_yaw is not None else 0.85), 2)

    # 5. Context-Adaptive Target Boundaries
    preset_key = target_preset if target_preset in PRESET_DISTANCE_BOUNDARIES else PortraitPreset.MEDIUM_PORTRAIT.value
    ideal_min_m, ideal_max_m = PRESET_DISTANCE_BOUNDARIES[preset_key]
    ideal_min_ft = ideal_min_m * METERS_TO_FEET
    ideal_max_ft = ideal_max_m * METERS_TO_FEET

    # 6. Evaluation Score & Actionable Recommendation Generation
    if ideal_min_m <= distance_m <= ideal_max_m:
        score = 1.0
        msg = None
        status = EvaluationStatus.OPTIMAL
    elif distance_m < ideal_min_m:
        delta_ft = ideal_min_ft - distance_ft
        span_ft = max(0.5, ideal_min_ft * 0.75)
        score = max(0.2, 1.0 - (delta_ft / span_ft))
        status = EvaluationStatus.SUBOPTIMAL

        delta_rounded = max(0.5, round(delta_ft * 2.0) / 2.0)
        msg = f"Step back {delta_rounded:.1f} feet (camera too close)"
    else:
        delta_ft = distance_ft - ideal_max_ft
        span_ft = max(1.0, ideal_max_ft * 0.85)
        score = max(0.2, 1.0 - (delta_ft / span_ft))
        status = EvaluationStatus.SUBOPTIMAL

        delta_rounded = max(0.5, round(delta_ft * 2.0) / 2.0)
        msg = f"Step closer {delta_rounded:.1f} feet (camera too far)"

    diagnostics = {
        "distance_m": round(distance_m, 2),
        "distance_ft": round(distance_ft, 1),
        "uncertainty_m": round(uncertainty_m, 2),
        "uncertainty_ft": round(uncertainty_ft, 1),
        "face_pixel_w": round(face_pixel_w, 1),
        "corrected_pixel_w": round(corrected_pixel_w, 1),
        "f_effective": round(f_effective, 1),
        "yaw_factor": round(yaw_factor, 3),
        "target_preset": preset_key,
        "is_calibrated": calibration.is_calibrated if calibration else False,
    }

    return MetricDistanceResult(
        distance_meters=round(distance_m, 2),
        distance_feet=round(distance_ft, 1),
        uncertainty_meters=round(uncertainty_m, 2),
        uncertainty_feet=round(uncertainty_ft, 1),
        score=round(score, 2),
        status=status,
        recommendation=msg,
        confidence=overall_confidence,
        target_preset=preset_key,
        target_distance_range_m=(ideal_min_m, ideal_max_m),
        diagnostics=diagnostics,
    )
