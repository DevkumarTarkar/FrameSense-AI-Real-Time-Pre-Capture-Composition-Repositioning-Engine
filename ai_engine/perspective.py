"""
FrameSense AI - Eye-Level Camera Angle & Perspective Analyzer
Detects unflattering low-angle camera tilt (double-chin perspective) or excessive high-angle shots
by evaluating facial landmark pitch and eye-level positioning relative to the head box.
"""

from typing import Tuple, Optional, List


def evaluate_camera_perspective(
    face_box: Optional[List[float]],
    eye_y: Optional[float] = None,
    nose_y: Optional[float] = None,
    mouth_y: Optional[float] = None,
    re_x: Optional[float] = None,
    re_y: Optional[float] = None,
    le_x: Optional[float] = None,
    le_y: Optional[float] = None,
    nose_x: Optional[float] = None,
) -> Tuple[float, str, Optional[str]]:
    """
    Evaluates whether the camera is held at flattering portrait eye-level,
    detects chin pitch, head tilt, and profile angle.

    Parameters:
        face_box (list | None): [x1, y1, x2, y2] bounding box coordinates.
        eye_y (float | None): Y pixel coordinate of the midpoint between the eyes.
        nose_y (float | None): Y pixel coordinate of the nose tip.
        mouth_y (float | None): Y pixel coordinate of the mouth center.
        re_x (float | None): Right eye X.
        re_y (float | None): Right eye Y.
        le_x (float | None): Left eye X.
        le_y (float | None): Left eye Y.
        nose_x (float | None): Nose tip X.

    Returns:
        score (float): Normalized perspective score [0.0, 1.0].
        angle_status (str): 'eye_level' | 'low_angle' | 'high_angle' | 'chin_up' | 'chin_down' | 'head_tilted' | 'turned_away'.
        message (str | None): Guidance message for camera elevation or face pose angle.
    """
    if not face_box or len(face_box) < 4:
        return 1.0, "eye_level", None

    y1, y2 = face_box[1], face_box[3]
    box_h = y2 - y1

    if box_h <= 10.0 or eye_y is None:
        return 1.0, "eye_level", None

    # Ratio of eye height relative to top of head bounding box [0.0, 1.0]
    eye_ratio = (eye_y - y1) / box_h

    # 1. Low-Angle Warning (Camera held below chest/chin looking upward):
    # Eyes appear shifted abnormally high in the head box (< 0.28)
    if eye_ratio < 0.27:
        score = 0.45
        status = "low_angle"
        message = "Raise camera to eye level (avoid unflattering low chin angle)"
        return score, status, message

    # 2. High-Angle Warning (Camera held far overhead looking down):
    # Forehead exaggerated, eyes pushed downward (> 0.54)
    if eye_ratio > 0.54:
        score = 0.55
        status = "high_angle"
        message = "Lower camera slightly to eye level"
        return score, status, message

    # 3. Vertical feature proportion check: distance between eyes and nose vs nose and mouth
    if nose_y is not None and mouth_y is not None:
        eye_to_nose = max(1.0, nose_y - eye_y)
        nose_to_mouth = max(1.0, mouth_y - nose_y)
        ratio = eye_to_nose / nose_to_mouth

        # Severe upward compression (nostril exposure)
        if ratio < 0.40:
            return 0.5, "low_angle", "Raise camera to eye level (avoid low chin angle)"
        elif ratio < 0.62:
            return 0.65, "chin_up", "Lower chin slightly and look at the lens"
        elif ratio > 1.85:
            return 0.65, "chin_down", "Lift chin slightly for a sharp jawline"

    # 4. Head roll / tilt angle (slanted head)
    if re_x is not None and re_y is not None and le_x is not None and le_y is not None:
        dx = abs(re_x - le_x)
        dy = abs(re_y - le_y)
        if dx > 15.0 and (dy / dx) > 0.22:
            return 0.70, "head_tilted", "Straighten your head slightly"

    # 5. Profile turned too far sideways
    if nose_x is not None and re_x is not None and le_x is not None:
        d_r = abs(nose_x - re_x)
        d_l = abs(nose_x - le_x)
        if max(d_r, d_l) / max(1.0, min(d_r, d_l)) > 3.8:
            return 0.68, "turned_away", "Turn face slightly back towards the camera"

    return 1.0, "eye_level", None
