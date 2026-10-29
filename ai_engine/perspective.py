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
) -> Tuple[float, str, Optional[str]]:
    """
    Evaluates whether the camera is held at flattering portrait eye-level.

    Parameters:
        face_box (list | None): [x1, y1, x2, y2] bounding box coordinates.
        eye_y (float | None): Y pixel coordinate of the midpoint between the eyes.
        nose_y (float | None): Y pixel coordinate of the nose tip.
        mouth_y (float | None): Y pixel coordinate of the mouth center.

    Returns:
        score (float): Normalized perspective score [0.0, 1.0].
        angle_status (str): 'eye_level' | 'low_angle' | 'high_angle'.
        message (str | None): Guidance message for camera elevation.
    """
    if not face_box or len(face_box) < 4:
        return 1.0, "eye_level", None

    y1, y2 = face_box[1], face_box[3]
    box_h = y2 - y1

    if box_h <= 10.0 or eye_y is None:
        return 1.0, "eye_level", None

    # Ratio of eye height relative to top of head bounding box [0.0, 1.0]
    eye_ratio = (eye_y - y1) / box_h

    # Low-Angle Warning (Camera held below chest/chin looking upward):
    # Eyes appear shifted abnormally high in the head box (< 0.28)
    if eye_ratio < 0.27:
        score = 0.45
        status = "low_angle"
        message = "Raise camera to eye level (avoid unflattering low chin angle)"
        return score, status, message

    # High-Angle Warning (Camera held far overhead looking down):
    # Forehead exaggerated, eyes pushed downward (> 0.54)
    if eye_ratio > 0.54:
        score = 0.55
        status = "high_angle"
        message = "Lower camera slightly to eye level"
        return score, status, message

    # Vertical feature proportion check: distance between eyes and nose vs nose and mouth
    if nose_y is not None and mouth_y is not None:
        eye_to_nose = max(1.0, nose_y - eye_y)
        nose_to_mouth = max(1.0, mouth_y - nose_y)
        ratio = eye_to_nose / nose_to_mouth

        # Severe upward compression (nostril exposure)
        if ratio < 0.40:
            return 0.5, "low_angle", "Raise camera to eye level (avoid low chin angle)"

    return 1.0, "eye_level", None
