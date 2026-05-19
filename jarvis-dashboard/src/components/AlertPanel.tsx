"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, Bell, CheckCheck, X, Activity, Zap } from "lucide-react";
import { useState } from "react";

type AlertLevel = "critical" | "warning" | "info";

interface Alert {
  id: number;
  level: AlertLevel;
  title: string;
  detail: string;
  time: string;
  acknowledged: boolean;
}

const LEVEL_CFG: Record<AlertLevel, { color: string; bg: string; border: string; icon: React.ElementType }> = {
  critical: { color: "#ef4444", bg: "bg-red-500/10", border: "border-red-500/30", icon: AlertTriangle },
  warning:  { color: "#f59e0b", bg: "bg-amber-500/10", border: "border-amber-500/30", icon: AlertTriangle },
  info:     { color: "#3b82f6", bg: "bg-blue-500/10", border: "border-blue-500/30", icon: Bell },
};

const INITIAL_ALERTS: Alert[] = [
  { id: 1, level: "critical", title: "Neural Rate Limit",     detail: "Synaptic flux approaching cap — 84% consumed",   time: "02m_ago", acknowledged: false },
  { id: 2, level: "warning",  title: "Buffer Timeout",         detail: "Target sequence failed 3 load attempts",        time: "05m_ago", acknowledged: false },
  { id: 3, level: "warning",  title: "Memory Flux",            detail: "Synapse heap at 74% — Cycle triggered",         time: "09m_ago", acknowledged: false },
  { id: 4, level: "info",     title: "Sequence Dispatched",    detail: "Agent Search dispatched task #48",              time: "12m_ago", acknowledged: false },
];

export default function AlertPanel() {
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);

  const dismiss = (id: number) =>
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, acknowledged: true } : a));

  const unackedCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="glass-panel hud-bracket hud-bracket-top-right flex flex-col h-full bg-blue-950/5">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded bg-blue-500/10 border border-blue-500/20">
            <Shield className={`w-4 h-4 ${unackedCount > 0 ? "text-amber-400 animate-pulse" : "text-blue-400"}`} />
          </div>
          <div>
            <span className="block text-xs font-bold font-sora text-white uppercase tracking-tight">Intelligence Alerts</span>
            <span className="block text-[8px] font-mono text-blue-400/40 uppercase tracking-[0.3em]">Security Protocol ACTIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {unackedCount > 0 && (
            <button
              onClick={() => setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })))}
              className="text-[9px] font-mono font-bold text-blue-400/50 hover:text-blue-400 transition-colors flex items-center gap-1.5 px-2 py-1 rounded bg-blue-500/5"
            >
              <CheckCheck className="w-3 h-3" /> FLUSH ALL
            </button>
          )}
        </div>
      </div>

      {/* Alert list */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 custom-scrollbar bg-black/40">
        <AnimatePresence mode="popLayout">
          {alerts
            .filter((a) => !a.acknowledged)
            .map((alert, i) => {
              const cfg = LEVEL_CFG[alert.level];
              const Icon = cfg.icon;
              const isCritical = alert.level === "critical";
              
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                  className={`group relative glass-panel p-4 flex items-start gap-4 transition-all duration-300 ${isCritical ? "border-red-500/40 bg-red-500/5" : "bg-white/[0.03]"}`}
                >
                  {isCritical && (
                    <motion.div 
                      animate={{ opacity: [0.1, 0.3, 0.1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute inset-0 bg-red-500 pointer-events-none rounded-xl"
                    />
                  )}
                  
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${cfg.border} bg-black/40`}>
                    <Icon className="w-5 h-5" style={{ color: cfg.color }} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-[11px] font-bold font-sora uppercase tracking-wider" style={{ color: cfg.color }}>
                        {alert.title}
                      </h4>
                      <span className="text-[8px] font-mono text-white/30 uppercase">{alert.time}</span>
                    </div>
                    <p className="text-[10px] font-mono text-white/60 leading-relaxed font-medium">
                      {alert.detail}
                    </p>
                  </div>

                  <button
                    onClick={() => dismiss(alert.id)}
                    className="p-1.5 rounded-lg text-white/20 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
        </AnimatePresence>

        {unackedCount === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-10 gap-4 opacity-20">
             <div className="relative">
                <CheckCheck className="w-12 h-12 text-blue-400" />
                <motion.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 border border-blue-400 rounded-full" 
                />
             </div>
             <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em]">All Sectors Clear</span>
          </div>
        )}
      </div>

      {/* Aesthetic Footer Line */}
      <div className="h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
    </div>
  );
}
