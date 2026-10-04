# FrameSense AI — Technology Stack Document

**Project:** FrameSense AI (Real-Time Pre-Capture Composition Assistant)
**Version:** 1.0

---

## 1. Stack Overview

| Layer | Technology | Version |
|---|---|---|
| Frontend Framework | React | 18.3.x |
| Frontend Build Tool | Vite | 5.4.x |
| Frontend Language | TypeScript | 5.5.x |
| Overlay Rendering | HTML5 Canvas 2D API | Native browser API |
| Camera Access | WebRTC `getUserMedia` | Native browser API |
| Voice Guidance | Web Speech Synthesis API | Native browser API |
| Real-time Transport | WebSocket | Native browser API + FastAPI |
| Backend Framework | FastAPI | 0.115.x |
| Backend Server | Uvicorn | 0.30.x |
| Backend Language | Python | 3.11 |
| Face Detection | MediaPipe (Face Detection) | 0.10.x |
| Classical Computer Vision | OpenCV (`opencv-python-headless`) | 4.10.x |
| Numerical Computing | NumPy | 1.26.x |
| Data Validation | Pydantic + Pydantic Settings | 2.9.x / 2.5.x |
| Testing | pytest | 8.3.x |
| Containerization | Docker | Latest stable |

---

## 2. Frontend Stack

### 2.1 React 18 + Vite + TypeScript
**Purpose:** Builds the camera UI, composition HUD, and score panel as a
component-based single-page app.

**Why chosen:**
- React's component model maps naturally to this project's UI pieces
  (`CameraView`, `CompositionHUD`, `ScorePanel`) — each independently testable.
- Vite gives near-instant dev-server startup and hot reload, important for
  rapid iteration on visual overlay tuning.
- TypeScript catches telemetry shape mismatches (e.g. a renamed backend
  field) at compile time instead of at runtime in the browser.

**Alternatives considered:** Plain HTML/JS (simpler, but no type safety or
component reuse as the HUD grows); Vue (equally valid, React chosen for
wider community support/resources for a solo-timeline college project).

**Install:** `npm install` inside `frontend/` (see `package.json`)
**Docs:** https://react.dev · https://vitejs.dev

### 2.2 HTML5 Canvas 2D API
**Purpose:** Draws the rule-of-thirds grid, detected face box, and target
alignment point on top of the live video feed, every frame.

**Why chosen:** Native browser API, zero extra dependency, capable of
60 FPS redraw without blocking on the network — critical since the HUD must
stay smooth even when backend telemetry arrives only ~10 times/second.

**Docs:** https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API

### 2.3 WebRTC `getUserMedia`
**Purpose:** Requests webcam permission and streams live video into a
`<video>` element.

**Why chosen:** Standard, no-install browser API for camera access; works
across Chrome, Edge, Firefox without plugins.

**Docs:** https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia

