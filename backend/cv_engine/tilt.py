import math
import numpy as np
import cv2

class HorizonTiltDetector:
    """
    Computer Vision spatial geometry engine for real-time horizon tilt 
    detection and camera inclination angle estimation using Hough Line Transforms.
    """
    def __init__(self, min_line_length_ratio=0.25, max_line_gap=20):
        self.min_line_length_ratio = min_line_length_ratio
        self.max_line_gap = max_line_gap

    def compute_tilt(self, image_np):
        """
        Analyzes image numpy array (RGB/BGR) to extract dominant horizontal lines 
        and calculate inclination angle error in degrees.
        """
        if image_np is None or image_np.size == 0:
            return self._get_fallback_result("Invalid or empty image array")

        height, width = image_np.shape[:2]

        # Convert to Grayscale if image is 3-channel
        if len(image_np.shape) == 3:
            gray = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY)
        else:
            gray = image_np

        # Apply noise reduction blur and edge detection
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 50, 150, apertureSize=3)

        min_line_len = int(width * self.min_line_length_ratio)
        lines = cv2.HoughLinesP(
            edges, 
            rho=1, 
            theta=np.pi / 180, 
            threshold=70, 
            minLineLength=min_line_len, 
            maxLineGap=self.max_line_gap
        )

        detected_angles = []

        if lines is not None:
            for item in lines:
                # Handle varying line shape outputs from OpenCV HoughLinesP
                if len(item.shape) > 0 and item.shape[0] == 4:
                    x1, y1, x2, y2 = item
                elif len(item[0]) == 4:
                    x1, y1, x2, y2 = item[0]
                else:
                    continue

                dx = float(x2 - x1)
                dy = float(y2 - y1)

                if abs(dx) > 1e-3:
                    # Calculate inclination angle relative to horizontal axis
                    angle_rad = math.atan2(dy, dx)
                    angle_deg = math.degrees(angle_rad)

                    # Normalize angle to range [-90, 90]
                    if angle_deg > 90:
                        angle_deg -= 180
                    elif angle_deg < -90:
                        angle_deg += 180

                    # Filter for near-horizontal lines (tilt <= 35 degrees)
                    if abs(angle_deg) <= 35.0:
                        detected_angles.append(angle_deg)

        if len(detected_angles) > 0:
            tilt_angle = float(np.median(detected_angles))
            horizon_found = True
        else:
            tilt_angle = 0.0
            horizon_found = False

        # Calculate level score: 100 at 0 degrees, degrading down as tilt increases
        abs_tilt = abs(tilt_angle)
        tilt_score = max(0.0, min(100.0, 100.0 - abs_tilt * 7.5))
        is_level = abs_tilt <= 1.0

        # Construct natural audio prompt
        if is_level:
            voice_prompt = "Horizon perfectly aligned."
        elif tilt_angle > 0:
            voice_prompt = f"Rotate camera left {abs_tilt:.1f} degrees to level horizon."
        else:
            voice_prompt = f"Rotate camera right {abs_tilt:.1f} degrees to level horizon."

        return {
            'tilt_angle_deg': round(tilt_angle, 2),
            'tilt_score': round(tilt_score, 1),
            'is_level': is_level,
            'horizon_found': horizon_found,
            'lines_analyzed': len(detected_angles),
            'voice_prompt': voice_prompt
        }

    def _get_fallback_result(self, error_msg):
        return {
            'tilt_angle_deg': 0.0,
            'tilt_score': 85.0,
            'is_level': True,
            'horizon_found': False,
            'lines_analyzed': 0,
            'voice_prompt': "Hold steady, scanning horizon level.",
            'error': error_msg
        }

def estimate_horizon_tilt(image_np):
    """
    Convenience wrapper function for horizon tilt computation.
    """
    detector = HorizonTiltDetector()
    return detector.compute_tilt(image_np)

if __name__ == '__main__':
    # Local verification test script
    print("[CV Engine] Testing Horizon Tilt Detector...")
    
    # Generate synthetic image with an inclined horizon line
    canvas = np.zeros((480, 640, 3), dtype=np.uint8)
    
    angle_deg = 4.5
    angle_rad = math.radians(angle_deg)
    center_y = 240
    dx = 250
    dy = int(dx * math.tan(angle_rad))
    
    cv2.line(canvas, (320 - dx, center_y - dy), (320 + dx, center_y + dy), (255, 255, 255), 4)

    detector = HorizonTiltDetector()
    result = detector.compute_tilt(canvas)

    print(f"[CV Engine] Detected Tilt Angle: {result['tilt_angle_deg']}°")
    print(f"[CV Engine] Tilt Score: {result['tilt_score']}/100")
    print(f"[CV Engine] Is Level: {result['is_level']}")
    print(f"[CV Engine] Voice Guidance: '{result['voice_prompt']}'")
