"use client";

import { 
  Mountain, 
  Github,
  Compass,
} from "lucide-react";

export default function Header() {
  return (
    <header className="h-16 liquid-glass border-b border-white/10 flex items-center justify-between px-6 z-50 relative">
      {/* Logo */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Mountain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">SanBernard</h1>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Route Estimator</p>
          </div>
        </div>
      </div>

      {/* Center - Status */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span className="text-sm text-white/70">3D Globe View</span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          <span className="text-xs text-green-400">Ready</span>
        </div>
        
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
        >
          <Github className="w-4 h-4 text-white/60" />
        </a>
      </div>
    </header>
  );
}