### 2.4 Web Speech Synthesis API
**Purpose:** Speaks the top guidance message aloud (e.g. "Step back a
little") so the user gets hands-free feedback while framing a shot.

**Why chosen:** Native, no API key, no network call — works offline once
the page is loaded.

**Docs:** https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis

---

## 3. Communication Layer

### 3.1 WebSocket
**Purpose:** Persistent, low-overhead, bidirectional channel between the
browser and backend for continuous frame-in / telemetry-out streaming.

**Why chosen over plain HTTP polling:** A new HTTP request every frame adds
handshake overhead per call; a single open WebSocket avoids that and keeps
the ~10 FPS sampling loop lightweight.

**Endpoint:** `ws://<host>/ws/analyze` (full contract in the PRD §10)

---

## 4. Backend Stack

### 4.1 FastAPI + Uvicorn
**Purpose:** Serves the `/ws/analyze` WebSocket endpoint and `/health`
REST check; orchestrates the vision pipeline per incoming frame.

**Why chosen:**
- Native `async`/`await` WebSocket support without extra libraries.
- Automatic request/response validation via Pydantic models.
- Auto-generated interactive API docs at `/docs` (useful for the report/demo).

**Alternatives considered:** Flask (no native async WebSocket support as
clean as FastAPI's); Django (too heavyweight for a single-purpose API).

**Install:** `pip install -r backend/requirements.txt`
**Docs:** https://fastapi.tiangolo.com

### 4.2 Python 3.11
**Why chosen:** Full wheel compatibility with OpenCV, MediaPipe, and
NumPy; modern syntax (`str | None` union types) used throughout `ai_engine`.

### 4.3 MediaPipe (Face Detection)
**Purpose:** Detects the primary face's bounding box per frame — the
subject-position input to the scoring engine.

**Why chosen:** Google's pretrained, production-grade, CPU-friendly model
(used in real products like Instagram/Snap filters); runs without GPU,
no training required, no external API calls or data leaving the machine.

**Docs:** https://developers.google.com/mediapipe/solutions/vision/face_detector

### 4.4 OpenCV (`opencv-python-headless`)
**Purpose:** Decodes incoming JPEG frame bytes into pixel arrays, and runs
classical Canny edge detection + probabilistic Hough Transform to find the
dominant horizon line for tilt scoring.

**Why "headless" build specifically:** The standard `opencv-python` package
bundles GUI bindings (`highgui`) that need system display libraries not
present on a server/container — `headless` strips these, keeping the
Docker image smaller and avoiding unnecessary system dependencies.

**Docs:** https://docs.opencv.org

### 4.5 NumPy
**Purpose:** Underlying array representation for decoded video frames;
used for distance/length calculations in `horizon_cv.py`.

### 4.6 Pydantic + Pydantic Settings
**Purpose:** `schemas.py` defines strict request/response shapes
(`FramePayload`, `TelemetryResponse`) so malformed WebSocket messages fail
fast with a clear error instead of crashing the pipeline; `config.py` loads
environment-variable-based settings (e.g. allowed CORS origins).

**Docs:** https://docs.pydantic.dev

---

## 5. AI/Logic Core

### `ai_engine` — Pure Python (no framework)
**Purpose:** All composition-scoring math — rule-of-thirds, headroom,
horizon-tilt, subject-distance, and the combined weighted score.

**Why a separate, dependency-free package:** Keeps the actual "AI logic"
testable with `pytest` using nothing but plain numbers — no camera, no
model download, no server needed to verify correctness. Only
`horizon_cv.py` inside this package touches OpenCV/NumPy directly; every
other file is pure arithmetic. This separation is itself a deliberate
software-engineering decision worth highlighting in the report/viva.

---

## 6. Testing

### pytest
**Purpose:** Unit tests for every `ai_engine` scoring function (see
`ai_engine/tests/test_scoring.py`).

**Run:** `pytest ai_engine/tests -v` from the repo root — requires only
`pytest` itself, no camera or GPU.

**Docs:** https://docs.pytest.org

---

## 7. Deployment

### Docker
**Purpose:** Packages the backend (Python + OpenCV + MediaPipe + FastAPI)
into a single reproducible container so it runs identically on any machine,
independent of locally-installed Python versions or system libraries.

**Why it matters for this project:** OpenCV/MediaPipe have real system-level
dependencies (`libgl1`, `libglib2.0-0`); Docker avoids "works on my machine"
issues when demoing on a different lab PC or examiner's laptop.

**Build context:** Repository root (not `backend/`) — because the image
needs both `backend/` and the sibling `ai_engine/` package.

**Docs:** https://docs.docker.com

---

## 8. Why No Third-Party Cloud AI APIs

Every AI/CV component (MediaPipe face detection, OpenCV horizon detection)
runs **locally on the backend you control** — no calls to any external paid
API (no OpenAI, no Google Cloud Vision, etc.). This matters for three
reasons, worth stating explicitly in the report:

1. **Privacy** — camera frames never leave your own server.
2. **Cost** — zero per-request API billing, which matters for a live,
   continuously-streaming use case (~10 frames/second).
3. **Defensibility** — every model used is a known, inspectable, pretrained
   model you can explain, not a black-box API response.
