# FrameSense AI — System Design Document

**Project:** FrameSense AI (Real-Time Pre-Capture Composition Assistant)
**Version:** 1.0

> All diagrams below use Mermaid syntax. They render natively in GitHub,
> VS Code (with the Mermaid extension), Antigravity, and most modern
> Markdown viewers. If your college wants image-based diagrams for the
> printed report, open this file in such a viewer and export each diagram
> as PNG/SVG.

---

## 1. Purpose

This document describes FrameSense AI's system architecture, data flow,
and component interactions at a level of detail sufficient to implement,
review, and defend the design in a viva. It complements the PRD (which
covers *what* is being built) by focusing on *how* the pieces fit together.

Note: FrameSense AI has **no persistent database** in v1 (every frame is
processed and discarded in real time, nothing is stored) — so no ER diagram
is included. If a "saved shots history" feature is added later, an ER
diagram would be added at that point.

---

## 2. High-Level Architecture Diagram

```mermaid
graph TB
    subgraph Browser["🌐 Browser (Frontend)"]
        CAM[Camera<br/>getUserMedia]
        CANVAS[Sampling Canvas<br/>JPEG encode]
        WS_CLIENT[WebSocket Client]
        HUD[Composition HUD<br/>Canvas overlay]
        VOICE[Voice Guidance<br/>Web Speech API]
        SCORE[Score Panel]
    end

    subgraph Server["🖥️ Backend (FastAPI)"]
        WS_ROUTE["/ws/analyze<br/>WebSocket Route"]
        VISION[vision.py<br/>Decode + Orchestrate]
        MP[MediaPipe<br/>Face Detection]
        CV[OpenCV<br/>Canny + Hough Transform]
    end

    subgraph Engine["🧠 ai_engine (Pure Python)"]
        THIRDS[rule_of_thirds.py]
        HEAD[headroom.py]
        TILT[horizon.py]
        SCORING[scoring.py<br/>analyze_frame]
    end

    CAM --> CANVAS
    CANVAS -->|base64 JPEG, ~10 FPS| WS_CLIENT
    WS_CLIENT <-->|WebSocket| WS_ROUTE
    WS_ROUTE --> VISION
    VISION --> MP
    VISION --> CV
    MP -->|face bbox| SCORING
    CV -->|horizon angle| SCORING
    SCORING --> THIRDS
    SCORING --> HEAD
    SCORING --> TILT
    SCORING -->|FrameAnalysis| VISION
    VISION -->|JSON telemetry| WS_ROUTE
    WS_ROUTE -->|JSON telemetry| WS_CLIENT
    WS_CLIENT --> HUD
    WS_CLIENT --> VOICE
    WS_CLIENT --> SCORE
```

---

## 3. Data Flow Diagram

### 3.1 Level 0 — Context Diagram

```mermaid
graph LR
    USER((User)) -->|positions self in front of camera| SYSTEM[FrameSense AI System]
    SYSTEM -->|visual overlay + voice guidance| USER
```

### 3.2 Level 1 — Detailed Data Flow

```mermaid
flowchart LR
    A[User's Live Video Feed] -->|Process 1:<br/>Capture & Sample Frame| B[Sampled JPEG Frame]
    B -->|Process 2:<br/>Transmit via WebSocket| C[Raw Frame on Backend]
    C -->|Process 3:<br/>Decode Image| D[Pixel Array]
    D -->|Process 4:<br/>Detect Face| E[Face Bounding Box]
    D -->|Process 5:<br/>Detect Horizon| F[Horizon Angle]
    E -->|Process 6:<br/>Score Composition| G[Composite Score +<br/>Guidance Messages]
    F --> G
    G -->|Process 7:<br/>Send Telemetry| H[JSON Response]
    H -->|Process 8:<br/>Render Overlay| I[HUD on Screen]
    H -->|Process 9:<br/>Speak Message| J[Audio Output]
```

---

## 4. Sequence Diagram — One Frame's Journey

```mermaid
sequenceDiagram
    participant U as User
    participant V as Video Element
    participant C as Sampling Canvas
    participant WSC as WebSocket Client
    participant WSS as WebSocket Route (Backend)
    participant VP as vision.py
    participant MP as MediaPipe
    participant CV as OpenCV
    participant AE as ai_engine.scoring

    U->>V: Stands in front of camera
    loop every 100ms (~10 FPS)
        C->>V: Draw current video frame
        C->>C: Encode as JPEG (base64)
        C->>WSC: dataUrl
        WSC->>WSS: {image_base64, width, height}
        WSS->>VP: decode_frame() + process_frame()
        VP->>MP: estimate face bounding box
        MP-->>VP: face_box
        VP->>CV: detect_dominant_horizon_angle()
        CV-->>VP: angle_deg (or None)
        VP->>AE: analyze_frame(face, headroom, distance, tilt)
        AE-->>VP: FrameAnalysis(score, messages, target_point)
        VP-->>WSS: TelemetryResponse
        WSS-->>WSC: JSON telemetry
        WSC->>U: Draw HUD overlay + speak top message
    end
```

