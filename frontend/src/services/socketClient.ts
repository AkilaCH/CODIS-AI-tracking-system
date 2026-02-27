import { useCodisStore } from '@/store/codisStore';

let ws: WebSocket | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;

export const connectTelemetryStream = (url: string = 'ws://localhost:8000/ws/telemetry') => {

  if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
    return;
  }

  ws = new WebSocket(url);

  ws.onopen = () => {
    console.log('🔗 Connected to CODIS Telemetry Stream');
    useCodisStore.getState().setConnectionStatus(true);

    if (reconnectTimer) clearTimeout(reconnectTimer);
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      // Instantly push the new AI coordinates to the Zustand store
      useCodisStore.getState().updateTelemetry(data);
    } catch (error) {
      console.error('❌ Failed to parse telemetry data:', error);
    }
  };

  ws.onclose = () => {
    console.log('🔌 Disconnected from CODIS Telemetry Stream. Reconnecting in 3s...');
    // Tell the UI that the system is offline (turns the status lights red)
    useCodisStore.getState().setConnectionStatus(false);
    ws = null;
    
    // Auto-reconnect logic: try again every 3 seconds
    reconnectTimer = setTimeout(() => connectTelemetryStream(url), 3000);
  };

  ws.onerror = (error) => {
    console.error('⚠️ WebSocket Error:', error);
    ws?.close(); // Force close to trigger the onclose reconnect logic
  };
};

export const disconnectTelemetryStream = () => {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  if (ws) {
    ws.close();
    ws = null;
  }
};