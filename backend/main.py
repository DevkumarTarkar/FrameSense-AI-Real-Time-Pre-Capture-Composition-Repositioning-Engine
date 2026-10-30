"""
FrameSense AI - FastAPI Backend Server
Main entry point for REST endpoints and real-time WebSocket analysis pipeline.
"""

import asyncio
import logging
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import torch
import cv2
import numpy as np

from fastapi.staticfiles import StaticFiles
from backend.app.config import settings
from backend.app.websocket_routes import router as websocket_router
from backend.app.vision import vision_engine
from backend.app.db import init_db, UPLOADS_DIR
from backend.app.routes_gallery import router as gallery_router
from backend.app.routes_auth import router as auth_router

# Configure root logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("framesense.main")

# Initialize SQLite database
init_db()

# Initialize FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Real-Time Pre-Capture Composition & Aesthetic Assessment Engine",
)

# Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Uploads Folder
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# Mount Routers
app.include_router(websocket_router)
app.include_router(gallery_router)
app.include_router(auth_router)


@app.get("/health")
async def health_check():
    """Health check endpoint adhering to PRD Section 10."""
    cuda_active = torch.cuda.is_available()
    device_name = torch.cuda.get_device_name(0) if cuda_active else "CPU"
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "hardware_accelerator": device_name,
        "cuda_active": cuda_active,
    }


@app.post("/api/analyze-image")
async def analyze_uploaded_image(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
):
    """
    Offline/Upload evaluation endpoint for DSLR/Phone photos.
    Runs Dual-Brain (MediaPipe BlazeFace + OpenCV Hough + PyTorch RTX 3050 NIMA).
    """
    try:
        frame = None
        if file is not None:
            contents = await file.read()
            np_arr = np.frombuffer(contents, np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        elif image_base64 is not None:
            frame = vision_engine.decode_image(image_base64)

        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid or unsupported image file.")

        h, w = frame.shape[:2]
        telemetry = await asyncio.to_thread(vision_engine.analyze_frame, frame)

        score = telemetry.score
        grade = "A+" if score >= 90 else "A" if score >= 75 else "B" if score >= 50 else "Needs Retake"
        verdict = "Master Composition" if score >= 80 else "Good Alignment" if score >= 50 else "Repositioning Required"

        return {
            "success": True,
            "score": score,
            "grade": grade,
            "verdict": verdict,
            "messages": telemetry.messages or ["Composition analyzed successfully."],
            "target_x": telemetry.target_x,
            "target_y": telemetry.target_y,
            "face_box": telemetry.face_box,
            "width": w,
            "height": h,
            "aesthetic_score": telemetry.sub_scores.get("aesthetic_ai", 7.0),
            "sub_scores": telemetry.sub_scores,
            "device": "NVIDIA GeForce RTX 3050 CUDA" if torch.cuda.is_available() else "Host CPU",
            "has_subject": telemetry.face_box is not None,
            "shot_type": telemetry.shot_type,
            "shot_description": telemetry.shot_description,
            "estimated_distance_ft": telemetry.estimated_distance_ft,
            "estimated_distance_m": telemetry.estimated_distance_m,
            "all_faces": telemetry.all_faces,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in /api/analyze-image: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting {settings.APP_NAME} server on http://{settings.HOST}:{settings.PORT}")
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=True)
