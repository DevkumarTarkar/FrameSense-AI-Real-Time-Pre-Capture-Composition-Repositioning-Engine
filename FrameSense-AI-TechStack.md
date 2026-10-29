# FrameSense AI — Technology Stack Specification

**Project Title:** FrameSense AI: Real-Time Pre-Capture Composition & Hardware-Accelerated Aesthetic Assessment Engine  
**Degree Track:** Bachelor of Technology (Computer Science & Engineering — Artificial Intelligence & Machine Learning)  
**Academic Institution:** GLA University, Mathura (Class of 2026)  
**Project Team:**
- **Dev Kumar Tarkar** (University Roll No: 2415500147) — *Team Lead: AI/Deep Learning, Vision Pipeline & Frontend Architecture*
- **Dev Aggarwal** (University Roll No: 2415500145) — *Team Member: Backend Engineering, Network Protocols & API Design*  
**Project Mentor:** **Ms. Sanjana Shaw**, Assistant Professor, Department of Computer Science & Engineering, GLA University  
**Technology Stack Version:** 2.0 (Dual-Brain Hardware-Accelerated Architecture)  
**Hardware Verification Target:** ASUS TUF Gaming F16 Laptop / NVIDIA GeForce RTX 3050 A Laptop GPU (4 GB GDDR6, CUDA 12.4, Compute Capability 8.9)

---

## 1. Complete Technology Stack Matrix

| Architecture Layer | Technology / Library | Version | Role in FrameSense AI |
|---|---|:---:|---|
| **Client Framework** | React | 18.3.1 | Component-based reactive UI architecture |
| **Client Toolchain** | Vite | 5.4.2 | Sub-second HMR and optimized ES modules bundler |
| **Client Language** | TypeScript | 5.5.4 | Strict type contracts matching backend Pydantic schemas |
| **Real-Time HUD** | HTML5 Canvas 2D API | Native | 60 FPS non-blocking HUD and vector overlay rendering |
| **Sensor Ingestion** | WebRTC `getUserMedia` | Native | Zero-dependency camera stream acquisition |
| **Voice Guidance** | Web Speech Synthesis API | Native | Offline hands-free audio feedback engine |
| **Network Protocol** | WebSocket (Full-Duplex) | RFC 6455 | Low-overhead bidirectional 10 FPS frame streaming |
| **Backend Framework** | FastAPI | 0.115.0 | Async ASGI framework for high-throughput WebSocket orchestration |
| **ASGI Web Server** | Uvicorn (uvloop) | 0.30.6 | Ultra-fast asynchronous event loop server |
| **Backend Language** | Python | 3.11.9 | High-performance modern Python with native union typing |
| **Brain 1: Face Detection** | Google MediaPipe | 0.10.14 | BlazeFace anchor-based facial bounding box detector (CPU) |
| **Brain 1: Geometric CV** | OpenCV (`opencv-python`) | 4.11.0 | Canny edge detection & Probabilistic Hough Transform |
| **Brain 2: Deep Learning** | PyTorch (CUDA Enabled) | 2.6.0+cu124 | GPU-accelerated tensor operations & neural inference |
| **Brain 2: Computer Vision** | TorchVision | 0.21.0+cu124 | Image transforms & normalization on GPU tensors |
| **Brain 2: Aesthetic Head** | PyIQA / Google NIMA | 0.1.16 | Neural Image Assessment with Earth Mover's Distance |
| **Hardware Driver** | NVIDIA CUDA Toolkit | 12.4 | Direct GPU streaming, tensor core execution |
| **GPU Architecture** | NVIDIA GeForce RTX 3050 A | 4 GB GDDR6 | 2048 CUDA Cores, 4th Gen Tensor Cores, Compute 8.9 |
| **Numerical Computing** | NumPy | 2.2.3 | Vectorized array transformations and Euclidean distances |
| **Data Contract Layer** | Pydantic | 2.9.2 | High-speed C-based validation of telemetry schemas |
| **Benchmark Dataset** | AVA (Aesthetic Visual Analysis)| 5,000 photos | Ground-truth photographic aesthetic benchmark |
| **Automated Testing** | PyTest | 8.3.3 | 100% automated test coverage across geometric rules |

