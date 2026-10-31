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

    # Adaptive Canny thresholds based on frame median luminance for robust edge detection in dim/bright conditions
    v = float(np.median(blurred))
    lower_thresh = int(max(20.0, 0.67 * v))
    upper_thresh = int(min(240.0, 1.33 * v))
    if lower_thresh >= upper_thresh:
        lower_thresh, upper_thresh = 50, 150

    edges = cv2.Canny(blurred, lower_thresh, upper_thresh, apertureSize=3)

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

    candidate_lines = []

    for line in lines:
        coords = np.array(line).flatten()
        if len(coords) < 4:
            continue
        x1, y1, x2, y2 = int(coords[0]), int(coords[1]), int(coords[2]), int(coords[3])

        # Canonical endpoint ordering: enforce x1 < x2 so dx is always positive
        if x1 > x2:
            x1, y1, x2, y2 = x2, y2, x1, y1

        dx = x2 - x1
        dy = y2 - y1

        length = math.hypot(dx, dy)
        if length <= 0 or dx == 0:
            continue

        # Compute line angle in degrees relative to horizontal: atan2(dy, dx)
        angle_rad = math.atan2(dy, dx)
        angle_deg = math.degrees(angle_rad)

        # Check if line is within plausible horizontal slope
        if abs(angle_deg) <= angle_threshold_deg:
            candidate_lines.append((length, angle_deg, (x1, y1, x2, y2)))

    if not candidate_lines:
        return None, None

    # Sort candidates by line length descending
    candidate_lines.sort(key=lambda item: item[0], reverse=True)
    best_length, best_angle, best_line = candidate_lines[0]

    # Weighted consensus across consistent horizon lines within 3.0 degrees
    consensus_angles = []
    consensus_weights = []
    for length, angle, _ in candidate_lines:
        if abs(angle - best_angle) <= 3.0:
            w_i = length * length
            consensus_angles.append(angle * w_i)
            consensus_weights.append(w_i)

    if consensus_weights and sum(consensus_weights) > 0:
        dominant_angle = round(sum(consensus_angles) / sum(consensus_weights), 1)
    else:
        dominant_angle = round(best_angle, 1)

    return dominant_angle, best_line
