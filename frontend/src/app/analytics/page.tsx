"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, Activity, Router, Settings, LogOut, 
  AlertTriangle, FileText, Bell, Crosshair, Target
} from 'lucide-react';
import { useCodisStore } from '@/store/codisStore';
import { sendTerminalCommand, triggerEffectorState } from '@/services/apiClient';
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function Analytics() {
  const isConnected = useCodisStore((state) => state.isConnected);
  const telemetry = useCodisStore((state) => state.latestTelemetry);
  const history = useCodisStore((state) => state.telemetryHistory);

  const [commandInput, setCommandInput] = useState("");

  // ================= DATA PROCESSING =================
  const liveX = telemetry?.current_x ? telemetry.current_x.toFixed(1) : '----';
  const liveY = telemetry?.current_y ? telemetry.current_y.toFixed(1) : '----';
  const predX = telemetry?.predicted_x ? telemetry.predicted_x.toFixed(1) : '----';
  
  const liveVelocity = telemetry?.closing_velocity ? telemetry.closing_velocity.toFixed(2) : '----';
  const liveConfidence = telemetry?.confidence ? (telemetry.confidence * 100).toFixed(1) : '0.0';
  const filterStatus = isConnected ? (telemetry?.target_detected ? 'TRACKING' : 'SCANNING') : 'IDLE';

  // Format data for the Spatial Scatter Plot
  // We use two separate datasets so we can style the Actual vs Predicted lines differently
  const actualPath = useMemo(() => {
    return history.filter(h => h.current_x !== null).map(h => ({
      x: h.current_x,
      y: h.current_y,
      time: new Date(h.timestamp * 1000).toLocaleTimeString()
    }));
  }, [history]);

  const predictedPath = useMemo(() => {
    return history.filter(h => h.predicted_x !== null).map(h => ({
      x: h.predicted_x,
      y: h.predicted_y,
      time: new Date(h.timestamp * 1000).toLocaleTimeString()
    }));
  }, [history]);

  // ================= HANDLERS =================
  const handleEmergencyStop = async () => {
    await triggerEffectorState(false);
    alert("EMERGENCY STOP ACTIVATED");
  };

  const handleCommandSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const cmd = commandInput.trim();
      setCommandInput(""); 
      if (!cmd) return;
      await sendTerminalCommand(cmd);
    }
  };

  return (
    <div className="flex h-screen bg-[#0B0F19] text-gray-300 font-sans overflow-hidden">
      
      {/* ================= MAIN NAVIGATION (FAR LEFT) ================= */}
      <aside className="w-20 lg:w-64 bg-[#0F1522] border-r border-gray-800 flex flex-col z-20 shrink-0 transition-all">
        <div className="p-6 flex items-center justify-center lg:justify-start gap-3 border-b border-gray-800 h-16">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
            <Activity size={18} />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-white font-bold tracking-wider text-sm">SKY-WATCH</h1>
          </div>
        </div>

        <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
          <Link href="/" className="flex items-center gap-3 px-3 py-3 hover:bg-[#1A2332] rounded-lg transition-colors text-gray-400">
            <LayoutDashboard size={18} /> <span className="hidden lg:block">Dashboard</span>
          </Link>
          <Link href="/analytics" className="flex items-center gap-3 px-3 py-3 bg-[#1A2332] text-white rounded-lg border border-gray-700">
            <Activity size={18} className="text-blue-400" /> <span className="hidden lg:block">Analytics</span>
          </Link>
          <Link href="/devices" className="flex items-center gap-3 px-3 py-3 hover:bg-[#1A2332] rounded-lg transition-colors text-gray-400">
            <Router size={18} /> <span className="hidden lg:block">Devices</span>
          </Link>
          <Link href="/settings" className="flex items-center gap-3 px-3 py-3 hover:bg-[#1A2332] rounded-lg transition-colors text-gray-400">
            <Settings size={18} /> <span className="hidden lg:block">Settings</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <button className="flex items-center gap-3 px-3 py-2 w-full text-gray-400 hover:text-white transition-colors">
            <LogOut size={18} /> <span className="hidden lg:block">Logout</span>
          </button>
        </div>
      </aside>

      {/* ================= DATA SIDEBAR (INNER LEFT) ================= */}
      <aside className="w-80 bg-[#0B0F19] border-r border-gray-800 p-4 flex flex-col gap-4 overflow-y-auto z-10 shrink-0">
        <h2 className="text-[10px] font-bold text-gray-500 tracking-widest mb-2">LIVE TELEMETRY FEED</h2>
        
        {/* Telemetry Cards */}
        <div className="bg-[#161B28] p-3 rounded-lg border border-gray-800 flex justify-between items-center">
          <div>
            <p className="text-[10px] text-gray-500 font-bold tracking-wider mb-1">X-COORD</p>
            <p className="text-lg text-white font-mono font-bold">{liveX}</p>
          </div>
          <Crosshair size={16} className="text-blue-500" />
        </div>
        
        <div className="bg-[#161B28] p-3 rounded-lg border border-gray-800 flex justify-between items-center">
          <div>
            <p className="text-[10px] text-gray-500 font-bold tracking-wider mb-1">Y-COORD</p>
            <p className="text-lg text-white font-mono font-bold">{liveY}</p>
          </div>
          <Crosshair size={16} className="text-[#00FFAA]" />
        </div>

        <div className="bg-[#161B28] p-3 rounded-lg border border-gray-800 flex justify-between items-center mb-4">
          <div>
            <p className="text-[10px] text-gray-500 font-bold tracking-wider mb-1">PREDICTED X</p>
            <p className="text-lg text-[#F59E0B] font-mono font-bold">{predX}</p>
          </div>
          <Target size={16} className="text-[#F59E0B]" />
        </div>

        {/* Live Log */}
        <div className="bg-[#161B28] flex-1 rounded-lg border border-gray-800 p-4 flex flex-col min-h-[300px]">
          <h2 className="text-xs font-bold text-gray-500 tracking-wider mb-4 flex items-center gap-2">
            <FileText size={14}/> LIVE LOG
          </h2>
          <div className="flex-1 space-y-3 overflow-y-auto pr-2">
            {history.slice(-15).reverse().map((entry, idx) => {
              if (entry.system_log) {
                const colorClass = entry.log_level === 'WARN' ? 'text-red-400' : 
                                   entry.log_level === 'SUCCESS' ? 'text-green-400' :
                                   entry.log_level === 'CMD' ? 'text-blue-400' : 'text-blue-500';
                return (
                  <div key={idx} className="text-xs font-mono">
                    <span className={`font-bold ${colorClass}`}>[SYS]</span> {entry.system_log}
                  </div>
                );
              }
              return (
                <div key={idx} className="text-xs font-mono text-gray-400">
                  <span className="text-[#10B981]">[TRK]</span> Target updated: {Math.round(entry.current_x || 0)}, {Math.round(entry.current_y || 0)}
                </div>
              );
            })}
            {!isConnected && (
              <div className="text-xs font-mono text-gray-500">
                <span className="text-blue-500 font-bold">[SYS]</span> Telemetry stream disconnected.
              </div>
            )}
          </div>
          
          <div className="mt-4 bg-black border border-gray-700 rounded p-2 flex items-center">
            <span className="text-blue-500 mr-2 font-mono font-bold">{'>'}</span>
            <input 
              type="text" 
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              onKeyDown={handleCommandSubmit}
              placeholder="Enter command..." 
              className="bg-transparent border-none text-xs font-mono text-white focus:outline-none w-full"
              autoComplete="off" spellCheck="false"
            />
          </div>
        </div>

        {/* Emergency Stop Button */}
        <button 
          onClick={handleEmergencyStop}
          className="w-full flex justify-center items-center gap-2 px-4 py-4 bg-[#EF4444]/10 border border-[#EF4444] text-[#EF4444] rounded-lg text-sm font-bold hover:bg-[#EF4444] hover:text-white transition-all mt-2"
        >
          <AlertTriangle size={18} /> EMERGENCY STOP
        </button>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#0B0F19] p-6 gap-6">
        
        {/* Top Header Row */}
        <header className="flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3 text-white">
            <Activity size={20} className="text-blue-500" />
            <h1 className="font-bold tracking-widest text-lg">TRAJECTORY & ANALYTICS ENGINE</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-3 py-1 rounded border text-xs font-bold flex items-center gap-2 ${isConnected ? 'bg-[#10B981]/10 border-[#10B981] text-[#10B981]' : 'bg-[#EF4444]/10 border-[#EF4444] text-[#EF4444]'}`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#10B981] animate-pulse' : 'bg-[#EF4444]'}`}></div>
              {isConnected ? 'ONLINE' : 'OFFLINE'}
            </div>
            <Settings size={18} className="text-gray-500 hover:text-white cursor-pointer" />
            <Bell size={18} className="text-gray-500 hover:text-white cursor-pointer" />
          </div>
        </header>

        {/* --- SPATIAL TRAJECTORY VISUALIZATION (RADAR MAP) --- */}
        <div className="bg-[#161B28] flex-1 rounded-xl border border-gray-800 p-6 flex flex-col relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4 z-10">
            <h2 className="text-sm font-bold text-white tracking-widest">SPATIAL TRAJECTORY VISUALIZATION</h2>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-blue-400 font-mono mb-6 z-10">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            {filterStatus === 'TRACKING' ? 'TARGET ACQUIRED - PLOTTING KINEMATICS...' : 'SCANNING ...'}
          </div>

          {/* Background Radar Rings (CSS styling trick) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-[300px] h-[300px] rounded-full border border-blue-500/30"></div>
            <div className="w-[600px] h-[600px] rounded-full border border-blue-500/20 absolute"></div>
            <div className="w-[900px] h-[900px] rounded-full border border-blue-500/10 absolute"></div>
          </div>

          <div className="flex-1 w-full h-full min-h-[300px] z-10">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" opacity={0.5} />
                {/* We map X vs Y to mimic the camera field of view. Y is reversed because camera pixels start 0 at top */}
                <XAxis type="number" dataKey="x" name="X-Coord" domain={[0, 1280]} stroke="#4B5563" tick={{fontSize: 10}} />
                <YAxis type="number" dataKey="y" name="Y-Coord" domain={[0, 720]} reversed stroke="#4B5563" tick={{fontSize: 10}} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  contentStyle={{ backgroundColor: '#0F1522', borderColor: '#1F2937', color: '#fff', fontSize: '12px' }} 
                />
                
                {/* Actual AI Path (Solid Blue) */}
                <Scatter 
                  name="Actual Path" 
                  data={actualPath} 
                  fill="#3B82F6" 
                  line={{ stroke: '#3B82F6', strokeWidth: 2 }} 
                  isAnimationActive={false}
                />
                
                {/* Kalman Prediction Path (Dashed Gray/White) */}
                <Scatter 
                  name="Kalman Prediction" 
                  data={predictedPath} 
                  fill="#9CA3AF" 
                  line={{ stroke: '#9CA3AF', strokeWidth: 2, strokeDasharray: '5 5' }} 
                  isAnimationActive={false}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Legend matching mockup */}
          <div className="absolute bottom-6 left-6 bg-[#0B0F19] border border-gray-800 rounded px-4 py-2 flex gap-6 text-xs font-bold text-gray-400 z-10">
            <div className="flex items-center gap-2"><div className="w-4 h-1 bg-blue-500"></div> ACTUAL PATH</div>
            <div className="flex items-center gap-2"><div className="w-4 h-1 bg-gray-400 border-t border-dashed border-gray-400"></div> KALMAN PREDICTION</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#F59E0B]"></div> TARGET VECTORS</div>
          </div>
        </div>

        {/* --- REAL-TIME ANALYTICS (BOTTOM PANEL) --- */}
        <div className="bg-[#161B28] rounded-xl border border-gray-800 p-6 flex flex-col md:flex-row gap-8 shrink-0">
          <div className="w-48 shrink-0">
            <h2 className="text-[10px] font-bold text-gray-500 tracking-widest mb-6 flex items-center gap-2">
              <Activity size={14}/> REAL-TIME ANALYTICS
            </h2>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8 border-l border-gray-800 pl-8">
            <div>
              <p className="text-[10px] font-bold text-gray-500 tracking-widest mb-2 flex justify-between">
                CLOSING VELOCITY (Vc) <Target size={14} className="text-[#F59E0B]"/>
              </p>
              <p className="text-3xl font-mono font-bold text-white">{liveVelocity} <span className="text-sm text-gray-500">px/s</span></p>
            </div>

            <div className="border-l border-gray-800 pl-8">
              <p className="text-[10px] font-bold text-gray-500 tracking-widest mb-2 flex justify-between">
                AI CONFIDENCE <Crosshair size={14} className="text-[#A855F7]"/>
              </p>
              <p className="text-3xl font-mono font-bold text-white">{liveConfidence} <span className="text-sm text-gray-500">%</span></p>
            </div>

            <div className="border-l border-gray-800 pl-8">
              <p className="text-[10px] font-bold text-gray-500 tracking-widest mb-2">FILTER STATUS</p>
              <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
                <div className={`w-3 h-3 rounded-full ${filterStatus === 'TRACKING' ? 'bg-[#00FFAA]' : filterStatus === 'SCANNING' ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
                {filterStatus}
              </div>
              <p className="text-xs text-gray-500">Tracking predictions running at 30Hz</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}