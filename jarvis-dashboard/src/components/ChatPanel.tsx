"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, User, Bot, Volume2, ShieldCheck, Cpu } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "jarvis";
  text: string;
  ts: string;
}

const TypingText = ({ text, onComplete }: { text: string; onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => text.slice(0, index + 1));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 20);
    return () => clearInterval(interval);
  }, [text, onComplete]);

  return <span>{displayedText}</span>;
};

export default function ChatPanel({ history, isSpeaking }: { history: Message[]; isSpeaking: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="hud-panel bracket flex flex-col h-full overflow-hidden bg-slate-950/40 backdrop-blur-xl border-cyan-500/20 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 shrink-0 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          </div>
          <div>
            <span className="block text-xs font-bold font-mono text-white uppercase tracking-tighter">Neural Interface</span>
            <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest">Secure Link Active</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isSpeaking && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-2 py-1 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
            >
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
              <span className="text-[9px] font-mono font-bold">AUDIO_OUT</span>
            </motion.div>
          )}
          <ShieldCheck className="w-4 h-4 text-slate-500" />
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 scroll-smooth custom-scrollbar"
      >
        {history.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20">
            <Bot className="w-12 h-12 text-cyan-400 mb-4" />
            <div className="text-center font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-100">
              [ LINK_ESTABLISHED ]<br/>
              AWAITING_NEURAL_INPUT
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {history.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-lg ${
                  msg.role === "user" 
                    ? "border-violet-500/40 bg-violet-500/10 text-violet-300" 
                    : "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                }`}>
                  {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>

                {/* Bubble */}
                <div className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} max-w-[85%]`}>
                  <div className={`px-4 py-3 rounded-2xl text-[13px] font-mono leading-relaxed shadow-xl border ${
                    msg.role === "user" 
                      ? "bg-violet-600/10 border-violet-500/30 text-slate-200 rounded-tr-none" 
                      : "bg-cyan-600/5 border-cyan-500/30 text-cyan-50 text-shadow-sm rounded-tl-none"
                  }`}>
                    {msg.role === "jarvis" && i === history.length - 1 ? (
                      <TypingText text={msg.text} />
                    ) : (
                      msg.text
                    )}
                  </div>
                  
                  {/* Metadata */}
                  <div className="flex items-center gap-2 mt-2 px-1">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter">
                      {msg.ts}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                    <span className={`text-[9px] font-mono uppercase tracking-tighter ${
                      msg.role === "user" ? "text-violet-500/60" : "text-cyan-500/60"
                    }`}>
                      {msg.role === "user" ? "AUTH_USER_ALPHA" : "SYS_RESPONSE_OMEGA"}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer decoration */}
      <div className="px-6 py-3 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
        <div className="flex gap-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-1 h-1 bg-cyan-500/30 rounded-full" />
          ))}
        </div>
        <span className="text-[8px] font-mono text-slate-600 uppercase tracking-[0.3em]">Neural Interface Layer</span>
      </div>
    </div>
  );
}
