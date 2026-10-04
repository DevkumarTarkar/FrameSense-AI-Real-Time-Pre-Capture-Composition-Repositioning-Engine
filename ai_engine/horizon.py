"""
FrameSense AI - Horizon Tilt Evaluator
Pure mathematical scoring for horizon levelness without any direct OpenCV dependency.
Adheres strictly to PRD Section 8.3.
"""

from typing import Tuple, Optional

LEVEL_TOLERANCE_DEG = 2.0
MAX_TILT_TOLERANCE_DEG = 15.0


def score_horizon_tilt(
    tilt_degrees: Optional[float],
) -> Tuple[float, Optional[float], Optional[str]]:
    """
    Evaluates horizon tilt angle theta in degrees.

    Parameters:
        tilt_degrees (float | None): Angle in degrees relative to true horizontal.
                                     Positive indicates clockwise tilt, negative counter-clockwise.
                                     None if no distinct horizon line was detected.

    Returns:
        score (float): Horizon level score [0.0, 1.0].
        angle (float | None): Reported angle in degrees.
        message (str | None): Actionable guidance prompt.
    """
    if tilt_degrees is None:
        # PRD §8.3: No confident horizon found (e.g. tight portrait) -> do NOT penalize
        return 1.0, None, None

    abs_tilt = abs(tilt_degrees)

    if abs_tilt <= LEVEL_TOLERANCE_DEG:
        score = 1.0
        message = None
    elif abs_tilt >= MAX_TILT_TOLERANCE_DEG:
        score = 0.0
        if tilt_degrees > 0:
            message = "Level camera: tilt left"
        else:
            message = "Level camera: tilt right"
    else:
        # Linear falloff between 2.0 and 15.0 degrees
        span = MAX_TILT_TOLERANCE_DEG - LEVEL_TOLERANCE_DEG
        excess = abs_tilt - LEVEL_TOLERANCE_DEG
        score = max(0.0, 1.0 - (excess / span))
        if tilt_degrees > 0:
            message = "Level camera: tilt left slightly"
        else:
            message = "Level camera: tilt right slightly"

    return round(score, 3), round(tilt_degrees, 1), message
