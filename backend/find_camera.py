import cv2

print("🔍 Searching for available cameras (Indices 0-9)...")
available_cameras = []

for i in range(10):
    # CAP_DSHOW is the native Windows DirectShow API, often more reliable
    cap = cv2.VideoCapture(i, cv2.CAP_DSHOW) 
    
    if cap.isOpened():
        ret, frame = cap.read()
        if ret:
            print(f"✅ LIVE Camera found at index: {i}")
            available_cameras.append(i)
        else:
            print(f"⚠️ Device at index {i} opened, but returned no video (Virtual/Dead camera).")
        cap.release()

if not available_cameras:
    print("\n❌ CRITICAL: Windows is blocking all cameras. Check 'Camera Privacy Settings' in your Start Menu.")
else:
    print(f"\n🎯 SUCCESS! Open your backend/.env file and set CAMERA_INDEX={available_cameras[0]}")