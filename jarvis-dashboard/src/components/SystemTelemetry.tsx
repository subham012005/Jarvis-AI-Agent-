"use client";

import { motion } from "framer-motion";
import { Cpu } from "lucide-react";
import { AreaChart, Area, Tooltip, ResponsiveContainer } from "recharts";
import { useMemo } from "react";

interface Ring {
  label: string;
  value: number;
  color: string;
  bg: string;
}

interface Stats {
  cpu: number;
  ram: number;
  disk: number;
  uptime: string;
  db_health: string;
}

function TelemetryRingItem({ ring, index }: { ring: Ring; index: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (ring.value / 100) * circumference;

  // Stable, deterministic sparkline data based on ring value
  const data = useMemo(() => 
    Array.from({ length: 14 }, (_, i) => ({
      v: parseFloat(Math.max(0, Math.min(100, ring.value + (Math.sin(i * 0.7) * 5) + (Math.cos(i * 0.3) * 2))).toFixed(2)),
    }))
  , [ring.value]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 + index * 0.08 }}
      className="rounded-xl p-3 flex flex-col gap-2"
      style={{ background: ring.bg, border: `1px solid ${ring.color}20` }}
    >
      {/* SVG ring */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{ring.label}</div>
          <div className="text-xl font-bold font-mono mt-0.5" style={{ color: ring.color }}>
            {ring.value}<span className="text-xs font-normal text-slate-600">%</span>
          </div>
        </div>
        <div className="relative w-16 h-16 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 70 70">
            {/* track */}
            <circle cx="35" cy="35" r={radius} fill="none" strokeWidth="5" stroke="rgba(255,255,255,0.05)" />
            {/* progress */}
            <motion.circle
              cx="35" cy="35" r={radius}
              fill="none"
              strokeWidth="5"
              stroke={ring.color}
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: circumference - strokeDash }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ filter: `drop-shadow(0 0 4px ${ring.color})` }}
            />
          </svg>
          <div
            className="absolute inset-0 flex items-center justify-center text-[9px] font-mono"
            style={{ color: ring.color }}
          >
            {ring.value}%
          </div>
        </div>
      </div>

      {/* Sparkline */}
      <div style={{ height: 28 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`grad-${ring.label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={ring.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={ring.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={ring.color}
              strokeWidth={1.5}
              fill={`url(#grad-${ring.label})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default function SystemTelemetry({ stats }: { stats: Stats }) {
  const rings: Ring[] = [
    { label: "CPU",  value: stats.cpu,  color: "#38BDF8", bg: "#0c1929" },
    { label: "RAM",  value: stats.ram,  color: "#A78BFA", bg: "#140e24" },
    { label: "API",  value: 45,         color: "#34D399", bg: "#0a1d16" },
    { label: "DISK", value: stats.disk, color: "#F59E0B", bg: "#1a1506" },
  ];

  return (
    <div className="hud-panel bracket flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 pt-3 pb-3 shrink-0">
        <Cpu className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">System Telemetry</span>
        <div className="ml-auto text-[10px] font-mono text-emerald-400">Linked</div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-2 px-3 pb-3 content-start">
        {rings.map((ring, i) => (
          <TelemetryRingItem key={ring.label} ring={ring} index={i} />
        ))}
      </div>

      {/* DB + uptime row */}
      <div
        className="mx-3 mb-3 rounded-lg px-3 py-2 grid grid-cols-3 gap-3"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(56,189,248,0.08)" }}
      >
        {[
          { label: "DB Health",  value: stats.db_health, color: "#34D399" },
          { label: "Uptime",     value: stats.uptime,    color: "#38BDF8" },
          { label: "Req/min",    value: "284",           color: "#A78BFA" },
        ].map((m) => (
          <div key={m.label} className="text-center">
            <div className="text-xs font-bold font-mono" style={{ color: m.color }}>{m.value}</div>
            <div className="text-[9px] font-mono text-slate-600 uppercase tracking-wider">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
