"""
FrameSense AI - Face Lighting & Exposure Quality Engine
Analyzes face luminance vs background luminance to detect harsh backlighting,
underexposed silhouettes, and blown-out highlights/glare on human subjects.
Adheres strictly to FrameSense AI PRD Standards.
"""

from typing import Tuple, Optional, List
import cv2
import numpy as np
from ai_engine.contract import EvaluatorResult, EvaluationStatus

# Photometric luminance thresholds in 8-bit grayscale [0, 255]
MIN_FACE_LUMINANCE = 52.0            # Below 52 is severely underexposed
BACKLIGHT_FACE_MAX = 75.0            # Backlight face threshold
BACKLIGHT_BG_MIN = 130.0             # Backlight background threshold
BACKLIGHT_DELTA_MIN = 45.0           # Significant shadow delta
HARSH_GLARE_LUMINANCE = 218.0        # Above 218 is prone to blown-out specular highlights
BLOWN_OUT_PIXEL_RATIO_MAX = 0.22     # More than 22% clipped white pixels (>245)


def evaluate_face_lighting(
    frame_bgr: np.ndarray,
    face_box: Optional[List[float]],
) -> Tuple[float, float, str, Optional[str]]:
    """
    Evaluates the lighting balance on the subject's face.
    Maintains 100% backward-compatible return signature.

    Returns:
        score (float): Normalized lighting score [0.0, 1.0].
        face_lum (float): Mean face luminance [0, 255].
        status (str): 'balanced' | 'backlight' | 'dark' | 'glare'.
        message (str | None): Corrective action prompt for the user.
    """
    result = evaluate_face_lighting_contract(frame_bgr, face_box)
    status_str = result.diagnostics.get("lighting_status", "balanced")
    return result.score, result.measured_value, status_str, result.recommendation


