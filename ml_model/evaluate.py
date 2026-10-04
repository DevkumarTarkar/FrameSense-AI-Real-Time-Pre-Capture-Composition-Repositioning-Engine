"""
FrameSense AI - Hardware Latency & Aesthetic Model Evaluation Benchmark
Benchmarks MobileNetV3-NIMA on NVIDIA RTX 3050 GPU (CUDA) for real-time inference latency.
"""

import time
import torch
import numpy as np
from PIL import Image
from ml_model.aesthetic_net import build_aesthetic_model
from ml_model.dataset_loader import build_aesthetic_transforms


def run_hardware_benchmark(num_iterations=100):
    """
    Benchmarks GPU inference latency and VRAM consumption.
    Demonstrates hardware acceleration on NVIDIA RTX 3050.
    """
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    print("\n" + "=" * 65)
    print("      FRAMESENSE AI - DEEP LEARNING HARDWARE BENCHMARK")
    print("=" * 65)
    print(f"Target Compute Device  : {device}")

    if device.type == "cuda":
        gpu_name = torch.cuda.get_device_name(0)
        props = torch.cuda.get_device_properties(0)
        total_vram = props.total_memory / (1024 ** 2)
        print(f"GPU Hardware           : {gpu_name}")
        print(f"Compute Capability     : {props.major}.{props.minor}")
        print(f"Total Dedicated VRAM   : {total_vram:.0f} MiB")
        print(f"CUDA Driver Version    : {torch.version.cuda}")
    else:
        print("Running in CPU mode (CUDA not detected).")
    print("-" * 65)

    # 1. Instantiate model and move to GPU
    net = build_aesthetic_model(pretrained=True).to(device)
    net.eval()

    # 2. Synthetic test frame (224x224 RGB)
    dummy_input = torch.randn(1, 3, 224, 224).to(device)

    # Warmup runs (GPU kernel compilation)
    for _ in range(10):
        with torch.no_grad():
            _ = net(dummy_input)
    if device.type == "cuda":
        torch.cuda.synchronize()

    # 3. Latency measurement across multiple iterations
    latencies = []
    for _ in range(num_iterations):
        if device.type == "cuda":
            torch.cuda.synchronize()
        t0 = time.perf_counter()
        with torch.no_grad():
            prob_dist, mean_score = net(dummy_input)
        if device.type == "cuda":
            torch.cuda.synchronize()
        t1 = time.perf_counter()
        latencies.append((t1 - t0) * 1000.0)

    latencies = np.array(latencies)
    avg_latency = np.mean(latencies)
    min_latency = np.min(latencies)
    p95_latency = np.percentile(latencies, 95)
    fps_throughput = 1000.0 / avg_latency

    # VRAM allocated
    vram_used = torch.cuda.memory_allocated(0) / (1024 ** 2) if device.type == "cuda" else 0.0

    print(f"Benchmark Iterations   : {num_iterations} frames")
    print(f"Mean Latency           : {avg_latency:.2f} ms")
    print(f"Min Latency (Fastest)  : {min_latency:.2f} ms")
    print(f"95th Percentile (P95)  : {p95_latency:.2f} ms")
    print(f"Throughput Capacity    : {fps_throughput:.1f} FPS (Target: >= 10 FPS)")
    print(f"VRAM Memory Allocated  : {vram_used:.1f} MiB / {total_vram:.0f} MiB" if device.type == "cuda" else "")
    print(f"Sample Aesthetic Score : {mean_score.item():.2f} / 100")
    print("=" * 65 + "\n")

    return {
        "device": str(device),
        "mean_latency_ms": round(float(avg_latency), 2),
        "fps_capacity": round(float(fps_throughput), 1),
        "vram_used_mb": round(float(vram_used), 1),
    }


def evaluate_single_image(image_path: str, checkpoint_path: str = None):
    """Evaluates aesthetic score of a real photograph."""
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    net = build_aesthetic_model(pretrained=True).to(device)

    if checkpoint_path and torch.cuda.is_available():
        checkpoint = torch.load(checkpoint_path, map_location=device)
        net.load_state_dict(checkpoint["model_state_dict"])
        print(f"[Model] Loaded fine-tuned checkpoint from: {checkpoint_path}")

    net.eval()
    transform = build_aesthetic_transforms(is_train=False)

    img = Image.open(image_path).convert("RGB")
    tensor_img = transform(img).unsqueeze(0).to(device)

    with torch.no_grad():
        prob_dist, mean_score = net(tensor_img)

    probs = prob_dist[0].cpu().numpy()
    ratings = np.arange(1, 11)
    std_dev = np.sqrt(np.sum(probs * (ratings - (mean_score.item() / 10.0)) ** 2))

    print(f"\n--- Evaluation for {image_path} ---")
    print(f"Predicted Aesthetic Score : {mean_score.item():.2f} / 100 ({mean_score.item() / 10.0:.2f} / 10)")
    print(f"Aesthetic Confidence (std): {std_dev:.3f}")
    print(f"Rating Distribution (1-10): {[round(float(p), 3) for p in probs]}")

    return mean_score.item(), std_dev


if __name__ == "__main__":
    run_hardware_benchmark(num_iterations=50)
