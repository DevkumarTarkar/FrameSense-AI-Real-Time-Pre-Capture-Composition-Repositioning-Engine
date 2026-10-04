"""
FrameSense AI - Classical CV Horizon Line Detector
Isolated module utilizing OpenCV Canny edge detection and probabilistic Hough Transform.
Adheres strictly to PRD Section 6 (FR6) & Section 8.3.
"""

import math
from typing import Optional, Tuple
import cv2
import numpy as np


def detect_horizon_angle(
    frame: np.ndarray,
    min_line_length_ratio: float = 0.25,
    max_line_gap_ratio: float = 0.05,
    angle_threshold_deg: float = 30.0,
) -> Tuple[Optional[float], Optional[Tuple[int, int, int, int]]]:
    """
    Detects the dominant horizon line in a frame and returns its tilt in degrees.

    Parameters:
        frame (np.ndarray): Decoded BGR or Grayscale image frame.
        min_line_length_ratio (float): Minimum line length as a ratio of frame width.
        max_line_gap_ratio (float): Maximum allowed gap along the line.
        angle_threshold_deg (float): Only consider lines within +/- degrees of horizontal.

    Returns:
        angle_degrees (float | None): Dominant horizon tilt angle (None if no line found).
        line_coords (tuple | None): (x1, y1, x2, y2) coordinates of the dominant line.
    """
    if frame is None or frame.size == 0:
        return None, None

    h, w = frame.shape[:2]

    # Convert to grayscale if necessary
    if len(frame.shape) == 3:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    else:
        gray = frame

    # Bilateral or Gaussian blur to suppress noise while preserving structural edges
    blurred = cv2.GaussianBlur(gray, (5, 5), 1.5)

    # Canny Edge Detection
    edges = cv2.Canny(blurred, 50, 150, apertureSize=3)

    min_line_length = int(w * min_line_length_ratio)
    max_line_gap = int(w * max_line_gap_ratio)

    lines = cv2.HoughLinesP(
        edges,
        rho=1,
        theta=np.pi / 180,
        threshold=40,
        minLineLength=min_line_length,
        maxLineGap=max_line_gap,
    )

    if lines is None:
        return None, None

    best_line = None
    max_length = 0.0
    dominant_angle = None

    for line in lines:
        coords = np.array(line).flatten()
        if len(coords) < 4:
            continue
        x1, y1, x2, y2 = int(coords[0]), int(coords[1]), int(coords[2]), int(coords[3])
        dx = x2 - x1
        dy = y2 - y1

        length = math.hypot(dx, dy)
        if length <= 0:
            continue

        # Compute line angle in degrees (-90 to +90)
        angle_rad = math.atan2(dy, dx)
        angle_deg = math.degrees(angle_rad)

        # Normalize to near-horizontal [-90, 90]
        if angle_deg > 90.0:
            angle_deg -= 180.0
        elif angle_deg < -90.0:
            angle_deg += 180.0

        # Check if line is within plausible horizontal slope
        if abs(angle_deg) <= angle_threshold_deg:
            if length > max_length:
                max_length = length
                dominant_angle = angle_deg
                best_line = (int(x1), int(y1), int(x2), int(y2))

    return dominant_angle, best_line
