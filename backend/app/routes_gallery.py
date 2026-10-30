"""
FrameSense AI - Gallery & Captured Photos API Router
Provides real REST endpoints backed by SQLite and persistent disk storage,
eliminating browser LocalStorage quota crashes.
"""

import base64
import datetime
import logging
import uuid
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field

from backend.app.db import (
    UPLOADS_DIR,
    delete_capture_by_id,
    fetch_all_captures,
    fetch_capture_by_id,
    insert_capture,
)

logger = logging.getLogger("framesense.gallery")
router = APIRouter(prefix="/api/captures", tags=["Gallery Captures"])


class CreateCaptureRequest(BaseModel):
    """Payload for creating a capture via base64 encoded photo."""
    image_base64: str = Field(..., description="Base64 encoded JPEG/PNG image")
    score: int = Field(..., ge=0, le=100, description="Composite score (0-100)")
    aesthetic: float = Field(5.0, description="Deep aesthetic score (1-10)")
    grade: str = Field("A", description="A+, A, B, or Needs Retake")
    verdict: str = Field("Master Composition", description="Evaluation verdict")
    shot_type: Optional[str] = Field("portrait", description="Contextual scene mode")
    distance_ft: Optional[float] = Field(None, description="Estimated distance in feet")
    sub_scores: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Sub-scores map")


@router.post("", status_code=201)
async def create_capture(payload: CreateCaptureRequest):
    """
    Save a photo captured from the live viewfinder directly to disk and SQLite.
    Resolves the browser 5MB LocalStorage quota crash.
    """
    try:
        raw_b64 = payload.image_base64
        if "," in raw_b64:
            raw_b64 = raw_b64.split(",", 1)[1]

        image_bytes = base64.b64decode(raw_b64)
        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty image data.")

        capture_id = f"FS-{datetime.datetime.now().strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex[:4].upper()}"
        filename = f"{capture_id}.jpg"
        file_path = UPLOADS_DIR / filename

        with open(file_path, "wb") as f:
            f.write(image_bytes)

        now = datetime.datetime.now()
        timestamp_str = now.strftime("%H:%M:%S")
        date_str = now.strftime("%b %d, %Y")
        image_url = f"/uploads/{filename}"

        record = insert_capture(
            capture_id=capture_id,
            filename=filename,
            image_url=image_url,
            timestamp=timestamp_str,
            date=date_str,
            score=payload.score,
            aesthetic=round(payload.aesthetic, 1),
            grade=payload.grade,
            verdict=payload.verdict,
            shot_type=payload.shot_type or "portrait",
            distance_ft=payload.distance_ft,
            sub_scores=payload.sub_scores,
        )

        logger.info(f"Saved capture {capture_id} (Score: {payload.score}) to SQLite.")
        return {"success": True, "capture": record}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error saving capture: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to persist capture: {str(e)}")


@router.get("")
async def list_captures(limit: int = 100, offset: int = 0):
    """List all saved captures from SQLite, ordered by newest first."""
    try:
        captures = fetch_all_captures(limit=limit, offset=offset)
        return {"success": True, "count": len(captures), "captures": captures}
    except Exception as e:
        logger.error(f"Error fetching captures: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{capture_id}")
async def get_capture(capture_id: str):
    """Retrieve details for a single capture."""
    record = fetch_capture_by_id(capture_id)
    if not record:
        raise HTTPException(status_code=404, detail="Capture not found")
    return {"success": True, "capture": record}


@router.delete("/{capture_id}")
async def delete_capture(capture_id: str):
    """Delete a capture from SQLite database and erase image file from disk."""
    deleted_filename = delete_capture_by_id(capture_id)
    if not deleted_filename:
        raise HTTPException(status_code=404, detail="Capture not found")
    return {"success": True, "id": capture_id, "deleted_file": deleted_filename}
