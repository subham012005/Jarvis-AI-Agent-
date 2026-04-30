"use client";

import { useState, useEffect, useRef } from "react";
import { User, Mic, Search, Wifi, Zap, ChevronRight, Terminal, Volume2, Languages } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SUGGESTIONS = [
  "Search the web for latest AI news",
  "Open Chrome browser",
  "What time is it in Tokyo?",
  "Get my notifications",
  "Send WhatsApp message to Mom",
  "Get the weather forecast",
  "Open VS Code",
  "Search for Python tutorials",
];

interface CommandBarProps {
  onSendCommand: (cmd: string) => void;
  isSpeaking: boolean;
  isProcessing: boolean;
  isConnected: boolean;
  isListening: boolean;
  onListeningChange: (listening: boolean) => void;
  language: "en" | "hi";
  onLanguageChange: (lang: "en" | "hi") => void;
}

export default function CommandBar({ 
  onSendCommand, 
  isSpeaking, 
  isProcessing, 
  isConnected,
  isListening,
  onListeningChange,
  language,
  onLanguageChange
}: CommandBarProps) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [suggestion, setSuggestion] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="relative h-20 px-8 flex items-center justify-between bg-slate-950/90 border-b border-white/5 backdrop-blur-2xl z-50">
      {/* Left: JARVIS Logo & Version */}
      <div className="flex flex-col">
        <h1 className="text-xl font-bold font-mono text-cyan-400 tracking-[0.2em] flex items-baseline gap-2">
          J.A.R.V.I.S <span className="text-[10px] text-slate-500 font-normal">v2.1.0</span>
        </h1>
        <p className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">JUST A RATHER VERY INTELLIGENT SYSTEM</p>
      </div>

      {/* Center-Left: Time Display */}
      <div className="flex flex-col border-l border-white/10 pl-6 ml-6">
        <div className="text-lg font-mono font-bold text-white tracking-widest">{time}</div>
        <div className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter">{date}</div>
      </div>

      {/* Center: System Status */}
      <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
        <span className="text-[8px] font-mono text-slate-500 uppercase tracking-[0.4em]">System Status</span>
        <span className="text-sm font-bold font-mono text-emerald-400 tracking-widest uppercase">Optimal</span>
        <div className="w-32 h-[1px] bg-emerald-500/30 mt-1 relative overflow-hidden">
          <motion.div 
            className="absolute h-full w-full bg-emerald-500/80" 
            animate={{ x: ["-100%", "100%"] }} 
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>

      {/* Right: Metrics, Language & User */}
      <div className="flex items-center gap-8">
        {/* HUD Metrics */}
        <div className="flex gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-mono text-slate-500 uppercase">CPU</span>
            <div className="flex items-end gap-1">
              <span className="text-xs font-mono font-bold text-white">23%</span>
              <div className="flex gap-[1px] h-2">
                {[...Array(4)].map((_, i) => <div key={i} className={`w-1 h-full ${i < 1 ? "bg-cyan-400" : "bg-white/10"}`} />)}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-mono text-slate-500 uppercase">RAM</span>
            <div className="flex items-end gap-1">
              <span className="text-xs font-mono font-bold text-white">45%</span>
              <div className="flex gap-[1px] h-2">
                {[...Array(4)].map((_, i) => <div key={i} className={`w-1 h-full ${i < 2 ? "bg-cyan-400" : "bg-white/10"}`} />)}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-mono text-slate-500 uppercase">NET</span>
            <div className="flex items-end gap-1">
              <span className="text-xs font-mono font-bold text-white">1.2 GB/S</span>
              <div className="flex gap-[1px] h-2 items-end">
                 {[4, 6, 8, 5, 7].map((h, i) => <div key={i} className="w-[1px] bg-cyan-400" style={{ height: h }} />)}
              </div>
            </div>
          </div>
        </div>

        {/* Language Protocol Selector */}
        <div className="flex flex-col items-center px-4 border-l border-white/10">
           <span className="text-[8px] font-mono text-slate-500 uppercase mb-1 flex items-center gap-1">
             <Languages className="w-2 h-2" /> Protocol
           </span>
           <div className="flex bg-white/5 rounded-full p-0.5 border border-white/5">
              <button 
                onClick={() => onLanguageChange("en")}
                className={`text-[9px] font-mono font-bold px-3 py-0.5 rounded-full transition-all ${language === "en" ? "bg-cyan-500 text-black" : "text-slate-500 hover:text-slate-300"}`}
              >
                ENG
              </button>
              <button 
                onClick={() => onLanguageChange("hi")}
                className={`text-[9px] font-mono font-bold px-3 py-0.5 rounded-full transition-all ${language === "hi" ? "bg-amber-500 text-black" : "text-slate-500 hover:text-slate-300"}`}
              >
                HIN
              </button>
           </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 border-l border-white/10 pl-6 h-10">
          <div className="text-right">
            <span className="block text-[8px] font-mono text-slate-500 uppercase">User</span>
            <span className="block text-[11px] font-bold font-mono text-white tracking-widest">TONY STARK</span>
          </div>
          <div className="relative w-10 h-10 rounded-full border border-cyan-500/50 p-0.5 overflow-hidden">
             <div className="w-full h-full rounded-full bg-cyan-500/10 flex items-center justify-center">
                <User className="w-6 h-6 text-cyan-400" />
             </div>
             <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent" />
          </div>
        </div>
      </div>
    </header>
  );
}
