import asyncio
import time
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from core.vision import VisionEngine
from core.math_engine import TargetTracker
from core.serial_bridge import SerialBridge
from models.telemetry import TelemetryData

router = APIRouter()
vision = VisionEngine()
tracker = TargetTracker()
message_queue = []

# ==========================================
# HARDWARE ABSTRACTION & MOCK FALLBACK
# ==========================================
class MockHardwareBridge:
    """A dummy class that safely consumes commands when physical hardware is missing."""
    def __init__(self):
        print("🟢 MOCK HARDWARE ACTIVE: System running in Software-Only Showcase Mode.")
        self.is_connected = False

    def send_target_coords(self, x, y):
        # Silently consume coordinates to prevent crashing
        pass

    def close(self):
        pass

# Attempt to connect to the physical Arduino
try:
    bridge = SerialBridge(port='COM3')
    # If the real bridge initializes but fails to find the port, swap to Mock
    if not getattr(bridge, 'is_connected', True):
        bridge = MockHardwareBridge()
except Exception as e:
    print(f"⚠️ Serial Port Error. Falling back to Mock Hardware. ({e})")
    bridge = MockHardwareBridge()


# ==========================================
# TELEMETRY STREAM
# ==========================================
@router.websocket("/ws/telemetry")
async def telemetry_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("🟢 Client Connected to Telemetry Stream")
    
    try:
        while True:
            frame, detection = vision.get_latest_frame_and_detections()
            
            sys_log = None
            log_lvl = "INFO"
            if len(message_queue) > 0:
                msg_data = message_queue.pop(0)
                sys_log = msg_data["msg"]
                log_lvl = msg_data["level"]

            if detection:
                pred_x, pred_y = tracker.predict()
                tracker.update([detection["x"], detection["y"]])
                
                # This safely routes to either the real Arduino or the Mock object
                bridge.send_target_coords(pred_x, pred_y)
                
                data = TelemetryData(
                    timestamp=time.time(),
                    target_detected=True,
                    current_x=detection["x"],
                    current_y=detection["y"],
                    predicted_x=pred_x,
                    predicted_y=pred_y,
                    confidence=detection["conf"],
                    distance=detection["dist"],
                    system_log=sys_log,
                    log_level=log_lvl
                )
            else:
                data = TelemetryData(
                    timestamp=time.time(),
                    target_detected=False,
                    system_log=sys_log,
                    log_level=log_lvl
                )
            
            await websocket.send_json(data.dict())
            await asyncio.sleep(0.033)
            
    except WebSocketDisconnect:
        print("🔴 Client gracefully disconnected.")
    except Exception as e:
        # Catch unexpected async drops so Uvicorn doesn't crash
        print(f"⚠️ Stream interrupted: {e}")
    finally:
        bridge.close()