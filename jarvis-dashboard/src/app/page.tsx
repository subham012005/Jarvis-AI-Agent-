"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Cpu, Activity, Globe, Zap, Clock, Bot, Wifi, 
  FolderOpen, Terminal, AlertTriangle, MessageSquare,
  Shield, Server, HardDrive, Share2, Layers, Search,
  Target, Brain, Database, Cloud, Lock
} from "lucide-react";

import CommandBar      from "@/components/CommandBar";
import HologramCore    from "@/components/HologramCore";
import AgentFleet      from "@/components/AgentFleet";
import LiveLog         from "@/components/LiveLog";
import SystemTelemetry from "@/components/SystemTelemetry";
import ChatPanel       from "@/components/ChatPanel";
import InputInterface  from "@/components/InputInterface";
import BottomNav       from "@/components/BottomNav";
import AlertPanel      from "@/components/AlertPanel";
import InsightsPanel   from "@/components/InsightsPanel";
import MissionTimeline from "@/components/MissionTimeline";

interface SystemStats {
  cpu: number; ram: number; disk: number; uptime: string; db_health: string;
  net_latency?: string; net_packets_tx?: string; net_packets_rx?: string; net_connections?: number;
}

interface LogEntry {
  id: number; ts: string; severity: string; source: string; message: string;
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
  const [isServerVoice, setIsServerVoice] = useState(false);
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
  
  const [statsHistory, setStatsHistory] = useState({
    cpu: Array(20).fill(0),
    ram: Array(20).fill(0),
    network: Array(20).fill(0)
  });

  const telegramChatHistory = React.useMemo(() => {
    const combined: Message[] = [];
    telegramMessages.forEach(msg => {
      combined.push({ role: "user", text: msg.user_text, ts: msg.ts });
      combined.push({ role: "jarvis", text: msg.text, ts: msg.ts });
    });
    return combined.sort((a, b) => a.ts.localeCompare(b.ts));
  }, [telegramMessages]);

  const socketRef = useRef<WebSocket | null>(null);
  const logIdCounter = useRef(0);

  const agentState = isListening ? "listening" : isProcessing ? "processing" : isSpeaking ? "speaking" : "idle";

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
          case "system_stats": 
            setStats(msg.data);
            setStatsHistory(prev => ({
              cpu: [...prev.cpu.slice(1), msg.data.cpu],
              ram: [...prev.ram.slice(1), msg.data.ram],
              network: [...prev.network.slice(1), Math.random() * 100]
            }));
            break;
          case "log": setLogs(prev => [{ ...msg.data, id: ++logIdCounter.current }, ...prev].slice(0, 100)); break;
          case "chat_update": setChatHistory(prev => [...prev, msg.data]); break;
          case "telegram_update": setTelegramMessages(prev => [...prev, msg.data]); break;
          case "thought_process": setThoughtProcess(msg.data); break;
          case "agents_sync": setAgents(msg.data); setIsProcessing(msg.data.some((a: any) => a.status === "busy")); break;
          case "hotword_detected": 
            setIsServerVoice(true);
            setIsListening(true); 
            break;
          case "voice_stop":
            setIsServerVoice(false);
            setIsListening(false);
            break;
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
    let ttsText = rawResponse;
    if (language === "hi") {
      try {
        const json = JSON.parse(rawResponse);
        if (json.tts_text) ttsText = json.tts_text;
      } catch (e) {}
    }
    
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(ttsText);
    const voices = window.speechSynthesis.getVoices();
    