---

## 5. Use Case Diagram

```mermaid
graph TD
    User((User))
    UC1[Grant Camera Permission]
    UC2[View Live Composition Score]
    UC3[Receive Visual Guidance<br/>Rule-of-Thirds Overlay]
    UC4[Receive Voice Guidance]
    UC5[Reposition Based on Feedback]

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    UC2 -.includes.-> UC3
    UC2 -.includes.-> UC4
```

---

## 6. Component / Module Diagram

```mermaid
graph TB
    subgraph Frontend Components
        App[App.tsx]
        CameraView[CameraView.tsx]
        HUDComp[CompositionHUD.tsx]
        ScorePanelComp[ScorePanel.tsx]
        useCameraHook[useCamera.ts]
        useSocketHook[useCompositionSocket.ts]
    end

    subgraph Backend Modules
        MainPy[main.py]
        WSRoutes[websocket_routes.py]
        VisionPy[vision.py]
        Schemas[schemas.py]
        Config[config.py]
    end

    subgraph ai_engine Modules
        RoT[rule_of_thirds.py]
        HR[headroom.py]
        HZ[horizon.py]
        HZCV[horizon_cv.py]
        Scoring[scoring.py]
    end

    App --> CameraView
    App --> HUDComp
    App --> ScorePanelComp
    App --> useCameraHook
    App --> useSocketHook
    CameraView --> useCameraHook

    MainPy --> WSRoutes
    MainPy --> Config
    WSRoutes --> Schemas
    WSRoutes --> VisionPy
    VisionPy --> HZCV
    VisionPy --> Scoring

    Scoring --> RoT
    Scoring --> HR
    Scoring --> HZ
    HZCV --> HZ

    useSocketHook -.WebSocket.-> WSRoutes
```

---

## 7. Class-Level Design — `ai_engine`

```mermaid
classDiagram
    class Point {
        +float x
        +float y
    }

    class FrameAnalysis {
        +int composite_score
        +list~str~ messages
        +Point target_point
    }

    class rule_of_thirds {
        +thirds_intersections(w, h) list~Point~
        +nearest_thirds_point(subject, w, h) tuple
        +score_thirds_alignment(subject, w, h) tuple
    }

    class headroom {
        +score_headroom(head_top_y, h) tuple
    }

    class horizon {
        +angle_from_line(x1, y1, x2, y2) float
        +score_tilt(angle_deg) tuple
    }

    class horizon_cv {
        +detect_dominant_horizon_angle(frame_bgr) float
    }

    class scoring {
        +score_distance(face_width_ratio) tuple
        +analyze_frame(...) FrameAnalysis
    }

    scoring --> rule_of_thirds : uses
    scoring --> headroom : uses
    scoring --> horizon : uses
    scoring --> FrameAnalysis : returns
    horizon_cv --> horizon : uses angle_from_line
    rule_of_thirds --> Point : uses
    FrameAnalysis --> Point : target_point
```

---

## 8. Deployment Diagram

```mermaid
graph TB
    subgraph "User's Machine"
        Browser[Web Browser<br/>Frontend runs here]
    end

    subgraph "Docker Container"
        Uvicorn[Uvicorn Server]
        FastAPIApp[FastAPI App]
        MediaPipeModel[MediaPipe Model<br/>bundled/downloaded on first run]
        OpenCVLib[OpenCV Runtime]
    end

    Browser <-->|WebSocket over localhost or LAN| Uvicorn
    Uvicorn --> FastAPIApp
    FastAPIApp --> MediaPipeModel
    FastAPIApp --> OpenCVLib
```

---

## 9. Design Notes Worth Mentioning in the Report/Viva

- **Why a sequence diagram matters here:** the ~10 FPS backend sampling vs.
  ~60 FPS frontend HUD rendering is a deliberate performance decision — the
  sequence diagram makes that timing explicit rather than hidden in code.
- **Why the component diagram shows `ai_engine` fully isolated:** no arrow
  points *into* `ai_engine` from `backend` except through `scoring.py` and
  `horizon_cv.py` — everything else in `ai_engine` has zero inbound
  framework dependency, which is what makes it unit-testable in isolation.
- **No ER diagram** because v1 has no persistence layer — this is a
  deliberate scope decision (see PRD §9, Future Enhancements) and should be
  stated as such if a reviewer asks why there's no database.
