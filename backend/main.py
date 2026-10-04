"""
FrameSense AI - FastAPI Backend Server
Main entry point for REST endpoints and real-time WebSocket analysis pipeline.
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import torch

from backend.app.config import settings
from backend.app.websocket_routes import router as websocket_router

# Configure root logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("framesense.main")

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

# Mount WebSocket pipeline router
app.include_router(websocket_router)


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


if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting {settings.APP_NAME} server on http://{settings.HOST}:{settings.PORT}")
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=True)
