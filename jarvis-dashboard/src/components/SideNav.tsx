"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Bot, Cpu, Rocket, ScrollText,
  Zap, Settings, ChevronRight, Shield,
} from "lucide-react";

const NAV = [
  { id: "overview",     icon: LayoutDashboard, label: "Overview",    badge: null },
  { id: "agents",       icon: Bot,             label: "Agents",      badge: "4" },
  { id: "systems",      icon: Cpu,             label: "Systems",     badge: null },
  { id: "mission",      icon: Rocket,          label: "Mission",     badge: "2" },
  { id: "logs",         icon: ScrollText,      label: "Logs",        badge: "12" },
  { id: "automations",  icon: Zap,             label: "Automations", badge: null },
  { id: "security",     icon: Shield,          label: "Security",    badge: "1" },
  { id: "settings",     icon: Settings,        label: "Settings",    badge: null },
];

export default function SideNav({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  return (
    <aside
      className="flex flex-col w-[58px] lg:w-[200px] shrink-0 py-3 gap-1"
      style={{
        background: "rgba(11,16,32,0.9)",
        borderRight: "1px solid rgba(56,189,248,0.1)",
      }}
    >
      {NAV.map((item, i) => {
        const Icon = item.icon;
        const isActive = active === item.id;
        return (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            onClick={() => onSelect(item.id)}
            className="relative flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg transition-all duration-200 group text-left"
            style={{
              background: isActive ? "rgba(56,189,248,0.1)" : "transparent",
              border: isActive ? "1px solid rgba(56,189,248,0.25)" : "1px solid transparent",
              boxShadow: isActive ? "0 0 16px rgba(56,189,248,0.1)" : "none",
            }}
            id={`nav-${item.id}`}
          >
            {/* Active indicator bar */}
            {isActive && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-cyan-400"
                style={{ boxShadow: "0 0 8px rgba(56,189,248,0.8)" }}
              />
            )}

            <Icon
              className="w-4 h-4 shrink-0 transition-colors"
              style={{ color: isActive ? "#38BDF8" : "#64748b" }}
            />

            <span
              className="hidden lg:block text-xs font-medium tracking-wide transition-colors flex-1"
              style={{ color: isActive ? "#e2e8f0" : "#64748b" }}
            >
              {item.label}
            </span>

            {item.badge && (
              <span
                className="hidden lg:flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-bold font-mono"
                style={{
                  background: isActive ? "rgba(56,189,248,0.2)" : "rgba(100,116,139,0.2)",
                  color: isActive ? "#38BDF8" : "#64748b",
                }}
              >
                {item.badge}
              </span>
            )}

            {/* Hover chevron */}
            <ChevronRight
              className="hidden lg:block w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity shrink-0"
              style={{ color: "#38BDF8" }}
            />
          </motion.button>
        );
      })}

      {/* Spacer + System uptime */}
      <div className="mt-auto mx-3 hidden lg:block">
        <div
          className="rounded-lg p-2.5"
          style={{ background: "rgba(56,189,248,0.04)", border: "1px solid rgba(56,189,248,0.1)" }}
        >
          <div className="text-[9px] font-mono text-slate-600 uppercase tracking-wider mb-1.5">Uptime</div>
          <div className="text-xs font-mono text-cyan-400 font-semibold">47d 12h 08m</div>
          <div className="mt-1.5 h-1 rounded-full bg-slate-800 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400"
              initial={{ width: 0 }}
              animate={{ width: "94%" }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
            />
          </div>
          <div className="text-[9px] font-mono text-slate-600 mt-1">94% SLA</div>
        </div>
      </div>
    </aside>
  );
}
