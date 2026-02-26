import numpy as np
import math

class TargetTracker:
    def __init__(self):
        # Initialize Kalman Filter parameters
        self.dt = 0.033 # Assuming ~30 fps (1/30)
        
        # State matrix: [x, y, vx, vy]
        self.state = np.zeros((4, 1))
        
        # State transition matrix (F) representing laws of kinematics
        self.F = np.array([
            [1, 0, self.dt, 0],
            [0, 1, 0, self.dt],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ])
        
        # Measurement matrix (H) - we only observe x and y
        self.H = np.array([
            [1, 0, 0, 0],
            [0, 1, 0, 0]
        ])
        
        # Covariance matrix (P)
        self.P = np.eye(4) * 1000 
        
        # Measurement noise (R) and Process noise (Q)
        self.R = np.eye(2) * 10  # Adjust during field testing for camera shake
        self.Q = np.eye(4) * 0.1 # Process noise

    def predict(self):
        # Prediction Step: Estimates current state variables
        self.state = np.dot(self.F, self.state)
        self.P = np.dot(np.dot(self.F, self.P), self.F.T) + self.Q
        
        # Return predicted future position (x, y)
        return float(self.state[0][0]), float(self.state[1][0])

    def update(self, measurement):
        # Update Step: Calculates Kalman Gain and updates prediction
        Z = np.array([[measurement[0]], [measurement[1]]])
        
        S = np.dot(self.H, np.dot(self.P, self.H.T)) + self.R
        K = np.dot(np.dot(self.P, self.H.T), np.linalg.inv(S))
        
        y = Z - np.dot(self.H, self.state)
        
        self.state = self.state + np.dot(K, y)
        I = np.eye(self.H.shape[1])
        self.P = np.dot((I - np.dot(K, self.H)), self.P)


class ProportionalNavigation:
    def __init__(self, navigation_constant=3.0):
        # N is the navigation constant, typically between 3 and 5
        self.N = navigation_constant

    def calculate_acceleration(self, target_pos, target_vel, interceptor_pos, interceptor_vel):
        """
        Calculates the required acceleration command for the interceptor.
        Variables:
        - target_pos, interceptor_pos: (x, y) tuples
        - target_vel, interceptor_vel: (vx, vy) tuples
        """
        # Relative position
        rel_pos_x = target_pos[0] - interceptor_pos[0]
        rel_pos_y = target_pos[1] - interceptor_pos[1]
        
        # Distance to target (Line of Sight distance)
        distance = math.hypot(rel_pos_x, rel_pos_y)
        
        if distance == 0:
            return 0.0, 0.0

        # Relative velocity
        rel_vel_x = target_vel[0] - interceptor_vel[0]
        rel_vel_y = target_vel[1] - interceptor_vel[1]
        
        # Closing velocity (Vc)
        # Dot product of relative velocity and relative position normalized
        Vc = -(rel_vel_x * rel_pos_x + rel_vel_y * rel_pos_y) / distance
        
        # Line of sight (LOS) angle (lambda)
        los_angle = math.atan2(rel_pos_y, rel_pos_x)
        
        # Rate of change of LOS angle (lambda_dot)
        # Cross product of relative position and relative velocity divided by distance squared
        los_rate = (rel_pos_x * rel_vel_y - rel_pos_y * rel_vel_x) / (distance ** 2)
        
        # Commanded Acceleration (ac = N * Vc * lambda_dot)
        ac = self.N * Vc * los_rate
        
        # Convert commanded acceleration into x and y components perpendicular to LOS
        ac_x = -ac * math.sin(los_angle)
        ac_y = ac * math.cos(los_angle)
        
        return ac_x, ac_y