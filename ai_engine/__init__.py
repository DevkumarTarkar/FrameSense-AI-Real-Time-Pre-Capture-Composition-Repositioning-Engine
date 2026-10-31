"""
FrameSense AI - AI Engine Package
Pure mathematical, geometric, and rule-based composition analysis.
"""

from .contract import EvaluatorResult, EvaluationStatus
from .rule_of_thirds import evaluate_rule_of_thirds, evaluate_rule_of_thirds_contract, GridMode
from .headroom import evaluate_headroom, evaluate_headroom_contract
from .distance import evaluate_subject_distance, evaluate_subject_distance_contract
from .depth import estimate_metric_face_distance, estimate_metric_face_distance_contract
from .horizon import score_horizon_tilt, score_horizon_tilt_contract
from .horizon_cv import detect_horizon_angle
from .lighting import evaluate_face_lighting, evaluate_face_lighting_contract
from .perspective import evaluate_camera_perspective, evaluate_camera_perspective_contract
from .shot_classifier import classify_shot_type, ShotTypeResult
from .scoring import compute_composite_score, CompositionTelemetry

__all__ = [
    "EvaluatorResult",
    "EvaluationStatus",
    "GridMode",
    "evaluate_rule_of_thirds",
    "evaluate_rule_of_thirds_contract",
    "evaluate_headroom",
    "evaluate_headroom_contract",
    "evaluate_subject_distance",
    "evaluate_subject_distance_contract",
    "estimate_metric_face_distance",
    "estimate_metric_face_distance_contract",
    "score_horizon_tilt",
    "score_horizon_tilt_contract",
    "detect_horizon_angle",
    "evaluate_face_lighting",
    "evaluate_face_lighting_contract",
    "evaluate_camera_perspective",
    "evaluate_camera_perspective_contract",
    "classify_shot_type",
    "ShotTypeResult",
    "compute_composite_score",
    "CompositionTelemetry",
]
