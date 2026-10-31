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
    """
    if frame_bgr is None or frame_bgr.size == 0 or not face_box or len(face_box) < 4:
        return EvaluatorResult(
            score=1.0,
            measured_value=128.0,
            status=EvaluationStatus.UNAVAILABLE,
            recommendation=None,
            confidence=0.5,
            diagnostics={"lighting_status": "balanced"},
        )

    h, w = frame_bgr.shape[:2]
    x1 = max(0, int(face_box[0]))
    y1 = max(0, int(face_box[1]))
    x2 = min(w, int(face_box[2]))
    y2 = min(h, int(face_box[3]))

    if (x2 - x1) < 10 or (y2 - y1) < 10:
        return EvaluatorResult(
            score=1.0,
            measured_value=128.0,
            status=EvaluationStatus.UNAVAILABLE,
            recommendation=None,
            confidence=0.5,
            diagnostics={"lighting_status": "balanced"},
        )

    # Extract face region
    face_crop = frame_bgr[y1:y2, x1:x2]
    face_gray = cv2.cvtColor(face_crop, cv2.COLOR_BGR2GRAY)
    face_lum = float(np.mean(face_gray))

    # Compute overall frame/background luminance
    frame_gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)
    bg_lum = float(np.mean(frame_gray))

    # Fraction of severely overexposed pixels (> 245)
    blown_out_ratio = float(np.mean(face_gray > 245))

    # 1. Harsh Backlight (Silhouette problem: Bright background, dark face)
    if face_lum < BACKLIGHT_FACE_MAX and bg_lum > BACKLIGHT_BG_MIN and (bg_lum - face_lum) >= BACKLIGHT_DELTA_MIN:
        score = max(0.3, face_lum / 110.0)
        msg = "Backlight warning: Face is in shadow — turn towards the light"
        return EvaluatorResult(
            score=round(score, 2),
            measured_value=round(face_lum, 1),
            status=EvaluationStatus.SUBOPTIMAL,
            recommendation=msg,
            confidence=0.95,
            diagnostics={"lighting_status": "backlight", "bg_lum": round(bg_lum, 1)},
        )

    # 2. Overall Scene / Face Underexposed
    if face_lum < MIN_FACE_LUMINANCE:
        score = max(0.3, face_lum / 75.0)
        msg = "Scene too dark — increase lighting for clearer portrait"
        return EvaluatorResult(
            score=round(score, 2),
            measured_value=round(face_lum, 1),
            status=EvaluationStatus.SUBOPTIMAL,
            recommendation=msg,
            confidence=0.90,
            diagnostics={"lighting_status": "dark", "bg_lum": round(bg_lum, 1)},
        )

    # 3. Harsh Glare / Blown-Out Overexposure
    if face_lum > HARSH_GLARE_LUMINANCE or blown_out_ratio > BLOWN_OUT_PIXEL_RATIO_MAX:
        score = max(0.35, (255.0 - face_lum) / 45.0)
        msg = "Harsh glare on face — soften direct light or step into shade"
        return EvaluatorResult(
            score=round(score, 2),
            measured_value=round(face_lum, 1),
            status=EvaluationStatus.SUBOPTIMAL,
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
