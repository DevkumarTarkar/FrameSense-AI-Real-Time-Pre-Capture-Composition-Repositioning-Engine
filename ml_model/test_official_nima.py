"""
FrameSense AI - Official Verified NIMA Benchmark (Trained on 255k AVA Images)
Uses the official research weights from CUHK / Google NIMA paper running on RTX 3050 CUDA.
"""

import os
import time
import torch
import pyiqa
import numpy as np
from PIL import Image, ImageFilter

def run_official_nima_test():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print("\n" + "=" * 70)
    print("      FRAMESENSE AI - OFFICIAL AVA PRETRAINED NIMA BENCHMARK")
    print(f"      Accelerator: {device} ({torch.cuda.get_device_name(0)})")
    print("=" * 70)

    # 1. Instantiate official NIMA metric on RTX 3050 GPU
    print("[Model] Loading official NIMA metric on GPU...")
    nima_metric = pyiqa.create_metric('nima', device=device)
    print("[Model] Official NIMA model loaded successfully!")

    # 2. Pick sample images from data/images
    img_files = os.listdir("data/images")
    if not img_files:
        print("No images found in data/images")
        return

    sample_img_path = os.path.join("data/images", img_files[0])
    
    # Create an artificially degraded / blurry version of the same image to test contrast
    orig_img = Image.open(sample_img_path).convert("RGB")
    blurry_img = orig_img.filter(ImageFilter.GaussianBlur(radius=8))
    
    os.makedirs("data/test_comparison", exist_ok=True)
    orig_path = os.path.join("data/test_comparison", "original_sharp.jpg")
    blurry_path = os.path.join("data/test_comparison", "blurred_degraded.jpg")
    
    orig_img.save(orig_path)
    blurry_img.save(blurry_path)

    # 3. Evaluate both images on RTX 3050 GPU
    if device.type == "cuda":
        torch.cuda.synchronize()
    t0 = time.perf_counter()
    score_sharp = nima_metric(orig_path).item()
    if device.type == "cuda":
        torch.cuda.synchronize()
    lat_sharp = (time.perf_counter() - t0) * 1000.0

    t1 = time.perf_counter()
    score_blurry = nima_metric(blurry_path).item()
    if device.type == "cuda":
        torch.cuda.synchronize()
    lat_blurry = (time.perf_counter() - t1) * 1000.0

    print("\n" + "-" * 70)
    print(f"{'Image Condition':<25} | {'NIMA Score (1-10)':<20} | {'Inference Latency':<15}")
    print("-" * 70)
    print(f"{'Original Sharp Photo':<25} | {score_sharp:0.2f} / 10.00          | {lat_sharp:0.2f} ms")
    print(f"{'Degraded / Blurry Photo':<25} | {score_blurry:0.2f} / 10.00          | {lat_blurry:0.2f} ms")
    print("-" * 70)
    print(f"Dynamic Score Separation Delta: {score_sharp - score_blurry:+0.2f} points")
    print("=" * 70 + "\n")

if __name__ == "__main__":
    run_official_nima_test()
