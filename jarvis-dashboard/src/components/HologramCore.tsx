"use client";

import { motion } from "framer-motion";
import ArcReactor, { AgentState } from "./ArcReactor";

interface HologramCoreProps {
  state?: AgentState;
}

export default function HologramCore({ state = "idle" }: HologramCoreProps) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Decorative hexagonal grid background for the center */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: "radial-gradient(circle at center, #38BDF8 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full h-full flex items-center justify-center"
      >
        <ArcReactor state={state} />
      </motion.div>
    </div>
  );
}
