"use client";

import { motion } from "framer-motion";
import { Lightbulb, ArrowRight } from "lucide-react";

interface Insight {
  id: number;
  type: "action" | "recommendation" | "observation";
  title: string;
  detail: string;
  priority: "high" | "medium" | "low";
}

const PRIORITY_COLOR = { high: "#F59E0B", medium: "#38BDF8", low: "#64748b" };
const TYPE_COLOR     = { action: "#EF4444", recommendation: "#34D399", observation: "#A78BFA" };

const INSIGHTS: Insight[] = [
  {
    id: 1, type: "action", priority: "high",
    title: "WhatsApp API limit critical",
    detail: "80% of hourly cap used. Recommend pausing non-urgent messages for the next 40 minutes.",
  },
  {
    id: 2, type: "recommendation", priority: "medium",
    title: "Schedule memory compaction",
    detail: "Cache at 74% — run a compaction cycle during low-activity window tonight at 23:00.",
  },
  {
    id: 3, type: "observation", priority: "medium",
    title: "SearchBot performing well",
    detail: "Average query latency dropped 18% since last config update. No action required.",
  },
  {
    id: 4, type: "recommendation", priority: "low",
    title: "Add Contact for Mom",
    detail: "Detected a missing contact reference in message log. Run addContacts routine.",
  },
];

export default function InsightsPanel() {
  return (
    <div className="hud-panel bracket flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 shrink-0">
        <Lightbulb className="w-4 h-4 text-amber-400" />
        <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">AI Insights</span>
        <span
          className="ml-auto text-[9px] font-mono px-2 py-0.5 rounded"
          style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.25)" }}
        >
          {INSIGHTS.length} New
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-2">
        {INSIGHTS.map((ins, i) => (
          <motion.div
            key={ins.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
            whileHover={{ borderColor: `${PRIORITY_COLOR[ins.priority]}40` }}
            className="rounded-lg p-3 cursor-default transition-all group"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${PRIORITY_COLOR[ins.priority]}20`,
            }}
          >
            <div className="flex items-start gap-2 mb-1">
              <div
                className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase shrink-0 mt-0.5"
                style={{
                  background: `${TYPE_COLOR[ins.type]}15`,
                  color: TYPE_COLOR[ins.type],
                  border: `1px solid ${TYPE_COLOR[ins.type]}25`,
                }}
              >
                {ins.type}
              </div>
              <span className="text-xs font-semibold text-slate-200 flex-1">{ins.title}</span>
              <ArrowRight
                className="w-3 h-3 text-slate-700 group-hover:text-cyan-400 transition-colors shrink-0 mt-0.5"
              />
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed pl-0.5">{ins.detail}</p>
            <div className="mt-1.5 pl-0.5">
              <span
                className="text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{
                  background: `${PRIORITY_COLOR[ins.priority]}10`,
                  color: PRIORITY_COLOR[ins.priority],
                }}
              >
                {ins.priority} priority
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
