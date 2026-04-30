"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, Bell, CheckCheck, X } from "lucide-react";
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
  critical: { color: "#EF4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.25)",   icon: X },
  warning:  { color: "#F59E0B", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.25)",  icon: AlertTriangle },
  info:     { color: "#38BDF8", bg: "rgba(56,189,248,0.06)",  border: "rgba(56,189,248,0.2)",   icon: Bell },
};

const INITIAL_ALERTS: Alert[] = [
  { id: 1, level: "critical", title: "WhatsApp Rate Limit",     detail: "API approaching hourly cap — 80% consumed",   time: "2m ago", acknowledged: false },
  { id: 2, level: "warning",  title: "Browser Timeout",         detail: "Target URL failed 3 consecutive load attempts", time: "5m ago", acknowledged: false },
  { id: 3, level: "warning",  title: "Memory Pressure",         detail: "Heap usage at 74% — GC cycle triggered",      time: "9m ago", acknowledged: false },
  { id: 4, level: "info",     title: "New Job Dispatched",      detail: "SearchBot assigned task #48 · HIGH priority",  time: "12m ago", acknowledged: false },
];

export default function AlertPanel() {
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);

  const dismiss = (id: number) =>
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, acknowledged: true } : a));

  const unacked = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="hud-panel bracket flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Alerts</span>
          {unacked > 0 && (
            <span
              className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-black"
              style={{ background: "#F59E0B" }}
            >
              {unacked}
            </span>
          )}
        </div>
        {unacked > 0 && (
          <button
            onClick={() => setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })))}
            className="flex items-center gap-1 text-[9px] font-mono text-slate-500 hover:text-cyan-400 transition-colors"
          >
            <CheckCheck className="w-3 h-3" /> Dismiss all
          </button>
        )}
      </div>

      {/* Alert list */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-2">
        <AnimatePresence>
          {alerts
            .filter((a) => !a.acknowledged)
            .map((alert, i) => {
              const cfg = LEVEL_CFG[alert.level];
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16, height: 0, marginBottom: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-lg p-3 flex items-start gap-3"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                >
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: `${cfg.color}20` }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold" style={{ color: cfg.color }}>{alert.title}</span>
                      <span className="text-[9px] font-mono text-slate-600 shrink-0">{alert.time}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{alert.detail}</p>
                  </div>
                  <button
                    onClick={() => dismiss(alert.id)}
                    className="text-slate-600 hover:text-slate-300 transition-colors shrink-0 mt-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              );
            })}
        </AnimatePresence>

        {unacked === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-6 text-slate-700">
            <CheckCheck className="w-6 h-6" />
            <span className="text-[10px] font-mono uppercase tracking-widest">All clear</span>
          </div>
        )}
      </div>
    </div>
  );
}
