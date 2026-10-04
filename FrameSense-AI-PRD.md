# FrameSense AI — Product Requirements Document (PRD)

**Project Type:** B.Tech Major Project (CSE / AIML)
**Version:** 1.0
**Status:** Draft — ready for implementation

---

## 1. Overview

FrameSense AI is a real-time, pre-capture composition assistant. It analyzes
the live camera feed through a web browser and gives the user active
guidance — visual overlays, on-screen text, and voice prompts — so they fix
framing mistakes *before* pressing the shutter, instead of discovering them
afterward when it's too late to reshoot.

**Core philosophy:** Pre-capture correction over post-capture editing.
Cropping and rotating after the fact permanently loses resolution and
field-of-view; FrameSense AI prevents the mistake instead of fixing it.

---

## ✅ What We Are Building — This Project's Actual Deliverable (V1)

Everything below is being fully implemented, working, and demoed this
semester — this is the real, functioning system, not a future idea:

- Live webcam access in the browser
- Real-time face detection (MediaPipe, pretrained model)
- Rule-of-Thirds grid overlay + nearest-intersection guidance
- Headroom scoring (too tight / too much space above head)
- Horizon-tilt detection using OpenCV (Canny edge detection + Hough Transform)
- Subject-distance scoring (too close / too far)
- Combined weighted composite score (0–100), shown live
- Voice guidance via text-to-speech
- FastAPI backend with a WebSocket pipeline connecting frontend ↔ AI logic
- Fully unit-tested scoring engine (`pytest`), Dockerized backend

The **"Future Enhancements"** section further down (§9) is explicitly
*not* part of this deliverable — it exists only to show the examiner that
the scope was deliberately, thoughtfully limited rather than incomplete.
Full functional detail of what's built is in §6 (Functional Requirements)
and §8 (Scoring Algorithm) below.

---

## 2. Problem Statement

| Problem | Impact |
|---|---|
| Poor framing & composition | Casual photographers don't know rule-of-thirds, headroom, or horizon-leveling conventions in the moment |
| Post-capture regret | Bad angles, tilted horizons, and cut-off subjects are only noticed after leaving the scene |
| Lossy post-editing | Cropping/rotating to "fix" a photo destroys resolution and background detail |

---

## 3. Goals & Objectives

1. Analyze the live camera feed in real time and detect composition issues.
2. Give the user immediate, understandable feedback (visual + voice).
3. Score composition quality on a 0–100 scale using explainable rules.
4. Keep the system fully on-device / self-hosted — no third-party cloud AI APIs.
5. Ship a codebase that is modular, tested, and defensible in a viva/interview
   (every claim in this doc must be something you can explain line-by-line).

**Explicitly out of scope for v1** (see §9 Future Scope): auto-shutter
trigger, mobile native app, multi-subject group photos, scene-type
classification (portrait vs landscape vs food), trained deep-learning
aesthetic model.

> **Why no "fine-tuned deep learning aesthetic model"?** Training a real NIMA
> style model needs a labeled dataset (e.g., AVA), GPU time, and evaluation —
> that's a separate research project. Claiming a trained model you can't
> explain in a viva is a resume/interview risk. Instead, v1 uses a
> **transparent, weighted heuristic scoring engine** built on real detected
> landmarks (MediaPipe) and classical CV (OpenCV Hough transform) — which is
> equally legitimate engineering and much easier to defend under questioning.

---

## 4. Users & Use Case

**Primary user:** Anyone taking a photo of a person (selfie or portrait) on
a laptop/desktop webcam via the browser (v1 scope). They open the app, the
camera activates, and they reposition themselves in response to on-screen
and spoken guidance until the composition score is high, then take the
photo with any camera app / screenshot / the phone in their other hand.

---

## 5. System Architecture

Three decoupled modules, so each can be developed, tested, and explained
independently:

```
FrameSense-AI/
├── frontend/     React (Vite) + TypeScript — camera capture, HUD, voice guidance
├── backend/      FastAPI (Python) — WebSocket gateway, orchestrates ai_engine
└── ai_engine/    Pure Python — composition scoring logic (framework-agnostic)
```

**Data flow (per sampled frame):**

```
Browser camera (getUserMedia)
  → Canvas captures a frame, encodes JPEG (base64)
  → WebSocket send to backend (~10 FPS, NOT the full 60 FPS render rate)
  → Backend decodes frame (OpenCV)
  → MediaPipe Face Detection → face bounding box
  → OpenCV Canny + Hough Transform → horizon line angle
  → ai_engine.analyze_frame() → composite score + guidance messages
  → JSON telemetry sent back over WebSocket
  → Frontend draws HUD overlay (Canvas) + speaks top message (Web Speech API)
```

