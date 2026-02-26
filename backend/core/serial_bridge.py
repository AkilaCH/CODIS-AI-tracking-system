import serial
import time
import threading

class SerialBridge:
    def __init__(self, port='/dev/ttyACM0', baudrate=115200):
        try:
            # Change port to 'COM3' or similar if on Windows
            self.ser = serial.Serial(port, baudrate, timeout=0.1)
            self.is_connected = True
            print(f"🔌 Hardware Link Established on {port}")
        except Exception as e:
            print(f"⚠️ Serial Error: {e}. Hardware running in simulation mode.")
            self.ser = None
            self.is_connected = False

    def send_target_coords(self, x, y):
        """
        Maps screen coordinates to servo degrees and sends to Arduino.
        Assumes 1280x720 resolution and 180-degree servos.
        """
        if not self.is_connected or not self.ser:
            return

        # Map 0-1280 (X) to 0-180 degrees
        angle_x = int((x / 1280) * 180)
        # Map 0-720 (Y) to 0-180 degrees
        angle_y = int((y / 720) * 180)

        # Create a compact command string: X[val]Y[val]\n
        command = f"X{angle_x}Y{angle_y}\n"
        
        try:
            self.ser.write(command.encode('utf-8'))
        except Exception:
            self.is_connected = False

    def close(self):
        if self.ser:
            self.ser.close()