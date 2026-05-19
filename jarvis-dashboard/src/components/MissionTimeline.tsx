"use client";

import { motion } from "framer-motion";
import { Rocket, CheckCircle2, Globe, Cpu, MessageSquare, Wrench, ShieldCheck } from "lucide-react";

const CAPABILITIES = [
  {
    id: "intel_core", 
    status: "online",
    title: "Web & Intelligence",
    description: "Fetch live data from the web, open websites, and control browser automation.",
    tools: ["Google_Search", "Website_Opener", "Browser_Control"],
    icon: Globe,
    color: "#38bdf8" // light blue
  },
  {
    id: "comms_matrix", 
    status: "online",
    title: "Comms & Networking",
    description: "Read, write, and manage WhatsApp messages, notifications, and contacts dynamically.",
    tools: ["Message_Calls_Maker", "Get_WhatsApp_Chats", "Send_WhatsApp_Media", "Add_Contact"],
    icon: MessageSquare,
    color: "#10b981" // emerald
  },
  {
    id: "sys_ops", 
    status: "online",
    title: "System Operations",
    description: "Control local OS files, pathways, execution, and semantic local file search.",
    tools: ["File_Opening", "File_Closing", "Search_Local_Files", "Share_File_Tool"],
    icon: Cpu,
    color: "#8b5cf6" // violet
  },
  {
    id: "utils", 
    status: "online",
    title: "Global Utilities",
    description: "Read environment matrices: weather, time, and phone contacts.",
    tools: ["Get_weather_tool", "Date_and_time_tool", "Get_Contact_Number", "Get_Notification"],
    icon: Wrench,
    color: "#f59e0b" // amber
  }
];

export default function MissionTimeline() {
  return (
    <div className="glass-panel hud-bracket hud-bracket-top-left flex flex-col h-full bg-blue-950/5">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-sora text-white uppercase tracking-wider">System Capabilities</h3>
            <span className="text-[9px] font-mono text-blue-400/40 uppercase tracking-[0.2em]">Loaded Core Modules</span>
          </div>
        </div>
        <div className="text-[9px] font-mono text-emerald-400/80 uppercase tracking-widest flex items-center gap-1">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
           {CAPABILITIES.reduce((acc, c) => acc + c.tools.length, 0)} ACTIVE TOOLS
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar bg-black/20">
        <div className="relative pl-8">
          {/* Vertical Line Lineage */}
          <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/30 via-emerald-500/30 to-violet-500/30" />

          {CAPABILITIES.map((cap, i) => {
            const Icon = cap.icon;
            
            return (
              <motion.div
                key={cap.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative mb-6 last:mb-0 group"
              >
                {/* Node Pip */}
                <div className="absolute -left-[25px] top-4 w-3.5 h-3.5 rounded-full border-2 border-black z-10 transition-all duration-500 scale-110 shadow-[0_0_10px_currentColor]"
                     style={{ background: cap.color, color: cap.color }}>
                     <motion.div 
                       animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                       transition={{ duration: 2, repeat: Infinity }}
                       className="absolute inset-[-8px] rounded-full border"
                       style={{ borderColor: cap.color }}
                     />
                </div>

                <div className="glass-panel p-5 transition-all duration-300 border-white/5 bg-white/[0.02] hover:bg-white/[0.04] ring-1 ring-white/5 hover:ring-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col">
                       <h4 className="text-xs font-bold font-sora uppercase tracking-tight" style={{ color: cap.color }}>{cap.title}</h4>
                    </div>
                    <div className="flex flex-col items-end">
                       <div className="flex items-center gap-2 mb-1 px-2 py-0.5 rounded backdrop-blur-sm" style={{ backgroundColor: `${cap.color}15` }}>
                          <CheckCircle2 className="w-3 h-3" style={{ color: cap.color }} />
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: cap.color }}>ONLINE</span>
                       </div>
                    </div>
                  </div>
                  
                  <p className="text-[11px] font-mono text-white/60 leading-relaxed mb-4">
                    {cap.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5">
                    {cap.tools.map((t) => (
                      <div
                        key={t}
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/40 border border-white/10 group-hover:border-white/20 transition-all"
                      >
                         <Icon className="w-2.5 h-2.5 opacity-50" style={{ color: cap.color }} />
                         <span className="text-[8px] font-mono text-white/50 uppercase tracking-widest">{t}</span>
                      </div>
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
