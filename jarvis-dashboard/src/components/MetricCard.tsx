"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

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
const TREND_COLOR = { up: "#34D399", down: "#EF4444", flat: "#64748b" };

export default function MetricCard({
  label, value, sub, icon: Icon, trend = "flat",
  trendValue, color = "#38BDF8", delay = 0, pulse = false,
}: MetricCardProps) {
  const TrendIcon = TREND_ICON[trend];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: "easeOut" }}
      whileHover={{ y: -2, boxShadow: `0 0 24px rgba(56,189,248,0.15)` }}
      className="hud-panel bracket p-4 flex flex-col gap-2 cursor-default select-none"
      style={{ borderColor: `${color}22` }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        {trend !== "flat" && (
          <div className="flex items-center gap-1" style={{ color: TREND_COLOR[trend] }}>
            <TrendIcon className="w-3 h-3" />
            <span className="text-[10px] font-mono">{trendValue}</span>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-baseline gap-1">
          <span
            className={clsx("text-2xl font-bold font-mono animate-counter", pulse && "animate-blink")}
            style={{ color }}
          >
            {value}
          </span>
        </div>
        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">{label}</div>
        {sub && <div className="text-[10px] text-slate-600 mt-0.5">{sub}</div>}
      </div>

      {/* Bottom glow line */}
      <div
        className="absolute bottom-0 left-4 right-4 h-px rounded-full"
        style={{ background: `linear-gradient(90deg,transparent,${color}40,transparent)` }}
      />
    </motion.div>
  );
}
