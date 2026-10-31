"""
FrameSense AI - Advanced Metric Distance & Calibration Test Suite
Comprehensive unit tests covering camera intrinsics, yaw foreshortening,
scenario presets, anthropometric uncertainty, and edge case resilience.
"""

import math
import pytest
from ai_engine.depth import (
    estimate_metric_face_distance,
    estimate_metric_distance_detailed,
    estimate_metric_face_distance_contract,
    CameraCalibration,
    PortraitPreset,
    MetricDistanceResult,
    AVERAGE_HUMAN_FACE_WIDTH_M,
    METERS_TO_FEET,
)
from ai_engine.contract import EvaluatorResult, EvaluationStatus


def test_known_synthetic_camera_geometry():
    """
    Given f = 800 px and W_real = 0.15 m:
    At 2.0 m distance, face width must project to exactly:
    W_pixel = (f * W_real) / D = (800 * 0.15) / 2.0 = 60.0 px.
    """
    calib = CameraCalibration(fx=800.0, fy=800.0, cx=320.0, cy=240.0, image_width=640.0, image_height=480.0)
    face_box = [100.0, 100.0, 160.0, 180.0]  # width = 60 px

    res = estimate_metric_distance_detailed(face_box, calibration=calib)
    assert res.distance_meters == 2.0
    assert pytest.approx(res.distance_feet, 0.1) == 2.0 * METERS_TO_FEET
    assert res.uncertainty_meters == 0.20  # +/- 10%


def test_different_focal_lengths():
    """Varying focal lengths should scale measured distance linearly."""
    calib_short = CameraCalibration(fx=400.0, fy=400.0, cx=320.0, cy=240.0, image_width=640.0, image_height=480.0)
    calib_long = CameraCalibration(fx=1200.0, fy=1200.0, cx=320.0, cy=240.0, image_width=640.0, image_height=480.0)

    face_box = [100.0, 100.0, 200.0, 200.0]  # 100 px width

    d_short = estimate_metric_distance_detailed(face_box, calibration=calib_short).distance_meters
    d_long = estimate_metric_distance_detailed(face_box, calibration=calib_long).distance_meters

    assert pytest.approx(d_short * 3.0, 0.01) == d_long


def test_uniform_image_resizing_scaling():
    """Rescaling the frame and calibration uniformly by 2x must yield identical physical distance."""
    calib_orig = CameraCalibration(fx=500.0, fy=500.0, cx=320.0, cy=240.0, image_width=640.0, image_height=480.0)
    face_orig = [100.0, 100.0, 180.0, 200.0]  # width = 80 px

    calib_2x = calib_orig.scale_uniform(2.0)
    face_2x = [200.0, 200.0, 360.0, 400.0]   # width = 160 px

    d1 = estimate_metric_distance_detailed(face_orig, calibration=calib_orig).distance_meters
    d2 = estimate_metric_distance_detailed(face_2x, calibration=calib_2x).distance_meters

    assert d1 == d2


def test_camera_cropping_preserves_focal_length():
    """Cropping shifts principal point cx, cy but preserves focal length and distance."""
    calib_orig = CameraCalibration(fx=600.0, fy=600.0, cx=320.0, cy=240.0, image_width=640.0, image_height=480.0)
    calib_crop = calib_orig.apply_crop(crop_x=50.0, crop_y=50.0, cropped_width=400.0, cropped_height=300.0)

    assert calib_crop.fx == calib_orig.fx
    assert calib_crop.cx == 270.0
    assert calib_crop.cy == 190.0


def test_hfov_camera_calibration_construction():
    """Calibrating from HFOV produces correct fx."""
    # 90 degree HFOV on 800w: fx = 800 / (2 * tan(45)) = 400.0 px
    calib = CameraCalibration.from_hfov(hfov_degrees=90.0, width=800.0, height=600.0)
    assert pytest.approx(calib.fx, 0.1) == 400.0


