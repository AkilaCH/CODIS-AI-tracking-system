"use client";
import React, { useState } from 'react';
import { LayoutDashboard, Activity, Router, Settings as SettingsIcon, LogOut, Save, RotateCcw, ShieldAlert, AlertTriangle } from 'lucide-react';
import { updateTacticalLogic } from '@/services/apiClient';
import Link from 'next/link';

export default function SettingsPage() {
  // State for UI Toggles
  const [targetClass, setTargetClass] = useState("drones");
  const [confidence, setConfidence] = useState(85);
  const [isAutonomous, setIsAutonomous] = useState(true);

  const handleSave = async () => {
    const result = await updateTacticalLogic(confidence, targetClass, isAutonomous);
    if (result) alert("Tactical Configuration Synchronized with Backend");
  };

  return (
    <div className="flex h-screen bg-[#0B0F19] text-gray-300 font-sans overflow-hidden">
      {/* Sidebar - Same as other pages */}
      <aside className="w-64 bg-[#0F1522] border-r border-gray-800 flex flex-col z-20 shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-gray-800">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold"><Activity size={18} /></div>
          <h1 className="text-white font-bold tracking-wider text-sm">SKY-WATCH</h1>
        </div>
        <nav className="flex-1 py-6 flex flex-col gap-2 px-4">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 hover:bg-[#1A2332] rounded-lg transition-colors text-gray-400"><LayoutDashboard size={18} /> Dashboard</Link>
          <Link href="/analytics" className="flex items-center gap-3 px-4 py-3 hover:bg-[#1A2332] rounded-lg transition-colors text-gray-400"><Activity size={18} /> Analytics</Link>
          <Link href="/devices" className="flex items-center gap-3 px-4 py-3 hover:bg-[#1A2332] rounded-lg transition-colors text-gray-400"><Router size={18} /> Devices</Link>
          <Link href="/settings" className="flex items-center gap-3 px-4 py-3 bg-[#1A2332] text-white rounded-lg border border-gray-700"><SettingsIcon size={18} className="text-blue-400" /> Settings</Link>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto bg-[#0B0F19]">
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-[#0F1522] shrink-0">
          <h1 className="text-white font-bold tracking-widest text-sm">AI LOGIC CONFIGURATION</h1>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-1.5 bg-gray-800 rounded text-xs font-bold"><RotateCcw size={14}/> Reset Defaults</button>
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 rounded text-xs font-bold text-white"><Save size={14}/> Save Changes</button>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Threat Detection Logic */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-[#161B28] border border-gray-800 rounded-xl p-6">
              <h2 className="text-xs font-bold text-gray-500 tracking-widest mb-6 flex items-center gap-2"><Activity size={14}/> THREAT DETECTION LOGIC</h2>
              <div className="space-y-4">
                {[
                  { id: 'drones', label: 'Class A Threats: Drones & UAVs', desc: 'Active scanning for quadcopters and fixed-wing UAVs.' },
                  { id: 'birds', label: 'Biologicals: Birds & Bats', desc: 'Filter biological signatures to prevent false positives.' },
                  { id: 'projectiles', label: 'Projectiles: Sports Balls', desc: 'Ignore non-explosive ballistic trajectories.' }
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-black/20 rounded border border-gray-800/50">
                    <div>
                      <p className="text-sm font-bold text-white">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <button 
                      onClick={() => setTargetClass(item.id)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${targetClass === item.id ? 'bg-blue-600' : 'bg-gray-700'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${targetClass === item.id ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-[#161B28] border border-gray-800 rounded-xl p-6">
               <h2 className="text-xs font-bold text-gray-500 tracking-widest mb-6 flex items-center gap-2"><SettingsIcon size={14}/> SCAN PARAMETERS</h2>
               <div className="grid grid-cols-2 gap-6">
                 <div className="bg-black/20 p-6 rounded border border-gray-800/50">
                    <p className="text-[10px] text-gray-500 font-bold mb-2 uppercase">Scan Frequency</p>
                    <p className="text-3xl text-white font-mono">120 <span className="text-sm text-gray-500">Hz</span></p>
                 </div>
                 <div className="bg-black/20 p-6 rounded border border-gray-800/50">
                    <p className="text-[10px] text-gray-500 font-bold mb-2 uppercase">Effective Range</p>
                    <p className="text-3xl text-white font-mono">2.4 <span className="text-sm text-gray-500">km</span></p>
                 </div>
               </div>
            </section>
          </div>

          {/* Right: Confidence and Rules */}
          <div className="space-y-6">
            <section className="bg-[#161B28] border border-gray-800 rounded-xl p-6">
              <h2 className="text-xs font-bold text-gray-500 tracking-widest mb-4 flex items-center gap-2"><Activity size={14}/> AI CONFIDENCE THRESHOLD</h2>
              <div className="py-6">
                <div className="flex justify-between items-end mb-4">
                  <p className="text-xs text-gray-400">Minimum confidence for lock</p>
                  <p className="text-3xl font-bold text-blue-500 font-mono">{confidence}%</p>
                </div>
                <input 
                  type="range" min="60" max="95" step="5" 
                  value={confidence} onChange={(e) => setConfidence(parseInt(e.target.value))}
                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-bold mt-4 uppercase">
                  <span>Loose (60%)</span><span>Balanced (80%)</span><span>Strict (95%)</span>
                </div>
              </div>
            </section>

            <section className="bg-[#161B28] border border-gray-800 rounded-xl p-6">
              <h2 className="text-xs font-bold text-gray-500 tracking-widest mb-6 flex items-center gap-2"><ShieldAlert size={14}/> ENGAGEMENT RULES</h2>
              <div className="space-y-4">
                <button 
                  onClick={() => setIsAutonomous(false)}
                  className={`w-full p-4 rounded border text-left flex justify-between items-center transition-all ${!isAutonomous ? 'bg-blue-600/10 border-blue-600' : 'bg-black/20 border-gray-800'}`}
                >
                  <div><p className="text-sm font-bold text-white">MANUAL CONFIRMATION</p><p className="text-[10px] text-gray-500">Operator must authorize every event.</p></div>
                  <div className={`w-4 h-4 rounded-full border-2 ${!isAutonomous ? 'border-white bg-white' : 'border-gray-600'}`} />
                </button>
                <button 
                  onClick={() => setIsAutonomous(true)}
                  className={`w-full p-4 rounded border text-left flex justify-between items-center transition-all ${isAutonomous ? 'bg-blue-600/10 border-blue-600' : 'bg-black/20 border-gray-800'}`}
                >
                  <div><p className="text-sm font-bold text-white">FULLY AUTONOMOUS</p><p className="text-[10px] text-gray-500">System engages valid threats automatically.</p></div>
                  <div className={`w-4 h-4 rounded-full border-2 ${isAutonomous ? 'border-white bg-white' : 'border-gray-600'}`} />
                </button>
              </div>
              {isAutonomous && (
                <div className="mt-6 p-3 bg-red-900/10 border border-red-900/50 rounded flex items-center gap-3">
                  <AlertTriangle size={16} className="text-red-500"/>
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Autonomous Mode Active</span>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}