"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Trend = "up" | "down" | "flat";

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  trend?: Trend;
  trendValue?: string;
  color?: string;
  delay?: number;
  pulse?: boolean;
}

const TREND_ICON = { up: TrendingUp, down: TrendingDown, flat: Minus };
const TREND_COLOR = { up: "#10b981", down: "#ef4444", flat: "#64748b" };

export default function MetricCard({
  label, value, sub, icon: Icon, trend = "flat",
  trendValue, color = "#3b82f6", delay = 0, pulse = false,
}: MetricCardProps) {
  const TrendIcon = TREND_ICON[trend];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className="glass-panel p-5 flex flex-col gap-3 relative group overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-12 bg-blue-500/30 group-hover:bg-blue-500 transition-colors" />
      
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-500/10 border border-blue-500/20"
        >
          <Icon className="w-5 h-5 text-blue-400" />
        </div>
        {trend !== "flat" && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/40 border border-white/5" style={{ color: TREND_COLOR[trend] }}>
            <TrendIcon className="w-3 h-3" />
            <span className="text-[10px] font-mono font-bold">{trendValue}</span>
          </div>
        )}
      </div>

      <div>
        <div className="text-[10px] font-mono text-blue-400/40 uppercase tracking-[0.2em] mb-1">{label}</div>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold font-sora text-white ${pulse ? "animate-pulse" : ""}`}>
            {value}
          </span>
          {sub && <span className="text-[10px] font-mono text-blue-400/20 uppercase">{sub}</span>}
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute bottom-2 right-2 opacity-5">
         <Icon className="w-12 h-12" />
      </div>
    </motion.div>
  );
}
