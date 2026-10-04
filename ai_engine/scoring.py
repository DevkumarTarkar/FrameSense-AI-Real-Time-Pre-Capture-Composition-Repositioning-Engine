"""
FrameSense AI - Composition Scoring Engine
Combines Rule-of-Thirds, Headroom, Horizon-Tilt, and Distance signals into a single
weighted composite score with actionable, prioritized user prompts.
Adheres strictly to PRD Section 8.5 & Section 10.
"""

from dataclasses import dataclass, field
from typing import List, Tuple, Optional

# Named constants adhering to PRD §7 (NFR7) & §8.5
WEIGHT_THIRDS = 0.35
WEIGHT_HEADROOM = 0.25
WEIGHT_TILT = 0.20
WEIGHT_DISTANCE = 0.20


@dataclass
class CompositionTelemetry:
    """Telemetry data structure returned by the scoring engine."""
    score: int
    messages: List[str]
    target_x: Optional[float] = None
    target_y: Optional[float] = None
    face_box: Optional[List[float]] = None
    sub_scores: dict = field(default_factory=dict)


def compute_composite_score(
    thirds_score: float,
    headroom_score: float,
    tilt_score: float,
    distance_score: float,
    guidance_candidates: List[Tuple[float, str]],
    target_point: Optional[Tuple[float, float]] = None,
    face_box: Optional[List[float]] = None,
    has_subject: bool = True,
) -> CompositionTelemetry:
    """
    Computes weighted composite score (0-100) and orders guidance messages.

    Parameters:
        thirds_score (float): [0.0, 1.0]
        headroom_score (float): [0.0, 1.0]
        tilt_score (float): [0.0, 1.0]
        distance_score (float): [0.0, 1.0]
        guidance_candidates (list): List of (sub_score, message) tuples.
        target_point (tuple | None): (target_x, target_y) for HUD crosshair.
        face_box (list | None): [x1, y1, x2, y2] of primary face.
        has_subject (bool): False if no face/subject detected.

    Returns:
        CompositionTelemetry: Formatted telemetry package.
    """
    if not has_subject:
        # PRD §6 (FR11): Handle "no face detected" with score 0 and clear message
        return CompositionTelemetry(
            score=0,
            messages=["Position subject inside the frame"],
            target_x=None,
            target_y=None,
            face_box=None,
            sub_scores={
                "thirds": 0.0,
                "headroom": 0.0,
                "tilt": 1.0,
                "distance": 0.0,
            },
        )

    # Weighted composite calculation
    composite = (
        (WEIGHT_THIRDS * thirds_score) +
        (WEIGHT_HEADROOM * headroom_score) +
        (WEIGHT_TILT * tilt_score) +
        (WEIGHT_DISTANCE * distance_score)
    )

    final_score = int(round(max(0.0, min(1.0, composite)) * 100))

    # Sort guidance candidates by lowest score first (highest urgency)
    sorted_prompts = sorted(
        [item for item in guidance_candidates if item[1] is not None],
        key=lambda x: x[0]
    )

    messages = [item[1] for item in sorted_prompts]

    if not messages:
        if final_score >= 85:
            messages.append("Excellent framing! Hold steady")
        else:
            messages.append("Composition balanced")

    tx = target_point[0] if target_point else None
    ty = target_point[1] if target_point else None

    return CompositionTelemetry(
        score=final_score,
        messages=messages,
        target_x=tx,
        target_y=ty,
        face_box=face_box,
        sub_scores={
            "thirds": round(thirds_score, 2),
            "headroom": round(headroom_score, 2),
            "tilt": round(tilt_score, 2),
            "distance": round(distance_score, 2),
        },
    )
