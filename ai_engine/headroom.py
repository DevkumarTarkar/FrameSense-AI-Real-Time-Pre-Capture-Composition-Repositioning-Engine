"""
FrameSense AI - Headroom Evaluator
Calculates top-of-head clearance and prompts for vertical tilt/framing adjustments.
Adheres strictly to PRD Section 8.2.
"""

from typing import Tuple, Optional

IDEAL_HEADROOM_MIN = 0.10
IDEAL_HEADROOM_MAX = 0.18
MAX_ACCEPTABLE_HEADROOM = 0.35


def evaluate_headroom(
    head_top_y: float,
    frame_height: float,
) -> Tuple[float, float, Optional[str]]:
    """
    Evaluates headroom ratio: distance from frame top to top of the subject's head.

    Parameters:
        head_top_y (float): Y coordinate of top of the head/face box (0 is top of frame).
        frame_height (float): Total height of the frame.

    Returns:
        score (float): Headroom score [0.0, 1.0].
        ratio (float): head_top_y / frame_height ratio.
        message (str | None): Actionable guidance prompt.
    """
    if frame_height <= 0:
        return 0.0, 0.0, "Invalid frame height"

    ratio = max(0.0, head_top_y / frame_height)

    if IDEAL_HEADROOM_MIN <= ratio <= IDEAL_HEADROOM_MAX:
        score = 1.0
        message = None
    elif ratio < IDEAL_HEADROOM_MIN:
        # Too tight above head: ratio < 0.10
        score = max(0.0, ratio / IDEAL_HEADROOM_MIN)
        message = "Tilt camera down (headroom too tight)"
    else:
        # Too much space above head: ratio > 0.18
        excess = ratio - IDEAL_HEADROOM_MAX
        span = MAX_ACCEPTABLE_HEADROOM - IDEAL_HEADROOM_MAX
        score = max(0.0, 1.0 - (excess / span))
        if ratio > 0.25:
            message = "Tilt camera up or step closer (excessive headroom)"
        else:
            message = "Tilt camera up slightly"

    return round(score, 3), round(ratio, 3), message
