# FrameSense AI — Product Requirements Document (PRD)

**Project Title:** FrameSense AI: Real-Time Pre-Capture Composition & Hardware-Accelerated Aesthetic Assessment Engine  
**Degree Track:** B.Tech Major Project (Computer Science & Engineering — Artificial Intelligence & Machine Learning)  
**Academic Institution:** GLA University, Mathura  
**Version:** 2.0 (Dual-Brain Hybrid Architecture)  
**Status:** Implemented & Verified on NVIDIA GeForce RTX 3050 GPU  

---

## 1. Executive Summary

**FrameSense AI** is a real-time, pre-capture photography composition and aesthetic quality assistant. Operating via a live webcam feed through a browser interface, it provides active visual overlays (HTML5 Canvas HUD) and conversational voice feedback (Web Speech API) to guide users in correcting framing, angle, distance, headroom, and aesthetic mistakes **before** pressing the shutter.

### Core Philosophy: Pre-Capture Correction over Post-Capture Editing
Traditional post-capture editing (cropping, rotating, leveling) permanently sacrifices sensor resolution, distorts the background perspective, and loses field of view. FrameSense AI shifts quality assurance to the pre-capture stage, eliminating framing errors before the photo is taken.

---

## 2. Core Technical Innovation: Dual-Brain Hybrid Architecture

Unlike conventional toy projects that rely exclusively on either black-box neural networks or trivial heuristic rules, FrameSense AI introduces a **Dual-Brain Hybrid Architecture**:

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

1. **Brain 1 (Classical Geometric & Explainability Engine)**:
   - Uses MediaPipe Face Detection and OpenCV Canny + Hough transform.
   - Computes deterministic, mathematical sub-scores: Rule of Thirds, Headroom clearance, Horizon leveling, and Subject distance.
   - Guarantees 100% explainability: every recommendation is mathematically justifiable in a viva defense.

2. **Brain 2 (Deep Learning Neural Aesthetic Engine)**:
   - Uses Google's **Neural Image Assessment (NIMA)** architecture with a lightweight **MobileNetV3** backbone.
   - Fine-tuned on **5,000 real photographic benchmarks** curated from the **CVPR AVA (Aesthetic Visual Analysis) dataset** using **Earth Mover's Distance (EMD) Loss ($r=2$)**.
   - Hardware-accelerated on **NVIDIA GeForce RTX 3050 Laptop GPU (CUDA 12.4)**, running inference in **< 11 ms** (~92 FPS capacity) with only **12.9 MB VRAM**.

---

## 3. Hardware Acceleration & Benchmarks (Asus TUF F16)

| Parameter | Measured Specification | Industry Requirement | Evaluation |
|---|---|---|---|
| **Target GPU** | **NVIDIA GeForce RTX 3050 A Laptop GPU** | Dedicated GPU | 🟢 Verified (Compute 8.9) |
| **CUDA Driver** | **CUDA 12.4 / Driver 572.40** | CUDA 11.8+ | 🟢 Up-to-date |
| **Dedicated VRAM** | **4094 MiB GDDR6** | $\ge 2\text{ GB}$ | 🟢 Ample Headroom |
| **Inference Latency** | **10.84 ms** (Fastest: **6.57 ms**) | $\le 50\text{ ms}$ | 🟢 5x Faster than target |
| **Video Throughput** | **92.3 FPS** | $\ge 10\text{ FPS}$ | 🟢 9x Streaming Capacity |
| **VRAM Allocated** | **12.9 MiB** / 4094 MiB | $\le 2000\text{ MiB}$ | 🟢 Extremely Lightweight |
| **Best Validation Loss** | **0.0894 EMD Loss** | $\le 0.12$ | 🟢 Optimal Convergence |

---

## 4. Functional Requirements

| ID | Module | Functional Specification |
|---|---|---|
| **FR1** | Camera Stream | Capture live webcam video in browser via WebRTC `getUserMedia` at native 60 FPS HUD. |
| **FR2** | Sampling Gateway | Sub-sample video frames to ~10 FPS, JPEG-encode, and transmit over persistent WebSocket. |
| **FR3** | Subject Detection | Detect primary human face bounding box `[x1, y1, x2, y2]` using MediaPipe Face Detection. |
| **FR4** | Rule of Thirds | Calculate Euclidean distance from subject center to the nearest of 4 grid power points; tolerance $\pm 8\%$ of width. |
| **FR5** | Headroom Analysis | Compute headroom ratio $\frac{\text{head\_top\_y}}{\text{frame\_height}}$. Target ideal window: $0.10 \le \text{ratio} \le 0.18$. |
| **FR6** | Horizon Leveling | Detect dominant background lines via OpenCV Canny + HoughLinesP; measure tilt angle $\theta$. Tolerance $|\theta| \le 2^\circ$. |
| **FR7** | Subject Distance | Compute face width to frame width proportion. Target: $0.12 \le \text{ratio} \le 0.45$. |
| **FR8** | Neural Aesthetics | Evaluate lighting, blur, color harmony, and aesthetic depth via MobileNetV3-NIMA on RTX 3050 CUDA. |
| **FR9** | Composite Scoring | Aggregate all signals into a weighted composite score (0–100) and an aesthetic rating (1.0–10.0). |
| **FR10** | Voice Prompts | Synthesize top-priority guidance message via Web Speech API, throttled to prevent audio overlap. |
| **FR11** | Edge Case Handling | Gracefully report score 0 with guidance *"Position subject inside frame"* when no face is visible. |
| **FR12** | Fault Tolerance | Single bad/corrupted frame does not drop WebSocket connection (PRD FR12 compliant). |

