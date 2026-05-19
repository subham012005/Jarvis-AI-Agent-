"use client";

import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Zap, Database, Globe, Cpu, Server } from "lucide-react";

export interface SystemStats {
  cpu: number; ram: number; disk: number; uptime: string; db_health: string;
  net_latency?: string; net_packets_tx?: string; net_packets_rx?: string; net_connections?: number;
  ram_gb?: string; disk_gb?: string; cpu_cores?: number; cpu_freq?: string;
  gpu_name?: string; gpu_usage?: number; npu_name?: string; npu_usage?: number; wifi_status?: string;
}

interface TelemetryProps {
  stats: {
    cpu: number[];
    ram: number[];
    network: number[];
  };
  sysStats?: SystemStats;
}

export default function SystemTelemetry({ stats, sysStats }: TelemetryProps) {
  // Format data for Recharts
  const data = stats.cpu.map((val, i) => ({
    name: i,
    cpu: val,
    ram: stats.ram[i] || 0,
    net: stats.network[i] || 0,
  }));

  const metrics = [
    { label: "Neural Load", value: stats.cpu[stats.cpu.length - 1] || 0, unit: "%", icon: Cpu, color: "#3b82f6" },
    { label: "Synapse Buff", value: stats.ram[stats.ram.length - 1] || 0, unit: "%", icon: Database, color: "#8b5cf6" },
    { label: "Data Flux", value: (stats.network[stats.network.length - 1] || 0) / 10, unit: "GB/s", icon: Globe, color: "#10b981" },
  ];

  return (
    <div className="flex flex-col h-full bg-transparent gap-6">
      
      {/* Top Section: Hero Chart */}
      <div className="relative h-[250px] shrink-0 glass-panel bg-black/40 border-white/5 rounded-2xl overflow-hidden flex flex-col group hover:border-blue-500/20 transition-all">
         <div className="absolute top-4 left-6 flex items-center gap-3 z-10">
            <Activity className="w-5 h-5 text-blue-400 animate-pulse" />
            <div>
               <div className="text-[10px] font-bold font-sora text-white uppercase tracking-[0.3em]">Telemetry Stream</div>
               <div className="text-[9px] font-mono text-blue-400/50 uppercase">0x42_SYS_ACTIVE • LIVE</div>
            </div>
         </div>
         <div className="absolute top-4 right-6 flex items-center gap-2 z-10">
            <div className="flex gap-1">
               {[...Array(5)].map((_, i) => (
                 <div key={i} className={`w-1 h-3 rounded-full ${i < 4 ? "bg-blue-500/50" : "bg-white/10"}`} />
               ))}
            </div>
         </div>
         
         <div className="flex-1 w-full mt-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6}/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '8px', fontSize: '10px', fontFamily: 'JetBrains Mono' }}
                  itemStyle={{ color: '#fff' }} cursor={{ stroke: 'rgba(59,130,246,0.2)', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCpu)" isAnimationActive={false} />
                <Area type="monotone" dataKey="ram" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRam)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* Middle Section: Floating Quick Metrics */}
      <div className="grid grid-cols-3 gap-6 shrink-0">
         {metrics.map((m, i) => (
            <div key={i} className="flex items-center justify-between glass-panel bg-gradient-to-r from-blue-950/20 to-transparent border-white/5 py-4 px-6 rounded-2xl relative overflow-hidden group">
               <div className="absolute left-0 top-0 bottom-0 w-1 bg-current opacity-50 shadow-[0_0_10px_currentColor]" style={{ color: m.color }} />
               <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 shadow-inner">
                     <m.icon className="w-5 h-5" style={{ color: m.color }} />
                  </div>
                  <div>
                     <div className="text-[9px] font-bold font-sora uppercase tracking-[0.2em] text-white/50 mb-0.5">{m.label}</div>
                     <div className="text-2xl font-mono font-bold text-white flex items-baseline gap-1">
                        {m.value.toFixed(1)} <span className="text-[10px] text-white/30">{m.unit}</span>
                     </div>
                  </div>
               </div>
               <div className="w-16 h-8 opacity-20 group-hover:opacity-40 transition-opacity">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={data}>
                        <Area type="step" dataKey={i === 0 ? "cpu" : i === 1 ? "ram" : "net"} stroke={m.color} fill={m.color} fillOpacity={0.2} strokeWidth={2} isAnimationActive={false} />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>
         ))}
      </div>

      {/* Bottom Section: 3-Column Detailed Diagnostics */}
      {sysStats && (
        <div className="flex-1 grid grid-cols-3 gap-6">
           
           {/* Core Silicon */}
           <div className="glass-panel bg-black/40 border-white/5 p-6 rounded-2xl flex flex-col gap-5 hover:border-blue-500/20 transition-all">
              <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                 <Cpu className="w-4 h-4 text-blue-400" />
                 <h3 className="text-[10px] font-bold font-sora text-white/80 uppercase tracking-widest">Core Silicon</h3>
              </div>
              
              <div className="flex flex-col gap-4 flex-1">
                 <div>
                    <div className="flex justify-between items-end mb-1">
                       <span className="text-[9px] font-mono text-blue-400/60 uppercase">Logicals</span>
                       <span className="text-[11px] font-mono text-white/90">{sysStats.cpu_cores || 16} @ {sysStats.cpu_freq || "3.2GHz"}</span>
                    </div>
                    <div className="h-[2px] bg-white/5 w-full"><div className="h-full bg-blue-500 w-[100%]" /></div>
                 </div>

                 <div>
                    <div className="flex justify-between items-end mb-1">
                       <span className="text-[9px] font-mono text-blue-400/60 uppercase">Memory ({sysStats.ram_gb || "---"})</span>
                       <span className="text-[11px] font-mono text-white/90">{sysStats.ram}%</span>
                    </div>
                    <div className="h-[2px] bg-white/5 w-full"><div className="h-full bg-blue-500" style={{ width: `${sysStats.ram}%` }} /></div>
                 </div>

                 <div>
                    <div className="flex justify-between items-end mb-1">
                       <span className="text-[9px] font-mono text-blue-400/60 uppercase">Drive ({sysStats.disk_gb || "---"})</span>
                       <span className="text-[11px] font-mono text-white/90">{sysStats.disk}%</span>
                    </div>
                    <div className="h-[2px] bg-white/5 w-full"><div className="h-full bg-indigo-500" style={{ width: `${sysStats.disk}%` }} /></div>
                 </div>
              </div>

              <div className="mt-auto flex justify-between items-center text-[10px] font-mono bg-white/5 p-2 rounded text-white/70">
                 <span className="uppercase text-blue-400/50">Uptime</span>
                 <span>{sysStats.uptime}</span>
              </div>
           </div>

           {/* Matrix Accel */}
           <div className="glass-panel bg-black/40 border-white/5 p-6 rounded-2xl flex flex-col gap-5 hover:border-blue-500/20 transition-all">
              <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                 <Zap className="w-4 h-4 text-emerald-400" />
                 <h3 className="text-[10px] font-bold font-sora text-white/80 uppercase tracking-widest">Matrix Accel</h3>
              </div>
              
              <div className="flex flex-col gap-4 flex-1">
                 <div>
                    <div className="flex justify-between items-end mb-1">
                       <span className="text-[9px] font-mono text-emerald-400/60 uppercase truncate w-[100px]">{sysStats.gpu_name || "dGPU"}</span>
                       <span className="text-[11px] font-mono text-white/90">{sysStats.gpu_usage || 0}%</span>
                    </div>
                    <div className="h-[2px] bg-white/5 w-full"><div className="h-full bg-emerald-500" style={{ width: `${sysStats.gpu_usage || 0}%` }} /></div>
                 </div>

                 <div>
                    <div className="flex justify-between items-end mb-1">
                       <span className="text-[9px] font-mono text-amber-400/60 uppercase truncate w-[100px]">{sysStats.npu_name || "NPU"}</span>
                       <span className="text-[11px] font-mono text-white/90">{sysStats.npu_usage || 0}%</span>
                    </div>
                    <div className="h-[2px] bg-white/5 w-full"><div className="h-full bg-amber-500" style={{ width: `${sysStats.npu_usage || 0}%` }} /></div>
                 </div>

                 <div>
                    <div className="flex justify-between items-end mb-1">
                       <span className="text-[9px] font-mono text-blue-400/60 uppercase">Net TX / RX</span>
                       <span className="text-[11px] font-mono text-white/90">{sysStats.net_packets_tx} <span className="opacity-40">/</span> {sysStats.net_packets_rx}</span>
                    </div>
                    <div className="h-[2px] bg-white/5 w-full"><div className="h-full bg-blue-500 w-[100%]" /></div>
                 </div>
              </div>

              <div className="mt-auto flex justify-between items-center text-[10px] font-mono bg-white/5 p-2 rounded text-emerald-400">
                 <span className="uppercase text-emerald-400/50">Uplink</span>
                 <span>{sysStats.wifi_status || "SECURE"}</span>
              </div>
           </div>

           {/* Tech Stack Matrix */}
           <div className="glass-panel bg-blue-950/10 border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.05)] p-6 rounded-2xl flex flex-col gap-4 hover:border-blue-500/40 transition-all">
              <div className="flex items-center gap-3 border-b border-blue-500/20 pb-3">
                 <Server className="w-4 h-4 text-blue-400" />
                 <h3 className="text-[10px] font-bold font-sora text-blue-300 uppercase tracking-widest">Tech Operations</h3>
                 <span className="ml-auto px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[8px] animate-pulse">ACTIVE</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs h-full content-start mt-2">
                 <div className="flex flex-col gap-1">
                    <span className="font-mono text-blue-400/50 text-[9px] uppercase tracking-wider">Engine UI</span>
                    <span className="font-mono text-white/90 text-[10px]">Next.js + React</span>
                 </div>
                 <div className="flex flex-col gap-1">
                    <span className="font-mono text-blue-400/50 text-[9px] uppercase tracking-wider">Visual FX</span>
                    <span className="font-mono text-white/90 text-[10px]">Tailwind + Framer</span>
                 </div>
                 <div className="flex flex-col gap-1">
                    <span className="font-mono text-blue-400/50 text-[9px] uppercase tracking-wider">Agent Engine</span>
                    <span className="font-mono text-white/90 text-[10px]">Python FastAPI</span>
                 </div>
                 <div className="flex flex-col gap-1">
                    <span className="font-mono text-blue-400/50 text-[9px] uppercase tracking-wider">Data Stream</span>
                    <span className="font-mono text-white/90 text-[10px]">WebSockets</span>
                 </div>
                 <div className="flex flex-col gap-1">
                    <span className="font-mono text-blue-400/50 text-[9px] uppercase tracking-wider">Brain Pattern</span>
                    <span className="font-mono text-white/90 text-[10px]">LangChain NLP</span>
                 </div>
                 <div className="flex flex-col gap-1">
                    <span className="font-mono text-blue-400/50 text-[9px] uppercase tracking-wider">Perception</span>
                    <span className="font-mono text-white/90 text-[10px]">openWakeWord</span>
                 </div>
              </div>
           </div>

        </div>
      )}
    </div>
  );
}
