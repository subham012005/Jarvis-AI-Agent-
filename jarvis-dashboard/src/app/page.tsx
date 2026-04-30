"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Activity, Globe, Zap, Clock, Bot, Wifi, FolderOpen, Terminal, AlertTriangle, MessageSquare } from "lucide-react";

import CommandBar      from "@/components/CommandBar";
import HologramCore    from "@/components/HologramCore";
import MetricCard      from "@/components/MetricCard";
import AgentFleet      from "@/components/AgentFleet";
import LiveLog         from "@/components/LiveLog";
import SystemTelemetry from "@/components/SystemTelemetry";
import ChatPanel       from "@/components/ChatPanel";
import BottomNav       from "@/components/BottomNav";
import InputInterface  from "@/components/InputInterface";

interface SystemStats {
  cpu: number; ram: number; disk: number; uptime: string; db_health: string;
}

interface LogEntry {
  id: number; ts: string; severity: any; source: string; message: string;
}

interface Message {
  role: "user" | "jarvis"; text: string; ts: string;
}

interface Agent {
  id: string; name: string; status: any; task: string; progress: number;
}

export default function DashboardPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeView, setActiveView] = useState("home");
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [telegramMessages, setTelegramMessages] = useState<any[]>([]);
  const [thoughtProcess, setThoughtProcess] = useState<any | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    cpu: 0, ram: 0, disk: 0, uptime: "---", db_health: "Connecting..."
  });
  const [intelligenceError, setIntelligenceError] = useState<string | null>(null);
  
  const socketRef = useRef<WebSocket | null>(null);
  const logIdCounter = useRef(0);

  const agentState = isListening ? "listening" : isProcessing ? "processing" : isSpeaking ? "speaking" : "idle";

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket("ws://localhost:8000/ws");
      ws.onopen = () => setIsConnected(true);
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case "init_state":
            setStats(msg.data.system);
            setAgents(msg.data.agents);
            setLogs(msg.data.logs.map((l: any) => ({ ...l, id: ++logIdCounter.current })));
            setChatHistory(msg.data.chat_history);
            if (msg.data.telegram_history?.length) {
              setTelegramMessages(msg.data.telegram_history);
            }
            break;
          case "system_stats": setStats(msg.data); break;
          case "log": setLogs(prev => [{ ...msg.data, id: ++logIdCounter.current }, ...prev].slice(0, 100)); break;
          case "chat_update": setChatHistory(prev => [...prev, msg.data]); break;
          case "telegram_update": setTelegramMessages(prev => [...prev, msg.data]); break;
          case "thought_process": setThoughtProcess(msg.data); break;
          case "agents_sync": setAgents(msg.data); setIsProcessing(msg.data.some((a: any) => a.status === "busy")); break;
          case "response": handleJarvisResponse(msg.data); break;
        }
      };
      ws.onclose = () => { setIsConnected(false); setTimeout(connect, 3000); };
      socketRef.current = ws;
    };
    connect();
    return () => socketRef.current?.close();
  }, []);

  const handleJarvisResponse = useCallback((rawResponse: string) => {
    let displayText = rawResponse;
    let ttsText = rawResponse;

    // Dual-Output Protocol: Try to parse JSON if we are in Hindi mode
    if (language === "hi") {
      try {
        const json = JSON.parse(rawResponse);
        if (json.display_text && json.tts_text) {
          displayText = json.display_text;
          ttsText = json.tts_text;
        }
      } catch (e) {
        // Fallback to raw text if not JSON
        console.log("Response was not JSON, using raw text.");
      }
    }

    // Removed local Chat Panel update to prevent doubling (handled by server's chat_update)
    
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    
    // Speak using TTS text (Proper Devanagari Hindi if applicable)
    const utterance = new SpeechSynthesisUtterance(ttsText);
    const voices = window.speechSynthesis.getVoices();
    
    if (language === "hi") {
      utterance.lang = "hi-IN";
      const hiVoice = voices.find(v => v.name.includes("Google हिन्दी") || v.name.includes("Hindi") || v.lang === "hi-IN");
      if (hiVoice) {
        utterance.voice = hiVoice;
        utterance.pitch = 1.1;
        utterance.rate = 0.95;
      }
    } else {
      utterance.lang = "en-GB";
      const enVoice = voices.find(v => v.name.includes("Google UK English Male") || v.name.includes("Daniel") || v.lang.includes("en-GB"));
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [language]);

  const sendCommand = useCallback((cmd: string) => {
    setIsProcessing(true);
    setIntelligenceError(null);

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ 
        type: "command", 
        data: cmd, 
        lang: language 
      }));
    } else {
      setTimeout(() => {
        setIsProcessing(false);
        const mockRes = language === "hi" 
          ? JSON.stringify({
              display_text: `Haan bhai, kya haal hai? Maine suna ki tune kaha: "${cmd}"`,
              tts_text: `हाँ भाई, क्या हाल है? मैंने सुना कि तुमने कहा: ${cmd}`
            })
          : `I have received your command: "${cmd}". Rebuilding the neural patterns now...`;
        handleJarvisResponse(mockRes);
      }, 2000);
    }
  }, [handleJarvisResponse, language]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#050812] selection:bg-cyan-500/30">
      {/* Top HUD Bar */}
      <CommandBar 
        onSendCommand={sendCommand} 
        isSpeaking={isSpeaking}
        isProcessing={isProcessing}
        isConnected={isConnected}
        isListening={isListening}
        onListeningChange={setIsListening}
        language={language}
        onLanguageChange={setLanguage}
      />

      <main className="flex-1 overflow-hidden p-6 grid grid-cols-[380px_1fr_420px] gap-6">
        {/* Left Column */}
        <div className="flex flex-col gap-6 overflow-hidden">
           <InputInterface 
              onSendCommand={sendCommand} 
              isProcessing={isProcessing} 
              isListening={isListening} 
              onListeningChange={setIsListening} 
           />
           <div className="flex-1 overflow-hidden flex flex-col gap-3 min-h-0">
             <div className="overflow-hidden shrink-0 min-h-0 flex-[0_0_auto]" style={{maxHeight: '45%'}}>
               <AgentFleet agents={agents} />
             </div>
             
             {/* AI Neural Thought Chain */}
             <div className="flex-1 overflow-hidden hud-panel bracket bg-violet-950/10 border-violet-500/20 flex flex-col min-h-0">
               <div className="px-4 py-3 border-b border-violet-500/20 bg-violet-500/5 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                   <span className="text-violet-400 font-mono text-[9px] uppercase tracking-widest font-bold">Neural Thought Chain</span>
                 </div>
                 {thoughtProcess && (
                   <span className="text-[8px] font-mono text-violet-400/50 uppercase">{thoughtProcess.ts}</span>
                 )}
               </div>
               <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-2">
                 {!thoughtProcess ? (
                   <div className="flex flex-col items-center justify-center h-full opacity-20 text-violet-400">
                     <Cpu className="w-6 h-6 mb-2 animate-pulse" />
                     <span className="text-[9px] font-mono uppercase tracking-widest">Awaiting neural activation...</span>
                   </div>
                 ) : (
                   <>
                     <div className="text-[8px] font-mono text-violet-400/50 uppercase tracking-widest mb-2 pb-2 border-b border-violet-500/10">
                       Query: <span className="text-violet-300">{thoughtProcess.query?.slice(0, 40)}{thoughtProcess.query?.length > 40 ? "..." : ""}</span>
                     </div>
                     {thoughtProcess.steps.map((step: any, i: number) => (
                       <motion.div
                         key={i}
                         initial={{ opacity: 0, x: -10 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: i * 0.05 }}
                         className={`flex gap-2 p-2 rounded text-[9px] font-mono border ${
                           step.type === "tool_call"
                             ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                             : step.type === "tool_result"
                             ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                             : step.type === "final"
                             ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-300"
                             : "bg-violet-500/10 border-violet-500/20 text-violet-300"
                         }`}
                       >
                         <span className="shrink-0 mt-0.5">
                           {step.type === "tool_call" ? "⚡" : step.type === "tool_result" ? "✓" : step.type === "final" ? "★" : "◈"}
                         </span>
                         <div className="min-w-0">
                           <div className="font-bold uppercase tracking-wide mb-0.5">{step.label}</div>
                           {step.detail && <div className="opacity-70 break-words leading-relaxed">{step.detail}</div>}
                         </div>
                       </motion.div>
                     ))}
                   </>
                 )}
               </div>
             </div>
           </div>
        </div>

        {/* Center Column */}
        <div className="flex flex-col overflow-hidden relative">
           <div className="flex-1 relative overflow-hidden">
              <AnimatePresence mode="wait">
                {activeView === "home" && (
                  <motion.div 
                    key="home"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-8"
                  >
                     {intelligenceError && (
                       <motion.div 
                         initial={{ opacity: 0, y: -20 }}
                         animate={{ opacity: 1, y: 0 }}
                         className="w-full max-w-2xl mb-8 hud-panel border-red-500/50 bg-red-500/10 p-5 relative overflow-hidden group"
                       >
                         <div className="absolute top-0 left-0 w-1 h-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                         <div className="flex gap-4">
                           <div className="shrink-0 w-12 h-12 rounded bg-red-500/20 flex items-center justify-center text-red-500 border border-red-500/30">
                             <AlertTriangle className="w-7 h-7 animate-pulse" />
                           </div>
                           <div className="flex-1">
                             <h4 className="text-[11px] font-mono font-bold text-red-400 uppercase tracking-widest mb-2">
                               Integrity Breach / Execution Failed
                             </h4>
                             <p className="text-xs font-mono text-red-200/80 leading-relaxed mb-5">
                               {intelligenceError}
                             </p>
                             <button 
                               onClick={() => setActiveView("settings")}
                               className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 text-[10px] font-mono font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group-hover:gap-3"
                             >
                               Configure Intelligence Providers <Zap className="w-3 h-3" />
                             </button>
                           </div>
                         </div>
                       </motion.div>
                     )}
                     <HologramCore state={agentState} />
                  </motion.div>
                )}

                {activeView === "analytics" && (
                  <motion.div 
                    key="analytics"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute inset-0 flex flex-col gap-4 p-4 overflow-y-auto custom-scrollbar"
                  >
                    <div className="hud-panel bracket p-5 bg-cyan-500/5 border-cyan-500/20 shrink-0">
                      <h3 className="text-cyan-400 font-mono text-[10px] mb-4 uppercase tracking-widest flex items-center justify-between">
                        <span className="flex items-center gap-2"><Activity className="w-3 h-3" /> Neural Analytics Projection</span>
                        <span className="text-cyan-400/50 text-[9px]">LIVE</span>
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: "CPU Load", value: `${stats.cpu.toFixed(1)}%`, color: "text-cyan-400", bg: "bg-cyan-500/10" },
                          { label: "RAM Usage", value: `${stats.ram.toFixed(1)}%`, color: "text-violet-400", bg: "bg-violet-500/10" },
                          { label: "Disk Usage", value: `${stats.disk.toFixed(1)}%`, color: "text-amber-400", bg: "bg-amber-500/10" },
                        ].map((m, i) => (
                          <div key={i} className={`${m.bg} border border-white/5 rounded-lg p-3 text-center`}>
                            <div className="text-[9px] text-slate-500 uppercase mb-1">{m.label}</div>
                            <div className={`text-2xl font-mono font-bold ${m.color}`}>{m.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="hud-panel bracket p-5 bg-cyan-500/5 border-cyan-500/20 shrink-0">
                      <h3 className="text-cyan-400 font-mono text-[10px] mb-4 uppercase tracking-widest">CPU Utilization — Live</h3>
                      <div className="flex items-end gap-1 h-24 w-full">
                        {[...Array(20)].map((_, i) => {
                          const h = i === 19 ? stats.cpu : Math.max(5, Math.random() * 80 + 10);
                          return (
                            <motion.div key={i}
                              className={`flex-1 rounded-t ${i === 19 ? "bg-cyan-400 shadow-[0_0_8px_#22D3EE]" : "bg-cyan-500/30"}`}
                              initial={{ height: 0 }}
                              animate={{ height: `${h}%` }}
                              transition={{ duration: 0.5, delay: i * 0.02 }}
                            />
                          );
                        })}
                      </div>
                      <div className="text-[9px] text-slate-600 font-mono mt-2 text-center uppercase tracking-widest">Past 20 Readings</div>
                    </div>

                    <div className="hud-panel bracket p-5 bg-cyan-500/5 border-cyan-500/20 shrink-0">
                      <h3 className="text-cyan-400 font-mono text-[10px] mb-4 uppercase tracking-widest">Session Activity</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "Messages Sent", value: chatHistory.filter(m => m.role === "user").length, color: "text-violet-400" },
                          { label: "AI Responses", value: chatHistory.filter(m => m.role === "jarvis").length, color: "text-emerald-400" },
                          { label: "Telegram Msgs", value: telegramMessages.length, color: "text-amber-400" },
                          { label: "Uptime", value: stats.uptime, color: "text-cyan-400" },
                        ].map((s, i) => (
                          <div key={i} className="bg-white/5 border border-white/5 rounded-lg p-3">
                            <div className="text-[9px] text-slate-500 uppercase mb-1">{s.label}</div>
                            <div className={`text-xl font-mono font-bold ${s.color}`}>{s.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeView === "network" && (
                  <motion.div 
                    key="network"
                    initial={{ opacity: 0, rotateY: 90 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    exit={{ opacity: 0, rotateY: -90 }}
                    className="absolute inset-0 flex flex-col gap-6 p-4"
                  >
                     <div className="hud-panel bracket flex-1 flex flex-col overflow-hidden bg-emerald-950/10 border-emerald-500/20 relative">
                       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)] pointer-events-none" />
                       
                       <div className="px-6 py-4 border-b border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between shrink-0">
                         <div className="flex items-center gap-4">
                           <div className="relative">
                             <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                               <MessageSquare className="w-5 h-5 text-emerald-400" />
                             </div>
                             <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse border-2 border-[#050812]" />
                           </div>
                           <div>
                             <h3 className="text-emerald-400 font-mono text-xs uppercase tracking-widest font-bold">Telegram Communications Link</h3>
                             <span className="text-[9px] text-emerald-400/60 font-mono uppercase tracking-[0.2em]">End-to-End Encrypted Tunnel</span>
                           </div>
                         </div>
                         <div className="flex flex-col items-end">
                           <span className="text-[10px] text-emerald-400 font-mono font-bold tracking-widest flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> ONLINE</span>
                           <span className="text-[9px] text-emerald-400/50 font-mono tracking-widest">STATUS: <span className="text-emerald-400">NOMINAL</span></span>
                         </div>
                       </div>
                       
                       <div className="flex-1 overflow-y-auto p-6 custom-scrollbar flex flex-col gap-6 relative z-10">
                         {telegramMessages.length === 0 ? (
                           <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-emerald-400">
                             <div className="w-24 h-24 border border-emerald-500 border-dashed rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite] mb-4">
                               <Wifi className="w-8 h-8 animate-pulse" />
                             </div>
                             <span className="font-mono text-[10px] tracking-[0.3em] uppercase">Listening for mobile transmissions...</span>
                           </div>
                         ) : (
                           telegramMessages.map((msg, i) => (
                             <motion.div 
                               initial={{ opacity: 0, x: -20 }}
                               animate={{ opacity: 1, x: 0 }}
                               key={i} 
                               className="flex flex-col gap-3 relative pl-6"
                             >
                               <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/50 to-transparent" />
                               <div className="absolute left-[-3px] top-2 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                               
                               <div className="text-[10px] font-mono text-emerald-400/60 uppercase tracking-widest flex gap-2 items-center">
                                 <span>{msg.ts}</span>
                                 <span className="w-1 h-1 bg-emerald-500/50 rounded-full" />
                                 <span>Mobile Relay</span>
                               </div>
                               
                               <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-lg p-4 font-mono shadow-[0_0_15px_rgba(16,185,129,0.05)] backdrop-blur-sm">
                                 <div className="mb-3">
                                   <div className="text-[9px] text-violet-400 uppercase tracking-widest mb-1 font-bold">USER_ALPHA:</div>
                                   <div className="text-[13px] text-slate-300 pl-2 border-l-2 border-violet-500/30">{msg.user_text}</div>
                                 </div>
                                 <div>
                                   <div className="text-[9px] text-emerald-400 uppercase tracking-widest mb-1 font-bold">SYS_RESPONSE:</div>
                                   <div className="text-[13px] text-emerald-50 pl-2 border-l-2 border-emerald-500/50 text-shadow-sm">{msg.text}</div>
                                 </div>
                               </div>
                             </motion.div>
                           ))
                         )}
                       </div>
                       
                       <div className="px-6 py-3 border-t border-emerald-500/20 bg-emerald-500/5 grid grid-cols-4 gap-4 text-[9px] font-mono shrink-0">
                          <div className="text-emerald-400 flex flex-col"><span className="text-emerald-400/50">PROTOCOL</span><span>TG-SEC-9</span></div>
                          <div className="text-emerald-400 flex flex-col"><span className="text-emerald-400/50">PACKET LOSS</span><span>0.00%</span></div>
                          <div className="text-cyan-400 flex flex-col"><span className="text-cyan-400/50">UP/DOWN</span><span>840M / 1.2G</span></div>
                          <div className="text-amber-400 flex flex-col"><span className="text-amber-400/50">SERVER LOAD</span><span>{(stats.cpu).toFixed(1)}%</span></div>
                       </div>
                     </div>
                  </motion.div>
                )}

                {activeView === "memory" && (
                  <motion.div 
                    key="memory"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="absolute inset-0 flex flex-col gap-4 p-4 overflow-y-auto custom-scrollbar"
                  >
                    <div className="hud-panel bracket p-5 bg-purple-500/5 border-purple-500/20 shrink-0">
                      <h3 className="text-purple-400 font-mono text-[10px] mb-5 uppercase tracking-widest flex items-center gap-2">
                        <Cpu className="w-3 h-3" /> Memory Allocation Matrix — Live
                      </h3>
                      <div className="space-y-5">
                        {[
                          { label: "RAM Utilization", value: stats.ram, color: "bg-purple-500", glow: "shadow-[0_0_10px_#A78BFA]", text: "text-purple-400" },
                          { label: "Disk Usage", value: stats.disk, color: "bg-cyan-500", glow: "shadow-[0_0_10px_#22D3EE]", text: "text-cyan-400" },
                          { label: "CPU Load", value: stats.cpu, color: "bg-amber-500", glow: "shadow-[0_0_10px_#F59E0B]", text: "text-amber-400" },
                        ].map((item, i) => (
                          <div key={i} className="space-y-2">
                            <div className="flex justify-between text-[10px] font-mono uppercase">
                              <span className="text-slate-400">{item.label}</span>
                              <span className={item.text}>{item.value.toFixed(1)}%</span>
                            </div>
                            <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${item.value}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full ${item.color} ${item.glow} rounded-full`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="hud-panel bracket p-5 bg-purple-500/5 border-purple-500/20 shrink-0">
                      <h3 className="text-purple-400 font-mono text-[10px] mb-4 uppercase tracking-widest">Memory Segments</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "Chat Buffer", value: chatHistory.length, unit: "msgs", color: "text-violet-400" },
                          { label: "Telegram Cache", value: telegramMessages.length, unit: "msgs", color: "text-emerald-400" },
                          { label: "Log Entries", value: logs.length, unit: "entries", color: "text-cyan-400" },
                          { label: "Active Agents", value: agents.length, unit: "agents", color: "text-amber-400" },
                        ].map((s, i) => (
                          <div key={i} className="bg-white/5 border border-white/5 rounded-lg p-3">
                            <div className="text-[9px] text-slate-500 uppercase mb-1">{s.label}</div>
                            <div className={`text-xl font-mono font-bold ${s.color}`}>{s.value} <span className="text-[10px] opacity-50">{s.unit}</span></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="hud-panel bracket p-5 bg-purple-500/5 border-purple-500/20 shrink-0">
                      <h3 className="text-purple-400 font-mono text-[10px] mb-3 uppercase tracking-widest">System Uptime</h3>
                      <div className="text-3xl font-mono font-bold text-purple-300 text-center py-4">{stats.uptime}</div>
                    </div>
                  </motion.div>
                )}

                {activeView === "files" && (
                  <motion.div 
                    key="files"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="absolute inset-0 flex flex-col gap-4 p-4 overflow-y-auto custom-scrollbar"
                  >
                    <div className="hud-panel bracket p-5 bg-amber-500/5 border-amber-500/20 shrink-0">
                      <h3 className="text-amber-400 font-mono text-[10px] mb-1 uppercase tracking-widest flex items-center gap-2">
                        <FolderOpen className="w-3 h-3" /> Encrypted Data Repository
                      </h3>
                      <div className="text-[9px] text-amber-400/40 font-mono uppercase tracking-widest mb-4">Root: D:\vs_code\jarvis\</div>
                      <div className="space-y-2">
                        {[
                          { name: "server.py", size: "10.3 KB", type: "py", color: "text-amber-400", badge: "CORE" },
                          { name: "jarviss.py", size: "2.8 KB", type: "py", color: "text-amber-400", badge: "AGENT" },
                          { name: "telegram_bot.py", size: "1.8 KB", type: "py", color: "text-amber-400", badge: "BOT" },
                          { name: ".env", size: "256 B", type: "env", color: "text-red-400", badge: "SECRET" },
                          { name: "jprompt.py", size: "3.2 KB", type: "py", color: "text-cyan-400", badge: "PROMPT" },
                          { name: "tool.py", size: "5.4 KB", type: "py", color: "text-violet-400", badge: "TOOLS" },
                        ].map((file, i) => (
                          <motion.div 
                            key={i}
                            whileHover={{ x: 4 }}
                            className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg hover:bg-amber-500/10 hover:border-amber-500/20 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 bg-amber-500/10 border border-amber-500/20 rounded flex items-center justify-center">
                                <FolderOpen className="w-3 h-3 text-amber-500" />
                              </div>
                              <div>
                                <div className={`text-xs font-mono ${file.color} group-hover:text-amber-300`}>{file.name}</div>
                                <div className="text-[9px] text-slate-600 font-mono">{file.size}</div>
                              </div>
                            </div>
                            <span className="text-[8px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">{file.badge}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeView === "devtools" && (
                   <motion.div 
                     key="devtools"
                     initial={{ opacity: 0, y: 30 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: 30 }}
                     className="absolute inset-0 p-4 flex flex-col gap-4"
                   >
                      <div className="hud-panel bracket p-0 bg-[#020B18] border-emerald-500/20 flex-1 flex flex-col overflow-hidden font-mono text-xs">
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-emerald-500/20 bg-emerald-500/5 shrink-0">
                          <Terminal className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400 font-bold text-[10px] uppercase tracking-widest">ROOT@JARVIS_CORE: ~ /dev/console</span>
                          <div className="ml-auto flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[9px] text-emerald-400/50">LIVE</span>
                          </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-1.5">
                          <p className="text-emerald-400/40"># ═══ JARVIS DIAGNOSTIC CONSOLE ═══</p>
                          <p className="text-emerald-400"><span className="text-emerald-400/50">$</span> system.status.verify()</p>
                          <p className="text-emerald-300">[OK] CPU: {stats.cpu.toFixed(1)}% — NOMINAL</p>
                          <p className="text-emerald-300">[OK] RAM: {stats.ram.toFixed(1)}% — STABLE</p>
                          <p className="text-emerald-300">[OK] DISK: {stats.disk.toFixed(1)}% — LINKED</p>
                          <p className="text-cyan-400">[OK] WEBSOCKET: CONNECTED — {agents.length} AGENT(S) ACTIVE</p>
                          <p className="text-cyan-400">[OK] TELEGRAM: UPLINK ESTABLISHED</p>
                          <p className="text-emerald-400/40">---</p>
                          <p className="text-emerald-400"><span className="text-emerald-400/50">$</span> log.tail --lines=10</p>
                          {logs.slice(0, 10).map((log: any, i: number) => (
                            <p key={i} className={
                              log.severity === "error" ? "text-red-400" :
                              log.severity === "success" ? "text-emerald-300" :
                              "text-slate-400"
                            }>
                              [{log.ts}] [{log.source}] {log.message}
                            </p>
                          ))}
                          <div className="flex items-center gap-1">
                            <span className="text-emerald-400">$</span>
                            <motion.span
                              animate={{ opacity: [1, 0, 1] }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                              className="inline-block w-2 h-4 bg-emerald-400 align-middle"
                            />
                          </div>
                        </div>
                      </div>
                   </motion.div>
                )}

                {activeView === "settings" && (
                   <motion.div 
                     key="settings"
                     initial={{ opacity: 0, scale: 1.05 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="absolute inset-0 p-4 overflow-y-auto custom-scrollbar"
                   >
                      <div className="hud-panel bracket p-5 bg-white/3 border-slate-700/50 space-y-6">
                        <div>
                          <h3 className="text-slate-300 font-mono text-[10px] mb-1 uppercase tracking-widest flex items-center gap-2"><Zap className="w-3 h-3 text-cyan-400" /> System Configuration</h3>
                          <p className="text-[9px] text-slate-600 font-mono">Core runtime parameters</p>
                        </div>

                        <div className="space-y-3">
                          {[
                            { label: "Telegram Bridge", desc: "Sync mobile conversations to dashboard", on: true, color: "bg-emerald-400" },
                            { label: "Langchain Debug", desc: "Output AI thought chain to terminal", on: true, color: "bg-cyan-400" },
                            { label: "Voice Synthesis", desc: "Text-to-speech response playback", on: true, color: "bg-violet-400" },
                            { label: "Auto-Reconnect", desc: "Reconnect WebSocket on disconnect", on: true, color: "bg-emerald-400" },
                          ].map((s, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                              <div>
                                <div className="text-xs font-mono text-slate-200 uppercase mb-1">{s.label}</div>
                                <div className="text-[9px] text-slate-600 font-mono">{s.desc}</div>
                              </div>
                              <div className={`w-10 h-5 ${s.on ? "bg-emerald-500/20 border-emerald-500/40" : "bg-white/5 border-white/10"} border rounded-full relative cursor-pointer shrink-0`}>
                                <div className={`absolute ${s.on ? "right-1" : "left-1"} top-1 w-3 h-3 ${s.on ? `${s.color} shadow-[0_0_8px_currentColor]` : "bg-slate-600"} rounded-full transition-all`} />
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-white/5 pt-5 space-y-3">
                          <h4 className="text-slate-500 font-mono text-[9px] uppercase tracking-widest">Connection Info</h4>
                          {[
                            { label: "Backend URL", value: "ws://localhost:8000/ws" },
                            { label: "DB Health", value: stats.db_health },
                            { label: "Uptime", value: stats.uptime },
                          ].map((c, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white/3 rounded border border-white/5 font-mono text-[10px]">
                              <span className="text-slate-500 uppercase">{c.label}</span>
                              <span className="text-cyan-400">{c.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                   </motion.div>
                )}


              </AnimatePresence>
           </div>
           
           <div className="h-[100px] shrink-0 mt-4">
             <SystemTelemetry stats={stats} />
           </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6 overflow-hidden">
           <div className="flex-1 overflow-hidden">
             {activeView === "network" ? (
                <div className="hud-panel bracket h-full flex flex-col p-6 bg-slate-950/40 backdrop-blur-xl border-emerald-500/20 shadow-2xl items-center justify-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
                  <div className="w-24 h-24 rounded-full border-2 border-emerald-500/20 flex items-center justify-center mb-6 relative">
                    <div className="absolute inset-0 rounded-full border-t-2 border-emerald-400 animate-spin" />
                    <Wifi className="w-10 h-10 text-emerald-400 animate-pulse" />
                  </div>
                  <h3 className="font-mono text-emerald-400 tracking-[0.2em] uppercase text-sm mb-2 text-center">Telegram Satellite Uplink</h3>
                  <div className="text-[10px] text-emerald-400/50 font-mono text-center uppercase tracking-widest max-w-[200px] leading-relaxed">
                    Neural interface suspended. Direct secure transmission line to mobile device active.
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-8 w-full">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-3 text-center">
                      <div className="text-[9px] text-emerald-400/50 mb-1">ENCRYPTION</div>
                      <div className="text-[10px] text-emerald-400 font-bold">AES-256</div>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-3 text-center">
                      <div className="text-[9px] text-emerald-400/50 mb-1">LATENCY</div>
                      <div className="text-[10px] text-emerald-400 font-bold">12ms</div>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-3 text-center col-span-2">
                      <div className="text-[9px] text-emerald-400/50 mb-1">TOTAL TRANSMISSIONS</div>
                      <div className="text-xl text-emerald-400 font-bold">{telegramMessages.length}</div>
                    </div>
                  </div>
                </div>
             ) : (
               <ChatPanel history={chatHistory} isSpeaking={isSpeaking} />
             )}
           </div>
           <div className="h-[200px] shrink-0 overflow-hidden">
             <LiveLog externalLogs={logs} />
           </div>
        </div>
      </main>

      <BottomNav activeView={activeView} onActiveViewChange={setActiveView} />

      <div className="pointer-events-none fixed top-0 left-0 w-full h-full opacity-[0.08] z-[-1]" 
           style={{ background: "radial-gradient(circle at 10% 10%, #38BDF8 0%, transparent 40%), radial-gradient(circle at 90% 90%, #6366F1 0%, transparent 40%)" }} />
      
      <div className="pointer-events-none fixed inset-0 z-[60] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
    </div>
  );
}
