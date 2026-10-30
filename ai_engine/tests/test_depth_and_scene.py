"""
FrameSense AI - Test Suite for Depth Estimation & Shot Type Classification
Tests pinhole metric distance calculation, group detection, and contextual shot rules.
"""

import pytest
import numpy as np
import cv2
from ai_engine.depth import estimate_metric_face_distance
from ai_engine.shot_classifier import classify_shot_type


def test_depth_estimation_ideal_portrait_range():
    """Face bounding box of normal size (~100px on 640w) should yield ideal 2.8-5.5 ft distance."""
    # face_box: [100, 100, 200, 200] -> width = 100px
    dist_m, dist_ft, score, msg = estimate_metric_face_distance([100, 100, 200, 200], frame_width=640.0)

    assert dist_m is not None
    assert dist_ft is not None
    assert 2.8 <= dist_ft <= 5.5
    assert score == 1.0
    assert msg is None


def test_depth_estimation_too_close():
    """Large face occupying 350px width should prompt to step back in feet."""
    dist_m, dist_ft, score, msg = estimate_metric_face_distance([50, 50, 400, 400], frame_width=640.0)

    assert dist_ft is not None
    assert dist_ft < 2.8
    assert score < 1.0
    assert msg is not None
    assert "Step back" in msg
    assert "feet" in msg


def test_depth_estimation_too_far():
    """Small face occupying 40px width should prompt to step closer in feet."""
    dist_m, dist_ft, score, msg = estimate_metric_face_distance([200, 200, 240, 240], frame_width=640.0)

    assert dist_ft is not None
    assert dist_ft > 5.5
    assert score < 1.0
    assert msg is not None
    assert "Step closer" in msg
    assert "feet" in msg


def test_shot_type_classification_solo_portrait():
    """Single face should be classified as portrait."""
    dummy_frame = np.zeros((480, 640, 3), dtype=np.uint8)
    face_boxes = [[150.0, 100.0, 300.0, 300.0]]
    result = classify_shot_type(dummy_frame, face_boxes)

    assert result.shot_type == "portrait"
    assert result.confidence >= 0.80


def test_shot_type_classification_group_photo():
    """Multiple faces should be classified as group shot."""
    dummy_frame = np.zeros((480, 640, 3), dtype=np.uint8)
    face_boxes = [
        [100.0, 100.0, 200.0, 220.0],
        [300.0, 120.0, 400.0, 240.0],
    ]
    result = classify_shot_type(dummy_frame, face_boxes)

    assert result.shot_type == "group"
    assert "Group" in result.description
    assert result.confidence >= 0.80


def test_shot_type_classification_group_edge_clipped():
    """Face touching screen border (< 5% of width) should trigger edge clipping alert."""
    dummy_frame = np.zeros((480, 640, 3), dtype=np.uint8)
    face_boxes = [
        [10.0, 100.0, 120.0, 220.0],  # 10px < 32px (5% of 640)
        [300.0, 120.0, 400.0, 240.0],
    ]
    result = classify_shot_type(dummy_frame, face_boxes)

    assert result.shot_type == "group"
    assert result.edge_clipped_subject is not None
    assert "cut off" in result.edge_clipped_subject.lower()
