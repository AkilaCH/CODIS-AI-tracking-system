import cv2
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from core.hardware_manager import HardwareManager

# Import the shared global instances from websockets so the API and WebSocket share the same AI and Log Queue
from api.websockets import vision, message_queue

router = APIRouter()
hw_manager = HardwareManager()

# ================= PYDANTIC MODELS =================
class SystemConfig(BaseModel):
    min_confidence: float
    target_class: str
    tracking_enabled: bool

class EffectorCommand(BaseModel):
    arm: bool

class RecordCommand(BaseModel):
    record: bool

class CommandPayload(BaseModel):
    command: str

# ================= IN-MEMORY STORAGE =================
current_settings = {
   "min_confidence": 0.85,
   "target_class": "drones", # drones, birds, or projectiles
   "autonomous_mode": True,
   "scan_frequency": 120,
   "effective_range": 2.4
}

class TacticalConfig(BaseModel):
    min_confidence: float
    target_class: str
    autonomous_mode: bool

# ================= STANDARD API ROUTES =================

@router.get("/api/status")
async def get_system_status():
    return {
        "status": "online",
        "settings": current_settings
    }

@router.post("/api/settings")
async def update_settings(config: SystemConfig):
    current_settings["min_confidence"] = config.min_confidence
    current_settings["target_class"] = config.target_class
    current_settings["tracking_enabled"] = config.tracking_enabled
    
    # Send a log to the frontend terminal
    message_queue.append({"msg": f"SYS CONF UPDATED: {config.target_class.upper()} @ {config.min_confidence*100}%", "level": "INFO"})
    
    return {"message": "Settings updated successfully", "settings": current_settings}

@router.post("/api/effector")
async def control_effector(command: EffectorCommand):
    current_settings["effector_armed"] = command.arm
    state = "ARMED" if command.arm else "DISARMED"
    
    # Log to terminal so physical button clicks also show up in the Live Log
    msg_level = "SUCCESS" if command.arm else "WARN"
    message_queue.append({"msg": f"SYSTEM {state}: Effector updated.", "level": msg_level})
    
    # Note: In a real integration, you would call your EffectorController here
    return {"message": f"Effector is now {state}"}

@router.post("/api/record")
async def toggle_record():
    is_recording = vision.toggle_recording() 
    status = "RECORDING STARTED" if is_recording else "RECORDING SAVED"
    
    # Log to terminal
    msg_level = "WARN" if is_recording else "SUCCESS"
    message_queue.append({"msg": status, "level": msg_level})
    
    return {"status": status, "is_recording": is_recording}


# ================= VIDEO STREAMING =================

def gen_frames():
    """Generator function to continuously yield JPEG frames from OpenCV"""
    while True:
        frame, _ = vision.get_latest_frame_and_detections()
        if frame is not None:
            # Encode frame as JPEG
            ret, buffer = cv2.imencode('.jpg', frame)
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@router.get("/api/video_feed")
async def video_feed():
    """Endpoint that Next.js uses for the <img src="..." /> tag"""
    return StreamingResponse(gen_frames(), media_type="multipart/x-mixed-replace; boundary=frame")


# ================= TERMINAL COMMAND ROUTE =================

@router.post("/api/command")
async def execute_command(payload: CommandPayload):
    """Processes commands typed into the React frontend and executes backend logic"""
    cmd = payload.command.strip().lower()
    
    # 1. Echo the typed command back to the UI log instantly
    message_queue.append({"msg": f"> {cmd}", "level": "CMD"})

    # 2. Execute Backend Logic based on the command
    if cmd == "/arm":
        current_settings["effector_armed"] = True
        message_queue.append({"msg": "SYSTEM ARMED: Effectors online.", "level": "SUCCESS"})
        return {"status": "armed"}
        
    elif cmd == "/disarm" or cmd == "/stop":
        current_settings["effector_armed"] = False
        message_queue.append({"msg": "EMERGENCY STOP: System disarmed.", "level": "WARN"})
        return {"status": "disarmed"}
        
    elif cmd == "/record":
        is_recording = vision.toggle_recording()
        status_msg = "RECORDING STARTED" if is_recording else "RECORDING SAVED"
        msg_level = "WARN" if is_recording else "SUCCESS"
        message_queue.append({"msg": status_msg, "level": msg_level})
        return {"status": status_msg, "is_recording": is_recording}
        
    elif cmd == "/report":
        message_queue.append({"msg": "Report generation initialized.", "level": "INFO"})
        return {"status": "report"}
        
    elif cmd == "/help":
        message_queue.append({"msg": "Cmds: /arm, /disarm, /stop, /record, /report", "level": "INFO"})
        return {"status": "help"}
        
    else:
        message_queue.append({"msg": f"Unknown command: {cmd}", "level": "WARN"})
        return {"status": "unknown"}

@router.get("/api/hardware/status")
async def get_hardware_status():
    return hw_manager.get_hardware_telemetry()

@router.post("/api/hardware/calibrate/{node_id}")
async def calibrate_node(node_id: str):
    # Simulation: Log the calibration to the terminal
    message_queue.append({"msg": f"CALIBRATING NODE: {node_id}...", "level": "INFO"})
    return {"message": f"Node {node_id} recalibrated successfully."}

@router.post("/api/hardware/effector/{name}/{action}")
async def effector_action(name: str, action: str):
    message_queue.append({"msg": f"COMMAND: {action.upper()} sent to {name.upper()}", "level": "CMD"})
    return {"status": "command_sent", "effector": name, "action": action}

@router.post("/api/settings/tactical")
async def update_tactical_settings(config: TacticalConfig):
    current_settings["min_confidence"] = config.min_confidence
    current_settings["target_class"] = config.target_class
    current_settings["autonomous_mode"] = config.autonomous_mode
    
    # Push notification to the Live Log
    mode_text = "AUTONOMOUS" if config.autonomous_mode else "MANUAL"
    message_queue.append({
        "msg": f"POLICY UPDATE: {mode_text} Mode | Target: {config.target_class.upper()}", 
        "level": "SUCCESS"
    })
    
    return {"message": "Tactical parameters updated", "settings": current_settings}