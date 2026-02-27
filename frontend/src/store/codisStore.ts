import { create } from 'zustand';
import { TelemetryData } from '../types/telemetry';

interface CodisState {
  isConnected: boolean;
  latestTelemetry: TelemetryData | null;
  telemetryHistory: TelemetryData[];
  
  // Actions
  setConnectionStatus: (status: boolean) => void;
  updateTelemetry: (data: TelemetryData) => void;
}

export const useCodisStore = create<CodisState>((set) => ({
  isConnected: false,
  latestTelemetry: null,
  telemetryHistory: [],
  
  setConnectionStatus: (status) => set({ isConnected: status }),
  
  updateTelemetry: (data) => set((state) => {
    // We keep the last 100 data points to draw the trajectory paths,
    // slicing it prevents memory leaks from an endless data stream.
    const newHistory = [...state.telemetryHistory, data].slice(-100);
    
    return {
      latestTelemetry: data,
      telemetryHistory: newHistory,
    };
  }),
}));