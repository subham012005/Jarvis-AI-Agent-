"use client";

import { useState, useEffect, useRef } from "react";
import { User, Mic, Search, Wifi, Zap, ChevronRight, Terminal, Volume2, Languages, Shield, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CommandBarProps {
  onSendCommand: (cmd: string) => void;
  onVoiceCommand?: () => void;
  isSpeaking: boolean;
  isProcessing: boolean;
  isConnected: boolean;
  isListening: boolean;
  isServerVoice?: boolean;
  onListeningChange: (listening: boolean) => void;
  language: "en" | "hi";
  onLanguageChange: (lang: "en" | "hi") => void;
}

export default function CommandBar({ 
  onSendCommand, 
  onVoiceCommand,
  isSpeaking, 
  isProcessing, 
  isConnected,
  isListening,
  isServerVoice,
  onListeningChange,
  language,
  onLanguageChange
}: CommandBarProps) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
      setDate(now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="relative h-20 px-10 flex items-center justify-between border-b border-blue-500/10 bg-black/40 backdrop-blur-3xl z-50 overflow-hidden">
      {/* Decorative scanner sweep for the header */}
      <div className="scanner-sweep" />
      
      {/* Left section: Identity & System Clock */}
      <div className="flex items-center gap-4 lg:gap-10 flex-1">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold font-sora text-white tracking-widest flex items-baseline gap-2">
            JARVIS<span className="text-[10px] text-blue-400/50 font-mono font-medium tracking-normal">OS // v4.0.2</span>
          </h1>
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_#3b82f6]" />
             <span className="text-[8px] font-mono text-blue-400/60 uppercase tracking-[0.4em]">Integrated Intelligence</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4 border-l border-white/5 pl-8">
           <div className="flex flex-col items-center">
              <span className="text-[9px] font-mono text-blue-400/40 uppercase tracking-widest">Time</span>
              <span className="text-xl font-mono font-semibold text-white tracking-tight">{time}</span>
           </div>
           <div className="flex flex-col">
              <span className="text-[9px] font-mono text-blue-400/40 uppercase tracking-widest">Date</span>
              <span className="text-[10px] font-mono font-medium text-blue-200/60 uppercase">{date}</span>
           </div>
        </div>
      </div>

      {/* Center: Global Status Projection */}
      <div className="hidden md:flex flex-col items-center gap-1 group cursor-pointer shrink-0">
        <div className="flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-500/5 border border-emerald-500/20">
           <Activity className="w-3 h-3 text-emerald-400" />
           <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest">System Nominal</span>
        </div>
        <div className="relative w-48 h-[2px] bg-white/5 overflow-hidden rounded-full">
           <motion.div 
             className="absolute h-full w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent" 
             animate={{ x: ["-100%", "200%"] }} 
             transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
           />
        </div>
        <span className="text-[8px] font-mono text-blue-400/30 uppercase tracking-[0.5em] mt-1 group-hover:text-blue-400/60 transition-colors">Neural Sync Active</span>
      </div>

      {/* Right section: Protocols & Security */}
      <div className="flex items-center gap-4 lg:gap-10 flex-1 justify-end">
        {/* Language & Protocol */}
        <div className="flex items-center gap-6 pr-8 border-r border-white/5">
           <div className="flex flex-col items-end gap-1">
              <span className="text-[8px] font-mono text-blue-400/40 uppercase tracking-widest flex items-center gap-1">
                <Languages className="w-2.5 h-2.5" /> Language
              </span>
              <div className="flex p-0.5 rounded-lg bg-black/40 border border-white/5">
                {["en", "hi"].map((l) => (
                  <button 
                    key={l}
                    onClick={() => onLanguageChange(l as any)}
                    className={`text-[8px] font-mono font-bold px-3 py-1 rounded transition-all ${language === l ? "bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]" : "text-blue-400/40 hover:text-blue-400"}`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
           </div>

           <div className="flex flex-col items-center gap-1">
              <span className="text-[8px] font-mono text-blue-400/40 uppercase tracking-widest flex items-center gap-1">
                <Shield className="w-2.5 h-2.5" /> Link
              </span>
              <button 
                onClick={() => onVoiceCommand ? onVoiceCommand() : onListeningChange(!isListening)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${
                  isListening 
                    ? "bg-blue-600 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.6)] text-white" 
                    : "glass-panel bg-white/5 border-white/10 text-blue-400/60 hover:text-blue-400 hover:border-blue-500/40"
                }`}
              >
                <Mic className={`w-4 h-4 ${isListening ? "animate-pulse" : ""}`} />
              </button>
           </div>
        </div>

        {/* User Identity HUD */}
        <div className="flex items-center gap-4">
          <div className="text-right flex flex-col">
            <span className="text-[8px] font-mono text-blue-400/40 uppercase tracking-tighter">Auth User</span>
            <span className="text-xs font-bold font-sora text-white tracking-[0.1em]">ANTHONY STARK</span>
          </div>
          <div className="relative group">
             {/* Glowing border ring */}
             <div className="absolute inset-[-4px] rounded-full border border-blue-500/20 group-hover:border-blue-500/50 transition-all duration-500 animate-spin-slow" />
             <div className="w-12 h-12 rounded-full glass-panel border-blue-500/40 p-1">
                <div className="w-full h-full rounded-full bg-blue-500/10 flex items-center justify-center overflow-hidden">
                   <User className="w-6 h-6 text-blue-400" />
                </div>
             </div>
             {/* Security Badge */}
             <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center shadow-[0_0_10px_#10b981]">
                <Shield className="w-2.5 h-2.5 text-white" />
             </div>
          </div>
        </div>
      </div>
    </header>
  );
}
