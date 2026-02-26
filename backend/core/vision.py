import cv2
import os
import time
import torch
import functools
import threading
from ultralytics import YOLO
from dotenv import load_dotenv

load_dotenv()

class VisionEngine:
    def __init__(self):
        self.model_path = os.getenv("MODEL_PATH", "weights/yolov8n.pt")
        self.camera_index = int(os.getenv("CAMERA_INDEX", 0))
        
        self.model = None
        self.camera = None
        self.is_ready = False
        
        self.KNOWN_WIDTH = 0.25  
        self.FOCAL_LENGTH = 600  
        self.is_recording = False
        self.video_writer = None
        os.makedirs("recordings", exist_ok=True)
        
        # --- SHARED MEMORY ---
        # These store the latest data so endpoints don't fight over the camera
        self.current_frame = None
        self.current_annotated_frame = None
        self.current_detection = None
        
        print("⏳ Initializing AI Vision Engine in background...")
        threading.Thread(target=self._run_engine, daemon=True).start()

    def _run_engine(self):
        """The Master AI Loop: Reads camera and runs YOLO continuously."""
        original_torch_load = torch.load
        torch.load = functools.partial(original_torch_load, weights_only=False)
        
        try:
            self.model = YOLO(self.model_path)
            # FORCE WINDOWS DIRECTSHOW API TO TURN ON THE HARDWARE LIGHT
            self.camera = cv2.VideoCapture(self.camera_index, cv2.CAP_DSHOW) 
            time.sleep(1.0)
            self.is_ready = True
            print(f"✅ 🛡️ Sky-Watch Vision Engine Online & Ready on Camera {self.camera_index}.")
        except Exception as e:
            print(f"❌ Failed to load Vision Engine: {e}")
            torch.load = original_torch_load
            return
            
        torch.load = original_torch_load

        # The infinite loop that handles the camera 
        while True:
            success, frame = self.camera.read()
            if not success:
                print(f"⚠️ Warning: Camera at index {self.camera_index} is not sending frames. Is it in use by another app?")
                time.sleep(1.0)
                continue

            # Run AI Inference ONCE per frame
            results = self.model(frame, verbose=False)
            
            # Save the video picture with boxes drawn on it
            self.current_annotated_frame = results[0].plot()
            
            # Parse the math for the dashboard telemetry
            detection = None
            if len(results) > 0 and len(results[0].boxes) > 0:
                box = results[0].boxes[0]
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                pixel_width = x2 - x1
                dist = (self.KNOWN_WIDTH * self.FOCAL_LENGTH) / pixel_width if pixel_width > 0 else 0
                
                detection = {
                    "x": (x1 + x2) / 2, 
                    "y": (y1 + y2) / 2, 
                    "conf": float(box.conf[0]),
                    "dist": round(dist, 2)
                }

            # Update shared memory
            self.current_frame = frame
            self.current_detection = detection

            if self.is_recording and self.video_writer is not None:
                self.video_writer.write(frame)
                
            time.sleep(0.03) # Cap at ~30 FPS to save CPU

    def get_latest_frame_and_detections(self):
        """Websocket calls this to instantly get the latest math."""
        return self.current_frame, self.current_detection

    def generate_frames(self):
        """API Feed calls this to instantly get the latest picture."""
        while True:
            if not self.is_ready or self.current_annotated_frame is None:
                time.sleep(0.1)
                continue

            ret, buffer = cv2.imencode('.jpg', self.current_annotated_frame)
            if not ret:
                continue

            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            
            time.sleep(0.03) # Match the 30 FPS rate
            
    def toggle_recording(self):
        self.is_recording = not self.is_recording
        if self.is_recording and self.camera:
            filename = f"recordings/mission_{int(time.time())}.mp4"
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            width = int(self.camera.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(self.camera.get(cv2.CAP_PROP_FRAME_HEIGHT))
            self.video_writer = cv2.VideoWriter(filename, fourcc, 30.0, (width, height))
            print(f"🔴 RECORDING STARTED: {filename}")
        else:
            if self.video_writer:
                self.video_writer.release()
                self.video_writer = None
                print("⏹️ RECORDING SAVED")
        return self.is_recording