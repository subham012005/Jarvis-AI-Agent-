"use client";

import { motion } from "framer-motion";
import { Bot, CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";

type AgentStatus = "active" | "idle" | "busy" | "failed";

interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  task: string;
  progress: number;
}

const STATUS_CONFIG: Record<AgentStatus, { label: string; color: string; icon: React.ElementType; chipClass: string }> = {
  active: { label: "ACTIVE",  color: "#34D399", icon: CheckCircle2, chipClass: "chip-online" },
  idle:   { label: "IDLE",    color: "#A78BFA", icon: Clock,        chipClass: "chip-idle"   },
  busy:   { label: "BUSY",    color: "#F59E0B", icon: Loader2,      chipClass: "chip-busy"   },
  failed: { label: "FAILED",  color: "#EF4444", icon: XCircle,      chipClass: "chip-offline"},
};

export default function AgentFleet({ agents = [] }: { agents: Agent[] }) {
  return (
    <div className="hud-panel bracket flex flex-col h-full">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Active Agent Fleet</span>
        </div>
        <div className="text-[10px] font-mono text-slate-600">
          COUNT: {agents.length}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2">
        {agents.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-[10px] font-mono text-slate-700 italic">
            NO ACTIVE AGENTS LINKED
          </div>
        ) : (
          agents.map((agent, i) => {
            const cfg = STATUS_CONFIG[agent.status] || STATUS_CONFIG.idle;
            const StatusIcon = cfg.icon;
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="rounded-lg p-3 transition-all"
                style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${cfg.color}20` }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
                    <StatusIcon className={`w-3.5 h-3.5 ${agent.status === "busy" ? "animate-spin" : ""}`} style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-slate-200">{agent.name}</span>
                      <span className={`status-chip ${cfg.chipClass}`}>{cfg.label}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mb-1.5 truncate">{agent.task}</div>
                    <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ background: cfg.color }} animate={{ width: `${agent.progress}%` }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
