import math
import numpy as np
import cv2

class RuleOfThirdsAnalyzer:
    """
    Spatial geometry analysis engine evaluating Rule of Thirds compliance 
    and power point visual energy distribution.
    """
    def __init__(self, power_point_radius_ratio=0.08):
        self.radius_ratio = power_point_radius_ratio

    def compute_thirds_score(self, image_np):
        """
        Calculates Rule of Thirds composition score (0-100) and returns 
        target reticle lock coordinates based on edge energy density.
        """
        if image_np is None or image_np.size == 0:
            return self._get_fallback_result("Invalid or empty image input")

        height, width = image_np.shape[:2]

        # Convert to Grayscale if image is multi-channel
        if len(image_np.shape) == 3:
            gray = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY)
        else:
            gray = image_np

        # Compute spatial edge gradients using Sobel operators
        sobel_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobel_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        edge_magnitude = cv2.magnitude(sobel_x, sobel_y)

        # 4 Rule of Thirds Power Point Intersection Coordinates
        w13, w23 = width / 3.0, (2.0 * width) / 3.0
        h13, h23 = height / 3.0, (2.0 * height) / 3.0

        power_points = [
            {'name': 'Top-Left', 'x': w13, 'y': h13},
            {'name': 'Top-Right', 'x': w23, 'y': h13},
            {'name': 'Bottom-Left', 'x': w13, 'y': h23},
            {'name': 'Bottom-Right', 'x': w23, 'y': h23}
        ]

        radius = int(min(width, height) * self.radius_ratio)
        energies = []

        for pt in power_points:
            px, py = int(pt['x']), int(pt['y'])
            x1, x2 = max(0, px - radius), min(width, px + radius)
            y1, y2 = max(0, py - radius), min(height, py + radius)

            roi = edge_magnitude[y1:y2, x1:x2]
            energy = float(np.mean(roi)) if roi.size > 0 else 0.0
            pt['energy'] = energy
            energies.append(energy)

        # Total image background energy
        total_bg_energy = float(np.mean(edge_magnitude)) + 1e-5
        max_power_energy = max(energies) if energies else 0.0

        # Calculate composition ratio and score
        energy_ratio = max_power_energy / total_bg_energy
        thirds_score = max(20.0, min(100.0, energy_ratio * 24.0 + 40.0))

        # Select primary active power point
        best_pt = max(power_points, key=lambda p: p['energy'])

        # Compute target reticle percentage coordinates (0-100%)
        target_pct_x = round((best_pt['x'] / float(width)) * 100.0, 1)
        target_pct_y = round((best_pt['y'] / float(height)) * 100.0, 1)

        # Construct directional voice prompt
        if thirds_score >= 85.0:
            voice_prompt = "Optimal Rule of Thirds alignment achieved."
        elif best_pt['name'].startswith('Top-Left'):
            voice_prompt = "Pan camera slightly left and up to lock power point."
        elif best_pt['name'].startswith('Top-Right'):
            voice_prompt = "Pan camera slightly right and up to lock power point."
        elif best_pt['name'].startswith('Bottom-Left'):
            voice_prompt = "Pan camera slightly left and down to lock power point."
        else:
            voice_prompt = "Pan camera slightly right and down to lock power point."

        return {
            'thirds_score': round(thirds_score, 1),
            'active_power_point': best_pt['name'],
            'target_coordinates_pct': {'x': target_pct_x, 'y': target_pct_y},
            'max_power_energy': round(max_power_energy, 2),
            'voice_prompt': voice_prompt
        }

    def _get_fallback_result(self, error_msg):
        return {
            'thirds_score': 75.0,
            'active_power_point': 'Top-Left',
            'target_coordinates_pct': {'x': 33.3, 'y': 33.3},
            'max_power_energy': 0.0,
            'voice_prompt': "Align subject with Rule of Thirds grid.",
            'error': error_msg
        }

def evaluate_rule_of_thirds(image_np):
    """
    Convenience wrapper function for Rule of Thirds evaluation.
    """
    analyzer = RuleOfThirdsAnalyzer()
    return analyzer.compute_thirds_score(image_np)

if __name__ == '__main__':
    # Local verification test script
    print("[CV Engine] Testing Rule of Thirds Spatial Analyzer...")

    # Create synthetic image with a strong visual subject circle at top-left 1/3 intersection
    canvas = np.zeros((480, 640, 3), dtype=np.uint8)
    target_x, target_y = int(640 / 3.0), int(480 / 3.0)

    # Draw subject circle with concentric high contrast rings
    cv2.circle(canvas, (target_x, target_y), 40, (255, 255, 255), -1)
    cv2.circle(canvas, (target_x, target_y), 25, (0, 240, 255), 3)

    analyzer = RuleOfThirdsAnalyzer()
    result = analyzer.compute_thirds_score(canvas)

    print(f"[CV Engine] Rule of Thirds Score: {result['thirds_score']}/100")
    print(f"[CV Engine] Primary Power Point: {result['active_power_point']}")
    print(f"[CV Engine] Target Reticle Lock: X={result['target_coordinates_pct']['x']}%, Y={result['target_coordinates_pct']['y']}%")
    print(f"[CV Engine] Voice Prompt: '{result['voice_prompt']}'")
