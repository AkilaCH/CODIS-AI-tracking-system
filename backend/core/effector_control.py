import serial
import time
import json

class EffectorController:
    def __init__(self, port='/dev/ttyUSB0', baudrate=115200):
        self.port = port
        self.baudrate = baudrate
        self.connection = None
        self.is_armed = False

    def connect(self):
        try:
      
            self.connection = serial.Serial(self.port, self.baudrate, timeout=1)
            time.sleep(2)
            print(f"Successfully connected to effector on {self.port}")
            return True
        except serial.SerialException as e:
            print(f"Failed to connect to effector: {e}")
            return False

    def arm_system(self):
        self.is_armed = True
        self._send_command({"cmd": "ARM"})

    def disarm_system(self):
        self.is_armed = False
        self._send_command({"cmd": "DISARM"})

    def send_interception_command(self, target_x, target_y, acceleration_x, acceleration_y):
        if not self.is_armed or not self.connection:
            return False

        payload = {
            "cmd": "INTERCEPT",
            "tx": round(target_x, 2),
            "ty": round(target_y, 2),
            "ax": round(acceleration_x, 2),
            "ay": round(acceleration_y, 2)
        }
        return self._send_command(payload)

    def _send_command(self, data_dict):
        if self.connection and self.connection.is_open:
            try:
                
                msg = json.dumps(data_dict) + '\n'
                self.connection.write(msg.encode('utf-8'))
                return True
            except Exception as e:
                print(f"Error sending data to effector: {e}")
                return False
        return False
        
    def disconnect(self):
        if self.connection and self.connection.is_open:
            self.disarm_system()
            self.connection.close()