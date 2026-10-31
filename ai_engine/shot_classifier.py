"""
FrameSense AI - Contextual Shot Type Auto-Detection & Adaptive Composition
Classifies scenes into:
1. 'portrait' (Solo human subject)
2. 'group' (Multiple people in frame)
3. 'architecture' (Buildings, cityscapes, structural vertical lines)
4. 'landscape' (Nature, mountains, rivers, horizons)
5. 'food' (Plates, top-down flatlay, close-up items)

Adheres to Objective 3 of FrameSense AI Product Requirements.
"""

from typing import Tuple, List, Dict, Optional
import math
import cv2
import numpy as np


class ShotTypeResult:
    """Classified contextual shot type with confidence score and adaptive recommendations."""
    def __init__(
        self,
        shot_type: str,
        confidence: float,
        description: str,
        adaptive_guidance: Optional[str] = None,
        edge_clipped_subject: Optional[str] = None,
    ):
        self.shot_type = shot_type
        self.confidence = confidence
        self.description = description
        self.adaptive_guidance = adaptive_guidance
        self.edge_clipped_subject = edge_clipped_subject


def classify_shot_type(
    frame_bgr: np.ndarray,
    all_face_boxes: List[List[float]],
    horizon_angle: Optional[float] = None,
) -> ShotTypeResult:
    """
    Classifies the incoming live video frame into a contextual shot type
    and generates adaptive composition rules.

    Parameters:
        frame_bgr (np.ndarray): Decoded BGR image frame.
        all_face_boxes (list): List of detected face bounding boxes [[x1, y1, x2, y2], ...].
        horizon_angle (float | None): Pre-computed horizon line angle if available.

    Returns:
        ShotTypeResult: Classified shot type with confidence and adaptive advice.
    """
    if frame_bgr is None or frame_bgr.size == 0:
        return ShotTypeResult("portrait", 0.5, "Default Solo Portrait", None)

    h, w = frame_bgr.shape[:2]
    face_count = len(all_face_boxes)

    # ---------------------------------------------------------
    # 1. GROUP SHOT DETECTION (2 or more faces)
    # ---------------------------------------------------------
    if face_count >= 2:
        # Check if anyone on the edges is clipped
        edge_clipping_alert = None
        min_x = min(box[0] for box in all_face_boxes)
        max_x = max(box[2] for box in all_face_boxes)

        if min_x < 0.05 * w:
            edge_clipping_alert = "Subject on left edge is cut off — pan camera left"
        elif max_x > 0.95 * w:
            edge_clipping_alert = "Subject on right edge is cut off — pan camera right"

        guidance = edge_clipping_alert or f"Group shot ({face_count} subjects) — ensure even headroom and spacing"
        conf = min(0.99, 0.70 + (face_count * 0.1))
        return ShotTypeResult(
            shot_type="group",
            confidence=round(conf, 2),
            description=f"Group Photo ({face_count} Subjects)",
            adaptive_guidance=guidance,
            edge_clipped_subject=edge_clipping_alert,
        )

    # ---------------------------------------------------------
    # 2. SOLO PORTRAIT (1 face detected)
    # ---------------------------------------------------------
    if face_count == 1:
        box = all_face_boxes[0]
        face_w = abs(box[2] - box[0])
        # If face occupies significant area, high-confidence portrait
        ratio = face_w / float(w)
        conf = 0.95 if ratio >= 0.10 else 0.80

        # Boundary clipping detection: guard against cut head or clipped boundaries
        edge_clipping_alert = None
        if box[1] <= 0.03 * h:
            edge_clipping_alert = "Head cut off at top of frame — tilt camera up"
        elif box[0] <= 0.03 * w:
            edge_clipping_alert = "Subject clipped on left edge — pan camera left"
        elif box[2] >= 0.97 * w:
            edge_clipping_alert = "Subject clipped on right edge — pan camera right"

        guidance = edge_clipping_alert or "Align eyes with upper third grid; maintain natural headroom"
        return ShotTypeResult(
            shot_type="portrait",
            confidence=conf,
            description="Solo Portrait Session",
            adaptive_guidance=guidance,
            edge_clipped_subject=edge_clipping_alert,
        )

    # ---------------------------------------------------------
    # 3. NON-HUMAN SCENES (0 faces detected)
    # Analyze structural edges, color spectra, and geometric distribution
    # ---------------------------------------------------------
    gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY) if len(frame_bgr.shape) == 3 else frame_bgr

    # Canny Edge Detector for structural line analysis
    edges = cv2.Canny(gray, 50, 150)
    lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=45, minLineLength=int(w * 0.18), maxLineGap=15)

    vertical_lines = 0
    horizontal_lines = 0

    if lines is not None:
        for line in lines:
            coords = np.array(line).flatten()
            if len(coords) < 4:
                continue
            x1, y1, x2, y2 = int(coords[0]), int(coords[1]), int(coords[2]), int(coords[3])
            dx = abs(x2 - x1)
            dy = abs(y2 - y1)
            if dx == 0:
                vertical_lines += 1
                continue
            angle = math.degrees(math.atan2(dy, dx))
            if angle > 65.0:
                vertical_lines += 1
            elif angle < 25.0:
                horizontal_lines += 1

    # ---------------------------------------------------------
    # 3A. ARCHITECTURE DETECTION
    # High density of vertical lines + high structural edge density
    # ---------------------------------------------------------
    edge_density = float(np.mean(edges > 0))
    if vertical_lines >= 4 and vertical_lines > (horizontal_lines * 1.2):
        conf = min(0.92, 0.65 + (vertical_lines * 0.03))
        return ShotTypeResult(
            shot_type="architecture",
            confidence=round(conf, 2),
            description="Architecture / Urban Structure",
            adaptive_guidance="Keep vertical lines straight and camera level to avoid keystoning",
        )

    # ---------------------------------------------------------
    # 3B. FOOD & FLATLAY DETECTION
    # High concentration of circular/oval contours near center + warm hues
    # ---------------------------------------------------------
    hsv = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2HSV)
    # Detect plates/tableware via Hough Circles or color saturation in central ROI
    cx, cy = w // 2, h // 2
    roi_hsv = hsv[int(cy - h * 0.25):int(cy + h * 0.25), int(cx - w * 0.25):int(cx + w * 0.25)]
    # Warm color mask: red/orange/yellow hues (H: 0-35, S > 40)
    warm_mask = (roi_hsv[:, :, 0] <= 32) & (roi_hsv[:, :, 1] >= 45)
    warm_ratio = float(np.mean(warm_mask))

    circles = cv2.HoughCircles(
        gray,
        cv2.HOUGH_GRADIENT,
        dp=1.2,
        minDist=w * 0.3,
        param1=100,
        param2=35,
        minRadius=int(min(w, h) * 0.12),
        maxRadius=int(min(w, h) * 0.45),
    )
    has_circular_plate = circles is not None and len(circles[0]) > 0

    if has_circular_plate and warm_ratio > 0.25:
        return ShotTypeResult(
            shot_type="food",
            confidence=0.88,
            description="Food / Flatlay Photography",
            adaptive_guidance="Hold camera directly 90° overhead or 45° angled with plate centered",
        )

    # ---------------------------------------------------------
    # 3C. LANDSCAPE DETECTION
    # Dominant horizontal horizon, outdoor sky/vegetation variance
    # ---------------------------------------------------------
    if horizontal_lines >= 2 or horizon_angle is not None:
        # Check upper third sky luminance
        upper_third = gray[:int(h * 0.33), :]
        lower_third = gray[int(h * 0.66):, :]
        upper_lum = float(np.mean(upper_third))
        lower_lum = float(np.mean(lower_third))

        # Landscapes often exhibit open bright sky above darker earth/water
        if upper_lum > (lower_lum + 15.0) or horizontal_lines >= 3:
            conf = 0.85
            return ShotTypeResult(
                shot_type="landscape",
                confidence=conf,
                description="Landscape / Scenic Nature",
                adaptive_guidance="Align horizon with lower 1/3 for sky emphasis or upper 1/3 for foreground",
            )

    # ---------------------------------------------------------
    # 3D. FALLBACK: GENERAL OBJECT / SCENE
    # ---------------------------------------------------------
    if edge_density > 0.08:
        return ShotTypeResult(
            shot_type="architecture",
            confidence=0.65,
            description="Structural Composition",
            adaptive_guidance="Use leading lines and symmetrical framing",
        )

    return ShotTypeResult(
        shot_type="unframed",
        confidence=0.50,
        description="No Subject Detected",
        adaptive_guidance="Position subject inside the frame",
    )
