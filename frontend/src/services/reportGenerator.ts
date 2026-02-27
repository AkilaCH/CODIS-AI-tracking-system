import { TelemetryData } from '@/types/telemetry';

export const downloadMissionReport = (history: TelemetryData[]) => {
  if (history.length === 0) {
    alert("No telemetry data to report.");
    return;
  }

  const report = {
    mission_date: new Date().toISOString(),
    total_data_points: history.length,
    target_locks: history.filter(d => d.target_detected).length,
    telemetry_log: history
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = `SKY-WATCH_Report_${new Date().getTime()}.json`;
  document.body.appendChild(a);
  a.click();
  
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};