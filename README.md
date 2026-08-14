# FrameSense AI 📸
> **Edge-Driven Spatial Scene Understanding & Aesthetic Viewfinder Assistant**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python 3.14](https://img.shields.io/badge/Python-3.14-green.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)

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

## 🏗️ System Architecture
```
+------------------+      Sub-20ms Feed      +------------------------+
|  Camera Device   | ----------------------> |   HTML5 Canvas HUD     |
| (WebRTC Stream)  |                         |  (60 FPS AR Overlays)  |
+------------------+                         +------------------------+
         |                                               ^
         v                                               | Score & Reticles
+---------------------------------------------------------------------+
|                     FrameSense Edge AI Engine                       |
|  +---------------------+  +--------------------+  +--------------+  |
|  | MobileNetV3 NIMA    |  | MediaPipe Mesh     |  | Hough Transform |
|  | (Aesthetic Scoring) |  | (Pose & Headroom)  |  | (Horizon Tilt)| |
|  +---------------------+  +--------------------+  +--------------+  |
+---------------------------------------------------------------------+
```

---

## 📁 Repository Structure
```
FrameSense-AI/
├── README.md              # Project overview & documentation
├── .gitignore             # Git ignore rules
└── venv/                  # Python virtual environment
```

---

## 🛠️ Tech Stack
- **AI & ML**: PyTorch, MobileNetV3 (NIMA), OpenCV, MediaPipe, NumPy
- **Backend API**: FastAPI, Uvicorn, Pillow, Pydantic
- **Frontend HUD**: React 18, Vite, HTML5 Canvas 2D, Web Speech API

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
