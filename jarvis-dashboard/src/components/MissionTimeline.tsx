"use client";

import { motion } from "framer-motion";
import { Rocket, CheckCircle2, Clock, AlertCircle, Play } from "lucide-react";

type MissionStatus = "completed" | "running" | "scheduled" | "failed";

interface Mission {
  id: string;
  title: string;
  description: string;
  status: MissionStatus;
  time: string;
  tools: string[];
}

const STATUS_CFG: Record<MissionStatus, { color: string; icon: React.ElementType; label: string }> = {
  completed:  { color: "#34D399", icon: CheckCircle2, label: "Done" },
  running:    { color: "#38BDF8", icon: Play,         label: "Running" },
  scheduled:  { color: "#A78BFA", icon: Clock,        label: "Scheduled" },
  failed:     { color: "#EF4444", icon: AlertCircle,  label: "Failed" },
};

const MISSIONS: Mission[] = [
  {
    id: "m1", status: "running",
    title: "Morning Intelligence Brief",
    description: "Collect top AI/tech news, summarize, and deliver via Telegram",
    time: "Now", tools: ["Web Search", "Telegram"],
  },
  {
    id: "m2", status: "completed",
    title: "Contact Sync",
    description: "Synced 12 contacts from WhatsApp into local database",
    time: "08:30", tools: ["WhatsApp", "Contacts DB"],
  },
  {
    id: "m3", status: "scheduled",
    title: "Evening Report",
    description: "Compile daily metrics and send summary to user",
    time: "18:00", tools: ["File I/O", "Telegram"],
  },
  {
    id: "m4", status: "scheduled",
    title: "Calendar Reminder",
    description: "Check upcoming events and notify 30min before",
    time: "17:30", tools: ["Notifications"],
  },
  {
    id: "m5", status: "failed",
    title: "Browser Automation",
    description: "Screenshot target site — connection timeout",
    time: "11:45", tools: ["Browser Control"],
  },
];

export default function MissionTimeline() {
  return (
    <div className="hud-panel bracket flex flex-col h-full">
      <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <Rocket className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Mission Timeline</span>
        </div>
        <span className="text-[10px] font-mono text-slate-600">{MISSIONS.length} missions</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-3">
        {/* Timeline */}
        <div className="relative pl-5">
          {/* Vertical line */}
          <div
            className="absolute left-2 top-0 bottom-0 w-px"
            style={{ background: "linear-gradient(to bottom, rgba(56,189,248,0.3), transparent)" }}
          />

          {MISSIONS.map((m, i) => {
            const cfg = STATUS_CFG[m.status];
            const Icon = cfg.icon;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 * i }}
                className="relative mb-3 last:mb-0"
              >
                {/* Dot */}
                <div
                  className="absolute -left-5 top-1 w-3 h-3 rounded-full flex items-center justify-center z-10"
                  style={{
                    background: cfg.color,
                    boxShadow: m.status === "running" ? `0 0 10px ${cfg.color}` : "none",
                  }}
                >
                  {m.status === "running" && (
                    <div
                      className="absolute w-5 h-5 rounded-full animate-pulse-ring"
                      style={{ border: `1px solid ${cfg.color}` }}
                    />
                  )}
                </div>

                <div
                  className="rounded-lg p-3 transition-all"
                  style={{
                    background: m.status === "running"
                      ? "rgba(56,189,248,0.05)"
                      : "rgba(255,255,255,0.02)",
                    border: `1px solid ${cfg.color}20`,
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-200">{m.title}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Icon className="w-3 h-3" style={{ color: cfg.color }} />
                      <span className="text-[9px] font-mono" style={{ color: cfg.color }}>{m.time}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mb-1.5 leading-relaxed">{m.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {m.tools.map((t) => (
                      <span
                        key={t}
                        className="text-[8px] font-mono px-1.5 py-0.5 rounded"
                        style={{ background: `${cfg.color}12`, color: cfg.color, border: `1px solid ${cfg.color}20` }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
