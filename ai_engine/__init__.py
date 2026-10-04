"""
FrameSense AI - AI Engine Package
Pure mathematical and rule-based composition analysis.
"""

from .rule_of_thirds import evaluate_rule_of_thirds
from .headroom import evaluate_headroom
from .distance import evaluate_subject_distance
from .horizon import score_horizon_tilt
from .scoring import compute_composite_score, CompositionTelemetry

__all__ = [
    "evaluate_rule_of_thirds",
    "evaluate_headroom",
    "evaluate_subject_distance",
    "score_horizon_tilt",
    "compute_composite_score",
    "CompositionTelemetry",
]
