"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollText, Circle } from "lucide-react";

type Severity = "info" | "warn" | "error" | "success" | "debug";

interface LogEntry {
  id: number;
  ts: string;
  severity: Severity;
  source: string;
  message: string;
}

const SEV: Record<Severity, { label: string; color: string }> = {
  info:    { label: "INFO",  color: "#38BDF8" },
  warn:    { label: "WARN",  color: "#F59E0B" },
  error:   { label: "ERROR", color: "#EF4444" },
  success: { label: "OK",    color: "#34D399" },
  debug:   { label: "DEBUG", color: "#64748b" },
};

export default function LiveLog({ externalLogs = [] }: { externalLogs?: LogEntry[] }) {
  const [filter, setFilter] = useState<Severity | "all">("all");
  const bottomRef = useRef<HTMLDivElement>(null);

  const visible = filter === "all" ? externalLogs : externalLogs.filter((l) => l.severity === filter);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [externalLogs]);

  return (
    <div className="hud-panel bracket flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0 border-b border-white/5">
        <div className="flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Real-Time Core Stream</span>
        </div>
        <div className="flex items-center gap-1">
          {(["all", "info", "success", "error"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="text-[9px] font-mono px-2 py-0.5 rounded transition-all uppercase tracking-wider"
              style={{
                background: filter === f ? "rgba(56,189,248,0.15)" : "transparent",
                color: filter === f ? "#38BDF8" : "#475569",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 font-mono text-[10px] flex flex-col gap-0.5">
        {externalLogs.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-slate-700 italic">
            NO LOG DATA RECEIVED
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {visible.map((log) => {
              const sev = SEV[log.severity] || SEV.info;
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-2 rounded px-2 py-0.5 transition-colors hover:bg-white/[0.02]"
                >
                  <span className="text-slate-600 shrink-0 tabular-nums">{log.ts}</span>
                  <span className="shrink-0 w-11 text-right tabular-nums font-semibold uppercase" style={{ color: sev.color }}>
                    {sev.label}
                  </span>
                  <span className="text-slate-500 shrink-0 w-20 truncate">[{log.source}]</span>
                  <span className="text-slate-300 truncate flex-1">{log.message}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
