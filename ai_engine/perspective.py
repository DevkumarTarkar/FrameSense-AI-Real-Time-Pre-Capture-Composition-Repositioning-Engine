"""
FrameSense AI - Eye-Level Camera Angle & Perspective Analyzer
Detects unflattering low-angle camera tilt (double-chin perspective) or excessive high-angle shots
by evaluating facial landmark pitch and eye-level positioning relative to the head box.
Adheres strictly to FrameSense AI PRD Standards.
"""

from typing import Tuple, Optional, List
from ai_engine.contract import EvaluatorResult, EvaluationStatus


def evaluate_camera_perspective(
    face_box: Optional[List[float]],
    eye_y: Optional[float] = None,
    nose_y: Optional[float] = None,
    mouth_y: Optional[float] = None,
    re_x: Optional[float] = None,
    re_y: Optional[float] = None,
    le_x: Optional[float] = None,
    le_y: Optional[float] = None,
    nose_x: Optional[float] = None,
) -> Tuple[float, str, Optional[str]]:
    """
    Evaluates whether the camera is held at flattering portrait eye-level,
    detects chin pitch, head tilt, and profile angle.
    Maintains 100% backward-compatible return signature.

    Returns:
        score (float): Normalized perspective score [0.0, 1.0].
        angle_status (str): 'eye_level' | 'low_angle' | 'high_angle' | 'chin_up' | 'chin_down' | 'head_tilted' | 'turned_away'.
        message (str | None): Guidance message for camera elevation or face pose angle.
    """
    result = evaluate_camera_perspective_contract(
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
    status_str = result.diagnostics.get("angle_status", "eye_level")
    return result.score, status_str, result.recommendation


def evaluate_camera_perspective_contract(
    face_box: Optional[List[float]],
    eye_y: Optional[float] = None,
    nose_y: Optional[float] = None,
    mouth_y: Optional[float] = None,
    re_x: Optional[float] = None,
    re_y: Optional[float] = None,
    le_x: Optional[float] = None,
    le_y: Optional[float] = None,
    nose_x: Optional[float] = None,
) -> EvaluatorResult:
    """
    Evaluates camera perspective and returns standardized EvaluatorResult contract.
    """
    if not face_box or len(face_box) < 4:
        return EvaluatorResult(
            score=1.0,
            measured_value=0.0,
            status=EvaluationStatus.UNAVAILABLE,
            recommendation=None,
            confidence=0.5,
            diagnostics={"angle_status": "eye_level"},
        )

    y1, y2 = face_box[1], face_box[3]
    box_h = y2 - y1

    if box_h <= 10.0 or eye_y is None:
        return EvaluatorResult(
            score=1.0,
            measured_value=0.0,
            status=EvaluationStatus.UNAVAILABLE,
            recommendation=None,
            confidence=0.5,
            diagnostics={"angle_status": "eye_level"},
        )

    # Ratio of eye height relative to top of head bounding box [0.0, 1.0]
    eye_ratio = (eye_y - y1) / box_h

    # 1. Low-Angle Warning (Camera held below chest/chin looking upward):
    # Eyes appear shifted abnormally high in the head box (< 0.27)
    if eye_ratio < 0.27:
        score = 0.45
        status_str = "low_angle"
        msg = "Raise camera to eye level (avoid unflattering low chin angle)"
        return EvaluatorResult(
            score=score,
            measured_value=round(eye_ratio, 3),
            status=EvaluationStatus.SUBOPTIMAL,
            recommendation=msg,
            confidence=0.92,
            diagnostics={"angle_status": status_str, "eye_ratio": round(eye_ratio, 3)},
        )

    # 2. High-Angle Warning (Camera held far overhead looking down):
    # Forehead exaggerated, eyes pushed downward (> 0.54)
    if eye_ratio > 0.54:
        score = 0.55
        status_str = "high_angle"
        msg = "Lower camera slightly to eye level"
        return EvaluatorResult(
            score=score,
            measured_value=round(eye_ratio, 3),
            status=EvaluationStatus.SUBOPTIMAL,
            recommendation=msg,
            confidence=0.90,
            diagnostics={"angle_status": status_str, "eye_ratio": round(eye_ratio, 3)},
        )

    # 3. Vertical feature proportion check: distance between eyes and nose vs nose and mouth
    if nose_y is not None and mouth_y is not None:
        eye_to_nose = max(1.0, nose_y - eye_y)
        nose_to_mouth = max(1.0, mouth_y - nose_y)
        ratio = eye_to_nose / nose_to_mouth

        # Severe upward compression (nostril exposure)
        if ratio < 0.40:
            return EvaluatorResult(
                score=0.50,
                measured_value=round(ratio, 2),
                status=EvaluationStatus.SUBOPTIMAL,
                recommendation="Raise camera to eye level (avoid low chin angle)",
                confidence=0.92,
                diagnostics={"angle_status": "low_angle", "feature_ratio": round(ratio, 2)},
            )
        elif ratio < 0.62:
            return EvaluatorResult(
                score=0.65,
                measured_value=round(ratio, 2),
                status=EvaluationStatus.SUBOPTIMAL,
                recommendation="Lower chin slightly and look at the lens",
                confidence=0.88,
                diagnostics={"angle_status": "chin_up", "feature_ratio": round(ratio, 2)},
            )
        elif ratio > 1.85:
            return EvaluatorResult(
                score=0.65,
                measured_value=round(ratio, 2),
                status=EvaluationStatus.SUBOPTIMAL,
                recommendation="Lift chin slightly for a sharp jawline",
                confidence=0.88,
                diagnostics={"angle_status": "chin_down", "feature_ratio": round(ratio, 2)},
            )

    # 4. Head roll / tilt angle (slanted head)
    if re_x is not None and re_y is not None and le_x is not None and le_y is not None:
        dx = abs(re_x - le_x)
        dy = abs(re_y - le_y)
        if dx > 15.0 and (dy / dx) > 0.22:
            return EvaluatorResult(
                score=0.70,
                measured_value=round(dy / dx, 3),
                status=EvaluationStatus.SUBOPTIMAL,
                recommendation="Straighten your head slightly",
                confidence=0.90,
                diagnostics={"angle_status": "head_tilted", "roll_ratio": round(dy / dx, 3)},
            )

    # 5. Profile turned too far sideways
    if nose_x is not None and re_x is not None and le_x is not None:
        d_r = abs(nose_x - re_x)
        d_l = abs(nose_x - le_x)
        asym = max(d_r, d_l) / max(1.0, min(d_r, d_l))
        if asym > 3.8:
            return EvaluatorResult(
                score=0.68,
                measured_value=round(asym, 2),
                status=EvaluationStatus.SUBOPTIMAL,
                recommendation="Turn face slightly back towards the camera",
                confidence=0.90,
                diagnostics={"angle_status": "turned_away", "profile_asymmetry": round(asym, 2)},
            )

    return EvaluatorResult(
        score=1.0,
        measured_value=round(eye_ratio, 3),
        status=EvaluationStatus.OPTIMAL,
        recommendation=None,
        confidence=1.0,
        diagnostics={"angle_status": "eye_level", "eye_ratio": round(eye_ratio, 3)},
    )