    if (language === "hi") {
      utterance.lang = "hi-IN";
      const hiVoice = voices.find(v => v.lang === "hi-IN");
      if (hiVoice) utterance.voice = hiVoice;
    } else {
      utterance.lang = "en-GB";
      const enVoice = voices.find(v => v.lang.includes("en-GB"));
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: "speaking_state", speaking: true }));
      }
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: "speaking_state", speaking: false }));
      }
    };
    window.speechSynthesis.speak(utterance);
  }, [language]);

  const sendCommand = useCallback((cmd: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      setIsProcessing(true);
      socketRef.current.send(JSON.stringify({ type: "command", data: cmd, lang: language }));
    }
  }, [language]);

  const killCommand = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "kill_command" }));
    }
  }, []);

  const sendVoiceCommand = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "start_voice" }));
    }
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black selection:bg-blue-500/30 text-white font-inter">
      {/* Background Neural Matrix */}
      <div className="neural-grid z-0" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03)_0%,transparent_100%)] pointer-events-none" />
      <div className="crt-overlay z-[100]" />
      
      {/* HUD HEADER */}
      <CommandBar 
        onSendCommand={sendCommand} 
        onVoiceCommand={sendVoiceCommand}
        isSpeaking={isSpeaking}
        isProcessing={isProcessing}
        isConnected={isConnected}
        isListening={isListening}
        isServerVoice={isServerVoice}
        onListeningChange={setIsListening}
        language={language}
        onLanguageChange={setLanguage}
      />

      <main className={`flex-1 w-full max-w-[2000px] mx-auto p-6 grid ${activeView === "analytics" ? "grid-cols-1" : activeView === "network" ? "grid-cols-[450px_1fr]" : "grid-cols-[450px_1fr_450px]"} gap-6 relative z-10 overflow-hidden`}>
        
        {/* LEFT COLUMN: Input, Diagnostics & Sequence */}
        {activeView !== "analytics" && (
          <section className="flex flex-col gap-6 overflow-hidden">
             {activeView !== "network" && (
               <InputInterface 
                  onSendCommand={sendCommand} 
                  onVoiceCommand={sendVoiceCommand}
                  onKillCommand={killCommand}
                  isProcessing={isProcessing} 
                  isListening={isListening} 
                  isServerVoice={isServerVoice}
                  onListeningChange={setIsListening} 
                  language={language}
               />
             )}
             
             <div className="flex-1 overflow-hidden flex flex-col gap-6">
                <MissionTimeline />
                
                {/* Neural Thought Sequence */}
                <div className="flex-[0.8] glass-panel hud-bracket hud-bracket-bottom-left bg-violet-950/5 border-violet-500/20 flex flex-col overflow-hidden">
                  <div className="px-5 py-4 border-b border-violet-500/10 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                      <Layers className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-xs font-bold font-sora text-white uppercase tracking-tight">Neural Sequence</span>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse shadow-[0_0_8px_#8b5cf6]" />
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-black/20">
                    <AnimatePresence mode="popLayout">
                      {!thoughtProcess ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-10 text-violet-400 gap-3">
                          <Cpu className="w-10 h-10 animate-spin-slow" />
                          <span className="text-[10px] font-mono uppercase tracking-[0.4em]">Standby // Neural Link Idle</span>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 pb-3 border-b border-white/5 opacity-40 italic">
                             <Search className="w-3 h-3" />
                             <span className="text-[9px] font-mono truncate">{thoughtProcess.query}</span>
                          </div>
                          {thoughtProcess.steps.map((step: any, i: number) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`p-4 rounded-xl border ${
                                step.type === "tool_call" ? "bg-amber-500/5 border-amber-500/20 text-amber-100" :
                                step.type === "tool_result" ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-100" :
                                "bg-violet-500/5 border-violet-500/20 text-violet-100"
                              }`}
                            >
                              <div className="text-[10px] font-bold font-sora uppercase mb-1">{step.label}</div>
                              {step.detail && <div className="text-[11px] font-mono opacity-60 leading-relaxed">{step.detail}</div>}
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
             </div>
          </section>
        )}

        {/* CENTER COLUMN: The Core Projection */}
        <section className="flex flex-col gap-6 overflow-hidden">
           <div className="flex-1 relative glass-panel hud-bracket hud-bracket-top-left hud-bracket-bottom-right bg-blue-900/5 border-blue-500/10 flex flex-col overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />
              
              <AnimatePresence mode="wait">
                 {activeView === "home" ? (
                   <motion.div key="core" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, filter: "blur(20px)" }} className="flex-1 flex items-center justify-center">
                     <HologramCore state={agentState} />
                   </motion.div>
                 ) : (
                   <motion.div key="other" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                      {activeView === "analytics" && (
                         <div className="flex-1 flex flex-col gap-6 h-full p-6">
                            <div className="flex items-center gap-4 opacity-70 border-b border-blue-500/10 pb-4 mb-2">
                               <Activity className="w-8 h-8 animate-pulse text-blue-400" />
                               <div>
                                  <h2 className="text-xl font-sora font-bold uppercase tracking-[0.2em] text-blue-100">System Architecture & Stack</h2>
                                  <span className="text-xs font-mono text-blue-400">Hardware Diagnostics, Capabilities & Tech Stack Overview</span>
                               </div>
                            </div>
                            <div className="flex-1 h-full min-h-[500px]">
                               <SystemTelemetry stats={statsHistory} sysStats={stats} />
                            </div>
                         </div>
                      )}
                      {activeView === "network" && (
                         <div className="h-full flex flex-col gap-4">
                            <div className="flex items-center justify-between opacity-70">
                               <div className="flex items-center gap-4">
                                  <Wifi className="w-8 h-8 animate-pulse text-blue-400" />
                                  <div>
                                     <h2 className="text-xl font-sora font-bold uppercase tracking-[0.2em] text-blue-100">Telegram Uplink</h2>
                                     <span className="text-xs font-mono text-blue-400">Active Encrypted Tunnel: External Communications</span>
                                  </div>
                               </div>
                               <div className="flex gap-2">
                                  <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase rounded-full">Secure Link</div>
                                  <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-mono font-bold uppercase rounded-full">Port 8443</div>
                               </div>
                            </div>
                            
                            <div className="flex-1 overflow-hidden min-h-[500px]">
                               <ChatPanel history={telegramChatHistory} isSpeaking={false} />
                            </div>
                         </div>
                      )}
                      {activeView === "devtools" && (
                         <div className="h-full glass-panel bg-black/80 font-mono p-6 text-xs text-blue-400">
                            <div className="mb-4 border-b border-blue-500/30 pb-2">JARVIS_CORE @ SHELL-01: DIAGNOSTIC_MODE</div>
                            <div className="space-y-1">
                               <p>{">"} BOOT_SEQUENCE: OK</p>
                               <p>{">"} NEURAL_SYNC: 98.42%</p>
                               <p>{">"} UPTIME: {stats.uptime}</p>
                               <p className="text-white/40 mt-10 animate-pulse">_ AWAITING COMMAND...</p>
                            </div>
                         </div>
                      )}
                   </motion.div>
                 )}
              </AnimatePresence>

              {/* Decorative Coordinates */}
              <div className="absolute bottom-10 left-10 text-[8px] font-mono text-blue-400 opacity-30 flex flex-col gap-1">
                <span>LAT: 55.7558° N</span>
                <span>LON: 37.6173° E</span>
              </div>
           </div>
           
           {activeView !== "network" && activeView !== "analytics" && (
             <div className="h-[350px] shrink-0">
               <AgentFleet agents={agents} />
             </div>
           )}
        </section>

        {/* RIGHT COLUMN: Dialogue & Intelligence */}
        {activeView !== "network" && activeView !== "analytics" && (
          <section className="flex flex-col gap-6 overflow-hidden">
             <div className="flex-1 overflow-hidden">
                <ChatPanel history={chatHistory} isSpeaking={isSpeaking} />
             </div>
             <div className="h-[350px] shrink-0">
                <LiveLog externalLogs={logs} />
             </div>
          </section>
        )}
        
      </main>

      {/* GLOBAL FOOTER TASKBAR */}
      <BottomNav activeView={activeView} onActiveViewChange={setActiveView} />
    </div>
  );
}
