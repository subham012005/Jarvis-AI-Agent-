"use client";

import { motion, useAnimationFrame, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export type AgentState = "idle" | "listening" | "processing" | "speaking";

interface ArcReactorProps {
  state: AgentState;
}

export default function ArcReactor({ state }: ArcReactorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Core colors based on state - using premium gradients
  const colors = {
    idle: { primary: "#3b82f6", glow: "#38bdf8", secondary: "#1d4ed8" },
    listening: { primary: "#10b981", glow: "#34d399", secondary: "#059669" },
    processing: { primary: "#8b5cf6", glow: "#a78bfa", secondary: "#7c3aed" },
    speaking: { primary: "#3b82f6", glow: "#60a5fa", secondary: "#2563eb" },
  };

  const activeColor = colors[state] || colors.idle;

  return (
    <div className="relative flex items-center justify-center w-full h-full min-h-[500px] perspective-1000">
      {/* Background Deep Glow - Large Soft Aura */}
      <motion.div
        animate={{
          scale: state === "listening" ? [1, 1.2, 1] : [1, 1.05, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: `radial-gradient(circle, ${activeColor.glow} 0%, transparent 70%)` }}
      />

      {/* Holographic HUD Overlay - Floating Labels */}
      <div className="absolute inset-0 pointer-events-none p-12">
        <div className="grid grid-cols-2 h-full content-between">
          <div className="space-y-4">
             <div className="animate-slide-left" style={{ animationDelay: '0.1s' }}>
                <div className="text-[10px] font-mono text-blue-400/50 uppercase tracking-[0.3em]">Neural Load</div>
                <div className="text-2xl font-sora font-semibold text-white flex items-baseline gap-2">
                  <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 0.1, repeat: 2 }}>68.4</motion.span>
                  <span className="text-xs text-blue-400/30">%</span>
                </div>
             </div>
             <div className="animate-slide-left" style={{ animationDelay: '0.2s' }}>
                <div className="text-[10px] font-mono text-emerald-400/50 uppercase tracking-[0.3em]">Core Temp</div>
                <div className="text-2xl font-sora font-semibold text-white">42.8<span className="text-xs text-emerald-400/30">°C</span></div>
             </div>
          </div>
          
          <div className="text-right space-y-4">
             <div className="animate-slide-right" style={{ animationDelay: '0.1s' }}>
                <div className="text-[10px] font-mono text-violet-400/50 uppercase tracking-[0.3em]">Sync Priority</div>
                <div className="text-2xl font-sora font-semibold text-white uppercase">Omega-9</div>
             </div>
             <div className="animate-slide-right" style={{ animationDelay: '0.2s' }}>
                <div className="text-[10px] font-mono text-amber-400/50 uppercase tracking-[0.3em]">Stability</div>
                <div className="text-2xl font-sora font-semibold text-white">99.9<span className="text-xs text-amber-400/30">%</span></div>
             </div>
          </div>
        </div>
      </div>

      {/* Interactive Core Body */}
      <div className="relative w-[400px] h-[400px]">
        {/* Layered Floating Rings */}
        <div className="absolute inset-0 flex items-center justify-center">
            {/* Outer HUD Ring - Static Brackets */}
            <svg viewBox="0 0 200 200" className="w-full h-full opacity-20">
              <circle cx="100" cy="100" r="98" fill="none" stroke={activeColor.primary} strokeWidth="0.5" strokeDasharray="1 4" />
            </svg>
            
            {/* Rotating Gear Ring 1 */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute w-[360px] h-[360px] border border-blue-500/10 rounded-full border-dashed" 
            />

            {/* Pulsing Energy Shield */}
            <motion.div 
              animate={{ 
                scale: [0.95, 1.05, 0.95],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-[300px] h-[300px] rounded-full border-2 border-blue-400/20 shadow-[inset_0_0_50px_rgba(56,189,248,0.1)]"
            />

            {/* Neural Connector Nodes */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-blue-400"
                style={{
                  top: `calc(50% + ${Math.sin(i * Math.PI / 4) * 160}px)`,
                  left: `calc(50% + ${Math.cos(i * Math.PI / 4) * 160}px)`,
                  boxShadow: `0 0 10px ${activeColor.glow}`,
                }}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }}
              />
            ))}
        </div>

        {/* Main Central Reactor SVG */}
        <motion.div
          animate={{ scale: state === "speaking" ? [1, 1.02, 1] : 1 }}
          transition={{ duration: 0.2, repeat: Infinity }}
          className="relative w-full h-full z-10"
        >
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_30px_rgba(58,130,246,0.5)]">
            <defs>
              <radialGradient id="ring-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                <stop offset="100%" stopColor={activeColor.primary} stopOpacity="0.1" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Segmented Heavy Outer Shell */}
            <motion.g
              animate={{ rotate: state === "processing" ? 360 : 0 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            >
              {[...Array(10)].map((_, i) => (
                <path
                  key={i}
                  d={`M 100 ${15} A 85 85 0 0 1 ${100 + 85 * Math.sin((30 * Math.PI) / 180)} ${100 - 85 * Math.cos((30 * Math.PI) / 180)}`}
                  fill="none"
                  stroke={activeColor.primary}
                  strokeWidth="6"
                  strokeLinecap="round"
                  transform={`rotate(${i * 36} 100 100)`}
                  opacity="0.3"
                />
              ))}
            </motion.g>

            {/* Middle Rotating HUD Elements */}
            <motion.g
              animate={{ rotate: -360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            >
               <circle cx="100" cy="100" r="72" fill="none" stroke={activeColor.glow} strokeWidth="1" strokeDasharray="4 12" opacity="0.4" />
               <circle cx="100" cy="100" r="68" fill="none" stroke={activeColor.primary} strokeWidth="0.5" opacity="0.6" />
            </motion.g>

            {/* Iron Man Arc Reactor Style Core */}
            <motion.g
              animate={{ 
                scale: state === "listening" ? [1, 1.05, 1] : 1
              }}
              transition={{ 
                scale: { duration: 2, repeat: Infinity }
              }}
            >
              {/* Outer Palladium Ring Thick Layer */}
              <circle cx="100" cy="100" r="50" fill="none" stroke={activeColor.primary} strokeWidth="8" opacity="0.4" filter="url(#glow)" />
              <circle cx="100" cy="100" r="50" fill="none" stroke={activeColor.glow} strokeWidth="1" opacity="0.6" />
              
              {/* Magnetic Coil Segments (10 blocks) */}
              <motion.g
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              >
                {[...Array(10)].map((_, i) => (
                  <g key={i} transform={`rotate(${i * 36} 100 100)`}>
                    <path
                      d="M 94 44 L 106 44 L 108 56 L 92 56 Z"
                      fill={activeColor.secondary}
                      stroke={activeColor.glow}
                      strokeWidth="1.5"
                      opacity="0.8"
                    />
                    <line x1="96" y1="44" x2="94" y2="56" stroke={activeColor.primary} strokeWidth="1" opacity="0.5" />
                    <line x1="104" y1="44" x2="106" y2="56" stroke={activeColor.primary} strokeWidth="1" opacity="0.5" />
                    <line x1="100" y1="44" x2="100" y2="56" stroke={activeColor.glow} strokeWidth="0.5" opacity="0.8" />
                  </g>
                ))}
              </motion.g>

              {/* Inner Glowing Ring */}
              <circle cx="100" cy="100" r="40" fill="none" stroke={activeColor.glow} strokeWidth="3" filter="url(#glow)" />
              <circle cx="100" cy="100" r="40" fill="none" stroke="white" strokeWidth="0.5" opacity="0.8" />
              
              {/* Inner Coil Wires & Tech Rings */}
              <motion.g
                animate={{ rotate: -360 }}
                transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
              >
                <circle cx="100" cy="100" r="32" fill="none" stroke={activeColor.primary} strokeWidth="3" strokeDasharray="2 6" opacity="0.7" />
                <circle cx="100" cy="100" r="28" fill="none" stroke={activeColor.glow} strokeWidth="1" strokeDasharray="15 5 2 5" opacity="0.9" />
              </motion.g>

              {/* Glowing Core Bed */}
              <circle cx="100" cy="100" r="24" fill={`url(#ring-grad)`} filter="url(#glow)" opacity="0.8" />
            </motion.g>

            {/* Central Heart - The Spark */}
            <motion.circle
              cx="100" cy="100" r="18"
              fill="white"
              animate={{
                opacity: state === "listening" ? [0.6, 1, 0.6] : [0.8, 1, 0.8],
                scale: state === "speaking" ? [0.9, 1.1, 0.9] : 1
              }}
              transition={{ duration: 0.1, repeat: Infinity }}
              style={{ filter: "blur(10px)" }}
            />
            <circle cx="100" cy="100" r="8" fill="white" className="drop-shadow-[0_0_15px_white]" />
          </svg>

          {/* Neural Pulse Rings */}
          <AnimatePresence>
            {(state === "listening" || state === "speaking") && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute border-2 rounded-full"
                    style={{ borderColor: activeColor.glow }}
                    initial={{ width: 80, height: 80, opacity: 1, scale: 0.8 }}
                    animate={{ width: 450, height: 450, opacity: 0, scale: 1.2 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* State Indicator HUD Label */}
        <div className="absolute top-[100%] mt-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
           <div className="px-4 py-1 glass-panel border-blue-400/20 bg-blue-500/5 rounded-full flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${state === 'idle' ? 'bg-blue-400' : 'bg-emerald-400'} animate-pulse`} />
              <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-white">
                CORE STATUS: {state === "idle" ? "STANDBY" : state.toUpperCase()}
              </span>
           </div>
        </div>
      </div>
    </div>
  );
}
