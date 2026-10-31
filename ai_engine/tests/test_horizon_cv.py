"""
Unit tests for ai_engine.horizon_cv module.
Validates OpenCV Canny & Hough Line detection on synthetic frames,
canonical endpoint ordering, median-adaptive thresholding, and consensus aggregation.
"""

import cv2
import numpy as np
import pytest
from ai_engine.horizon_cv import detect_horizon_angle


def test_detect_horizon_perfectly_level():
    """Synthetic frame with a crisp horizontal line -> Angle ~0.0 degrees."""
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    # Draw horizontal line across the center
    cv2.line(img, (50, 240), (590, 240), (255, 255, 255), thickness=3)

    angle, line_coords = detect_horizon_angle(img)
    assert angle is not None
    assert abs(angle) <= 1.5
    assert line_coords is not None


def test_detect_horizon_tilted_clockwise():
    """
    Synthetic frame with a line sloping downward to the right (dy > 0, angle > 0).
    Draw from (50, 200) to (590, 270): dy = 70, dx = 540 -> atan2(70, 540) ~ 7.4 degrees.
    """
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    cv2.line(img, (50, 200), (590, 270), (255, 255, 255), thickness=3)

    angle, line_coords = detect_horizon_angle(img)
    assert angle is not None
    assert 5.0 <= angle <= 10.0
    assert line_coords is not None


def test_detect_horizon_tilted_counter_clockwise():
    """
    Synthetic frame with a line sloping upward to the right (dy < 0, angle < 0).
    Draw from (50, 270) to (590, 200): dy = -70, dx = 540 -> atan2(-70, 540) ~ -7.4 degrees.
    """
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    cv2.line(img, (50, 270), (590, 200), (255, 255, 255), thickness=3)

    angle, line_coords = detect_horizon_angle(img)
    assert angle is not None
    assert -10.0 <= angle <= -5.0
    assert line_coords is not None


def test_detect_horizon_blank_frame():
    """Blank frame without structural edges returns (None, None)."""
    img = np.full((480, 640, 3), 120, dtype=np.uint8)
    angle, line = detect_horizon_angle(img)
    assert angle is None
    assert line is None


def test_detect_horizon_none_input():
    """None or empty frame returns (None, None)."""
    angle, line = detect_horizon_angle(None)
    assert angle is None
    assert line is None
