"""
FrameSense AI - WebSocket Streaming Pipeline
Real-time bidirectional WebSocket handler for live camera telemetry.
Adheres strictly to PRD Section 10 & Functional Requirements FR11, FR12.
"""

import json
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.app.schemas import FramePayload, TelemetryResponse
from backend.app.vision import vision_engine

logger = logging.getLogger("framesense.websocket")
router = APIRouter()


@router.websocket("/ws/analyze")
async def websocket_composition_endpoint(websocket: WebSocket):
    """
    Persistent WebSocket endpoint for continuous frame analysis.
    Sub-sampled frames (~10 FPS) from the frontend are analyzed here.
    """
    await websocket.accept()
    logger.info("WebSocket connection established with client.")

    try:
        while True:
            # Receive text data (JSON) from client
            raw_data = await websocket.receive_text()

            try:
                data = json.loads(raw_data)
                payload = FramePayload(**data)
            except Exception as parse_err:
                logger.warning(f"Malformed payload received: {parse_err}")
                await websocket.send_json({"error": "Invalid frame payload format"})
                continue

            # Decode frame
            frame = vision_engine.decode_image(payload.image_base64)
            if frame is None:
                # PRD FR12: Single bad frame recovery without dropping connection
                await websocket.send_json({"error": "Failed to decode frame image"})
                continue

            try:
                # Execute unified composition analysis pipeline
                telemetry = vision_engine.analyze_frame(frame)

                response_data = TelemetryResponse(
                    score=telemetry.score,
                    messages=telemetry.messages,
                    target_x=telemetry.target_x,
                    target_y=telemetry.target_y,
                    face_box=telemetry.face_box,
                    aesthetic_score=telemetry.sub_scores.get("aesthetic_ai"),
                    device="cuda" if str(vision_engine.device) == "cuda" else "cpu",
                    sub_scores=telemetry.sub_scores,
                ).model_dump()

                await websocket.send_json(response_data)

            except Exception as proc_err:
                logger.error(f"Error during frame processing: {proc_err}", exc_info=True)
                await websocket.send_json({"error": "Frame analysis processing error"})

    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected normally.")
    except Exception as e:
        logger.error(f"Unexpected WebSocket error: {e}", exc_info=True)
