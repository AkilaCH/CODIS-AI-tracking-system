"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, Activity, Router, Settings, LogOut, 
  Play, Pause, SkipBack, SkipForward, ZoomIn, ZoomOut, 
  Circle, AlertTriangle, FileText, Cloud, Wind, Clock
} from 'lucide-react';
import { useCodisStore } from '@/store/codisStore'; 
import { triggerEffectorState, toggleVideoRecording } from '@/services/apiClient';

export default function Dashboard() {
  // ================= STORE & SUBSCRIPTIONS =================
  const isConnected = useCodisStore((state) => state.isConnected);
  const telemetry = useCodisStore((state) => state.latestTelemetry);
  const history = useCodisStore((state) => state.telemetryHistory);

  // ================= COMPONENT STATE =================
  const [currentTime, setCurrentTime] = useState<string>("00:00:00 UTC");
  const [weather, setWeather] = useState({ wind: "Loading...", condition: "..." });
  const [isPaused, setIsPaused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [commandInput, setCommandInput] = useState("");

  const statusColor = isConnected ? '#10B981' : '#EF4444'; 
  const statusText = isConnected ? 'ACTIVE' : 'OFFLINE';
  const confidencePct = telemetry?.confidence ? (telemetry.confidence * 100).toFixed(1) : '0.0';

  // ================= LIVE DATA HOOK =================
  useEffect(() => {
    // 1. Live UTC Clock
    const timer = setInterval(() => {
      setCurrentTime(new Date().toISOString().substring(11, 19) + " UTC");
    }, 1000);

    // 2. Live Weather Data (Open-Meteo API for Kandy, Sri Lanka)
    const fetchWeather = async () => {
      try {
        const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=7.2906&longitude=80.6337&current_weather=true");
        const data = await res.json();
        const windSpeed = `${data.current_weather.windspeed} km/h`;
        
        // Simple WMO weather code mapping
        const code = data.current_weather.weathercode;
        let cond = "Clear";
        if (code > 0 && code <= 3) cond = "Partly Cloudy";
        if (code > 3 && code < 50) cond = "Overcast";
        if (code >= 50) cond = "Precipitation";

        setWeather({ wind: windSpeed, condition: cond });
      } catch (error) {
        setWeather({ wind: "Offline", condition: "Offline" });
      }
    };
    fetchWeather();

    return () => clearInterval(timer);
  }, []);

  // ================= FUNCTIONAL HANDLERS =================

  const handleEmergencyStop = async () => {
    await triggerEffectorState(false);
    alert("EMERGENCY STOP ACTIVATED: SYSTEM DISARMED");
  };

  const handleGenerateReport = () => {
    if (history.length === 0) {
      alert("No telemetry data to report yet.");
      return;
    }
    const reportData = JSON.stringify(history, null, 2);
    const blob = new Blob([reportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CODIS_Mission_Report_${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 3)); 
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.5, 1)); 
  
  const handleRecordToggle = async () => {
    const result = await toggleVideoRecording();
    if (result) {
      setIsRecording(result.is_recording);
    } else {
      setIsRecording(!isRecording); // Fallback UI toggle if backend fails
    }
  };

  const handleCommandSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const cmd = commandInput.trim().toLowerCase();
      setCommandInput(""); // Clear input

      if (!cmd) return;

      switch (cmd) {
        case '/arm':
          await triggerEffectorState(true);
          alert("SYSTEM ARMED: Effectors are online.");
          break;
        case '/disarm':
        case '/stop':
          await handleEmergencyStop();
          break;
        case '/record':
          await handleRecordToggle();
          break;
        case '/report':
          handleGenerateReport();
          break;
        case '/help':
          alert("AVAILABLE COMMANDS:\n/arm - Arms interceptors\n/disarm - Emergency stop\n/record - Toggles video recording\n/report - Downloads mission JSON");
          break;
        default:
          alert(`Unknown command: ${cmd}. Type /help for a list of commands.`);
      }
    }
  };

  // ================= UI RENDER =================
  return (
    <div className="flex h-screen bg-panel-darker text-gray-300 font-sans overflow-hidden">
      
      {/* --- LEFT SIDEBAR --- */}
      <aside className="w-64 bg-[#0F1522] border-r border-gray-800 flex flex-col z-20 shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-gray-800">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            <Activity size={18} />
          </div>
          <div>
            <h1 className="text-white font-bold tracking-wider text-sm">SKY-WATCH</h1>
            <p className="text-xs text-gray-500">CMD CENTER V2.0</p>
          </div>
        </div>

        <nav className="flex-1 py-6 flex flex-col gap-2 px-4">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 bg-[#1A2332] text-white rounded-lg border border-gray-700">
            <LayoutDashboard size={18} className="text-blue-400" /> Dashboard
          </Link>
          <Link href="/analytics" className="flex items-center gap-3 px-4 py-3 hover:bg-[#1A2332] rounded-lg transition-colors text-gray-400">
            <Activity size={18} /> Analytics
          </Link>
          <Link href="/devices" className="flex items-center gap-3 px-4 py-3 hover:bg-[#1A2332] rounded-lg transition-colors text-gray-400">
            <Router size={18} /> Devices
          </Link>
          <Link href="/settings" className="flex items-center gap-3 px-4 py-3 hover:bg-[#1A2332] rounded-lg transition-colors text-gray-400">
            <Settings size={18} /> Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button className="flex items-center gap-3 px-4 py-2 w-full text-gray-400 hover:text-white transition-colors mb-4">
            <LogOut size={18} /> Logout
          </button>
          <div className="flex items-center gap-3 px-4">
            <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center font-bold text-white text-xs">
              AK
            </div>
            <div>
              <p className="text-sm text-white font-medium">Cmdr. Akila</p>
              <p className="text-xs transition-colors" style={{ color: statusColor }}>
                {isConnected ? 'ONLINE' : 'DISCONNECTED'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col bg-[#111827] overflow-hidden">
        
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-[#0F1522] z-20 shrink-0">
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2 font-mono"><Clock size={16}/> {currentTime}</div>
            <div className="flex items-center gap-2"><Wind size={16}/> {weather.wind}</div>
            <div className="flex items-center gap-2"><Cloud size={16}/> {weather.condition}</div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleGenerateReport}
              className="flex items-center gap-2 px-4 py-2 bg-[#1A2332] border border-gray-700 rounded text-sm hover:bg-gray-800 transition-colors"
            >
              <FileText size={16} /> REPORT
            </button>
            <button 
              onClick={handleEmergencyStop}
              className="flex items-center gap-2 px-4 py-2 bg-[#EF4444]/10 border border-[#EF4444] text-[#EF4444] rounded text-sm font-bold hover:bg-[#EF4444] hover:text-white transition-all"
            >
              <AlertTriangle size={16} /> EMERGENCY STOP
            </button>
          </div>
        </header>

        <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center">
          
          {/* VIDEO FEED WITH ZOOM */}
          <div 
            className="w-full h-full absolute inset-0 transition-transform duration-300 ease-in-out origin-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* VIDEO FEED WITH ZOOM */}
            {!isPaused && (
              <img 
                src="http://127.0.0.1:8000/api/video_feed" 
                className="absolute inset-0 w-full h-full object-cover opacity-60"
                alt="Live Feed"
                onError={(e) => { 
                  console.error("Video stream failed to load.");
                  e.currentTarget.src = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b"; 
                }}
              />
            )}
            
            {isPaused && (
              <div className="absolute inset-0 w-full h-full bg-gray-900 flex items-center justify-center opacity-80">
                <span className="text-white text-2xl font-bold tracking-widest">STREAM PAUSED</span>
              </div>
            )}

            {/* TARGET BOUNDING BOX */}
            {!isPaused && telemetry?.target_detected && telemetry.current_x !== null && telemetry.current_y !== null && (
              <div 
                className="absolute w-48 h-32 border-2 border-[#00FFAA] bg-[#00FFAA]/10 transition-all duration-75 pointer-events-none"
                style={{
                  left: `${telemetry.current_x}px`,
                  top: `${telemetry.current_y}px`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="absolute -top-6 left-0 bg-[#00FFAA] text-black text-[10px] font-bold px-2 py-1 flex items-center gap-2 whitespace-nowrap">
                  <span>TARGET ID: DR-{(telemetry.timestamp % 1000).toFixed(0)}</span>
                  <span>{confidencePct}% CONF</span>
                </div>
                
                <div className="absolute -bottom-6 right-0 text-[#00FFAA] text-[10px] font-bold tracking-widest bg-black/50 px-2 py-1">
                  DIST: {telemetry?.distance ? `${telemetry.distance}m` : 'SEARCHING...'}
                </div>

                <div className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 border border-[#00FFAA]/50 rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-[#00FFAA] rounded-full"></div>
                </div>
              </div>
            )}
          </div>

          {/* MEDIA CONTROLS */}
          <div className="absolute bottom-6 bg-[#0F1522]/90 backdrop-blur border border-gray-800 px-6 py-3 rounded-xl flex items-center gap-6 z-20">
            <button onClick={handleZoomOut} className="hover:text-white transition-colors"><ZoomOut size={18}/></button>
            <button className="hover:text-white transition-colors opacity-50 cursor-not-allowed"><SkipBack size={18}/></button>
            
            <button 
              onClick={() => setIsPaused(!isPaused)} 
              className="bg-blue-600 text-white p-2 rounded hover:bg-blue-500 transition-colors"
            >
              {isPaused ? <Play size={18} /> : <Pause size={18}/>}
            </button>
            
            <button className="hover:text-white transition-colors opacity-50 cursor-not-allowed"><SkipForward size={18}/></button>
            <button onClick={handleZoomIn} className="hover:text-white transition-colors"><ZoomIn size={18}/></button>
            
            <div className="w-px h-4 bg-gray-600"></div>
            
            <button 
              onClick={handleRecordToggle} 
              className={`transition-all flex items-center justify-center ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-500 hover:text-red-400'}`}
            >
              <Circle size={14} fill="currentColor" />
            </button>
          </div>
        </div>
      </main>

      {/* --- RIGHT PANEL --- */}
      <aside className="w-80 bg-[#0F1522] border-l border-gray-800 p-4 flex flex-col gap-4 overflow-y-auto z-20 shrink-0">
        
        {/* SYSTEM STATUS */}
        <div className="bg-[#1A2332] p-4 rounded-xl border border-gray-800">
          <h2 className="text-xs font-bold text-gray-500 mb-4 tracking-wider flex justify-between">
            SYSTEM STATUS <Settings size={14}/>
          </h2>
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="w-3 h-3 rounded-full transition-colors duration-300" 
              style={{ 
                backgroundColor: statusColor, 
                boxShadow: isConnected ? `0 0 10px ${statusColor}` : 'none' 
              }}
            ></div>
            <div>
              <p className="text-white font-bold text-sm">{statusText}</p>
              <p className="text-xs text-gray-500">
                {isConnected ? 'ALL SENSORS ONLINE' : 'AWAITING CONNECTION...'}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 bg-black/40 p-2 rounded border border-gray-700">
              <p className="text-[10px] text-gray-500 mb-1">DATA RATE</p>
              <div className="w-full bg-gray-800 h-1 rounded mb-1">
                <div className="bg-blue-500 h-1 rounded transition-all" style={{ width: isConnected ? '85%' : '0%' }}></div>
              </div>
              <p className="text-xs text-right text-white">{isConnected ? '30 FPS' : '0 FPS'}</p>
            </div>
          </div>
        </div>

        {/* INTERCEPTORS */}
        <div className="bg-[#1A2332] p-4 rounded-xl border border-gray-800">
          <h2 className="text-xs font-bold text-gray-500 tracking-wider flex justify-between items-center mb-2">
            INTERCEPTORS
            <span className="text-[10px] border border-[#10B981] text-[#10B981] px-2 py-0.5 rounded">READY</span>
          </h2>
          <p className="text-4xl font-bold text-white mb-2">3<span className="text-lg text-gray-500 font-normal">/3</span></p>
          <div className="flex gap-2 h-2">
            <div className="flex-1 bg-[#00FFAA] rounded"></div>
            <div className="flex-1 bg-[#00FFAA] rounded"></div>
            <div className="flex-1 bg-[#00FFAA] rounded"></div>
          </div>
        </div>

        {/* LIVE LOG & TERMINAL */}
        <div className="bg-[#1A2332] flex-1 rounded-xl border border-gray-800 p-4 flex flex-col min-h-[250px]">
          <h2 className="text-xs font-bold text-gray-500 tracking-wider mb-4 flex items-center gap-2">
            <FileText size={14}/> LIVE LOG
          </h2>
          
          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {isRecording && (
              <div className="border-l-2 border-red-500 pl-3 bg-red-500/5 p-2 rounded-r">
                <p className="text-[10px] text-gray-500">{currentTime}</p>
                <p className="text-sm text-white">Recording Started</p>
                <p className="text-[10px] text-red-400">SESSION LOGGING ACTIVE</p>
              </div>
            )}
            
            {history.slice(-10).reverse().map((entry, idx) => (
              <div key={idx} className={`border-l-2 pl-3 transition-all ${entry.target_detected ? 'border-[#10B981] bg-[#10B981]/5 p-2 rounded-r' : 'border-gray-500 opacity-60'}`}>
                <p className="text-[10px] text-gray-500">{new Date(entry.timestamp * 1000).toLocaleTimeString()}</p>
                <p className="text-sm text-white">{entry.target_detected ? "Visual lock confirmed" : "System pulse"}</p>
                <p className="text-[10px] text-gray-400">
                  {entry.target_detected ? `X: ${entry.current_x?.toFixed(0)} Y: ${entry.current_y?.toFixed(0)}` : "STANDBY"}
                </p>
              </div>
            ))}
          </div>
          
          {/* FUNCTIONAL COMMAND INPUT */}
          <div className="mt-4 bg-black border border-gray-700 rounded p-2 flex items-center">
            <span className="text-blue-500 mr-2 font-mono font-bold">{'>'}</span>
            <input 
              type="text" 
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              onKeyDown={handleCommandSubmit}
              placeholder="Enter command (e.g., /help)" 
              className="bg-transparent border-none text-xs font-mono text-white focus:outline-none w-full placeholder-gray-600"
              spellCheck="false"
              autoComplete="off"
            />
          </div>
        </div>

      </aside>
    </div>
  );
}