# FrameSense AI 📸
> **Edge-Driven Spatial Scene Understanding & Aesthetic Viewfinder Assistant**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python 3.14](https://img.shields.io/badge/Python-3.14-green.svg)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-EE4C2C.svg)](https://pytorch.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED.svg)](https://www.docker.com/)

---

## 📌 Problem Statement
Every day, billions of photos are captured on mobile devices, but most users lack formal photography training. This results in:
- **Composition Failure**: Awkward crops, tilted horizons, and unbalanced subject placement.
- **Post-Capture Regret**: Discovering glare, cut-off limbs, or bad angles after leaving the scene.
- **Lossy Editing**: Cropping and rotating post-capture degrades sensor resolution and field-of-view.

---

## 💡 Core Solution
**FrameSense AI** is an edge-optimized spatial scene assistant that evaluates camera feeds **before** the shutter button is pressed. Running lightweight neural networks on edge NPUs, the system provides:
- **Sub-20ms Real-Time Guidance**: Dynamic AR reticles (Rule of Thirds, Horizon Leveler, Headroom Box).
- **Natural Voice Prompts**: Speech synthesis (*"Step back 2 feet"*, *"Tilt camera up"*).
- **Contextual Shot Adaptors**: Custom rules for Portrait, Group, Architecture, Landscape, and Food.
- **Intelligent Auto-Shutter**: Automatically clicks when aesthetic composition score exceeds 88% sustained threshold.

---

## 🏗️ Technical Architecture & Stack Alignment

```
+-----------------------------------------------------------------------+
|  Frontend: React 18 + TypeScript + Vite + HTML5 Canvas (60 FPS HUD)   |
+-----------------------------------------------------------------------+
                                   |
                       WebSockets / REST (<20ms)
                                   v
+-----------------------------------------------------------------------+
|                Backend: Python 3.14 + FastAPI + Async               |
|                                                                       |
|  +---------------------+  +--------------------+  +----------------+  |
|  | PyTorch NIMA        |  | MediaPipe Face     |  | YOLOv8-Pose    |  |
|  | (Aesthetic Score)   |  | (Headroom Mesh)    |  | (Limb Bounds)  |  |
|  +---------------------+  +--------------------+  +----------------+  |
|  +---------------------+  +--------------------+                      |
|  | OpenCV & NumPy      |  | PostgreSQL DB      |                      |
|  | (Horizon Hough)     |  | (Analytics & Logs) |                      |
|  +---------------------+  +--------------------+                      |
+-----------------------------------------------------------------------+
                                   |
                Docker Containerization & GitHub Actions CI/CD
```

---

## 🛠️ Complete Technology Stack

| Layer | Technologies Used | Role / Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | **React 18, TypeScript, Vite** | Futuristic Cyberpunk AR Viewfinder HUD & Canvas Reticles |
| **Real-Time Backend**| **Python 3.14, FastAPI, Uvicorn** | Low-latency WebSockets & REST image processing server |
| **Computer Vision** | **OpenCV, NumPy** | Hough Line horizon tilt calculation & spatial matrix math |
| **Deep Learning** | **PyTorch, MobileNetV3 (NIMA)** | Aesthetic score regression & distribution scoring |
| **Pose & Keypoints** | **YOLOv8-Pose, MediaPipe** | 468 Face Mesh landmarks & body pose limb-cut protection |
| **Database** | **PostgreSQL** | Shot metadata analytics, historical score logs, session data |
| **DevOps & CI/CD** | **Docker, Docker Compose, GitHub Actions**| Containerization and automated integration testing workflows |

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