**Why this split?**
- `ai_engine` has zero web/framework dependencies → unit-testable with plain
  numbers, no camera or server needed to run its test suite.
- `backend` is the only place touching MediaPipe/OpenCV directly on raw
  pixels — an explicit, narrow boundary.
- `frontend` never talks to AI models directly — it only sends frames and
  renders whatever telemetry comes back, so the AI logic could be swapped
  (e.g. a different backend) without touching the UI.

---

## 6. Functional Requirements

| ID | Requirement |
|---|---|
| FR1 | System shall access the user's webcam via `getUserMedia` and request permission |
| FR2 | System shall detect a primary face in the frame using MediaPipe Face Detection |
| FR3 | System shall draw a Rule-of-Thirds grid overlay on the live video |
| FR4 | System shall compute the nearest rule-of-thirds intersection point to the subject and mark it |
| FR5 | System shall compute a headroom score based on distance from frame top to head-top landmark |
| FR6 | System shall detect the dominant horizon line (Canny + Hough Transform) and compute its tilt angle |
| FR7 | System shall compute a subject-distance score from face-width-to-frame-width ratio |
| FR8 | System shall combine all sub-scores into one weighted composite score (0–100) |
| FR9 | System shall display the score and guidance messages in real time |
| FR10 | System shall speak the top guidance message aloud, throttled to avoid repetition spam |
| FR11 | System shall handle "no face detected" gracefully with a score of 0 and a clear message |
| FR12 | System shall recover gracefully from a single bad/corrupt frame without dropping the WebSocket connection |

---

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR1 | HUD rendering shall run at the browser's native frame rate (≈60 FPS) — grid/overlay drawing must never block on network calls |
| NFR2 | Frames sent to the backend shall be sub-sampled to ~10 FPS to keep bandwidth and backend load low |
| NFR3 | Backend shall respond to CORS only from configured allowed origins |
| NFR4 | `ai_engine` shall have zero dependency on FastAPI, MediaPipe, or OpenCV outside of the single explicitly-isolated `horizon_cv.py` module |
| NFR5 | Core scoring logic shall be covered by unit tests runnable without a camera, GPU, or network |
| NFR6 | Backend shall be containerized (Docker) for reproducible deployment |
| NFR7 | All magic numbers (thresholds, weights) shall be named constants, not inline literals |

---

## 8. Composition Scoring Algorithm

### 8.1 Rule of Thirds
Frame divided into a 3×3 grid via lines at `x = W/3, 2W/3` and `y = H/3, 2H/3`.
Score is 1.0 if the subject's center is within `tolerance = 0.08 × frame_width`
of the nearest intersection point; otherwise it falls off linearly with
distance.

### 8.2 Headroom
`ratio = head_top_y / frame_height`
- Ideal range: `0.10 ≤ ratio ≤ 0.18` → score 1.0
- Below 0.10 → "too tight," score drops proportionally, prompt "tilt down"
- Above 0.18 → "too much space," score drops, prompt "step closer" past 0.25

### 8.3 Horizon Tilt
Angle `θ` computed from the dominant Hough-detected line via `atan2`.
- `|θ| ≤ 2°` → score 1.0
- Score falls off linearly up to `|θ| = 15°` (floored at 0)
- No confident horizon found (e.g. tight portrait) → **do not penalize**

### 8.4 Subject Distance
`face_width_ratio = face_box_width / frame_width`
- `> 0.45` → too close, score 0.4, "step back"
- `< 0.12` → too far, score 0.4, "step closer"
- Otherwise → score 1.0

### 8.5 Composite Score
```
composite = 0.35·thirds + 0.25·headroom + 0.20·tilt + 0.20·distance
final_score = round(composite × 100)   # 0-100
```
Weights are tunable constants in `ai_engine/scoring.py`, not hardcoded inline.

---

## 9. Future Enhancements — NOT Part of This Project's Deliverable

*(Listed only to show deliberate scoping, not to be built or demoed this semester)*

1. **Auto-shutter**: capture automatically once `score ≥ 85` holds steady for ~400ms.
2. **Horizon via device orientation**: use `DeviceOrientationEvent` on mobile browsers as a second, sensor-based signal alongside the CV-based one.
3. **Multi-subject / group photo rules**: different scoring when >1 face detected.
4. **Scene classification**: lightweight classifier (e.g. MobileNet) to switch rule sets for portrait vs. landscape vs. food.
5. **Native Android port**: CameraX + ML Kit + NPU acceleration for true sub-20ms on-device latency.
6. **Trained aesthetic model**: a properly trained/fine-tuned NIMA-style model on the AVA dataset, as a genuine research extension — not claimed until actually done.