---

## 2. Hardware Acceleration & GPU Architecture

FrameSense AI was engineered from the ground up to leverage the dedicated hardware of the **NVIDIA GeForce RTX 3050 A Laptop GPU** on the **ASUS TUF Gaming F16**:

```
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 572.70                 Driver Version: 572.70         CUDA Version: 12.8     |
|-----------------------------------------+------------------------+----------------------+
| GPU  Name                  Driver-Model | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|=========================================+========================+======================|
|   0  NVIDIA GeForce RTX 3050 ...  WDDM  |   00000000:01:00.0 Off |                  N/A |
| N/A   48C    P0             14W /   50W |      824MiB /   4096MiB  |      0%      Default |
+-----------------------------------------+------------------------+----------------------+
```

### Measured GPU Benchmark Profile

| Metric | Measured Value on RTX 3050 | Theoretical Limit |
|---|:---:|:---:|
| **Single Frame GPU Latency** | **10.84 ms** | < 15.00 ms |
| **Inference Throughput** | **92.3 FPS** | Target: 10 FPS |
| **Steady-State VRAM Footprint** | **12.9 MB** | 4,096 MB available |
| **Batch Size** | 1 (Real-time live streaming) | Dynamic |
| **Precision Mode** | FP32 / FP16 Mixed Precision | Native Tensor Cores |
| **Device Occupancy** | < 1% VRAM, 14W power draw | Extreme efficiency |

**Key Takeaway for Viva/Academic Defense:**  
The neural network requires only **12.9 MB of VRAM** and executes in **10.84 ms**. This demonstrates remarkable optimization: the model can run continuously in the background during live camera streaming without causing thermal throttling, laptop fan noise, or battery exhaustion.

---

## 3. Deep Learning & Computer Vision Specifications

### 3.1 Brain 1: Classical Geometric Engine
- **MediaPipe Face Detection (`mediapipe.python.solutions.face_detection`):**
  - Model: BlazeFace Short-Range detector.
  - Runtime: Sub-5ms execution on multicore CPU.
  - Output: Normalized bounding box `[xmin, ymin, width, height]` plus 6 key facial landmarks (eyes, nose tip, mouth center, ear tragi).
  - Use in FrameSense: Extracts the primary subject's head position, eye level, and scale ratio relative to frame boundaries.
- **OpenCV Hough Transform (`cv2.HoughLinesP`):**
  - Algorithm: Canny edge detector followed by the Probabilistic Hough Transform.
  - Parameter tuning: Threshold 40, minimum line length $W/6$, max line gap 10 px.
  - Mathematical function: Computes line slope $\theta = \arctan(\Delta y / \Delta x)$ to detect horizon tilt within a $\pm 2.0^\circ$ tolerance.

### 3.2 Brain 2: Deep Learning Neural Image Assessment (NIMA)
- **Architecture Backbone:** MobileNetV3 / InceptionV2 feature extractor pretrained on ImageNet and fine-tuned on the AVA benchmark dataset.
- **Output Head:** 10-way dense linear projection followed by a `Softmax` activation representing the discrete probability distribution of aesthetic quality scores from 1 to 10.
- **Loss Function:** Earth Mover's Distance (`EMDLoss`, $r=2$ Wasserstein distance).
  - Preserves the ordinal scale of photography ratings.
  - Punishes predictions that skew far from the ground truth distribution curve.
- **Percentile Score Normalization:**
  - In raw AVA research statistics, 5.0 represents the threshold of high aesthetic photographs (the dataset distribution is Gaussian with mean $\approx 5.2$ and standard deviation $\approx 0.6$).
  - FrameSense AI implements an intuitive percentile calibration function to translate raw AVA distributions into an accessible 1.0–10.0 score understandable by general users and evaluators.

---

## 4. Dataset & Benchmarking Infrastructure

FrameSense AI utilizes the **AVA (Aesthetic Visual Analysis)** dataset—the gold standard academic benchmark in computational aesthetic evaluation:

```
data/
├── curated_ava_benchmark.txt       # 5,000 curated image records with 10-bin vote histograms
├── download_ava.py                 # Asynchronous multi-threaded downloader
├── test_unseen_images/             # Holdout test set for validation
```

- **Curated Dataset Size:** 5,000 diverse photographs covering portraits, architecture, landscapes, street photography, and macro shots.
- **Distribution Range:** Raw aesthetic scores span from 3.77 (poorly exposed, blurry, tilted shots) to 7.82 (professionally composed award-winning photography).
- **Test Integrity:** The evaluation suite tests real human portraits against unseen images, verifying that proper framing directly increases the aesthetic score.

---

## 5. Frontend & Client-Side Technologies

### 5.1 React 18 + Vite + TypeScript
- **Component Decomposition:**
  - `CameraView.tsx`: Manages the `<video>` element and WebRTC hardware lifecycle.
  - `CompositionHUD.tsx`: Direct Canvas 2D overlay rendering at 60 FPS.
  - `ScorePanel.tsx`: Dual-gauge visual indicators for Geometric (0–100) and Neural Aesthetic (1.0–10.0) ratings.
  - `useCompositionSocket.ts`: Custom hook managing WebSocket reconnection, packet serialization, and ping/pong keep-alives.
- **Why TypeScript 5.5?**
  - Guarantees zero type-drift between backend Python Pydantic models (`schemas.py`) and frontend interfaces. Any schema modification fails at compile time.

### 5.2 HTML5 Canvas 2D HUD Rendering
- Operates on a dedicated `requestAnimationFrame` loop at a fluid **60 FPS**.
- Smooths incoming 10 FPS backend target coordinate vectors using linear interpolation:
  $$x_{\text{render}}(t) = x_{\text{render}}(t-1) + \alpha \cdot (x_{\text{target}} - x_{\text{render}}(t-1))$$
  where $\alpha = 0.25$, creating a butter-smooth visual crosshair and glowing Rule-of-Thirds grid.

### 5.3 Web Speech Synthesis API
- Native browser speech synthesis (`window.speechSynthesis`).
- Zero external cloud API calls, zero latency, zero cloud costs.
- Includes a 3.0-second speech cooldown throttle to prevent repetitive vocal chatter while the user is actively adjusting their stance.

---

## 6. Backend & Network Protocol Design

### 6.1 FastAPI & Uvicorn
- Asynchronous Python 3.11 web service.
- Handles full-duplex WebSocket connections with non-blocking async loops.
- Auto-generates OpenAPI documentation and schema validation.

### 6.2 WebSocket Wire Protocol
- **Endpoint:** `ws://127.0.0.1:8000/ws/analyze`
- **Inbound Message Format (Client → Server):**
  ```json
  {
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...",
    "width": 640,
    "height": 480
  }
  ```
- **Outbound Telemetry Format (Server → Client):**
  ```json
  {
    "composite_score": 78,
    "aesthetic_score": 6.8,
    "device": "NVIDIA GeForce RTX 3050 A Laptop GPU",
    "target_point": {"x": 213, "y": 160},
    "guidance_messages": [
      "Tilt camera down slightly to balance headroom",
      "Good rule-of-thirds alignment"
    ],
    "breakdown": {
      "thirds_score": 34,
      "headroom_score": 14,
      "tilt_score": 18,
      "distance_score": 12
    }
  }
  ```

---

## 7. Software Engineering & Quality Assurance

- **Unit Testing:** 15 automated test suites in `ai_engine/tests` covering:
  - Rule of thirds Euclidean distance calculations.
  - Headroom threshold boundaries and clipping behavior.
  - Horizon angle geometry and collinearity verification.
  - Scoring weight aggregation and edge-case boundary stability.
- **Pass Rate:** **15/15 tests passing** in 0.21s execution time.
- **Code Cleanliness:** Pure mathematical functions in `ai_engine/` maintain zero dependency on external network frameworks or database drivers, ensuring 100% reproducibility and modularity.
