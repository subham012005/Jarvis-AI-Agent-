"use client";

import { motion } from "framer-motion";
import { Lightbulb, ArrowRight, Brain, Sparkles, Target, Zap } from "lucide-react";

interface Insight {
  id: number;
  type: "action" | "recommendation" | "observation";
  title: string;
  detail: string;
  priority: "high" | "medium" | "low";
}

const PRIORITY_COLOR = { 
  high: "text-amber-400 bg-amber-400/10 border-amber-400/20", 
  medium: "text-blue-400 bg-blue-400/10 border-blue-400/20", 
  low: "text-white/40 bg-white/5 border-white/10" 
};

const TYPE_ICON = {
  action: Zap,
  recommendation: Brain,
  observation: Sparkles
};

const INSIGHTS: Insight[] = [
  {
    id: 1, type: "action", priority: "high",
    title: "Synaptic flux critical",
    detail: "Neural buffer approaching 80% cap. Recommend sequence optimization to prevent drift.",
  },
  {
    id: 2, type: "recommendation", priority: "medium",
    title: "Schedule memory sweep",
    detail: "Data cache fragmented — run a sweep cycle during low-latency window tonight at 23:00.",
  },
  {
    id: 3, type: "observation", priority: "medium",
    title: "Search Core optimized",
    detail: "Average query latency decreased 18% since last neural update. Performance is peak.",
  },
  {
    id: 4, type: "recommendation", priority: "low",
    title: "Update Contact: Admin",
    detail: "Detected missing biometric reference in communication logs. Sync required.",
  },
];

export default function InsightsPanel() {
  return (
    <div className="glass-panel hud-bracket hud-bracket-bottom-right flex flex-col h-full bg-blue-950/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Brain className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-sora text-white uppercase tracking-wider">Neural Insights</h3>
            <span className="text-[9px] font-mono text-blue-400/40 uppercase tracking-[0.2em]">AI Predictive Analysis</span>
          </div>
        </div>
        <div className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20">
          <span className="text-[9px] font-mono font-bold text-blue-400">{INSIGHTS.length} ACTIVE</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4 custom-scrollbar bg-black/20 relative">
        {/* Animated Scanner Decor */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
             style={{ backgroundImage: "linear-gradient(rgba(58,130,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(58,130,246,0.3) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

        {INSIGHTS.map((ins, i) => {
          const Icon = TYPE_ICON[ins.type];
          return (
            <motion.div
              key={ins.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative glass-panel p-5 bg-white/[0.03] hover:bg-white/[0.06] transition-all cursor-crosshair border-white/5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4 text-blue-400" />
                   </div>
                   <h4 className="text-xs font-bold font-sora text-white group-hover:text-blue-400 transition-colors">{ins.title}</h4>
                </div>
                <div className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border ${PRIORITY_COLOR[ins.priority]}`}>
                   {ins.priority}
                </div>
              </div>
              
              <p className="text-[11px] font-mono text-white/50 leading-relaxed mb-4">
                {ins.detail}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                 <div className="flex items-center gap-2">
                    <Target className="w-3 h-3 text-blue-400/40" />
                    <span className="text-[9px] font-mono text-blue-400/30 uppercase tracking-widest">Protocol: JARVIS_CORE_04</span>
                 </div>
                 <motion.button 
                   whileHover={{ x: 3 }}
                   className="flex items-center gap-2 text-[9px] font-mono font-bold text-blue-400 hover:text-white transition-colors"
                 >
                   RESOLVE <ArrowRight className="w-3 h-3" />
                 </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Reflection */}
      <div className="px-6 py-4 border-t border-white/5 bg-black/40 flex items-center justify-between">
         <span className="text-[8px] font-mono text-blue-400/20 uppercase tracking-[0.4em]">Integrated Neural Matrix</span>
         <div className="flex gap-1 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <motion.div 
                key={i} 
                className="w-1 h-3 bg-blue-500/20 rounded-full"
                animate={{ height: [8, 16, 8] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
         </div>
      </div>
    </div>
  );
}
