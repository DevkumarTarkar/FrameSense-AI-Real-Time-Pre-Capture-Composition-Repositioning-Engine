"""
FrameSense AI - Standardized Evaluator Contract Specification
Defines unified types, statuses, and data structures for all composition evaluators.
Enforces strict numerical bounds, non-finite guards, and immutability.
"""

import math
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
        score (float): Normalized performance metric strictly in [0.0, 1.0].
        measured_value (float): Primary physical/mathematical measurement.
        status (EvaluationStatus): Evaluator operational classification.
        recommendation (Optional[str]): Actionable corrective coaching prompt, or None if optimal.
        confidence (float): Signal reliability / measurement confidence strictly in [0.0, 1.0].
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

    def __post_init__(self):
        # 1. Type and enum normalization for status
        if not isinstance(self.status, EvaluationStatus):
            try:
                object.__setattr__(self, "status", EvaluationStatus(self.status))
            except (ValueError, TypeError):
                object.__setattr__(self, "status", EvaluationStatus.UNAVAILABLE)

        # 2. Guard against non-finite or invalid measured_value
        val = self.measured_value
        try:
            val_float = float(val)
            if math.isnan(val_float) or math.isinf(val_float):
                object.__setattr__(self, "measured_value", 0.0)
                object.__setattr__(self, "status", EvaluationStatus.UNAVAILABLE)
            else:
                object.__setattr__(self, "measured_value", val_float)
        except (ValueError, TypeError):
            object.__setattr__(self, "measured_value", 0.0)
            object.__setattr__(self, "status", EvaluationStatus.UNAVAILABLE)

        # 3. Guard and clamp score strictly to [0.0, 1.0]
        sc = self.score
        try:
            sc_float = float(sc)
            if math.isnan(sc_float) or math.isinf(sc_float):
                object.__setattr__(self, "score", 0.0)
                object.__setattr__(self, "status", EvaluationStatus.UNAVAILABLE)
            else:
                clamped_score = max(0.0, min(1.0, sc_float))
                object.__setattr__(self, "score", round(clamped_score, 4))
        except (ValueError, TypeError):
            object.__setattr__(self, "score", 0.0)
            object.__setattr__(self, "status", EvaluationStatus.UNAVAILABLE)

        # 4. Guard and clamp confidence strictly to [0.0, 1.0]
        conf = self.confidence
        try:
            conf_float = float(conf)
            if math.isnan(conf_float) or math.isinf(conf_float):
                object.__setattr__(self, "confidence", 0.0)
            else:
                clamped_conf = max(0.0, min(1.0, conf_float))
                object.__setattr__(self, "confidence", round(clamped_conf, 4))
        except (ValueError, TypeError):
            object.__setattr__(self, "confidence", 0.0)

    @classmethod
    def unavailable(
        cls,
        reason: Optional[str] = None,
        diagnostics: Optional[Dict[str, Any]] = None,
    ) -> "EvaluatorResult":
        """Convenience constructor for unavailable measurements."""
        diag = diagnostics.copy() if diagnostics else {}
        if reason:
            diag["unavailable_reason"] = reason
        return cls(
            score=0.0,
            measured_value=0.0,
            status=EvaluationStatus.UNAVAILABLE,
            recommendation=reason,
            confidence=0.0,
            diagnostics=diag,
        )

    def __iter__(self):
        """Enables backward-compatible tuple unpacking: score, measured_value, recommendation."""
        return iter((self.score, self.measured_value, self.recommendation))

    def __getitem__(self, index: int):
        """Enables index-based access for legacy callers expecting tuple returns."""
        elements = (self.score, self.measured_value, self.recommendation)
        return elements[index]

    def __len__(self) -> int:
        return 3
