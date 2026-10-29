"""
FrameSense AI - Face Lighting & Exposure Quality Engine
Analyzes face luminance vs background luminance to detect harsh backlighting,
underexposed silhouettes, and blown-out highlights/glare on human subjects.
"""

from typing import Tuple, Optional, List
import cv2
import numpy as np


def evaluate_face_lighting(
    frame_bgr: np.ndarray,
    face_box: Optional[List[float]],
) -> Tuple[float, float, str, Optional[str]]:
    """
    Evaluates the lighting balance on the subject's face.

    Parameters:
        frame_bgr (np.ndarray): Decoded BGR image frame.
        face_box (list | None): [x1, y1, x2, y2] bounding box coordinates.

    Returns:
        score (float): Normalized lighting score [0.0, 1.0].
        face_lum (float): Mean face luminance [0, 255].
        status (str): 'balanced' | 'backlight' | 'dark' | 'glare'.
        message (str | None): Corrective action prompt for the user.
    """
    if frame_bgr is None or frame_bgr.size == 0 or not face_box or len(face_box) < 4:
        return 1.0, 128.0, "balanced", None

    h, w = frame_bgr.shape[:2]
    x1 = max(0, int(face_box[0]))
    y1 = max(0, int(face_box[1]))
    x2 = min(w, int(face_box[2]))
    y2 = min(h, int(face_box[3]))

    if (x2 - x1) < 10 or (y2 - y1) < 10:
        return 1.0, 128.0, "balanced", None

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
    if face_lum < 75.0 and bg_lum > 130.0 and (bg_lum - face_lum) >= 45.0:
        score = max(0.3, face_lum / 110.0)
        status = "backlight"
        message = "Backlight warning: Face is in shadow — turn towards the light"
        return round(score, 2), round(face_lum, 1), status, message

    # 2. Overall Scene / Face Underexposed
    if face_lum < 52.0:
        score = max(0.3, face_lum / 75.0)
        status = "dark"
        message = "Scene too dark — increase lighting for clearer portrait"
        return round(score, 2), round(face_lum, 1), status, message

    # 3. Harsh Glare / Blown-Out Overexposure
    if face_lum > 218.0 or blown_out_ratio > 0.22:
        score = max(0.35, (255.0 - face_lum) / 45.0)
        status = "glare"
        message = "Harsh glare on face — soften direct light or step into shade"
        return round(score, 2), round(face_lum, 1), status, message

    # 4. Optimal Balanced Lighting
    return 1.0, round(face_lum, 1), "balanced", None
