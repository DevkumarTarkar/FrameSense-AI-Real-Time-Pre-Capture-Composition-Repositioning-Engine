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
import os
from pathlib import Path
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

# Native MobileNetV3-NIMA aesthetic model
from ml_model.aesthetic_net import build_aesthetic_model

# PyIQA NIMA metric (optional fallback)
try:
    import pyiqa
except ImportError:
    pyiqa = None

from ai_engine.rule_of_thirds import evaluate_rule_of_thirds
from ai_engine.headroom import evaluate_headroom
from ai_engine.distance import evaluate_subject_distance
from ai_engine.horizon import score_horizon_tilt
from ai_engine.horizon_cv import detect_horizon_angle
from ai_engine.lighting import evaluate_face_lighting
from ai_engine.perspective import evaluate_camera_perspective
from ai_engine.depth import estimate_metric_face_distance
from ai_engine.shot_classifier import classify_shot_type
from ai_engine.scoring import compute_composite_score, CompositionTelemetry

logger = logging.getLogger("framesense.vision")


class VisionEngine:
    """Manages MediaPipe detectors, OpenCV geometry, and RTX 3050 NIMA aesthetic model."""

    def __init__(self, min_detection_confidence: float = 0.5):
        self.min_detection_confidence = min_detection_confidence
        self.detector = None
        self.nima_model = None
        self.nima_metric = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.norm_mean = torch.tensor([0.485, 0.456, 0.406]).view(1, 3, 1, 1).to(self.device)
        self.norm_std = torch.tensor([0.229, 0.224, 0.225]).view(1, 3, 1, 1).to(self.device)

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
        # 1. Primary Engine: Official Google SOTA NIMA (InceptionV2 trained on 255k AVA photos) on RTX 3050 CUDA
        if pyiqa:
            try:
                logger.info(f"Loading official Google SOTA NIMA (InceptionV2-AVA) on compute device: {self.device}")
                self.nima_metric = pyiqa.create_metric("nima", device=self.device)
                logger.info("Official Google SOTA NIMA engine successfully activated on RTX 3050 CUDA GPU.")
                return
            except Exception as e:
                logger.error(f"Failed to load PyIQA official NIMA metric: {e}")
                self.nima_metric = None

        # 2. Secondary fallback: Local MobileNetV3-NIMA weights if available
        weights_path = Path(__file__).resolve().parent.parent.parent / "ml_model" / "weights" / "best_aesthetic_mobilenet.pth"
        if weights_path.exists():
            try:
                logger.info(f"Loading MobileNetV3-NIMA fallback checkpoint from {weights_path} on {self.device}")
                model = build_aesthetic_model(pretrained=False).to(self.device)
                checkpoint = torch.load(str(weights_path), map_location=self.device)
                state_dict = checkpoint.get("model_state_dict", checkpoint)
                model.load_state_dict(state_dict)
                model.eval()
                self.nima_model = model
                logger.info("MobileNetV3-NIMA fallback loaded.")
                return
            except Exception as e:
                logger.warning(f"Failed to load MobileNetV3 checkpoint: {e}")
                self.nima_model = None

        logger.warning("No aesthetic neural model available; will use fallback scores.")

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
        Runs real-time deep learning aesthetic evaluation on RTX 3050 CUDA using Google SOTA NIMA,
        calibrated with physical perceptual indicators (sharpness, dynamic contrast, color richness).
        Returns:
            calibrated_score (float): Normalized human scale [1.0, 10.0]
            raw_score (float): Raw research AVA score [~2.0, ~6.5]
        """
        raw_score = 5.0

        # 1. Neural Backbone Inference (Priority: Official SOTA NIMA on RTX 3050 CUDA)
        if self.nima_metric is not None:
            try:
                rgb_resized = cv2.resize(cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB), (224, 224))
                tensor_frame = (
                    torch.from_numpy(rgb_resized).permute(2, 0, 1).unsqueeze(0).float() / 255.0
                ).to(self.device)
                with torch.no_grad():
                    raw_score = float(self.nima_metric(tensor_frame).item())
            except Exception as e:
                logger.error(f"Official NIMA metric inference error: {e}")
        elif self.nima_model is not None:
            try:
                rgb_resized = cv2.resize(cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB), (224, 224))
                tensor_frame = (
                    torch.from_numpy(rgb_resized).permute(2, 0, 1).unsqueeze(0).float() / 255.0
                ).to(self.device)
                tensor_frame = (tensor_frame - self.norm_mean) / self.norm_std

                with torch.no_grad():
                    prob_dist, mean_score = self.nima_model(tensor_frame)
                    raw_score = float(mean_score.item() / 10.0)
            except Exception as e:
                logger.error(f"MobileNetV3 aesthetic computation error: {e}")

        # 2. Perceptual Aesthetic Calibration (Sharpness, Contrast, Saturation)
        try:
            gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)
            
            # Sharpness metric (Laplacian variance)
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            sharpness_factor = float(np.clip(laplacian_var / 300.0, 0.2, 1.0))

            # RMS Dynamic Contrast metric
            contrast = float(gray.std())
            contrast_factor = float(np.clip(contrast / 55.0, 0.2, 1.0))

            # Color Richness / Saturation in HSV
            hsv = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2HSV)
            sat_mean = float(hsv[:, :, 1].mean())
            sat_factor = float(np.clip(sat_mean / 60.0, 0.3, 1.0))

            # Perceptual composite aesthetic multiplier
            visual_multiplier = (sharpness_factor * 0.40) + (contrast_factor * 0.35) + (sat_factor * 0.25)
            
            # Dynamic Calibration:
            # - Dark/covered camera or blurry (raw ~2.4) -> calibrated ~1.5 - 2.8
            # - Average scene (raw ~4.5) -> calibrated ~6.0 - 7.0
            # - High-quality sharp composition (raw ~5.5+) -> calibrated ~8.0 - 9.5
            norm_aesthetic = (raw_score - 2.2) / 3.8
            base_calibrated = 1.5 + (np.clip(norm_aesthetic, 0.0, 1.0) * 7.5)
            calibrated = float(np.clip(base_calibrated * (0.6 + visual_multiplier * 0.4), 1.2, 9.8))

            return round(calibrated, 1), round(raw_score, 2)
        except Exception as e:
            logger.warning(f"Perceptual calibration fallback: {e}")
            calibrated = float(np.clip(1.0 + (raw_score - 3.2) * (9.0 / (5.6 - 3.2)), 1.0, 10.0))
            return round(calibrated, 1), round(raw_score, 2)

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

        all_face_boxes = []
        if face_results and face_results.detections:
            for det in face_results.detections:
                b = det.location_data.relative_bounding_box
                bx = max(0.0, b.xmin * w)
                by = max(0.0, b.ymin * h)
                bw = min(w - bx, b.width * w)
                bh = min(h - by, b.height * h)
                all_face_boxes.append([
                    round(bx, 1),
                    round(by, 1),
                    round(bx + bw, 1),
                    round(by + bh, 1),
                ])

        # 4. Contextual Shot Type Auto-Classification
        shot_res = classify_shot_type(
            frame_bgr=frame_bgr,
            all_face_boxes=all_face_boxes,
            horizon_angle=dominant_angle,
        )

        if not all_face_boxes:
            # Context-adaptive scoring for non-human scenes (Landscape, Architecture, Food)
            if shot_res.shot_type == "landscape":
                score = int(round((tilt_score * 0.55 + (aesthetic_score / 10.0) * 0.45) * 100))
                msg = tilt_msg or shot_res.adaptive_guidance
            elif shot_res.shot_type == "architecture":
                score = int(round((tilt_score * 0.50 + (aesthetic_score / 10.0) * 0.50) * 100))
                msg = tilt_msg or shot_res.adaptive_guidance
            elif shot_res.shot_type == "food":
                score = int(round(((aesthetic_score / 10.0) * 0.85 + 0.15) * 100))
                msg = shot_res.adaptive_guidance
            else:
                score = 0
                msg = "Position subject inside the frame"

            telemetry = CompositionTelemetry(
                score=score,
                messages=[msg] if msg else ["Framing scene..."],
                target_x=None,
                target_y=None,
                face_box=None,
                sub_scores={
                    "thirds": 0.0,
                    "headroom": 0.0,
                    "tilt": round(tilt_score, 2),
                    "distance": 0.0,
                    "aesthetic_ai": aesthetic_score,
                    "aesthetic_raw": raw_aesthetic,
                },
                shot_type=shot_res.shot_type,
                shot_description=shot_res.description,
                shot_confidence=shot_res.confidence,
                estimated_distance_ft=None,
                estimated_distance_m=None,
                all_faces=[],
            )
            return telemetry

        # Pick primary subject face (highest confidence)
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

        # 5. Extract Landmarks for Eye-Level Perspective, Gaze & Lead-Room Analysis
        eye_y, nose_y, mouth_y = None, None, None
        re_x, re_y, le_x, le_y, nose_x = None, None, None, None, None
        subject_yaw = None
        angle_coaching_msg = None
        try:
            kps = primary_detection.location_data.relative_keypoints
            if kps and len(kps) >= 4:
                re_x = kps[0].x * w
                re_y = kps[0].y * h
                le_x = kps[1].x * w
                le_y = kps[1].y * h
                nose_x = kps[2].x * w
                nose_y = kps[2].y * h
                mouth_x = kps[3].x * w
                mouth_y = kps[3].y * h
                eye_y = (re_y + le_y) / 2.0

                d_r = abs(nose_x - re_x)
                d_l = abs(nose_x - le_x)
                eye_span = max(10.0, abs(re_x - le_x))
                subject_yaw = (d_r - d_l) / eye_span

                # If perfectly symmetric/flat front, recommend 45-degree angle for dramatic depth
                if abs(subject_yaw) < 0.08 and shot_res.shot_type == "portrait":
                    angle_coaching_msg = "Turn face slightly at 45° angle for cinematic portrait depth"
        except Exception:
            pass

        # 6. Rule of Thirds & Lead-Room Composition Alignment
        thirds_score, target_pt, dist, thirds_msg = evaluate_rule_of_thirds(
            center_x=center_x,
            center_y=center_y,
            frame_width=float(w),
            frame_height=float(h),
            subject_yaw=subject_yaw,
        )

        # 7. Anatomical & Shot-Adaptive Headroom Clearance
        headroom_score, headroom_ratio, headroom_msg = evaluate_headroom(
            head_top_y=head_top_y,
            frame_height=float(h),
            face_height=box_h,
            apply_cranial_compensation=True,
        )

        # 8. Monocular Metric Depth & Subject Distance
        dist_m, dist_ft, depth_score, depth_msg = estimate_metric_face_distance(
            face_box=face_box,
            frame_width=float(w),
            frame_height=float(h),
        )
        dist_score, dist_ratio, generic_dist_msg = evaluate_subject_distance(
            face_width=box_w,
            frame_width=float(w),
        )
        # Use precise metric depth prompt if triggered
        final_dist_msg = depth_msg if depth_msg else generic_dist_msg
        final_dist_score = min(depth_score, dist_score)

        # 9. Face Lighting & Harsh Backlight Quality
        lighting_score, face_lum, lighting_status, lighting_msg = evaluate_face_lighting(
            frame_bgr=frame_bgr,
            face_box=face_box,
        )

        perspective_score, perspective_status, perspective_msg = evaluate_camera_perspective(
            face_box=face_box,
            eye_y=eye_y,
            nose_y=nose_y,
            mouth_y=mouth_y,
            re_x=re_x,
            re_y=re_y,
            le_x=le_x,
            le_y=le_y,
            nose_x=nose_x,
        )

        # Prioritize guidance messages (Framing, Headroom, Tilt, Perspective and Lighting prioritized for natural coaching)
        candidates = []
        if shot_res.edge_clipped_subject:
            candidates.append((0.15, shot_res.edge_clipped_subject))
        if thirds_msg:
            candidates.append((thirds_score, thirds_msg))
        if headroom_msg:
            candidates.append((headroom_score, headroom_msg))
        if tilt_msg:
            candidates.append((tilt_score, tilt_msg))
        if perspective_msg:
            candidates.append((perspective_score, perspective_msg))
        if lighting_msg:
            candidates.append((lighting_score, lighting_msg))
        if angle_coaching_msg:
            candidates.append((0.78, angle_coaching_msg))
        if final_dist_msg:
            # Deprioritize distance so framing, angles and posture take priority over metric depth
            candidates.append((max(0.88, final_dist_score), final_dist_msg))

        telemetry = compute_composite_score(
            thirds_score=thirds_score,
            headroom_score=headroom_score,
            tilt_score=tilt_score,
            distance_score=final_dist_score,
            guidance_candidates=candidates,
            target_point=target_pt,
            face_box=face_box,
            has_subject=True,
        )

        # Attach Deep Learning, Depth & Scene Context
        telemetry.sub_scores["aesthetic_ai"] = aesthetic_score
        telemetry.sub_scores["aesthetic_raw"] = raw_aesthetic
        telemetry.sub_scores["lighting"] = lighting_score
        telemetry.sub_scores["face_lum"] = face_lum
        telemetry.sub_scores["perspective"] = perspective_score
        if dist_ft is not None:
            telemetry.sub_scores["distance_ft"] = dist_ft
            telemetry.sub_scores["distance_m"] = dist_m

        telemetry.shot_type = shot_res.shot_type
        telemetry.shot_description = shot_res.description
        telemetry.shot_confidence = shot_res.confidence
        telemetry.estimated_distance_ft = dist_ft
        telemetry.estimated_distance_m = dist_m
        telemetry.all_faces = all_face_boxes

        return telemetry


# Singleton instance
vision_engine = VisionEngine()
