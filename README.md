# CODIS: Civilian Object Detection and Interception System

![Sky-Watch Hero Image](docs/dashboard.png)

## Project Overview
[cite_start]The objective of this project is to build an autonomous, non-lethal object detection and interception system inspired by the architecture of the Iron Dome[cite: 3]. [cite_start]Instead of military applications, this system uses Artificial Intelligence (AI) and advanced mathematical algorithms to track fast-moving objects (such as rogue drones, sports balls, or pests) and neutralize them using safe, civilian methods (like interceptor drones with nets, targeted water streams, or safe sound waves)[cite: 4].

## System Architecture
[cite_start]The system functions through a three-stage pipeline: Detect (Vision), Predict (Math), and Act (Kinematics)[cite: 6].



* [cite_start]**Sensor Node (Input):** High frame-rate cameras or LiDAR continuously scan the sky or designated area[cite: 7].
* [cite_start]**Compute Node (Processing):** A local GPU runs a deep learning model for real-time object detection, passing bounding box coordinates to the mathematical prediction engine[cite: 8].
* [cite_start]**Effector Node (Output):** The physical interception mechanism (e.g., an interceptor drone) receives guidance coordinates to neutralize the target[cite: 9].

## Mathematical Models & Algorithms
[cite_start]To mimic a missile defense system, you cannot rely on AI alone[cite: 11]. [cite_start]You must combine Deep Learning with fundamental physics and control theory[cite: 12].

### 1. Object Detection: YOLO (You Only Look Once)
[cite_start]The system uses a state-of-the-art vision model like YOLOv8[cite: 14]. [cite_start]It analyzes each video frame independently and outputs a bounding box around the detected object, providing its $x$ and $y$ pixel coordinates[cite: 14].

### 2. Trajectory Prediction: The Kalman Filter
[cite_start]Because AI only tells you where the object is right now, we use a Kalman Filter to calculate where the object will be[cite: 16]. [cite_start]A Kalman filter is an algorithm that uses a series of measurements observed over time (containing noise and inaccuracies) to produce precise estimates of unknown variables[cite: 17]. [cite_start]The filter operates in two continuous steps[cite: 18]:

[cite_start]**Prediction Step:** Estimates the current state variables and their uncertainties[cite: 19].
[cite_start]$$x_{k|k-1}=\overline{F_{k}}x_{k-1|k-1}+B_{k}u_{k}$$ [cite: 20]
[cite_start]$$P_{k|k-1}=F_{k}P_{k-1|k-1}F_{k}^{T}+Q_{k}$$ [cite: 21]
(Where $x$ is the state estimate containing position and velocity, $F$ is the state transition matrix representing the laws of kinematics, and $P$ is the covariance matrix of the estimation error) [cite_start][cite: 22, 23].

[cite_start]**Update Step:** Once the AI provides a new visual measurement, the algorithm calculates the Kalman Gain ($K$) and updates the prediction to be flawlessly accurate[cite: 24].
[cite_start]$$K_{k}=P_{k|k-1}H_{k}^{T}(H_{k}P_{k|k-1}H_{k}^{T}+R_{k})^{-1}$$ [cite: 25]
[cite_start]$$x_{k|k}=x_{k|k-1}+K_{k}(z_{k}-H_{k}x_{k|k-1})$$ [cite: 26]

### 3. Interception Guidance: Proportional Navigation (PN)
[cite_start]To intercept the object, your effector (e.g., interceptor drone) does not simply chase the target[cite: 28]. [cite_start]It uses Proportional Navigation, a guidance law used in actual missile defense[cite: 29]. [cite_start]It calculates an interception point where the paths of both objects will cross at the exact same time[cite: 30].



[cite_start]The commanded acceleration ($a_{c}$) of your interceptor is calculated using[cite: 31]:
[cite_start]$$a_{c}=N\cdot V_{c}\cdot\dot{\lambda}$$ [cite: 32]
(Where $N$ is the navigation constant, $V_{c}$ is the closing velocity between the two objects, and $\dot{\lambda}$ is the rate of change of the line-of-sight angle) [cite_start][cite: 33].

## Tech Stack & Architecture
This system is built using a modern, decoupled architecture, separating the heavy GPU computation from the high-speed telemetry routing and the client-side rendering.

