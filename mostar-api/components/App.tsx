"use client";
import React, { useState } from "react";

export default function App() {
  const [codename, setCodename] = useState("");
  const [email, setEmail] = useState("agent@future.ai");
  const [security, setSecurity] = useState("");
  const [tier, setTier] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex flex-col items-center justify-center relative overflow-hidden">
      <header className="w-full px-4 py-2 bg-black text-xs text-gray-200 font-mono fixed top-0 left-0 z-10">
        MoStar Industries AI Platform
      </header>
      <div className="mt-20 flex flex-col items-center">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-2 text-center" style={{ color: '#baff39', fontFamily: 'Orbitron, monospace' }}>
          MoStar Industries
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-8 text-center">
          Advanced AI Platform • Futuristic Intelligence • Limitless Possibilities
        </p>
        <div className="bg-gray-900/80 rounded-2xl shadow-2xl p-8 md:p-12 w-full max-w-md flex flex-col items-center border border-gray-700 relative">
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-pink-400 flex items-center justify-center mb-2 shadow-lg">
              <span className="text-5xl">😊</span>
            </div>
            <h2 className="text-2xl font-bold text-cyan-400 mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>
              Welcome to the Future
            </h2>
            <div className="flex gap-4 mt-2">
              <button className="px-6 py-2 rounded-full bg-gradient-to-r from-cyan-400 to-pink-500 shadow-lg font-bold text-white border-2 border-cyan-400 hover:scale-105 transition">Join Mission</button>
              <button className="px-6 py-2 rounded-full bg-gray-800 text-white font-bold border-2 border-gray-600 hover:border-cyan-400 hover:scale-105 transition">Launch Access</button>
            </div>
          </div>
          <form className="w-full flex flex-col gap-4 mt-4">
            <div>
              <label className="block text-cyan-300 text-xs font-bold mb-1">AGENT CODENAME</label>
              <input type="text" placeholder="Enter your codename" value={codename} onChange={e => setCodename(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-black/60 border border-cyan-900 text-white focus:outline-none focus:border-cyan-400" />
            </div>
            <div>
              <label className="block text-cyan-300 text-xs font-bold mb-1">COMMUNICATION CHANNEL</label>
              <input type="email" placeholder="agent@future.ai" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-black/60 border border-cyan-900 text-white focus:outline-none focus:border-cyan-400" />
            </div>
            <div>
              <label className="block text-cyan-300 text-xs font-bold mb-1">SECURITY PHRASE</label>
              <input type="password" placeholder="Enter security phrase" value={security} onChange={e => setSecurity(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-black/60 border border-cyan-900 text-white focus:outline-none focus:border-cyan-400" />
            </div>
            <div>
              <label htmlFor="mission-tier" className="block text-cyan-300 text-xs font-bold mb-1">MISSION TIER</label>
              <select id="mission-tier" value={tier} onChange={e => setTier(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-black/60 border border-cyan-900 text-white focus:outline-none focus:border-cyan-400">
                <option value="">Select tier…</option>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="elite">Elite</option>
              </select>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
