"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, User, Bot, Volume2, ShieldCheck, Cpu, Sparkles } from "lucide-react";
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
    }, 15); // Faster typing
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
    <div className="glass-panel hud-bracket hud-bracket-bottom-right flex flex-col h-full shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 shrink-0 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
               <Cpu className="w-5 h-5 text-blue-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black animate-pulse" />
          </div>
          <div>
            <span className="block text-xs font-bold font-sora text-white uppercase tracking-tight">Neural Interface</span>
            <span className="block text-[9px] font-mono text-blue-400/40 uppercase tracking-[0.2em]">Secure Data Link • Active</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <AnimatePresence>
            {isSpeaking && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400"
              >
                <div className="flex gap-0.5 items-end h-2">
                   {[...Array(4)].map((_, i) => (
                     <motion.div 
                       key={i}
                       className="w-0.5 bg-blue-400"
                       animate={{ height: [2, 8, 2] }}
                       transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                     />
                   ))}
                </div>
                <span className="text-[9px] font-mono font-bold tracking-widest uppercase">Audio_Out</span>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="p-2 rounded-lg bg-white/5 border border-white/10 opacity-40">
             <ShieldCheck className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 scroll-smooth custom-scrollbar"
      >
        {history.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center opacity-10">
            <Sparkles className="w-16 h-16 text-blue-400 mb-6 animate-pulse" />
            <div className="text-center font-mono text-[10px] uppercase tracking-[0.4em] text-blue-100">
              [ Awaiting Neural Patterns ]<br/>
              Identity Verified: Auth_User_Alpha
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {history.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className={`flex gap-5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar HUD */}
                <div className="relative shrink-0 mt-1">
                   <div className={`w-11 h-11 rounded-xl glass-panel flex items-center justify-center border shadow-2xl ${
                     msg.role === "user" 
                       ? "border-violet-500/40 bg-violet-600/10 text-violet-400" 
                       : "border-blue-500/40 bg-blue-600/10 text-blue-400"
                   }`}>
                     {msg.role === "user" ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                   </div>
                   {/* Avatar deco ring */}
                   <div className={`absolute inset-[-4px] rounded-xl border border-dashed opacity-20 ${
                     msg.role === "user" ? "border-violet-500/60" : "border-blue-500/60"
                   }`} />
                </div>

                {/* Bubble Interface */}
                <div className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} max-w-[80%]`}>
                   <div className="flex items-center gap-3 mb-2 px-1">
                     <span className={`text-[9px] font-mono font-bold uppercase tracking-widest ${
                       msg.role === "user" ? "text-violet-500/60" : "text-blue-500"
                     }`}>
                       {msg.role === "user" ? "USER_ALPHA" : "SYS_JARVIS"}
                     </span>
                     <span className="text-[8px] font-mono text-white/20">{msg.ts}</span>
                   </div>

                  <div className={`px-5 py-4 rounded-2xl text-[14px] font-mono leading-[1.6] shadow-2xl border ${
                    msg.role === "user" 
                      ? "bg-violet-600/5 border-violet-500/20 text-slate-200 rounded-tr-none" 
                      : "bg-blue-600/5 border-blue-500/20 text-blue-50 rounded-tl-none relative"
                  }`}>
                    {/* Decorative scanner line for AI responses */}
                    {msg.role === "jarvis" && (
                       <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
                    )}

                    {msg.role === "jarvis" && i === history.length - 1 ? (
                      <TypingText text={msg.text} />
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer System Status */}
      <div className="px-6 py-4 border-t border-white/5 bg-black/40 flex items-center justify-between">
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <motion.div 
              key={i} 
              className="w-1.5 h-1.5 bg-blue-500/30 rounded-full" 
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
        <span className="text-[9px] font-mono text-blue-400/20 uppercase tracking-[0.4em]">Neural Stream // Encrypted</span>
      </div>
    </div>
  );
}