### Frontend (Command Center)
* **Next.js & React:** Server-side rendering and fast, reactive UI components.
* **Tailwind CSS:** Custom UI design.
* **Zustand:** Lightweight state management to handle high-frequency WebSocket telemetry.
* **Lucide React:** Clean, modern iconography for the tactical dashboard.
* **Recharts:** Real-time data visualization of the spatial radar and tracking history.

### Backend (Telemetry & API Bridge)
* **FastAPI (Python):** The core routing engine, chosen for its exceptional asynchronous performance and native WebSocket support.
* **Uvicorn:** ASGI web server used to run the FastAPI application.
* **WebSockets:** Provides the sub-second, bi-directional communication bridge required to stream live $(X, Y)$ coordinates to the UI.

### AI & Computer Vision Engine
* **Ultralytics YOLOv8:** State-of-the-art, real-time object detection model.
* **PyTorch:** The underlying deep learning framework executing the YOLO tensors.
* **OpenCV:** Handles hardware camera interfacing, matrix transformations, and MJPEG video streaming.
* **NumPy:** Handles the high-speed matrix multiplications required by the Kalman Filter.

## Project Milestones
* [cite_start]**Phase 1: Hardware Setup & Data Gathering (Weeks 1-2)** [cite: 35]
  * [cite_start]Tasks: Mount high-speed cameras and connect them to a central processing unit (e.g., NVIDIA Jetson or a PC with a dedicated GPU)[cite: 36].
  * [cite_start]Deliverable: A live, unlagged video feed streaming directly into a Python environment[cite: 37].
* [cite_start]**Phase 2: AI Detection Integration (Weeks 3-4)** [cite: 37]
  * [cite_start]Tasks: Implement the YOLOv8 model using Python and OpenCV[cite: 38]. [cite_start]Train the model on a custom dataset to recognize your specific target (e.g., standard consumer drones or tennis balls)[cite: 39].
  * [cite_start]Deliverable: System accurately draws a bounding box around the target in real-time, outputting its coordinates at 30+ frames per second[cite: 40].
* [cite_start]**Phase 3: Mathematical Tracking & Prediction (Weeks 5-7)** [cite: 41]
  * [cite_start]Tasks: Write the mathematical logic[cite: 42]. [cite_start]Pass the AI's bounding box coordinates into a Kalman Filter script[cite: 42]. [cite_start]Apply kinematic equations to model gravity and wind resistance[cite: 43].
  * [cite_start]Deliverable: The system can draw a projected trajectory line on the screen, accurately predicting where the object will be 3 to 5 seconds into the future, even if the object briefly passes behind a tree or obstacle[cite: 43].
* [cite_start]**Phase 4: Interception Logic & Actuation (Weeks 8-10)** [cite: 44]
  * [cite_start]Tasks: Program the Proportional Navigation guidance laws[cite: 45]. [cite_start]Connect the main computer to your interception device (e.g., an Arduino controlling a motorized net launcher or an autonomous interceptor drone)[cite: 45].
  * [cite_start]Deliverable: The interception mechanism successfully aims at the predicted future location of the target, rather than its current location[cite: 46].
* [cite_start]**Phase 5: Field Testing & Calibration (Weeks 11-12)** [cite: 47]
  * [cite_start]Tasks: Test the system against live moving targets[cite: 48]. [cite_start]Adjust the noise matrices ($Q_{k}$ and $R_{k}$) in the Kalman Filter to account for real-world camera shake and lighting changes[cite: 48, 49].
  * [cite_start]Deliverable: A fully functional, non-military "Iron Dome" prototype[cite: 50].

## Command Center Interface

### Main Dashboard & Telemetry Stream
The central hub displaying the live OpenCV feed, real-time system status, and the tactical command terminal.
![Dashboard UI](docs/dashboard.png)

### Analytics & Device Management
Visualizes tracking history, radar pings, and effector readiness states.
![Analytics UI](docs/analytics.png)
![Settings UI](docs/settings.png)

## Installation & Setup

### Prerequisites
* Python 3.10+
* Node.js 18+
* A working webcam or continuous video feed

### 1. Clone the Repository
```bash
git clone [https://github.com/AkilaCH/CODIS-AI-tracking-system.git](https://github.com/AkilaCH/CODIS-AI-tracking-system.git)
cd CODIS-AI-tracking-system

Launch the AI Backend (FastAPI)
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

Launch the Command Center (Next.js)
cd frontend
npm install
npm run dev
