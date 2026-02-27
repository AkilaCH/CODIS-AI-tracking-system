"use client";
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Activity, Router, Settings, LogOut, 
  Bell, User, Eye, Radio, ScanLine, MicOff, 
  Wifi, Signal, Plane, SlidersHorizontal, MapPin,
  AlertTriangle, Zap, Shield
} from 'lucide-react';
import Link from 'next/link';

export default function Devices() {
  // ================= STATE & SIMULATION =================
  const [hwData, setHwData] = useState<any>(null);

  // Poll the backend every 2 seconds for hardware health updates
  useEffect(() => {
    const fetchHardwareStatus = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/hardware/status');
        const data = await res.json();
        setHwData(data);
      } catch (error) {
        console.error("Hardware Link Failed:", error);
      }
    };

    fetchHardwareStatus();
    const interval = setInterval(fetchHardwareStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  // ================= ACTION HANDLERS =================
  const handleCalibrate = async (nodeId: string) => {
    try {
      await fetch(`http://localhost:8000/api/hardware/calibrate/${nodeId}`, { method: 'POST' });
      alert(`Calibration sequence initiated for ${nodeId}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEffectorAction = async (name: string, action: string) => {
    try {
      await fetch(`http://localhost:8000/api/hardware/effector/${name}/${action}`, { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
  };

  if (!hwData) {
    return (
      <div className="flex h-screen bg-[#0B0F19] items-center justify-center text-blue-500 font-mono animate-pulse">
        ESTABLISHING SECURE HARDWARE LINK...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0B0F19] text-gray-300 font-sans overflow-hidden">
      
      {/* ================= LEFT SIDEBAR ================= */}
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
          <Link href="/" className="flex items-center gap-3 px-4 py-3 hover:bg-[#1A2332] rounded-lg transition-colors text-gray-400">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link href="/analytics" className="flex items-center gap-3 px-4 py-3 hover:bg-[#1A2332] rounded-lg transition-colors text-gray-400">
            <Activity size={18} /> Analytics
          </Link>
          <Link href="/devices" className="flex items-center gap-3 px-4 py-3 bg-[#1A2332] text-white rounded-lg border border-gray-700">
            <Router size={18} className="text-blue-400" /> Devices
          </Link>
          <Link href="/settings" className="flex items-center gap-3 px-4 py-3 hover:bg-[#1A2332] rounded-lg transition-colors text-gray-400">
            <Settings size={18} /> Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button className="flex items-center gap-3 px-4 py-2 w-full text-gray-400 hover:text-white transition-colors mb-4">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto bg-[#0B0F19]">
        
        {/* ================= HEADER ================= */}
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-[#0F1522] shrink-0">
          <div className="flex items-center gap-2 text-blue-400">
            <Router size={20} />
            <span className="text-white font-bold tracking-widest text-sm uppercase">Sky-Watch Control Systems</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 transition-colors cursor-pointer rounded text-white text-xs font-bold tracking-wide">
              SYSTEM STATUS: ARMED
            </div>
            <button className="p-2 bg-[#1A2332] rounded border border-gray-800 hover:border-gray-600 transition-colors"><Bell size={16} /></button>
            <button className="p-2 bg-[#1A2332] rounded border border-gray-800 hover:border-gray-600 transition-colors"><Settings size={16} /></button>
            <button className="p-2 bg-[#1A2332] rounded border border-gray-800 hover:border-gray-600 transition-colors"><User size={16} /></button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
          
          {/* Header Section */}
          <div className="flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 text-blue-500 text-xs font-bold tracking-widest mb-2">
                <Activity size={14}/> DEVICE GRID
              </div>
              <h1 className="text-3xl text-white font-bold mb-2">Hardware & Effector Management</h1>
              <p className="text-gray-400 text-sm max-w-2xl">
                Real-time status of sensor arrays and kinetic interceptors. Monitor latency, battery health, and connection stability.
              </p>
            </div>
            <div className="flex gap-8 text-right">
              <div>
                <p className="text-[10px] text-gray-500 font-bold tracking-wider mb-1 uppercase">Network Load</p>
                <p className="text-2xl text-white font-mono">{hwData.network_load} <span className="text-sm text-gray-400">MB/s</span></p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold tracking-wider mb-1 uppercase">Active Nodes</p>
                <p className="text-2xl text-[#10B981] font-mono">{hwData.active_nodes}<span className="text-sm text-gray-500">/12</span></p>
              </div>
            </div>
          </div>

          {/* ================= SENSOR NODES (DYNAMIC) ================= */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <Eye className="text-blue-500" size={20}/>
                <h2 className="text-lg text-white font-bold">Sensor Nodes</h2>
                <span className="bg-[#1A2332] border border-gray-700 text-gray-400 text-[10px] px-2 py-0.5 rounded font-bold tracking-wider">
                  {hwData.active_nodes - 3} ACTIVE
                </span>
              </div>
              <a href="#" className="text-blue-500 text-sm hover:text-blue-400 transition-colors">View Network Topology →</a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(hwData.sensors).map(([key, node]: any) => (
                <div key={key} className={`bg-[#161B28] border border-gray-800 rounded-xl overflow-hidden flex flex-col transition-all duration-500 ${node.status === 'OFFLINE' ? 'opacity-50 grayscale' : 'opacity-100 grayscale-0'}`}>
                  <div className="h-32 relative p-3 overflow-hidden bg-gray-900">
                    {/* Dynamic BG based on type */}
                    <div className={`absolute inset-0 opacity-40 ${key === 'optical' ? 'bg-blue-900' : key === 'thermal' ? 'bg-purple-900' : key === 'lidar' ? 'bg-indigo-900' : 'bg-gray-950'}`}></div>
                    
                    <div className="relative z-10 flex gap-2">
                      <span className="bg-black/60 backdrop-blur text-white text-[10px] px-2 py-1 rounded font-bold uppercase">{key}</span>
                      <span className={`text-[10px] px-2 py-1 rounded font-bold flex items-center gap-1 border ${
                        node.status === 'LIVE' ? 'bg-[#10B981]/20 border-[#10B981]/50 text-[#10B981]' : 
                        node.status === 'WEAK SIG' ? 'bg-[#F59E0B]/20 border-[#F59E0B]/50 text-[#F59E0B]' : 
                        'bg-red-900/20 border-red-500/50 text-red-500'
                      }`}>
                        {node.status === 'OFFLINE' ? <MicOff size={10}/> : node.status === 'WEAK SIG' ? <AlertTriangle size={10}/> : <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></div>}
                        {node.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-white font-bold text-lg leading-tight capitalize">{key} {key === 'optical' ? 'Node A-04' : 'Array'}</h3>
                        <p className="text-xs text-gray-500 font-mono mt-1">ID: {node.id}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-mono font-bold text-sm ${node.latency > 100 ? 'text-orange-500' : 'text-[#10B981]'}`}>{node.latency > 0 ? `${node.latency}ms` : '--'}</p>
                        <p className="text-[9px] text-gray-500 tracking-wider">LATENCY</p>
                      </div>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        {node.status === 'OFFLINE' ? <ScanLine size={14}/> : <Wifi size={14}/>} {node.signal}
                      </div>
                      <button 
                        onClick={() => handleCalibrate(node.id)}
                        disabled={node.status === 'OFFLINE'}
                        className="border border-blue-900 text-blue-400 hover:bg-blue-900/30 disabled:opacity-30 disabled:cursor-not-allowed px-4 py-1.5 rounded text-xs font-bold transition-colors"
                      >
                        {node.status === 'OFFLINE' ? 'DIAGNOSE' : 'CALIBRATE'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ================= EFFECTOR NODES (DYNAMIC) ================= */}
          <section className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <Plane className="text-blue-500" size={20} />
                <h2 className="text-lg text-white font-bold">Effector Nodes</h2>
                <span className="bg-[#1A2332] border border-gray-700 text-gray-400 text-[10px] px-2 py-0.5 rounded font-bold tracking-wider">3 READY</span>
              </div>
              <button className="flex items-center gap-2 bg-[#1A2332] border border-gray-700 px-4 py-1.5 rounded text-sm hover:bg-gray-800 transition-colors">
                <SlidersHorizontal size={14}/> Filter
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(hwData.effectors).map(([key, effector]: any) => (
                <div key={key} className="bg-[#161B28] border border-gray-800 rounded-xl p-5 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded bg-blue-900/30 flex items-center justify-center text-blue-500">
                        <Plane size={24} className="-rotate-45" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg capitalize">Interceptor {key}</h3>
                        <p className="text-xs text-gray-500 font-mono tracking-wide uppercase">MODEL: {effector.model}</p>
                      </div>
                    </div>
                    
                    {/* Dynamic Battery Ring */}
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <span className={`text-[10px] font-bold ${effector.battery < 40 ? 'text-orange-500' : 'text-gray-300'}`}>{effector.battery}%</span>
                      <svg className="absolute w-full h-full -rotate-90">
                        <circle cx="24" cy="24" r="20" fill="transparent" stroke="#1F2937" strokeWidth="4"/>
                        <circle 
                          cx="24" cy="24" r="20" fill="transparent" 
                          stroke={effector.battery > 40 ? "#10B981" : "#F59E0B"} 
                          strokeWidth="4" 
                          strokeDasharray={125.6} 
                          strokeDashoffset={125.6 - (125.6 * effector.battery) / 100}
                          className="transition-all duration-1000"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="flex gap-4 mb-6">
                    <div className="flex-1 bg-[#0B0F19] rounded p-3 border border-gray-800/50">
                      <p className="text-[9px] text-gray-500 font-bold tracking-wider mb-1 uppercase">Status</p>
                      <div className={`flex items-center gap-2 text-sm font-bold ${effector.status === 'Charging' ? 'text-orange-500' : 'text-[#10B981]'}`}>
                        <div className={`w-2 h-2 rounded-full ${effector.status === 'Charging' ? 'bg-orange-500 animate-pulse' : 'bg-[#10B981]'}`}></div> 
                        {effector.status}
                      </div>
                    </div>
                    <div className="flex-1 bg-[#0B0F19] rounded p-3 border border-gray-800/50">
                      <p className="text-[9px] text-gray-500 font-bold tracking-wider mb-1 uppercase">GPS Lock</p>
                      <div className="flex items-center gap-2 text-blue-400 text-sm font-bold">
                        <MapPin size={14}/> {effector.gps} Sats
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <button 
                      onClick={() => handleEffectorAction(key, 'deploy')}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded transition-colors flex items-center justify-center gap-2 text-sm uppercase"
                    >
                      <Plane size={16} /> Deploy Test
                    </button>
                    <button 
                      onClick={() => handleEffectorAction(key, 'recall')}
                      className="px-3 bg-[#1A2332] border border-gray-700 hover:bg-gray-800 rounded transition-colors flex items-center justify-center text-gray-400"
                    >
                      <SlidersHorizontal size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}