"""
FrameSense AI - Rule of Thirds Evaluator
Computes distance of the subject to the nearest Rule-of-Thirds intersection.
Adheres strictly to PRD Section 8.1.
"""

import math
from typing import Tuple, Optional


def evaluate_rule_of_thirds(
    center_x: float,
    center_y: float,
    frame_width: float,
    frame_height: float,
    tolerance_ratio: float = 0.08,
) -> Tuple[float, Tuple[float, float], float, Optional[str]]:
    """
    Evaluates how well the subject's center aligns with the nearest Rule-of-Thirds intersection.

    Parameters:
        center_x (float): Subject's center X coordinate.
        center_y (float): Subject's center Y coordinate.
        frame_width (float): Total width of the frame.
        frame_height (float): Total height of the frame.
        tolerance_ratio (float): Permissible deviation ratio before score penalty (default 8% of frame_width).

    Returns:
        score (float): Normalized alignment score [0.0, 1.0].
        nearest_target (tuple): (target_x, target_y) of nearest power point.
        distance (float): Euclidean distance to the nearest target.
        message (str | None): Actionable guidance if misaligned.
    """
    if frame_width <= 0 or frame_height <= 0:
        return 0.0, (0.0, 0.0), 0.0, "Invalid frame dimensions"

    # Define the 4 standard Rule-of-Thirds power points
    x_thirds = [frame_width / 3.0, (2.0 * frame_width) / 3.0]
    y_thirds = [frame_height / 3.0, (2.0 * frame_height) / 3.0]

    power_points = [
        (x_thirds[0], y_thirds[0]),
        (x_thirds[1], y_thirds[0]),
        (x_thirds[0], y_thirds[1]),
        (x_thirds[1], y_thirds[1]),
    ]

    # Find the nearest power point
    min_dist = float("inf")
    nearest_target = power_points[0]

    for pt in power_points:
        dist = math.hypot(center_x - pt[0], center_y - pt[1])
        if dist < min_dist:
            min_dist = dist
            nearest_target = pt

    tolerance = tolerance_ratio * frame_width

    # PRD §8.1: Score is 1.0 if within tolerance, falls off linearly with distance
    # Maximum reasonable displacement falloff is 35% of the frame diagonal
    frame_diagonal = math.hypot(frame_width, frame_height)
    max_falloff_dist = 0.35 * frame_diagonal

    if min_dist <= tolerance:
        score = 1.0
        message = None
    else:
        excess_dist = min_dist - tolerance
        falloff_range = max(1.0, max_falloff_dist - tolerance)
        score = max(0.0, 1.0 - (excess_dist / falloff_range))
        
        # Determine directional suggestion
        dx = nearest_target[0] - center_x
        dy = nearest_target[1] - center_y
        
        if abs(dx) > abs(dy):
            direction = "right" if dx > 0 else "left"
            message = f"Shift subject slightly {direction}"
        else:
            direction = "down" if dy > 0 else "up"
            message = f"Shift subject slightly {direction}"

    return round(score, 3), (round(nearest_target[0], 1), round(nearest_target[1], 1)), round(min_dist, 1), message
