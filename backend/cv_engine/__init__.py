"""
FrameSense AI - Computer Vision Engine Package
Contains spatial geometry analysis algorithms including horizon tilt estimation, 
rule of thirds matrix analysis, and headroom evaluators.
"""

from .tilt import HorizonTiltDetector, estimate_horizon_tilt
from .rule_of_thirds import RuleOfThirdsAnalyzer, evaluate_rule_of_thirds

__all__ = [
    'HorizonTiltDetector', 
    'estimate_horizon_tilt',
    'RuleOfThirdsAnalyzer',
    'evaluate_rule_of_thirds'
]
