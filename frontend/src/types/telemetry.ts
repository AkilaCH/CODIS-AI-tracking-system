export interface TelemetryData {
  timestamp: number;
  target_detected: boolean;
  current_x: number | null;
  current_y: number | null;
  predicted_x: number | null;
  predicted_y: number | null;
  confidence: number | null;
  closing_velocity: number | null;
  distance: number | null;
  system_log?: string | null;
  log_level?: string | null;
}