"use client";

import { motion } from "framer-motion";
import { 
  Home, 
  BarChart2, 
  FolderOpen, 
  Cpu, 
  Wifi, 
  Terminal, 
  Settings,
  ShieldCheck,
  Zap
} from "lucide-react";

const NAV_ITEMS = [
  { id: "home",      icon: Home,       label: "SYNC_HOME" },
  { id: "analytics", icon: BarChart2,  label: "METRICS" },
  { id: "network",   icon: Wifi,       label: "UPLINK" },
];

interface BottomNavProps {
  activeView: string;
  onActiveViewChange: (view: string) => void;
}

export default function BottomNav({ activeView, onActiveViewChange }: BottomNavProps) {
  return (
    <nav className="relative h-20 px-4 md:px-10 flex items-center justify-between border-t border-blue-500/10 bg-black/60 backdrop-blur-3xl z-[100]">
      {/* Decorative background sweep */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent pointer-events-none" />
      
      {/* Left spacer for perfect centering */}
      <div className="flex-1 hidden md:block"></div>

      <div className="flex items-center gap-2 shrink-0">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onActiveViewChange(item.id)}
              className={`relative flex flex-col items-center justify-center min-w-[120px] h-16 group transition-all duration-500 ${isActive ? "text-white" : "text-blue-400/30 hover:text-blue-400"}`}
            >
              {/* Active Glow Indicator (Top) */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="nav-active-glow"
                    className="absolute -top-[1.5px] inset-x-4 h-[2px] bg-blue-500 shadow-[0_0_15px_#3b82f6]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </AnimatePresence>

              <div className="relative">
                <Icon className={`w-5 h-5 mb-1.5 transition-all duration-500 ${isActive ? "scale-110 drop-shadow-[0_0_8px_white]" : "group-hover:scale-105"}`} />
                {isActive && (
                   <motion.div 
                     layoutId="icon-pulse"
                     className="absolute inset-[-6px] rounded-lg bg-blue-500/10 -z-10" 
                   />
                )}
              </div>
              
              <span className={`text-[8px] font-mono font-bold tracking-[0.3em] uppercase transition-colors ${isActive ? "text-blue-400" : "text-current"}`}>
                {item.label}
              </span>

              {/* Hover highlight line */}
              <div className="absolute bottom-0 inset-x-8 h-[1px] bg-white/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </button>
          );
        })}
      </div>

      {/* Connection Metadata (Far Right) */}
      <div className="flex-1 hidden md:flex items-center justify-end gap-6">
         <div className="flex flex-col items-end">
            <span className="text-[8px] font-mono text-blue-400/30 uppercase tracking-widest">Protocol</span>
            <div className="flex items-center gap-2">
               <ShieldCheck className="w-3 h-3 text-emerald-500/50" />
               <span className="text-[10px] font-mono font-bold text-white/60">TS-01</span>
            </div>
         </div>
         
         <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
            <div className="relative w-10 h-10 border border-blue-500/30 rounded-full flex items-center justify-center group cursor-pointer hover:border-blue-400 transition-colors">
                <Zap className="w-4 h-4 text-blue-400 group-hover:animate-bounce" />
                <div className="absolute inset-0 border border-blue-500/20 rounded-full animate-ping" />
            </div>
         </div>
      </div>
    </nav>
  );
}

import { AnimatePresence } from "framer-motion";
