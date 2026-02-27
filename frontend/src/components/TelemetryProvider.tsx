"use client";

import React, { useEffect } from 'react';
import { connectTelemetryStream, disconnectTelemetryStream } from '@/services/socketClient';

export default function TelemetryProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Boot up the WebSocket connection to FastAPI when the app mounts
    connectTelemetryStream();

    // Clean up when the app unmounts
    return () => {
      disconnectTelemetryStream();
    };
  }, []);

  return <>{children}</>;
}