def test_yaw_foreshortening_compensation():
    """
    When subject turns head, 2D bounding box shrinks.
    Yaw compensation must correct the width and avoid overestimating distance.
    """
    calib = CameraCalibration(fx=800.0, fy=800.0, cx=320.0, cy=240.0, image_width=640.0, image_height=480.0)
    # Subject at 2m frontal: width = 60 px
    # If turned 30 deg, observed box shrinks to ~52 px
    face_turned = [100.0, 100.0, 152.0, 180.0]

    res_uncorrected = estimate_metric_distance_detailed(face_turned, calibration=calib, subject_yaw=0.0)
    res_corrected = estimate_metric_distance_detailed(face_turned, calibration=calib, subject_yaw=0.45)

    assert res_corrected.distance_meters < res_uncorrected.distance_meters


def test_scenario_target_presets():
    """Different presets (selfie vs full body) have distinct optimal distance bands."""
    calib = CameraCalibration(fx=800.0, fy=800.0, cx=320.0, cy=240.0, image_width=640.0, image_height=480.0)
    # Subject at 3.0 meters (~9.8 ft)
    face_3m = [100.0, 100.0, 140.0, 180.0]  # 40 px

    # In medium portrait (ideal 1.3 - 2.2 m), 3.0 m is too far
    res_medium = estimate_metric_distance_detailed(face_3m, calibration=calib, target_preset="medium_portrait")
    assert res_medium.status == EvaluationStatus.SUBOPTIMAL
    assert "Step closer" in res_medium.recommendation

    # In full body (ideal 2.6 - 4.5 m), 3.0 m is optimal!
    res_full = estimate_metric_distance_detailed(face_3m, calibration=calib, target_preset="full_body")
    assert res_full.status == EvaluationStatus.OPTIMAL
    assert res_full.score == 1.0


def test_anthropometric_uncertainty_bounds():
    """Every valid measurement must quantify +/- 10% anthropometric uncertainty."""
    face_box = [100.0, 100.0, 200.0, 200.0]
    res = estimate_metric_distance_detailed(face_box, frame_width=640.0)
    assert res.uncertainty_meters is not None
    assert pytest.approx(res.uncertainty_meters, abs=0.02) == res.distance_meters * 0.10


def test_degenerate_inputs_handling():
    """Module must gracefully reject empty, None, NaN, and negative inputs without crashing."""
    assert estimate_metric_distance_detailed(None).status == EvaluationStatus.UNAVAILABLE
    assert estimate_metric_distance_detailed([]).status == EvaluationStatus.UNAVAILABLE
    assert estimate_metric_distance_detailed([10, 10]).status == EvaluationStatus.UNAVAILABLE
    assert estimate_metric_distance_detailed([float('nan'), 10, 20, 20]).status == EvaluationStatus.UNAVAILABLE
    assert estimate_metric_distance_detailed([10, 10, 20, 20], frame_width=0.0).status == EvaluationStatus.UNAVAILABLE


def test_very_small_face_box_rejection():
    """Tiny face boxes (< 6px) must be rejected with low confidence alert."""
    tiny_box = [100.0, 100.0, 104.0, 104.0]  # 4 px
    res = estimate_metric_distance_detailed(tiny_box, frame_width=640.0)
    assert res.status == EvaluationStatus.CRITICAL
    assert res.distance_meters is None
    assert "too far" in res.recommendation


def test_backward_compatible_4_tuple_return():
    """Original signature estimate_metric_face_distance must return 4 elements."""
    face_box = [100.0, 100.0, 200.0, 200.0]
    out = estimate_metric_face_distance(face_box, frame_width=640.0)
    assert isinstance(out, tuple)
    assert len(out) == 4
    dist_m, dist_ft, score, msg = out
    assert isinstance(dist_m, float)
    assert isinstance(dist_ft, float)
    assert isinstance(score, float)


def test_standardized_evaluator_result_contract():
    """Contract interface must return standard EvaluatorResult instance."""
    face_box = [100.0, 100.0, 200.0, 200.0]
    res = estimate_metric_face_distance_contract(face_box, frame_width=640.0)
    assert isinstance(res, EvaluatorResult)
    assert isinstance(res.status, EvaluationStatus)
    assert 0.0 <= res.score <= 1.0
