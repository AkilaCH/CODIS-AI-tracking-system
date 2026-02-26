import random
import time

class HardwareManager:
    def __init__(self):
        # Simulated states for your Device Grid
        self.sensor_nodes = {
            "optical": {"id": "#8821-XF", "latency": 12, "signal": "5GHz Signal", "status": "LIVE"},
            "thermal": {"id": "#9932-TH", "latency": 24, "signal": "Mesh Link", "status": "LIVE"},
            "lidar": {"id": "#1120-LI", "latency": 145, "signal": "Intermittent", "status": "WEAK SIG"},
            "acoustic": {"id": "#0045-AC", "latency": 0, "signal": "No Link", "status": "OFFLINE"}
        }
        
        self.effectors = {
            "alpha": {"model": "MK-IV VIPER", "status": "Standby", "battery": 88, "gps": 12},
            "bravo": {"model": "MK-IV VIPER", "status": "Charging", "battery": 32, "gps": 12},
            "charlie": {"model": "MK-V HEAVY", "status": "Patrol", "battery": 98, "gps": 14}
        }

    def get_hardware_telemetry(self):
        # Add slight random jitter to latency to make the UI look alive
        for node in self.sensor_nodes.values():
            if node["status"] != "OFFLINE":
                node["latency"] += random.randint(-2, 2)
        
        return {
            "sensors": self.sensor_nodes,
            "effectors": self.effectors,
            "network_load": round(24.0 + random.uniform(0.1, 0.9), 1),
            "active_nodes": sum(1 for n in self.sensor_nodes.values() if n["status"] != "OFFLINE") + 3
        }