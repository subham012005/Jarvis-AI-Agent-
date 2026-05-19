"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bot, CheckCircle2, Clock, XCircle, Loader2, ShieldAlert, Cpu, Zap } from "lucide-react";

type AgentStatus = "active" | "idle" | "busy" | "failed";

interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  task: string;
  progress: number;
}

const STATUS_CONFIG: Record<AgentStatus, { label: string; color: string; icon: React.ElementType; glow: string }> = {
  active: { label: "OPERATIONAL", color: "#10b981", icon: CheckCircle2, glow: "rgba(16, 185, 129, 0.4)" },
  idle:   { label: "STANDBY",     color: "#3b82f6", icon: Clock,        glow: "rgba(59, 130, 246, 0.4)" },
  busy:   { label: "EXECUTING",   color: "#f59e0b", icon: Loader2,      glow: "rgba(245, 158, 11, 0.4)"  },
  failed: { label: "SEVERED",     color: "#ef4444", icon: ShieldAlert,  glow: "rgba(239, 68, 68, 0.4)"   },
};

export default function AgentFleet({ agents = [] }: { agents: Agent[] }) {
  return (
    <div className="glass-panel hud-bracket hud-bracket-top-left flex flex-col h-full bg-blue-950/5">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Bot className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <span className="block text-xs font-bold font-sora text-white uppercase tracking-tight">Agent Fleet</span>
            <span className="block text-[8px] font-mono text-blue-400/40 uppercase tracking-[0.3em]">Neural Clusters</span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-black/40 border border-white/10 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[9px] font-mono text-blue-100/60 uppercase tracking-widest">{agents.length} LINKED</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 custom-scrollbar">
        {agents.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20">
             <Cpu className="w-10 h-10 text-blue-400 mb-3 animate-pulse" />
             <span className="text-[10px] font-mono text-blue-400 uppercase tracking-[0.3em] text-center">
               No Active Neural<br/>Signatures Detected
             </span>
          </div>
        ) : (
          <AnimatePresence>
            {agents.map((agent, i) => {
              const cfg = STATUS_CONFIG[agent.status] || STATUS_CONFIG.idle;
              const StatusIcon = cfg.icon;
              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative rounded-xl p-4 transition-all bg-black/40 border border-white/5 hover:border-blue-500/30 hover:bg-blue-950/10"
                >
                  {/* Status Indicator Glow */}
                  <div className="absolute top-4 left-4 w-1 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: cfg.color, boxShadow: `0 0 10px ${cfg.glow}` }} />

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-110" style={{ background: `${cfg.color}10`, borderColor: `${cfg.color}30` }}>
                      <StatusIcon className={`w-5 h-5 ${agent.status === "busy" ? "animate-spin" : ""}`} style={{ color: cfg.color }} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold font-sora text-white truncate">{agent.name}</span>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[8px] font-mono font-bold" style={{ borderColor: `${cfg.color}20`, background: `${cfg.color}05`, color: cfg.color }}>
                           <Zap className="w-2 h-2" />
                           {cfg.label}
                        </div>
                      </div>
                      
                      <div className="text-[10px] font-mono text-blue-100/40 mb-3 truncate group-hover:text-blue-100/60 transition-colors">
                        TASK: {agent.task || "NULL_BUFFER"}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] font-mono text-blue-400/40 uppercase tracking-widest">
                           <span>Execution Progress</span>
                           <span>{agent.progress}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-black/60 overflow-hidden border border-white/5">
                          <motion.div 
                            className="h-full rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)]" 
                            style={{ background: `linear-gradient(to right, ${cfg.color}80, ${cfg.color})` }} 
                            animate={{ width: `${agent.progress}%` }} 
                            transition={{ type: "spring", damping: 15 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Footer Decoration */}
      <div className="px-5 py-3 border-t border-white/5 bg-black/40">
         <div className="flex justify-between items-center opacity-30">
            <span className="text-[8px] font-mono text-blue-400 uppercase tracking-widest">Neural Link v4.0</span>
            <div className="flex gap-1">
               {[...Array(3)].map((_, i) => <div key={i} className="w-1 h-3 bg-blue-500/50 rounded-sm" />)}
            </div>
         </div>
      </div>
    </div>
  );
}
