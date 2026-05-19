"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, Keyboard, Zap, Cpu, Terminal, Database, AlertTriangle } from "lucide-react";

interface InputInterfaceProps {
  onSendCommand: (cmd: string) => void;
  onVoiceCommand?: () => void;
  isProcessing: boolean;
  isListening: boolean;
  isServerVoice?: boolean;
  onListeningChange: (listening: boolean) => void;
  onKillCommand?: () => void;
  language: "en" | "hi";
}

export default function InputInterface({ 
  onSendCommand, 
  onVoiceCommand,
  isProcessing, 
  isListening, 
  isServerVoice,
  onListeningChange,
  onKillCommand,
  language
}: InputInterfaceProps) {
  const [mode, setMode] = useState<"text" | "voice">("text");
  const [query, setQuery] = useState("");
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isListening) {
      setMode("voice");
    }
  }, [isListening]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = language === "hi" ? "hi-IN" : "en-US";

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) onSendCommand(transcript);
          onListeningChange(false);
        };

        recognition.onerror = (event: any) => {
          setErrorStatus(event.error === "network" ? "NETWORK ERROR: LINK SEVERED" : `FAILURE: ${event.error.toUpperCase()}`);
          onListeningChange(false);
          setTimeout(() => setErrorStatus(null), 5000);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [onSendCommand, onListeningChange, language]);

  useEffect(() => {
    if (isListening && recognitionRef.current && !isServerVoice) {
      try {
        recognitionRef.current.lang = language === "hi" ? "hi-IN" : "en-US";
        recognitionRef.current.start();
      } catch (e) { console.error(e); }
    } else if (!isListening && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
  }, [isListening, language, isServerVoice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isProcessing) return;
    onSendCommand(query);
    setQuery("");
  };

  return (
    <div className="glass-panel hud-bracket hud-bracket-top-left flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
           <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Terminal className="w-4 h-4 text-blue-400" />
           </div>
           <div>
              <h3 className="text-xs font-bold font-sora text-white uppercase tracking-wider">Command Buffer</h3>
              <span className="text-[9px] font-mono text-blue-400/50 uppercase tracking-widest">Neural Link v4.0</span>
           </div>
        </div>
        
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 shadow-inner">
          {[
            { id: "text", label: "TERMINAL", icon: Keyboard },
            { id: "voice", label: "V-LINK", icon: Mic }
          ].map((m) => (
            <button 
              key={m.id}
              onClick={() => setMode(m.id as any)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[9px] font-mono font-bold transition-all ${mode === m.id ? "bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]" : "text-blue-400/30 hover:text-blue-400"}`}
            >
              <m.icon className="w-3 h-3" />
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mode === "text" ? (
          <motion.form
            key="text"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <div className="relative group">
              {/* Animated corner decorations for the textarea */}
              <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-blue-500/50" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-blue-500/50" />
              
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="EXECUTE SEQUENCE: Analyze system logs and report anomalies..."
                className="w-full h-40 bg-black/60 border border-white/5 rounded-xl p-5 text-[13px] font-mono text-blue-50 outline-none focus:border-blue-500/30 focus:bg-blue-950/10 transition-all resize-none placeholder:text-blue-400/20 shadow-inner custom-scrollbar"
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-3">
                 <div className="text-[9px] font-mono text-blue-400/20 uppercase tracking-widest">
                   {query.length} / 5000 BYTES
                 </div>
                 <Database className="w-3 h-3 text-blue-400/20" />
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isProcessing || !query.trim()}
                className={`flex-1 relative overflow-hidden group flex items-center justify-center gap-3 h-12 rounded-xl border font-mono text-[11px] font-bold tracking-[0.2em] transition-all ${
                  isProcessing || !query.trim() 
                    ? "bg-white/5 border-white/5 text-white/20" 
                    : "bg-blue-600/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-400 hover:text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                }`}
              >
                {isProcessing ? (
                  <div className="flex gap-1">
                     {[...Array(3)].map((_, i) => (
                       <motion.div 
                         key={i}
                         className="w-1 h-1 bg-blue-400 rounded-full"
                         animate={{ opacity: [0.2, 1, 0.2] }}
                         transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                       />
                     ))}
                  </div>
                ) : (
                  <>
                    <Zap className="w-4 h-4 group-hover:animate-pulse" />
                    INIT_EXECUTION_SEQUENCE
                  </>
                )}
                
                {/* Hover sweep effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </button>

              {isProcessing && onKillCommand && (
                <button
                  type="button"
                  onClick={onKillCommand}
                  className="px-6 rounded-xl border border-red-500/30 bg-red-500/5 text-red-500 hover:bg-red-500/20 hover:border-red-500 transition-all font-mono text-[11px] font-bold tracking-widest flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  KILL_PROC
                </button>
              )}
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="voice"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex flex-col items-center justify-center py-8 gap-8"
          >
             {/* Dynamic Waveform Visualizer */}
             <div className="flex items-center gap-1.5 h-16">
               {[...Array(16)].map((_, i) => (
                 <motion.div
                   key={i}
                   className="w-1 rounded-full bg-gradient-to-t from-blue-600 to-blue-400"
                   animate={{ 
                     height: isListening ? [10, 60, 10] : 6,
                     opacity: isListening ? 1 : 0.2,
                     boxShadow: isListening ? "0 0 10px rgba(59,130,246,0.5)" : "none"
                   }}
                   transition={{ 
                     duration: 0.4 + (Math.random() * 0.2), 
                     repeat: Infinity, 
                     delay: i * 0.04,
                     ease: "easeInOut"
                   }}
                 />
               ))}
             </div>

              <div className="relative">
                 {/* Ripple effect when listening */}
                 {isListening && (
                   <motion.div 
                     initial={{ scale: 0.8, opacity: 0.5 }}
                     animate={{ scale: 1.6, opacity: 0 }}
                     transition={{ duration: 1.5, repeat: Infinity }}
                     className="absolute inset-0 rounded-full bg-blue-500/20"
                   />
                 )}
                 
                 <button
                    onClick={() => onVoiceCommand ? onVoiceCommand() : onListeningChange(!isListening)}
                    className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
                      isListening 
                        ? "bg-blue-600 border-blue-400 shadow-[0_0_40px_rgba(59,130,246,0.8)] text-white" 
                        : "bg-black/60 border-white/10 text-blue-400/40 hover:border-blue-500/50 hover:text-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                    }`}
                  >
                    <Mic className={`w-10 h-10 ${isListening ? "animate-pulse" : ""}`} />
                  </button>
              </div>
 
              <div className="text-center space-y-2">
                <div className={`text-xs font-mono font-bold uppercase tracking-[0.4em] ${
                  isListening ? "neon-text animate-pulse" : "text-blue-400/30"
                }`}>
                  {isListening ? "Listening For Patterns" : "Tap To Initialize Link"}
                </div>
                {errorStatus ? (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-mono text-red-500 font-bold uppercase tracking-widest bg-red-500/10 px-4 py-1 rounded-full border border-red-500/20">
                    {errorStatus}
                  </motion.p>
                ) : (
                  <p className="text-[9px] font-mono text-blue-400/20 uppercase tracking-[0.2em]">End-To-End Encrypted Tunnel Active</p>
                )}
              </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
