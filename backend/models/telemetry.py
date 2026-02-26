from pydantic import BaseModel
from typing import Optional

class TelemetryData(BaseModel):
    timestamp: float
    target_detected: bool
    current_x: Optional[float] = None
    current_y: Optional[float] = None
    predicted_x: Optional[float] = None
    predicted_y: Optional[float] = None
    confidence: Optional[float] = None
    closing_velocity: Optional[float] = None
    distance: Optional[float] = None
    system_log: Optional[str] = None
    log_level: Optional[str] = "INFO" # "INFO", "WARN", "CMD", "SUCCESS"