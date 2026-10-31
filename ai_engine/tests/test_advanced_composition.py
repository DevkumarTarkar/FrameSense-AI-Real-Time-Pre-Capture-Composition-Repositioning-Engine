"""
FrameSense AI - Test Suite for Advanced Composition & Evaluator Contracts
Tests anatomical cranial headroom, shot-adaptive boundaries, Golden Ratio grid,
gaze-aware lead room (looking room), and standardized EvaluatorResult contracts.
"""

import pytest
from ai_engine.contract import EvaluatorResult, EvaluationStatus
from ai_engine.rule_of_thirds import (
    evaluate_rule_of_thirds,
    evaluate_rule_of_thirds_contract,
    GridMode,
    get_grid_power_points,
    PHI_1,
    PHI_2,
)
from ai_engine.headroom import (
    evaluate_headroom,
    evaluate_headroom_contract,
    get_contextual_headroom_bands,
)
from ai_engine.distance import evaluate_subject_distance_contract
from ai_engine.depth import estimate_metric_face_distance_contract
from ai_engine.horizon import score_horizon_tilt_contract
from ai_engine.lighting import evaluate_face_lighting_contract
from ai_engine.perspective import evaluate_camera_perspective_contract


def test_anatomical_cranial_headroom_compensation():
    """
    When cranial compensation is enabled with face height, skull vertex
    offset should shift headroom by ~20% of face height.
    """
    frame_h = 1000.0
    face_h = 200.0  # 20% of frame
    eyebrow_y = 150.0  # Raw bbox ymin

    # Without compensation: raw ratio = 150 / 1000 = 0.15
    res_raw = evaluate_headroom_contract(
        head_top_y=eyebrow_y,
        frame_height=frame_h,
        face_height=face_h,
        apply_cranial_compensation=False,
    )
    assert res_raw.measured_value == 0.15

    # With compensation: offset = 0.20 * 200 = 40px -> true skull y = 110 -> ratio = 0.11
    res_comp = evaluate_headroom_contract(
        head_top_y=eyebrow_y,
        frame_height=frame_h,
        face_height=face_h,
        apply_cranial_compensation=True,
    )
    assert res_comp.measured_value == 0.11
    assert res_comp.status == EvaluationStatus.OPTIMAL


def test_shot_adaptive_headroom_bands():
    """Close-up portraits require tighter headroom, while wide shots require more headroom."""
    # Close up: face ratio = 0.45
    min_c, max_c, _ = get_contextual_headroom_bands(0.45)
    assert min_c == 0.05
    assert max_c == 0.12

    # Wide shot: face ratio = 0.08
    min_w, max_w, _ = get_contextual_headroom_bands(0.08)
    assert min_w == 0.12
    assert max_w == 0.22


def test_golden_ratio_grid_power_points():
    """Verify Golden Ratio coordinates match phi_1 (~38.2%) and phi_2 (~61.8%)."""
    w, h = 1000.0, 1000.0
    pts = get_grid_power_points(w, h, mode=GridMode.GOLDEN_RATIO)
    assert len(pts) == 4

    top_left = pts[0]
    assert pytest.approx(top_left[0], 0.1) == w * PHI_1
    assert pytest.approx(top_left[1], 0.1) == h * PHI_1

    # Exact evaluation on golden ratio intersection
    score, target, dist, msg = evaluate_rule_of_thirds(
        center_x=w * PHI_1,
        center_y=h * PHI_1,
        frame_width=w,
        frame_height=h,
        mode="golden_ratio",
    )
    assert score == 1.0
    assert dist == 0.0
    assert msg is None


def test_gaze_aware_lead_room_selection():
    """
    When a subject is gazing toward the right (yaw > 0.15), the system should
    prioritize placing them on the left third to provide open lead room.
    """
    w, h = 1200.0, 800.0
    # Subject placed on left third (400px), gazing toward the right
    res_right_gaze = evaluate_rule_of_thirds_contract(
        center_x=400.0,
        center_y=800.0 / 3.0,
        frame_width=w,
        frame_height=h,
        subject_yaw=0.35,  # Looking right
    )
    assert res_right_gaze.score == 1.0
    assert res_right_gaze.target_coordinates[0] == 400.0  # Left third preferred

    # Subject placed on right third (800px), gazing toward the left
    res_left_gaze = evaluate_rule_of_thirds_contract(
        center_x=800.0,
        center_y=800.0 / 3.0,
        frame_width=w,
        frame_height=h,
        subject_yaw=-0.35,  # Looking left
    )
    assert res_left_gaze.score == 1.0
    assert res_left_gaze.target_coordinates[0] == 800.0  # Right third preferred


def test_standardized_evaluator_result_contracts():
    """All evaluator contracts must adhere to the standardized EvaluatorResult schema."""
    # 1. Distance contract
    dist_res = evaluate_subject_distance_contract(face_width=150.0, frame_width=600.0)
    assert isinstance(dist_res, EvaluatorResult)
    assert isinstance(dist_res.status, EvaluationStatus)
    assert 0.0 <= dist_res.score <= 1.0

    # 2. Depth contract
    depth_res = estimate_metric_face_distance_contract(
        face_box=[100.0, 100.0, 250.0, 250.0],
        frame_width=640.0,
        frame_height=480.0,
    )
    assert isinstance(depth_res, EvaluatorResult)
    assert depth_res.score > 0.0

    # 3. Horizon contract
    horizon_res = score_horizon_tilt_contract(tilt_degrees=1.2)
    assert isinstance(horizon_res, EvaluatorResult)
    assert horizon_res.status == EvaluationStatus.OPTIMAL

    # 4. Perspective contract
    persp_res = evaluate_camera_perspective_contract(
        face_box=[100.0, 100.0, 300.0, 350.0],
        eye_y=190.0,
    )
    assert isinstance(persp_res, EvaluatorResult)
    assert persp_res.status == EvaluationStatus.OPTIMAL
