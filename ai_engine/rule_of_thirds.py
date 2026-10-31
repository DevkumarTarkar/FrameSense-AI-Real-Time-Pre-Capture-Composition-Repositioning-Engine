"""
FrameSense AI - Rule of Thirds & Golden Ratio Composition Engine
Computes Euclidean distance of the subject to nearest harmonic intersections,
evaluates directional lead room (looking room) based on subject gaze orientation,
and generates actionable repositioning recommendations.
Adheres strictly to FrameSense AI PRD Section 8.1 and Classical Composition Principles.
"""

import math
from enum import Enum
from typing import Tuple, Optional, List
from ai_engine.contract import EvaluatorResult, EvaluationStatus


class GridMode(str, Enum):
    """Compositional grid alignment standard."""
    RULE_OF_THIRDS = "rule_of_thirds"
    GOLDEN_RATIO = "golden_ratio"


# Golden ratio proportion: phi = (1 + sqrt(5)) / 2 ~ 1.6180339887
PHI_1 = 0.3820  # (3 - sqrt(5)) / 2 ~ 38.2%
PHI_2 = 0.6180  # (sqrt(5) - 1) / 2 ~ 61.8%


def get_grid_power_points(
    frame_width: float,
    frame_height: float,
    mode: GridMode = GridMode.RULE_OF_THIRDS,
) -> List[Tuple[float, float]]:
    """
    Computes the 4 harmonic intersection coordinates for the specified grid standard.
    """
    if mode == GridMode.GOLDEN_RATIO:
        x_coords = [frame_width * PHI_1, frame_width * PHI_2]
        y_coords = [frame_height * PHI_1, frame_height * PHI_2]
    else:
        x_coords = [frame_width / 3.0, (2.0 * frame_width) / 3.0]
        y_coords = [frame_height / 3.0, (2.0 * frame_height) / 3.0]

    return [
        (x_coords[0], y_coords[0]),  # Top-Left
        (x_coords[1], y_coords[0]),  # Top-Right
        (x_coords[0], y_coords[1]),  # Bottom-Left
        (x_coords[1], y_coords[1]),  # Bottom-Right
    ]


def evaluate_rule_of_thirds(
    center_x: float,
    center_y: float,
    frame_width: float,
    frame_height: float,
    tolerance_ratio: float = 0.08,
    mode: str = "rule_of_thirds",
    subject_yaw: Optional[float] = None,
) -> Tuple[float, Tuple[float, float], float, Optional[str]]:
    """
    Evaluates how well the subject's center aligns with the nearest power point.
    Maintains 100% backward-compatible return signature.

    Returns:
        score (float): Normalized alignment score [0.0, 1.0].
        nearest_target (tuple): (target_x, target_y) of nearest power point.
        distance (float): Euclidean distance in pixels to nearest target.
        message (str | None): Actionable repositioning guidance.
    """
    grid_mode = GridMode.GOLDEN_RATIO if mode == "golden_ratio" else GridMode.RULE_OF_THIRDS
    result = evaluate_rule_of_thirds_contract(
        center_x=center_x,
        center_y=center_y,
        frame_width=frame_width,
        frame_height=frame_height,
        tolerance_ratio=tolerance_ratio,
        mode=grid_mode,
        subject_yaw=subject_yaw,
    )
    target = result.target_coordinates if result.target_coordinates else (0.0, 0.0)
    return result.score, target, result.measured_value, result.recommendation


def evaluate_rule_of_thirds_contract(
    center_x: float,
    center_y: float,
    frame_width: float,
    frame_height: float,
    tolerance_ratio: float = 0.08,
    mode: GridMode = GridMode.RULE_OF_THIRDS,
    subject_yaw: Optional[float] = None,
) -> EvaluatorResult:
    """
    Evaluates composition grid alignment and returns standardized EvaluatorResult contract.
    """
    if frame_width <= 0.0 or frame_height <= 0.0:
        return EvaluatorResult(
            score=0.0,
            measured_value=0.0,
            status=EvaluationStatus.UNAVAILABLE,
            recommendation="Invalid frame dimensions",
            confidence=0.0,
            target_coordinates=(0.0, 0.0),
        )

    power_points = get_grid_power_points(frame_width, frame_height, mode)

    # Lead Room weighting: if subject is gazing strongly left or right,
    # bias the preferred power point so open negative space is left in front of the gaze
    preferred_points = power_points
    lead_room_note = None

    if subject_yaw is not None and abs(subject_yaw) > 0.15:
        # subject_yaw > 0 indicates subject is facing frame-right -> prefer left-side grid points
        if subject_yaw > 0.15:
            preferred_points = [p for p in power_points if p[0] < (frame_width * 0.5)]
            lead_room_note = "Position subject on left third for open right lead room"
        else:
            # subject_yaw < -0.15 indicates subject is facing frame-left -> prefer right-side grid points
            preferred_points = [p for p in power_points if p[0] > (frame_width * 0.5)]
            lead_room_note = "Position subject on right third for open left lead room"

    candidates = preferred_points if preferred_points else power_points

    min_dist = float("inf")
    nearest_target = candidates[0]

    for pt in candidates:
        dist = math.hypot(center_x - pt[0], center_y - pt[1])
        if dist < min_dist:
            min_dist = dist
            nearest_target = pt

    tolerance = tolerance_ratio * frame_width
    frame_diagonal = math.hypot(frame_width, frame_height)
    max_falloff_dist = 0.35 * frame_diagonal

    if min_dist <= tolerance:
        return EvaluatorResult(
            score=1.0,
            measured_value=round(min_dist, 1),
            status=EvaluationStatus.OPTIMAL,
            recommendation=None,
            confidence=1.0,
            target_coordinates=(round(nearest_target[0], 1), round(nearest_target[1], 1)),
            diagnostics={"mode": mode.value, "within_tolerance": True},
        )

    excess_dist = min_dist - tolerance
    falloff_range = max(1.0, max_falloff_dist - tolerance)
    score = max(0.0, 1.0 - (excess_dist / falloff_range))

    dx = nearest_target[0] - center_x
    dy = nearest_target[1] - center_y

    if abs(dx) > abs(dy):
        direction = "right" if dx > 0 else "left"
        msg = f"Shift subject slightly {direction}"
    else:
        direction = "down" if dy > 0 else "up"
        msg = f"Shift subject slightly {direction}"

    if lead_room_note and score < 0.70:
        msg = f"{msg} ({lead_room_note})"

    status = EvaluationStatus.SUBOPTIMAL if score >= 0.5 else EvaluationStatus.CRITICAL

    return EvaluatorResult(
        score=round(score, 3),
        measured_value=round(min_dist, 1),
        status=status,
        recommendation=msg,
        confidence=1.0,
        target_coordinates=(round(nearest_target[0], 1), round(nearest_target[1], 1)),
        diagnostics={
            "mode": mode.value,
            "dx": round(dx, 1),
            "dy": round(dy, 1),
            "tolerance_px": round(tolerance, 1),
        },
    )