---

## 10. WebSocket API Contract

**Endpoint:** `ws://<host>/ws/analyze`

**Client → Server** (per sampled frame):
```json
{
  "image_base64": "data:image/jpeg;base64,...",
  "width": 640,
  "height": 480
}
```

**Server → Client:**
```json
{
  "score": 82,
  "messages": ["Good composition!"],
  "target_x": 213.3,
  "target_y": 160.0,
  "face_box": [120.5, 80.2, 260.1, 240.7]
}
```
On processing failure: `{"error": "<description>"}` — connection stays open.

**REST:** `GET /health` → `{"status": "ok"}`

---

## 11. Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 18 + Vite + TypeScript | Fast dev loop, type safety for telemetry state |
| HUD/Overlay | HTML5 Canvas 2D API | Zero-overhead 60 FPS drawing over live video |
| Voice | Web Speech Synthesis API | Native browser TTS, no extra dependency |
| Backend | Python 3.11 + FastAPI + Uvicorn | Async WebSockets, first-class OpenCV/MediaPipe compatibility |
| Face detection | MediaPipe Face Detection | Real pretrained, production-grade model (used by Google/Instagram) |
| Classical CV | OpenCV (Canny + Hough Transform) | Explainable, deterministic horizon-line detection |
| Testing | pytest | Unit tests for `ai_engine` with zero external dependencies |
| Deployment | Docker | Reproducible backend container |

---

## 12. Suggested Folder Structure

```
FrameSense-AI/
├── ai_engine/
│   ├── rule_of_thirds.py
│   ├── headroom.py
│   ├── horizon.py           # pure trig, no cv2
│   ├── horizon_cv.py         # the ONLY file importing cv2/numpy
│   ├── scoring.py            # combines all signals
│   └── tests/
│       └── test_scoring.py
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── app/
│       ├── config.py
│       ├── schemas.py
│       ├── vision.py         # bridges MediaPipe/OpenCV → ai_engine
│       └── websocket_routes.py
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/
│       │   ├── CameraView.tsx
│       │   ├── CompositionHUD.tsx
│       │   └── ScorePanel.tsx
│       ├── hooks/
│       │   ├── useCamera.ts
│       │   └── useCompositionSocket.ts
│       └── types/composition.ts
├── docker-compose.yml
└── README.md
```

---

## 13. Team & Roles

| Name | Role | Responsibilities |
|---|---|---|
| **Dev Kumar Tarkar** (Team Lead) | AI Engine + Frontend | Owns `ai_engine` (scoring logic, unit tests) and `frontend` (React UI, camera capture, HUD overlay, voice guidance). Coordinates integration between frontend and backend, tracks milestones, prepares the final report and viva presentation. |
| **Dev** | Backend | Owns `backend` (FastAPI app, WebSocket gateway, MediaPipe/OpenCV integration in `vision.py`, request/response schemas). Sets up Docker containerization and backend deployment. |

**Shared responsibilities** (both members):
- Integration testing (frontend ↔ backend ↔ ai_engine working end-to-end)
- Bug fixing during the buffer week
- Demo video recording and final report writing
- Viva preparation — both members should be able to explain every module, not just their own, since examiners often ask cross-questions

---

## 14. Suggested Milestones (for a semester timeline)

| Week | Deliverable |
|---|---|
| 1–2 | `ai_engine` core logic + unit tests passing (no camera needed) |
| 3–4 | Backend WebSocket + MediaPipe/OpenCV integration, tested via Postman/websocat |
| 5–6 | Frontend camera capture + HUD grid rendering |
| 7 | Frontend ↔ backend WebSocket wired end-to-end |
| 8 | Voice guidance + score panel polish |
| 9 | Dockerize backend, write README, record demo video |
| 10 | Buffer week — bug fixes, edge cases (no face, multiple faces, low light) |
| 11–12 | Report writing, viva prep, optional Future Scope item if time allows |

---

## 15. Success Metrics

- Composite score responds correctly (verified by unit tests) to controlled
  changes in subject position, headroom, and horizon tilt.
- End-to-end demo: moving in front of the webcam visibly changes the score
  and triggers the correct guidance message within ~1 second.
- Zero crashes on edge cases: no face in frame, multiple faces, very dark
  frame, camera permission denied.
- All `ai_engine` unit tests pass with `pytest ai_engine/tests -v`.

