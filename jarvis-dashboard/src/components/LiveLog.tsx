"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Terminal, ShieldAlert, Cpu, AlertCircle, Database, Search } from "lucide-react";
import { useEffect, useRef } from "react";

interface LogEntry {
  id: number;
  ts: string;
  severity: string;
  source: string;
  message: string;
}

export default function LiveLog({ externalLogs = [] }: { externalLogs: LogEntry[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [externalLogs]);

  const severityConfig: Record<string, { color: string; bg: string; icon: any }> = {
    info:     { color: "text-blue-400", bg: "bg-blue-400/10", icon: Terminal },
    warning:  { color: "text-amber-400", bg: "bg-amber-400/10", icon: AlertCircle },
    warn:     { color: "text-amber-400", bg: "bg-amber-400/10", icon: AlertCircle },
    error:    { color: "text-red-400", bg: "bg-red-400/10", icon: ShieldAlert },
    success:  { color: "text-emerald-400", bg: "bg-emerald-400/10", icon: Cpu },
    critical: { color: "text-rose-500", bg: "bg-rose-500/20", icon: ShieldAlert },
  };

  return (
    <div className="glass-panel hud-bracket hud-bracket-bottom-right flex flex-col h-full bg-blue-950/5">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Terminal className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <span className="block text-xs font-bold font-sora text-white uppercase tracking-tight">Kernel Debugger</span>
            <span className="block text-[8px] font-mono text-blue-400/40 uppercase tracking-[0.3em]">Live Stream Buffer</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[9px] font-mono text-blue-400/40 uppercase tracking-widest font-bold">Relay_Active</span>
           </div>
           <Search className="w-3.5 h-3.5 text-blue-400/20 hover:text-blue-400 cursor-pointer transition-colors" />
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2.5 custom-scrollbar bg-black/40"
      >
        <AnimatePresence initial={false}>
          {externalLogs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center opacity-10 gap-3">
               <Database className="w-8 h-8 text-blue-400 animate-pulse" />
               <span className="text-[9px] font-mono uppercase tracking-[0.4em]">Initializing Data Stream...</span>
            </div>
          ) : (
            externalLogs.map((log) => {
              const cfg = severityConfig[log.severity.toLowerCase()] || severityConfig.info;
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="group relative flex gap-4 p-2 rounded hover:bg-white/[0.02] transition-colors overflow-hidden"
                >
                  <div className={`shrink-0 w-[2px] rounded-full group-hover:h-full transition-all ${cfg.bg}`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                         <span className="text-[9px] font-mono text-blue-400/30 whitespace-nowrap">[{log.ts}]</span>
                         <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color} uppercase tracking-tighter`}>
                           {log.severity}
                         </span>
                         <span className="text-[9px] font-mono text-blue-400/50 uppercase tracking-widest">:: {log.source}</span>
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-blue-100/70 group-hover:text-blue-100 transition-colors leading-relaxed">
                      {log.message}
                    </div>
                  </div>

                  {/* Aesthetic decorative bit */}
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Footer Decos */}
      <div className="h-2 bg-gradient-to-r from-blue-500/20 via-transparent to-blue-500/10 opacity-30" />
    </div>
  );
}
