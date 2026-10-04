"""
FrameSense AI - Test Suite for Scoring Engine
Unit tests for pure mathematical scoring logic.
Can be executed via `pytest ai_engine/tests -v` without camera, server, or GPU.
"""

import pytest
from ai_engine.rule_of_thirds import evaluate_rule_of_thirds
from ai_engine.headroom import evaluate_headroom
from ai_engine.distance import evaluate_subject_distance
from ai_engine.horizon import score_horizon_tilt
from ai_engine.scoring import (
    compute_composite_score,
    WEIGHT_THIRDS,
    WEIGHT_HEADROOM,
    WEIGHT_TILT,
    WEIGHT_DISTANCE,
)


def test_rule_of_thirds_exact_intersection():
    """Subject directly on (W/3, H/3) should receive a perfect 1.0 score."""
    w, h = 600.0, 300.0
    cx, cy = 200.0, 100.0  # Exactly W/3, H/3
    score, target, dist, msg = evaluate_rule_of_thirds(cx, cy, w, h)

    assert score == 1.0
    assert target == (200.0, 100.0)
    assert dist == 0.0
    assert msg is None


def test_rule_of_thirds_within_tolerance():
    """Subject within 8% width tolerance should receive a perfect 1.0 score."""
    w, h = 1000.0, 600.0
    tolerance = 0.08 * w  # 80 px
    cx = (1000.0 / 3.0) + (tolerance * 0.5)  # 40 px offset
    cy = 600.0 / 3.0
    score, target, dist, msg = evaluate_rule_of_thirds(cx, cy, w, h)

    assert score == 1.0
    assert msg is None


def test_rule_of_thirds_far_away():
    """Subject far from any intersection should have reduced score and directional prompt."""
    w, h = 900.0, 900.0
    cx, cy = 450.0, 450.0  # Dead center
    score, target, dist, msg = evaluate_rule_of_thirds(cx, cy, w, h)

    assert score < 1.0
    assert msg is not None
    assert "Shift subject" in msg


def test_headroom_ideal_range():
    """Headroom ratio within 0.10 to 0.18 should receive 1.0 score."""
    frame_h = 1000.0
    # Head at 14% of frame height (within [0.10, 0.18])
    score, ratio, msg = evaluate_headroom(140.0, frame_h)
    assert score == 1.0
    assert ratio == 0.14
    assert msg is None


def test_headroom_too_tight():
    """Head top touching or near frame top (< 0.10) should be penalized and prompt tilt down."""
    frame_h = 1000.0
    score, ratio, msg = evaluate_headroom(40.0, frame_h)  # 4% headroom
    assert score < 0.5
    assert ratio == 0.04
    assert "Tilt camera down" in msg


def test_headroom_excessive_space():
    """Head positioned too low (> 0.25) should prompt to step closer or tilt up."""
    frame_h = 1000.0
    score, ratio, msg = evaluate_headroom(300.0, frame_h)  # 30% headroom
    assert score < 0.5
    assert "Tilt camera up or step closer" in msg


def test_subject_distance_ideal():
    """Face width ratio between 0.12 and 0.45 should score 1.0."""
    score, ratio, msg = evaluate_subject_distance(150.0, 600.0)  # 25% width
    assert score == 1.0
    assert ratio == 0.25
    assert msg is None


def test_subject_distance_too_close():
    """Face width ratio > 0.45 should be scored 0.4 with step back prompt."""
    score, ratio, msg = evaluate_subject_distance(320.0, 600.0)  # 53.3% width
    assert score == 0.4
    assert "Step back" in msg


def test_subject_distance_too_far():
    """Face width ratio < 0.12 should be scored 0.4 with step closer prompt."""
    score, ratio, msg = evaluate_subject_distance(50.0, 600.0)  # 8.3% width
    assert score == 0.4
    assert "Step closer" in msg


def test_horizon_level():
    """Tilt angle within +/- 2 degrees should score 1.0."""
    score, angle, msg = score_horizon_tilt(1.2)
    assert score == 1.0
    assert angle == 1.2
    assert msg is None


def test_horizon_no_detection():
    """When no horizon line is detected (None), system must not penalize the user."""
    score, angle, msg = score_horizon_tilt(None)
    assert score == 1.0
    assert angle is None
    assert msg is None


def test_horizon_tilted():
    """Tilted horizon (> 2 degrees) should decrease score and give leveling prompt."""
    score, angle, msg = score_horizon_tilt(6.5)
    assert score < 1.0
    assert "Level camera" in msg


def test_composite_score_ideal_framing():
    """When all heuristics are 1.0, composite score should be 100."""
    telemetry = compute_composite_score(
        thirds_score=1.0,
        headroom_score=1.0,
        tilt_score=1.0,
        distance_score=1.0,
        guidance_candidates=[],
        target_point=(213.3, 160.0),
        face_box=[120.0, 80.0, 260.0, 240.0],
        has_subject=True,
    )

    assert telemetry.score == 100
    assert "Excellent framing" in telemetry.messages[0]
    assert telemetry.target_x == 213.3


def test_composite_score_no_subject():
    """When no subject is detected, score must be 0 with guidance."""
    telemetry = compute_composite_score(
        thirds_score=0.0,
        headroom_score=0.0,
        tilt_score=1.0,
        distance_score=0.0,
        guidance_candidates=[],
        has_subject=False,
    )

    assert telemetry.score == 0
    assert "Position subject inside the frame" in telemetry.messages[0]
    assert telemetry.target_x is None
    assert telemetry.face_box is None


def test_weights_sum_to_one():
    """Mathematical verification that scoring weights strictly sum to 1.0."""
    total_weight = WEIGHT_THIRDS + WEIGHT_HEADROOM + WEIGHT_TILT + WEIGHT_DISTANCE
    assert pytest.approx(total_weight) == 1.0
