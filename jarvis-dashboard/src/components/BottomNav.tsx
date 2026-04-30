"use client";

import { motion } from "framer-motion";
import { 
  Home, 
  BarChart2, 
  FolderOpen, 
  Cpu, 
  Wifi, 
  Terminal, 
  Settings 
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { id: "home",      icon: Home,       label: "HOME" },
  { id: "analytics", icon: BarChart2, label: "ANALYTICS" },
  { id: "files",     icon: FolderOpen, label: "FILES" },
  { id: "memory",    icon: Cpu,        label: "MEMORY" },
  { id: "network",   icon: Wifi,       label: "NETWORK" },
  { id: "devtools",  icon: Terminal,   label: "DEV TOOLS" },
  { id: "settings",  icon: Settings,   label: "SETTINGS" },
];

interface BottomNavProps {
  activeView: string;
  onActiveViewChange: (view: string) => void;
}

export default function BottomNav({ activeView, onActiveViewChange }: BottomNavProps) {
  return (
    <div className="relative flex items-center justify-center gap-1 px-8 py-2 bg-slate-950/80 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onActiveViewChange(item.id)}
            className={`relative flex flex-col items-center justify-center min-w-[100px] h-14 group transition-all duration-300 ${isActive ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"}`}
          >
            {/* Active Glow Indicator (Top) */}
            {isActive && (
              <motion.div
                layoutId="nav-glow"
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-cyan-400 shadow-[0_0_15px_#38BDF8]"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}

            <Icon className={`w-5 h-5 mb-1 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-105"}`} />
            <span className="text-[9px] font-mono font-bold tracking-[0.2em]">{item.label}</span>

            {/* Hover reflection effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-t from-cyan-500/50 to-transparent pointer-events-none" />
          </button>
        );
      })}

      {/* Extreme Right Glow Sphere (Reference Image Style) */}
      <div className="absolute right-10 bottom-2 w-12 h-12 flex items-center justify-center">
        <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl animate-pulse" />
        <div className="relative w-8 h-8 border border-cyan-500/40 rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
            <div className="absolute inset-0 border border-cyan-500/20 rounded-full animate-ping" />
        </div>
      </div>
    </div>
  );
}
