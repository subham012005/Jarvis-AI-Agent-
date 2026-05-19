"use client";

import { motion } from "framer-motion";
import ArcReactor, { AgentState } from "./ArcReactor";

interface HologramCoreProps {
  state?: AgentState;
}

export default function HologramCore({ state = "idle" }: HologramCoreProps) {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Background Neural Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none select-none overflow-hidden">
         <div className="w-full h-full" style={{ backgroundImage: "radial-gradient(circle at center, rgba(58,130,246,0.5) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>
      
      {/* Cinematic Focus Brackets */}
      <div className="absolute w-[80%] h-[80%] pointer-events-none select-none">
         {/* Top corners */}
         <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-blue-500/30" />
         <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-blue-500/30" />
         {/* Bottom corners */}
         <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-blue-500/30" />
         <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-blue-500/30" />
         
         {/* Focus Lines (Animated) */}
         <motion.div 
           animate={{ scale: [1, 1.02, 1], opacity: [0.3, 0.5, 0.3] }}
           transition={{ duration: 4, repeat: Infinity }}
           className="absolute inset-4 border border-blue-400/10 rounded-full" 
         />
         
         {/* Scanner Pulse Line */}
         <motion.div 
           animate={{ top: ["0%", "100%", "0%"] }}
           transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
           className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent z-10"
         />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full h-full flex items-center justify-center"
      >
        <ArcReactor state={state} />
      </motion.div>

      {/* Depth Decor: Holographic Labels */}
      {/* Moved top labels to center-vertical sides to prevent overlapping with HUD */}
      <div className="absolute inset-y-1/2 -translate-y-1/2 inset-x-8 flex justify-between pointer-events-none opacity-30">
         <div className="-rotate-90 origin-left text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest translate-y-1/2 -translate-x-4">Projection_Link: Verified</div>
         <div className="rotate-90 origin-right text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest translate-y-1/2 translate-x-4">Core_Stability: Nominal</div>
      </div>
      
      {/* Moved bottom labels to the very bottom edges */}
      <div className="absolute bottom-8 inset-x-16 flex justify-between pointer-events-none opacity-30">
         <div className="flex flex-col gap-1">
            <div className="w-16 h-1 bg-blue-500/30" />
            <div className="text-[8px] font-mono text-blue-400 uppercase tracking-tighter">Neural_Buffer_Stream</div>
         </div>
         <div className="text-right flex flex-col items-end gap-1">
            <div className="w-16 h-1 bg-blue-500/30" />
            <div className="text-[8px] font-mono text-blue-400 uppercase tracking-tighter">Sync_Rate: 99.9%</div>
         </div>
      </div>
    </div>
  );
}
