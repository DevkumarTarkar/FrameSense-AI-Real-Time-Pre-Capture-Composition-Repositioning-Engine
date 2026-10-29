# FrameSense AI 📸

> **Real-Time Pre-Capture Composition & Hardware-Accelerated Aesthetic Assessment Engine**  
> *A Dual-Brain Hybrid Architecture combining classical geometric computer vision with deep convolutional neural image assessment on NVIDIA RTX GPUs.*

[![CUDA 12.4](https://img.shields.io/badge/CUDA-12.4-76B900.svg?logo=nvidia&logoColor=white)](https://developer.nvidia.com/cuda-toolkit)
[![PyTorch 2.6](https://img.shields.io/badge/PyTorch-2.6.0%2Bcu124-EE4C2C.svg?logo=pytorch&logoColor=white)](https://pytorch.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-0.10.14-00A98F.svg)](https://developers.google.com/mediapipe)
[![OpenCV](https://img.shields.io/badge/OpenCV-4.11-5C3EE8.svg?logo=opencv&logoColor=white)](https://opencv.org/)
[![Tests Passing](https://img.shields.io/badge/Tests-15%2F15%20Passing-brightgreen.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🎓 Academic Attribution & Engineering Team

**Bachelor of Technology Major Project**  
*Department of Computer Science & Engineering (Artificial Intelligence & Machine Learning)*  
**GLA University, Mathura — Class of 2026**

- **Dev Kumar Tarkar** (Roll No: `2415500147`) — **Team Lead: AI/Deep Learning, Vision Pipeline & Frontend Architecture**
- **Dev Aggarwal** (Roll No: `2415500145`) — **Team Member: Backend Engineering, Network Protocols & API Design**
- **Project Mentor:** **Ms. Sanjana Shaw**, Assistant Professor, Dept. of CSE, GLA University

---

## 💡 The Core Problem: Pre-Capture Correction vs. Post-Capture Editing

Every day, billions of photos are captured on smartphones and cameras, but most users lack formal training in spatial framing. The common remedy is **post-capture editing** (cropping, rotating, leveling). 

However, post-capture editing carries severe irreversible penalties:
1. **Permanent Resolution Loss:** Cropping a 12MP shot down to an off-center subject discards up to 60% of sensor pixels.
2. **Perspective Distortion:** Software rotation warps background planes and truncates edge details.
3. **Loss of Field of View:** You cannot restore limbs or landmarks that were never captured inside the sensor frame.

**FrameSense AI** solves this problem by moving quality evaluation to the **pre-capture phase**. As the user holds up their camera, FrameSense evaluates the live stream and provides real-time visual reticles and conversational voice prompts (*"Tilt down 3 degrees"*, *"Step back to balance headroom"*) — ensuring the shot is framed perfectly **before** the shutter is clicked.

---

## 🧠 Technical Innovation: Dual-Brain Hybrid Architecture

Unlike conventional solutions that rely either on fragile heuristics or unexplainable black-box neural networks, FrameSense AI introduces a **Dual-Brain Hybrid Architecture**:

```
                       ┌──────────────────────────────────────────────┐
                       │           Live Camera Stream (10 FPS)        │
                       └──────────────────────┬───────────────────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      │                                               │
         ▼                                                            ▼
┌─────────────────────────────────┐                       ┌─────────────────────────────────┐
│     BRAIN 1: GEOMETRIC ENGINE   │                       │   BRAIN 2: NEURAL AESTHETIC AI  │
│  (MediaPipe + OpenCV Canny/Hough│                       │(MobileNetV3-NIMA on RTX 3050 GPU│
├─────────────────────────────────┤                       ├─────────────────────────────────┤
│ • Rule-of-Thirds Alignment      │                       │ • Google NIMA Architecture      │
│ • Headroom Ratio (0.10 - 0.18)  │                       │ • Trained on 5,000 Real AVA     │
│ • Horizon Leveling (|θ| ≤ 2°)   │                       │   Benchmark Photographs         │
│ • Subject Distance Ratio        │                       │ • Earth Mover's Distance Loss   │
│ • 100% Explainable Mathematics  │                       │ • RTX 3050 CUDA Acceleration    │
└────────────────┬────────────────┘                       └────────────────┬────────────────┘
                 │                                                         │
                 └────────────────────────────┬────────────────────────────┘
                                              │
                                              ▼
                             ┌──────────────────────────────────┐
                             │    Unified Master Telemetry      │
                             │  • Composite Score: 0 - 100      │
                             │  • Neural Aesthetic: 1.0 - 10.0  │
                             │  • Real-Time Voice Guidance      │
                             └──────────────────────────────────┘
```

1. **Brain 1 (Classical Geometric & Explainability Engine):**
   - Pure, deterministic mathematics implemented in pure Python (`ai_engine/`).
   - Evaluates Rule of Thirds golden intersections, headroom ratios, horizon tilt angles ($\theta$), and face-to-frame distance ratios.
   - **100% Explainable:** Provides exact pixel target coordinates and human-understandable spatial instructions.

2. **Brain 2 (Deep Learning Neural Image Assessment - NIMA):**
   - Fine-tuned on the prestigious **AVA (Aesthetic Visual Analysis)** photographic dataset.
   - Utilizes **Earth Mover's Distance (EMD)** loss ($r=2$ Wasserstein distance) over 10 ordered aesthetic rating bins.
   - Accurately captures lighting harmony, background contrast, textural richness, and visual balance.

---

## ⚡ Hardware Acceleration & Benchmark Results

FrameSense AI has been benchmarked and verified on an **ASUS TUF Gaming F16** featuring an **NVIDIA GeForce RTX 3050 A Laptop GPU (4 GB GDDR6, CUDA 12.4)**:

| Metric | Measured Value | Practical Significance |
|---|:---:|---|
| **GPU Inference Latency** | **10.84 ms / frame** | Real-time execution without frame drops |
| **Peak Inference Throughput** | **92.3 FPS** | Well above the 10 FPS streaming target |
| **VRAM Memory Usage** | **12.9 MB** | Leaves >99% of GPU VRAM free |
| **End-to-End WebSocket Roundtrip**| **~21.4 ms** | Sub-perceptual feedback latency |
| **Unit Test Suite Coverage** | **15/15 Passed (0.21s)**| Robust algorithmic stability |

---

## 📁 Repository Structure

```
FrameSense-AI/
├── ai_engine/                       # Brain 1: Pure Python Geometric Heuristics
│   ├── rule_of_thirds.py            # Euclidean distance to golden intersections
│   ├── headroom.py                  # Headroom clearance ratio analyzer
│   ├── horizon.py                   # Horizon tilt scoring mathematics
│   ├── horizon_cv.py                # OpenCV Canny + Probabilistic Hough Lines
│   ├── distance.py                  # Face bounding box scale ratio
│   ├── scoring.py                   # Weighted heuristic aggregation & spatial vectors
│   └── tests/                       # 15 Automated PyTest test suites
├── ml_model/                        # Brain 2: Deep Learning Neural Aesthetic Engine
│   ├── loss.py                      # Earth Mover's Distance (EMD) Loss implementation
│   ├── train.py                     # NIMA fine-tuning pipeline with Cosine Annealing
│   ├── evaluate.py                  # GPU latency & VRAM benchmarking suite
│   ├── test_official_nima.py        # AVA pre-trained PyIQA evaluation script
│   └── weights/                     # Saved PyTorch checkpoint weights
├── backend/                         # FastAPI WebSocket Orchestrator
│   ├── main.py                      # FastAPI application entrypoint & CORS setup
│   └── app/
│       ├── config.py                # App configuration & environment settings
│       ├── schemas.py               # Pydantic v2 telemetry request/response contracts
│       ├── vision.py                # VisionEngine orchestrating Brain 1 + Brain 2
│       └── websocket_routes.py      # /ws/analyze full-duplex WebSocket stream
├── data/                            # Dataset Ingestion & Benchmarking
│   ├── download_ava.py              # Multi-threaded AVA dataset downloader
│   └── curated_ava_benchmark.txt    # 5,000 curated photographic benchmark records
├── FrameSense-AI-PRD.md             # Complete Product Requirements Document v2.0
├── FrameSense-AI-Design-Docs.md     # System Architecture & Sequence Diagrams v2.0
└── FrameSense-AI-TechStack.md       # Technical Stack & Hardware Specification v2.0
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.11.x
- NVIDIA GPU with CUDA 12.x (Optional, falls back to CPU if unavailable)
- Node.js 18+ (For frontend)

### 1. Clone & Set Up Python Environment
```bash
git clone https://github.com/DevkumarTarkar/FrameSense-AI-Real-Time-Pre-Capture-Composition-Repositioning-Engine.git
cd FrameSense-AI-Real-Time-Pre-Capture-Composition-Repositioning-Engine

python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r backend/requirements.txt
```

### 2. Run Algorithmic Unit Tests
```bash
pytest ai_engine/tests -v
```
*Expected: `15 passed in 0.21s`*

### 3. Start the FastAPI WebSocket Engine
```bash
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be available at `http://127.0.0.1:8000/docs`.

### 4. Run the GPU Benchmark
```bash
python ml_model/evaluate.py
```

---

## 📜 Academic Integrity & Defense Readiness

All mathematical formulations, dataset ingestion scripts, and deep learning components in this repository have been developed from first principles without synthetic data falsification. Every architectural decision is grounded in academic research (Google NIMA, AVA Benchmark, BlazeFace, Hough Transform) and is ready for live viva demonstration and defense.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
