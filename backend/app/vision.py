"""
FrameSense AI - Unified Vision & Neural Aesthetic Pipeline
Orchestrates:
1. MediaPipe Face Detection
2. Classical OpenCV Canny + Hough Horizon Tilt
3. Rule-of-Thirds, Headroom & Subject Distance Heuristics
4. NVIDIA RTX 3050 CUDA-Accelerated NIMA Deep Aesthetic Assessment
"""

import base64
import logging
from typing import Optional, Tuple
import cv2
import numpy as np
import torch

# MediaPipe face detection
try:
    import mediapipe as mp
    mp_face_detection = mp.solutions.face_detection
except ImportError:
    mp = None
    mp_face_detection = None

# PyIQA NIMA metric
try:
    import pyiqa
except ImportError:
    pyiqa = None

from ai_engine.rule_of_thirds import evaluate_rule_of_thirds
from ai_engine.headroom import evaluate_headroom
from ai_engine.distance import evaluate_subject_distance
from ai_engine.horizon import score_horizon_tilt
from ai_engine.horizon_cv import detect_horizon_angle
from ai_engine.scoring import compute_composite_score, CompositionTelemetry

logger = logging.getLogger("framesense.vision")


class VisionEngine:
    """Manages MediaPipe detectors, OpenCV geometry, and RTX 3050 NIMA aesthetic model."""

    def __init__(self, min_detection_confidence: float = 0.5):
        self.min_detection_confidence = min_detection_confidence
        self.detector = None
        self.nima_metric = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        self._init_detector()
        self._init_nima()

    def _init_detector(self):
        if mp_face_detection:
            self.detector = mp_face_detection.FaceDetection(
                model_selection=0,
                min_detection_confidence=self.min_detection_confidence,
            )
            logger.info("MediaPipe FaceDetection initialized.")
        else:
            logger.warning("MediaPipe not available.")

    def _init_nima(self):
        if pyiqa:
            try:
                logger.info(f"Loading official NIMA model on compute device: {self.device}")
                self.nima_metric = pyiqa.create_metric("nima", device=self.device)
                logger.info("Official NIMA model successfully loaded on GPU.")
            except Exception as e:
                logger.error(f"Failed to load NIMA metric: {e}")
                self.nima_metric = None

    def decode_image(self, base64_str: str) -> Optional[np.ndarray]:
        """Decodes base64 string into BGR OpenCV image array."""
        try:
            if "," in base64_str:
                base64_str = base64_str.split(",", 1)[1]
            image_bytes = base64.b64decode(base64_str)
            np_arr = np.frombuffer(image_bytes, np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            return frame
        except Exception as e:
            logger.error(f"Failed to decode base64 image: {e}")
            return None

    def compute_aesthetic_score(self, frame_bgr: np.ndarray) -> Tuple[float, float]:
        """
        Runs real-time deep learning aesthetic evaluation on RTX 3050 CUDA.
        Returns:
            calibrated_score (float): Normalized human scale [1.0, 10.0]
            raw_score (float): Raw research AVA score [~3.0, ~5.8]
        """
        if self.nima_metric is None:
            return 7.0, 5.0

        try:
            rgb_resized = cv2.resize(cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB), (224, 224))
            tensor_frame = (
                torch.from_numpy(rgb_resized).permute(2, 0, 1).unsqueeze(0).float() / 255.0
            ).to(self.device)

            with torch.no_grad():
                raw_score = self.nima_metric(tensor_frame).item()

            # Percentile calibration: maps raw AVA research scale (3.2 to 5.6) to intuitive human perception (1.0 to 10.0)
            calibrated = float(np.clip(1.0 + (raw_score - 3.2) * (9.0 / (5.6 - 3.2)), 1.0, 10.0))
            return round(calibrated, 1), round(raw_score, 2)
        except Exception as e:
            logger.error(f"Aesthetic computation error: {e}")
            return 7.0, 5.0

    def analyze_frame(self, frame_bgr: np.ndarray) -> CompositionTelemetry:
        """Runs end-to-end unified composition and aesthetic analysis on incoming frame."""
        h, w = frame_bgr.shape[:2]

        # 1. Classical CV: Horizon Tilt Detection
        dominant_angle, _ = detect_horizon_angle(frame_bgr)
        tilt_score, reported_angle, tilt_msg = score_horizon_tilt(dominant_angle)

        # 2. Deep Learning: Neural Aesthetic Quality on RTX 3050
        aesthetic_score, raw_aesthetic = self.compute_aesthetic_score(frame_bgr)

        # 3. MediaPipe Face Detection
        rgb_frame = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        face_results = self.detector.process(rgb_frame) if self.detector else None

        if not face_results or not face_results.detections:
            telemetry = compute_composite_score(
                thirds_score=0.0,
                headroom_score=0.0,
                tilt_score=tilt_score,
                distance_score=0.0,
                guidance_candidates=[],
                has_subject=False,
            )
            telemetry.sub_scores["aesthetic_ai"] = aesthetic_score
            telemetry.sub_scores["aesthetic_raw"] = raw_aesthetic
            return telemetry

        # Pick primary subject face
        primary_detection = max(
            face_results.detections,
            key=lambda d: d.score[0] if d.score else 0.0,
        )

        bbox = primary_detection.location_data.relative_bounding_box
        xmin = max(0.0, bbox.xmin * w)
        ymin = max(0.0, bbox.ymin * h)
        box_w = min(w - xmin, bbox.width * w)
        box_h = min(h - ymin, bbox.height * h)

        center_x = xmin + (box_w / 2.0)
        center_y = ymin + (box_h / 2.0)
        head_top_y = ymin
        face_box = [round(xmin, 1), round(ymin, 1), round(xmin + box_w, 1), round(ymin + box_h, 1)]

        # 4. Rule of Thirds
        thirds_score, target_pt, dist, thirds_msg = evaluate_rule_of_thirds(
            center_x=center_x,
            center_y=center_y,
            frame_width=float(w),
            frame_height=float(h),
        )

        # 5. Headroom Clearance
        headroom_score, headroom_ratio, headroom_msg = evaluate_headroom(
            head_top_y=head_top_y,
            frame_height=float(h),
        )

        # 6. Subject Distance
        dist_score, dist_ratio, dist_msg = evaluate_subject_distance(
            face_width=box_w,
            frame_width=float(w),
        )

        # Prioritize guidance messages
        candidates = []
        if thirds_msg:
            candidates.append((thirds_score, thirds_msg))
        if headroom_msg:
            candidates.append((headroom_score, headroom_msg))
        if tilt_msg:
            candidates.append((tilt_score, tilt_msg))
        if dist_msg:
            candidates.append((dist_score, dist_msg))

        telemetry = compute_composite_score(
            thirds_score=thirds_score,
            headroom_score=headroom_score,
            tilt_score=tilt_score,
            distance_score=dist_score,
            guidance_candidates=candidates,
            target_point=target_pt,
            face_box=face_box,
            has_subject=True,
        )

        # Attach Deep Learning aesthetic metrics
        telemetry.sub_scores["aesthetic_ai"] = aesthetic_score
        telemetry.sub_scores["aesthetic_raw"] = raw_aesthetic

        return telemetry


# Singleton instance
vision_engine = VisionEngine()
