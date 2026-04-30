"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, Keyboard, Zap } from "lucide-react";

interface InputInterfaceProps {
  onSendCommand: (cmd: string) => void;
  isProcessing: boolean;
  isListening: boolean;
  onListeningChange: (listening: boolean) => void;
}

export default function InputInterface({ 
  onSendCommand, 
  isProcessing, 
  isListening, 
  onListeningChange 
}: InputInterfaceProps) {
  const [mode, setMode] = useState<"text" | "voice">("text");
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isProcessing) return;
    onSendCommand(query);
    setQuery("");
  };

  return (
    <div className="hud-panel bracket flex flex-col gap-4 p-6 bg-slate-950/40 backdrop-blur-xl border-white/5">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-[0.3em]">Input Interface</h3>
        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
          <button 
            onClick={() => setMode("text")}
            className={`px-3 py-1 rounded text-[9px] font-mono transition-all ${mode === "text" ? "bg-cyan-500 text-white shadow-[0_0_10px_#38BDF8]" : "text-slate-500"}`}
          >
            TEXT
          </button>
          <button 
            onClick={() => setMode("voice")}
            className={`px-3 py-1 rounded text-[9px] font-mono transition-all ${mode === "voice" ? "bg-cyan-500 text-white shadow-[0_0_10px_#38BDF8]" : "text-slate-500"}`}
          >
            VOICE
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mode === "text" ? (
          <motion.form
            key="text"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-3"
          >
            <div className="relative">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Analyze the following data and provide insights..."
                className="w-full h-32 bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4 text-xs font-mono text-cyan-50 outline-none focus:border-cyan-500/50 transition-all resize-none placeholder:text-slate-600"
              />
              <div className="absolute bottom-3 right-3 text-[9px] font-mono text-slate-600">
                {query.length}/5000
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isProcessing || !query.trim()}
              className="flex items-center justify-center gap-2 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] font-bold tracking-widest hover:bg-cyan-500/20 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <Zap className="w-3.5 h-3.5" />
                </motion.div>
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              SEND_COMMAND
            </button>
          </motion.form>
        ) : (
          <motion.div
            key="voice"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col items-center justify-center py-6 gap-6"
          >
             {/* Waveform Visualization */}
             <div className="flex items-center gap-1 h-12">
               {[...Array(12)].map((_, i) => (
                 <motion.div
                   key={i}
                   className="w-1 bg-cyan-500 rounded-full"
                   animate={{ 
                     height: isListening ? [10, 40, 10] : 4,
                     opacity: isListening ? 1 : 0.2
                   }}
                   transition={{ 
                     duration: 0.5, 
                     repeat: Infinity, 
                     delay: i * 0.05,
                     ease: "easeInOut"
                   }}
                 />
               ))}
             </div>

             <button
               onClick={() => onListeningChange(!isListening)}
               className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 border ${
                 isListening 
                   ? "bg-cyan-500 border-cyan-400 shadow-[0_0_30px_rgba(56,189,248,0.6)] text-white" 
                   : "bg-white/5 border-white/10 text-slate-500 hover:border-cyan-500/50 hover:text-cyan-400"
               }`}
             >
               <Mic className={`w-8 h-8 ${isListening ? "animate-pulse" : ""}`} />
             </button>

             <div className="text-center">
               <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                 {isListening ? "LISTENING..." : "TAP TO SPEAK"}
               </span>
               {isListening && (
                 <p className="text-[9px] font-mono text-cyan-500/60 mt-1 italic animate-pulse">Awaiting neural patterns</p>
               )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