def evaluate_face_lighting_contract(
    frame_bgr: np.ndarray,
    face_box: Optional[List[float]],
) -> EvaluatorResult:
    """
    Evaluates face lighting and returns standardized EvaluatorResult contract.

    Fixes:
    - Pure background luminance calculation by masking out the subject's face ROI.
    - True failure handling when face_box or frame is missing (no fake 1.0 scores).
    - Status properly reflects severity (CRITICAL vs SUBOPTIMAL).
    """
    if frame_bgr is None or not isinstance(frame_bgr, np.ndarray) or frame_bgr.size == 0 or not face_box or len(face_box) < 4:
        return EvaluatorResult(
            score=0.0,
            measured_value=0.0,
            status=EvaluationStatus.UNAVAILABLE,
            recommendation=None,
            confidence=0.0,
            diagnostics={"lighting_status": "unavailable", "reason": "missing_inputs"},
        )

    try:
        x1_raw, y1_raw, x2_raw, y2_raw = float(face_box[0]), float(face_box[1]), float(face_box[2]), float(face_box[3])
        if any(np.isnan([x1_raw, y1_raw, x2_raw, y2_raw]) | np.isinf([x1_raw, y1_raw, x2_raw, y2_raw])):
            return EvaluatorResult(
                score=0.0,
                measured_value=0.0,
                status=EvaluationStatus.UNAVAILABLE,
                recommendation=None,
                confidence=0.0,
                diagnostics={"lighting_status": "unavailable", "reason": "non_finite_coordinates"},
            )
    except (ValueError, TypeError):
        return EvaluatorResult(
            score=0.0,
            measured_value=0.0,
            status=EvaluationStatus.UNAVAILABLE,
            recommendation=None,
            confidence=0.0,
            diagnostics={"lighting_status": "unavailable", "reason": "invalid_coordinates"},
        )

    h, w = frame_bgr.shape[:2]
    x1 = max(0, min(w - 1, int(round(x1_raw))))
    y1 = max(0, min(h - 1, int(round(y1_raw))))
    x2 = max(0, min(w, int(round(x2_raw))))
    y2 = max(0, min(h, int(round(y2_raw))))

    if (x2 - x1) < 8 or (y2 - y1) < 8:
        return EvaluatorResult(
            score=0.0,
            measured_value=0.0,
            status=EvaluationStatus.UNAVAILABLE,
            recommendation=None,
            confidence=0.0,
            diagnostics={"lighting_status": "unavailable", "reason": "face_box_too_small"},
        )

    # Convert frame to grayscale for photometric evaluation
    if len(frame_bgr.shape) == 3:
        frame_gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)
    else:
        frame_gray = frame_bgr

    # Extract isolated face crop
    face_gray = frame_gray[y1:y2, x1:x2]
    face_lum = float(np.mean(face_gray))

    # Mask out face region to measure pure background luminance without subject contamination
    bg_mask = np.ones((h, w), dtype=bool)
    bg_mask[y1:y2, x1:x2] = False
    if np.any(bg_mask):
        bg_lum = float(np.mean(frame_gray[bg_mask]))
    else:
        bg_lum = face_lum

    # Fraction of severely overexposed pixels (> 245)
    blown_out_ratio = float(np.mean(face_gray > 245))

    # 1. Harsh Backlight (Silhouette problem: Bright background, dark face)
    if face_lum < BACKLIGHT_FACE_MAX and bg_lum > BACKLIGHT_BG_MIN and (bg_lum - face_lum) >= BACKLIGHT_DELTA_MIN:
        score = max(0.15, min(0.65, face_lum / 110.0))
        status = EvaluationStatus.CRITICAL if (bg_lum - face_lum) > 80.0 or face_lum < 40.0 else EvaluationStatus.SUBOPTIMAL
        msg = "Backlight warning: Face is in shadow — turn towards the light"
        return EvaluatorResult(
            score=round(score, 2),
            measured_value=round(face_lum, 1),
            status=status,
            recommendation=msg,
            confidence=0.95,
            diagnostics={"lighting_status": "backlight", "bg_lum": round(bg_lum, 1), "delta": round(bg_lum - face_lum, 1)},
        )

    # 2. Overall Scene / Face Underexposed
    if face_lum < MIN_FACE_LUMINANCE:
        score = max(0.1, min(0.60, face_lum / 75.0))
        status = EvaluationStatus.CRITICAL if face_lum < 32.0 else EvaluationStatus.SUBOPTIMAL
        msg = "Scene too dark — increase lighting for clearer portrait"
        return EvaluatorResult(
            score=round(score, 2),
            measured_value=round(face_lum, 1),
            status=status,
            recommendation=msg,
            confidence=0.90,
            diagnostics={"lighting_status": "dark", "bg_lum": round(bg_lum, 1)},
        )

    # 3. Harsh Glare / Blown-Out Overexposure
    if face_lum > HARSH_GLARE_LUMINANCE or blown_out_ratio > BLOWN_OUT_PIXEL_RATIO_MAX:
        score = max(0.15, min(0.65, (255.0 - face_lum) / 45.0))
        status = EvaluationStatus.CRITICAL if blown_out_ratio > 0.45 or face_lum > 242.0 else EvaluationStatus.SUBOPTIMAL
        msg = "Harsh glare on face — soften direct light or step into shade"
        return EvaluatorResult(
            score=round(score, 2),
            measured_value=round(face_lum, 1),
            status=status,
            recommendation=msg,
            confidence=0.95,
            diagnostics={"lighting_status": "glare", "blown_out_ratio": round(blown_out_ratio, 3)},
        )

    # 4. Optimal Balanced Lighting
    return EvaluatorResult(
        score=1.0,
        measured_value=round(face_lum, 1),
        status=EvaluationStatus.OPTIMAL,
        recommendation=None,
        confidence=1.0,
        diagnostics={"lighting_status": "balanced", "bg_lum": round(bg_lum, 1)},
    )
