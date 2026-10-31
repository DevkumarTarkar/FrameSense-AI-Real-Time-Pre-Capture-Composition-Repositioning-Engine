"""
FrameSense AI - Standardized Evaluator Contract Specification
Defines unified types, statuses, and data structures for all composition evaluators.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, Dict, Any, Tuple


class EvaluationStatus(str, Enum):
    """Operational status of a composition evaluator."""
    OPTIMAL = "optimal"
    SUBOPTIMAL = "suboptimal"
    CRITICAL = "critical"
    UNAVAILABLE = "unavailable"


@dataclass(frozen=True)
class EvaluatorResult:
    """
    Standardized output contract for all FrameSense AI evaluators.

    Attributes:
        score (float): Normalized performance metric [0.0, 1.0].
        measured_value (float): Primary physical/mathematical measurement.
        status (EvaluationStatus): Evaluator operational classification.
        recommendation (Optional[str]): Actionable corrective coaching prompt, or None if optimal.
        confidence (float): Signal reliability / measurement confidence [0.0, 1.0].
        target_coordinates (Optional[Tuple[float, float]]): Target coordinates (x, y) for HUD.
        diagnostics (Dict[str, Any]): Additional internal variables for telemetry / debugging.
    """
    score: float
    measured_value: float
    status: EvaluationStatus
    recommendation: Optional[str] = None
    confidence: float = 1.0
    target_coordinates: Optional[Tuple[float, float]] = None
    diagnostics: Dict[str, Any] = field(default_factory=dict)