---

## 5. Composition Scoring Algorithms & Mathematical Formulations

### 5.1 Rule of Thirds Formulation
Frame is partitioned into a $3 \times 3$ matrix with grid coordinates at $x \in \{W/3, 2W/3\}$ and $y \in \{H/3, 2H/3\}$.
The 4 power points are:
$$P_1 = (W/3, H/3), \quad P_2 = (2W/3, H/3), \quad P_3 = (W/3, 2H/3), \quad P_4 = (2W/3, 2H/3)$$
The nearest intersection target is:
$$P^* = \arg\min_{P_i} \| C_{\text{subject}} - P_i \|_2$$
If distance $d \le 0.08 \times W$, score $= 1.0$. Otherwise, falls off linearly with directional guidance: *"Shift subject slightly right/left/up/down"*.

### 5.2 Headroom Clearance Formulation
$$\text{Ratio}_{\text{headroom}} = \frac{Y_{\text{head\_top}}}{H_{\text{frame}}}$$
- **Ideal Range:** $0.10 \le \text{ratio} \le 0.18 \implies \text{Score} = 1.0$
- **Tight Headroom ($< 0.10$):** Proportional penalty $\frac{\text{ratio}}{0.10} \implies$ *"Tilt camera down"*.
- **Excessive Headroom ($> 0.18$):** Linear penalty $\implies$ *"Tilt camera up or step closer"*.

### 5.3 Horizon Tilt Formulation
$$\theta = \text{atan2}(y_2 - y_1, x_2 - x_1) \times \frac{180}{\pi}$$
- $|\theta| \le 2.0^\circ \implies \text{Score} = 1.0$ (Level horizon)
- $2.0^\circ < |\theta| \le 15.0^\circ \implies$ Linear falloff to 0.0 with leveling prompts: *"Level camera: tilt left/right"*.
- No dominant horizon detected (e.g. close-up portrait) $\implies$ No penalty applied (Score = 1.0).

### 5.4 Subject Distance Formulation
$$\text{Ratio}_{\text{distance}} = \frac{W_{\text{face}}}{W_{\text{frame}}}$$
- $\text{ratio} > 0.45 \implies \text{Score} = 0.4$, Prompt: *"Step back slightly"*.
- $\text{ratio} < 0.12 \implies \text{Score} = 0.4$, Prompt: *"Step closer"*.
- $0.12 \le \text{ratio} \le 0.45 \implies \text{Score} = 1.0$, Prompt: *"Good subject distance"*.

### 5.5 Neural Aesthetic Formulation (Google NIMA on AVA Benchmark)
Predicted probability distribution across 10 aesthetic rating buckets: $\mathbf{p} = [p_1, p_2, \dots, p_{10}]$ where $\sum_{i=1}^{10} p_i = 1.0$.
$$\mu = \sum_{i=1}^{10} i \cdot p_i, \quad \sigma = \sqrt{\sum_{i=1}^{10} (i - \mu)^2 \cdot p_i}$$
**Earth Mover's Distance (EMD) Loss:**
$$\mathcal{L}_{\text{EMD}}(\mathbf{p}, \hat{\mathbf{p}}) = \left( \frac{1}{N} \sum_{k=1}^N |\text{CDF}_{\mathbf{p}}(k) - \text{CDF}_{\hat{\mathbf{p}}}(k)|^r \right)^{1/r}, \quad r=2.0$$

### 5.6 Composite Aggregation Formula
$$\text{Composite} = (0.35 \cdot S_{\text{thirds}}) + (0.25 \cdot S_{\text{headroom}}) + (0.20 \cdot S_{\text{tilt}}) + (0.20 \cdot S_{\text{distance}})$$
$$\text{Final Score} = \text{round}(\text{Composite} \times 100) \in [0, 100]$$

---

## 6. WebSocket Streaming API Contract

- **Endpoint:** `ws://localhost:8000/ws/analyze`
- **Transport:** Full-duplex asynchronous WebSocket
- **Client $\to$ Server Payload:**
  ```json
  {
    "image_base64": "data:image/jpeg;base64,...",
    "width": 640,
    "height": 480
  }
  ```
- **Server $\to$ Client Response:**
  ```json
  {
    "score": 88,
    "aesthetic_score": 8.2,
    "device": "cuda",
    "target_x": 213.3,
    "target_y": 160.0,
    "face_box": [120.5, 80.2, 260.1, 240.7],
    "messages": [
      "Excellent framing! Hold steady"
    ],
    "sub_scores": {
      "thirds": 0.95,
      "headroom": 1.0,
      "tilt": 1.0,
      "distance": 1.0,
      "aesthetic_ai": 8.2,
      "aesthetic_raw": 5.12
    }
  }
  ```

---

## 7. Project Team & Academic Attribution

- **Academic Program:** B.Tech CSE (AIML), Class of 2026, GLA University, Mathura.
- **Team Lead:** Dev Kumar Tarkar (University Roll No: 2415500147) — *AI Engine, Deep Learning NIMA Optimization, Frontend Architecture, System Integration.*
- **Team Member:** Dev Aggarwal (University Roll No: 2415500145) — *Backend FastAPI, WebSocket Streaming Gateway, Dockerization, Testing.*
- **Project Mentor:** Sanjana Shaw Mam — *Department of Computer Science & Engineering, GLA University.*
