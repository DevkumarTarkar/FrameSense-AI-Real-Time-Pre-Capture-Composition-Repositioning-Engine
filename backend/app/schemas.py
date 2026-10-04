"""
FrameSense AI - Request & Response Schemas
Adheres strictly to WebSocket API contract in PRD Section 10.
"""

from typing import List, Optional, Dict
from pydantic import BaseModel, Field


class FramePayload(BaseModel):
    """Payload received from the frontend via WebSocket."""
    image_base64: str = Field(..., description="JPEG frame encoded in Base64 (data:image/jpeg;base64,...)")
    width: int = Field(640, description="Capture frame pixel width")
    height: int = Field(480, description="Capture frame pixel height")


class TelemetryResponse(BaseModel):
    """Telemetry response sent back to the frontend per frame."""
    score: int = Field(..., ge=0, le=100, description="Composite composition score from 0 to 100")
    messages: List[str] = Field(default_factory=list, description="Prioritized guidance messages")
    target_x: Optional[float] = Field(None, description="Suggested target X alignment coordinate on HUD")
    target_y: Optional[float] = Field(None, description="Suggested target Y alignment coordinate on HUD")
    face_box: Optional[List[float]] = Field(None, description="Bounding box of primary subject [x1, y1, x2, y2]")
    aesthetic_score: Optional[float] = Field(None, description="Calibrated deep learning aesthetic score from 1.0 to 10.0")
    device: Optional[str] = Field("cuda", description="Hardware compute accelerator")
    sub_scores: Dict[str, float] = Field(default_factory=dict, description="Detailed sub-scores breakdown")
    error: Optional[str] = Field(None, description="Error message if single frame processing failed")
