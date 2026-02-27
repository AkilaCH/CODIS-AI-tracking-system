const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Updates the AI vision settings in the FastAPI backend.
 */
export const updateBackendSettings = async (confidence: number, targetClass: string, autonomous: boolean) => {
  try {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        min_confidence: confidence / 100, 
        target_class: targetClass,
        tracking_enabled: autonomous
      })
    });
    return await response.json();
  } catch (error) {
    console.error("Failed to update settings:", error);
    return null;
  }
};

/**
 * Arms or disarms the physical effector node.
 */
export const triggerEffectorState = async (armSystem: boolean) => {
  try {
    const response = await fetch(`${API_BASE_URL}/effector`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ arm: armSystem })
    });
    return await response.json();
  } catch (error) {
    console.error("Failed to trigger effector:", error);
    return null;
  }
};

/**
 * Toggles the OpenCV VideoWriter on the backend.
 */
export const toggleVideoRecording = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/record`, { method: 'POST' });
    return await response.json();
  } catch (error) {
    console.error("Failed to toggle recording:", error);
    return null;
  }
};

/**
 * Sends a raw string command to the backend terminal parser.
 */
export const sendTerminalCommand = async (cmd: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: cmd })
    });
    return await response.json();
  } catch (error) {
    console.error("Failed to send command:", error);
    return null;
  }
};

export const updateTacticalLogic = async (confidence: number, targetClass: string, isAutonomous: boolean) => {
  try {
    const response = await fetch(`${API_BASE_URL}/settings/tactical`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        min_confidence: confidence / 100, 
        target_class: targetClass,
        autonomous_mode: isAutonomous
      })
    });
    return await response.json();
  } catch (error) {
    console.error("Failed to update tactical logic:", error);
    return null;
  }
};