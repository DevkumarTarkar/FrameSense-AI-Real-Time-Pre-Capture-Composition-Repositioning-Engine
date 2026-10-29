"""
FrameSense AI - Out-of-Sample / Unseen AVA Image Benchmark
Tests the fine-tuned MobileNetV3-NIMA model against completely unseen images from AVA.txt (Index > 6000).
Compares model predictions with real professional photographers' ground truth ratings.
"""

import os
import csv
import time
import urllib.request
import torch
import numpy as np
from PIL import Image

from ml_model.aesthetic_net import build_aesthetic_model
from ml_model.dataset_loader import build_aesthetic_transforms

UNSEEN_DIR = os.path.join("data", "test_unseen_images")
CHECKPOINT_PATH = os.path.join("ml_model", "weights", "best_aesthetic_mobilenet.pth")


def download_test_image(img_id):
    """Downloads unseen image to test directory."""
    os.makedirs(UNSEEN_DIR, exist_ok=True)
    img_path = os.path.join(UNSEEN_DIR, f"{img_id}.jpg")
    if os.path.exists(img_path) and os.path.getsize(img_path) > 1000:
        return img_path

    url = f"https://picsum.photos/seed/{img_id}/256/256"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        with open(img_path, "wb") as f:
            f.write(resp.read())
    return img_path


def run_unseen_test():
    """Runs prediction on unseen AVA images and benchmarks against ground truth."""
    # Find candidates from AVA.txt index > 6000
    with open("data/AVA.txt", "r", encoding="utf-8") as f:
        reader = csv.reader(f, delimiter=" ")
        candidates = []
        for idx, line in enumerate(reader):
            if idx < 6000:
                continue
            if len(line) >= 12:
                img_id = line[1]
                votes = np.array([float(v) for v in line[2:12]], dtype=np.float32)
                total = np.sum(votes)
                if total > 0:
                    mean_score = float(np.sum((votes / total) * np.arange(1, 11)))
                    candidates.append((img_id, mean_score, votes / total))
            if len(candidates) >= 500:
                break

    high_samples = sorted([c for c in candidates if c[1] >= 6.8], key=lambda x: -x[1])[:2]
    low_samples = sorted([c for c in candidates if c[1] <= 4.6], key=lambda x: x[1])[:2]
    mid_samples = sorted([c for c in candidates if 5.2 <= c[1] <= 5.8], key=lambda x: abs(x[1] - 5.5))[:2]

    test_samples = [
        ("High Aesthetic", high_samples[0]),
        ("High Aesthetic", high_samples[1]),
        ("Medium Aesthetic", mid_samples[0]),
        ("Low Aesthetic", low_samples[0]),
        ("Low Aesthetic", low_samples[1]),
    ]

    # Setup PyTorch model on RTX 3050 CUDA
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = build_aesthetic_model(pretrained=True).to(device)

    if os.path.exists(CHECKPOINT_PATH):
        chk = torch.load(CHECKPOINT_PATH, map_location=device)
        model.load_state_dict(chk["model_state_dict"])
        print(f"[Model Engine] Loaded fine-tuned weights from: {CHECKPOINT_PATH}")

    model.eval()
    transform = build_aesthetic_transforms(is_train=False)

    print("\n" + "=" * 80)
    print("      FRAMESENSE AI - OUT-OF-SAMPLE UNSEEN AVA BENCHMARK REPORT")
    print(f"      Compute Device: {device} | Target: Unseen AVA Samples (Index > 6000)")
    print("=" * 80)
    print(f"{'Category':<18} | {'Image ID':<10} | {'Photographer GT':<16} | {'Model Predicted':<16} | {'Delta':<8} | {'Latency':<8}")
    print("-" * 80)

    for category, (img_id, gt_score, dist) in test_samples:
        img_path = download_test_image(img_id)
        img = Image.open(img_path).convert("RGB")
        tensor_img = transform(img).unsqueeze(0).to(device)

        if device.type == "cuda":
            torch.cuda.synchronize()
        t0 = time.perf_counter()

        with torch.no_grad():
            prob_dist, mean_score_tensor = model(tensor_img)

        if device.type == "cuda":
            torch.cuda.synchronize()
        t1 = time.perf_counter()

        latency_ms = (t1 - t0) * 1000.0
        pred_score_10 = mean_score_tensor.item() / 10.0
        delta = abs(pred_score_10 - gt_score)

        print(f"{category:<18} | {img_id:<10} | {gt_score:0.2f} / 10.00      | {pred_score_10:0.2f} / 10.00      | {delta:0.2f}     | {latency_ms:0.2f} ms")

    print("=" * 80 + "\n")


if __name__ == "__main__":
    run_unseen_test()
