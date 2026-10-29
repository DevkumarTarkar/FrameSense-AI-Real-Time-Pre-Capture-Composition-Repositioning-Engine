"""
FrameSense AI - Subject Distance Evaluator
Assesses subject distance based on face width to frame width proportion.
Adheres strictly to PRD Section 8.4.
"""

from typing import Tuple, Optional

TOO_FAR_THRESHOLD = 0.12
TOO_CLOSE_THRESHOLD = 0.45


def evaluate_subject_distance(
    face_width: float,
    frame_width: float,
) -> Tuple[float, float, Optional[str]]:
    """
    Evaluates subject distance ratio: face_width / frame_width.

    Parameters:
        face_width (float): Width of the detected face bounding box.
        frame_width (float): Total width of the frame.

    Returns:
        score (float): Distance score [0.0, 1.0].
        ratio (float): face_width / frame_width ratio.
        message (str | None): Actionable guidance prompt.
    """
    if frame_width <= 0:
        return 0.0, 0.0, "Invalid frame width"

    ratio = max(0.0, face_width / frame_width)

    if ratio > TOO_CLOSE_THRESHOLD:
        score = 0.4
        message = "Step back slightly (subject too close)"
    elif ratio < TOO_FAR_THRESHOLD:
        score = 0.4
        message = "Step closer (subject too far)"
    else:
        score = 1.0
        message = None

    return round(score, 3), round(ratio, 3), message
