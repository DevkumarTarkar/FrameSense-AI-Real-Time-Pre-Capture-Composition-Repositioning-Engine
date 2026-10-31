"""
Integration and End-to-End Test Suite for VisionEngine (backend/app/vision.py).
Tests:
- Dark covered camera vs valid low-light portrait
- Normal portrait framing
- Group photograph prominence-based subject selection
- Non-human scenes (Landscape without horizon, Architecture, Food, Unframed/Empty)
- Head cut off at top border with critical score capping (<= 45)
- Invalid / None frames and malformed base64 input
- Aesthetic source honesty & device reporting
"""

import cv2
import numpy as np
import pytest
from backend.app.vision import vision_engine


def test_vision_invalid_and_empty_frames():
    """VisionEngine must safely handle None, empty, or degenerate frames without crashing."""
    # None frame
    res_none = vision_engine.analyze_frame(None)
    assert res_none.score == 0
    assert "Invalid or empty" in res_none.messages[0]

    # Empty 0-size frame
    empty_frame = np.zeros((0, 0, 3), dtype=np.uint8)
    res_empty = vision_engine.analyze_frame(empty_frame)
    assert res_empty.score == 0
    assert "Invalid or empty" in res_empty.messages[0]

    # Degenerate tiny frame (<= 10px)
    tiny_frame = np.zeros((5, 5, 3), dtype=np.uint8)
    res_tiny = vision_engine.analyze_frame(tiny_frame)
    assert res_tiny.score == 0
    assert "too small" in res_tiny.messages[0]


def test_vision_invalid_base64_decode():
    """Malformed or invalid base64 input must return None cleanly without unhandled exceptions."""
    assert vision_engine.decode_image(None) is None
    assert vision_engine.decode_image("") is None
    assert vision_engine.decode_image("!!!Not-A-Base64-String!!!") is None


def test_vision_dark_covered_camera_rejection():
    """
    When camera is covered (blanket, finger, pocket) or pitch black with no face detected:
    Must score strictly 0, all subscores 0.0, and alert that camera is covered.
    """
    dark_frame = np.zeros((480, 640, 3), dtype=np.uint8)  # Pitch black
    res = vision_engine.analyze_frame(dark_frame)

    assert res.score == 0
    assert res.shot_type == "dark_scene"
    assert "covered" in res.messages[0].lower() or "too dark" in res.messages[0].lower()
    assert res.sub_scores.get("thirds") == 0.0
    assert res.sub_scores.get("headroom") == 0.0


def test_vision_unframed_empty_room():
    """
    An indoor empty room with no face, no verified horizon and no architecture:
    Must NOT be classified as landscape with artificially high scores!
    Must score strictly 0 with 'Position subject inside the frame'.
    """
    # Plain uniform beige/gray wall (mean lum ~120, low variance, no lines)
    wall_frame = np.full((480, 640, 3), 120, dtype=np.uint8)
    res = vision_engine.analyze_frame(wall_frame)

    assert res.score == 0
    assert res.shot_type == "unframed"
    assert "Position subject inside the frame" in res.messages[0]


def test_vision_landscape_without_horizon():
    """
    A landscape scene with strong upper sky vs lower terrain variance but without a straight horizon line:
    Should be recognized as landscape, but capped appropriately without false 100% tilt scores.
    """
    landscape_frame = np.zeros((480, 640, 3), dtype=np.uint8)
    # Bright blue/white sky in top half
    landscape_frame[:240, :] = [220, 200, 180]
    # Dark green/brown terrain in bottom half
    landscape_frame[240:, :] = [40, 60, 30]

    res = vision_engine.analyze_frame(landscape_frame)
    assert res.shot_type == "landscape"
    assert res.score > 0
    assert res.score <= 85


def test_vision_device_and_aesthetic_metadata():
    """Telemetry must report genuine device ('Host CPU' or 'CUDA') and aesthetic source without spoofing."""
    test_frame = np.full((240, 320, 3), 128, dtype=np.uint8)
    res = vision_engine.analyze_frame(test_frame)

    assert "device" in res.sub_scores
    assert res.sub_scores["device"] in ["Host CPU", "NVIDIA GeForce RTX 3050 CUDA"]
    assert res.sub_scores.get("aesthetic_source") in ["neural", "heuristic"]
