"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export type AgentState = "idle" | "listening" | "processing" | "speaking";

interface ArcReactorProps {
  state: AgentState;
}

export default function ArcReactor({ state }: ArcReactorProps) {
  // Core colors based on state
  const colors = {
    idle: "#38BDF8",
    listening: "#22D3EE",
    processing: "#00d2ff",
    speaking: "#38BDF8",
  };

  const currentColor = colors[state] || colors.idle;

  return (
    <div className="relative flex items-center justify-center w-full h-full min-h-[450px]">
      {/* Background Glow */}
      <motion.div
        animate={{
          scale: state === "listening" ? [1, 1.3, 1] : [1, 1.1, 1],
          opacity: state === "listening" ? [0.2, 0.5, 0.2] : [0.1, 0.3, 0.1],
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none"
        style={{ background: `radial-gradient(circle, ${currentColor}22 0%, transparent 70%)` }}
      />

      {/* Surrounding Telemetry Labels (Reference Image Style) */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Left: Energy Level */}
        <div className="absolute top-[15%] left-[10%] text-left">
          <div className="text-[10px] font-mono text-cyan-500/60 uppercase tracking-widest">Energy Level</div>
          <div className="text-xl font-bold font-mono text-white">87%</div>
          <div className="w-24 h-1 bg-white/5 mt-1 overflow-hidden">
            <motion.div className="h-full bg-cyan-500" initial={{ width: 0 }} animate={{ width: "87%" }} />
          </div>
        </div>

        {/* Top Right: Core Temp */}
        <div className="absolute top-[15%] right-[10%] text-right">
          <div className="text-[10px] font-mono text-cyan-500/60 uppercase tracking-widest">Core Temp</div>
          <div className="text-xl font-bold font-mono text-white">42°C</div>
          <div className="w-24 h-1 bg-white/5 mt-1 ml-auto overflow-hidden">
            <motion.div className="h-full bg-cyan-500" initial={{ width: 0 }} animate={{ width: "42%" }} />
          </div>
        </div>

        {/* Bottom Left: Power Output */}
        <div className="absolute bottom-[20%] left-[10%] text-left">
          <div className="text-[10px] font-mono text-cyan-500/60 uppercase tracking-widest">Power Output</div>
          <div className="text-xl font-bold font-mono text-white">1.2 TW</div>
        </div>

        {/* Bottom Right: Neural Load */}
        <div className="absolute bottom-[20%] right-[10%] text-right">
          <div className="text-[10px] font-mono text-cyan-500/60 uppercase tracking-widest">Neural Load</div>
          <div className="text-xl font-bold font-mono text-white">68%</div>
        </div>
      </div>

      {/* Main Reactor Body */}
      <div className="relative w-[320px] h-[320px]">
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_20px_rgba(0,210,255,0.4)]">
          {/* Outer Ring 1 (Static Brackets) */}
          <circle cx="100" cy="100" r="98" fill="none" stroke={currentColor} strokeWidth="0.5" opacity="0.1" />
          
          {/* Outer Ring 2 (Dashed Processing) */}
          <motion.circle
            cx="100" cy="100" r="92"
            fill="none" stroke={currentColor} strokeWidth="2"
            strokeDasharray="4 8"
            animate={{ rotate: state === "processing" ? 360 : 0 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            opacity="0.3"
          />

          {/* Segmented Heavy Ring */}
          <motion.g
            animate={{ rotate: state === "processing" ? 360 : 0 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            {[...Array(12)].map((_, i) => (
              <path
                key={i}
                d={`M 100 ${12} A 88 88 0 0 1 ${100 + 88 * Math.sin((25 * Math.PI) / 180)} ${100 - 88 * Math.cos((25 * Math.PI) / 180)}`}
                fill="none"
                stroke={currentColor}
                strokeWidth="4"
                transform={`rotate(${i * 30} 100 100)`}
                opacity="0.4"
              />
            ))}
          </motion.g>

          {/* Inner Fast Ring */}
          <motion.g
            animate={{ rotate: state === "processing" ? -360 : 0 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          >
            {[...Array(24)].map((_, i) => (
              <rect
                key={i}
                x="99" y="30" width="2" height="6"
                fill={currentColor}
                transform={`rotate(${i * 15} 100 100)`}
                opacity="0.6"
              />
            ))}
          </motion.g>

          {/* The Geometric Star Pattern Core (Reference Image) */}
          <motion.g
            animate={{ rotate: state === "processing" ? 180 : 0 }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Outer Hexagon/Star */}
            <path
              d="M 100 55 L 140 75 L 140 125 L 100 145 L 60 125 L 60 75 Z"
              fill="none" stroke={currentColor} strokeWidth="1" opacity="0.4"
            />
            {/* Inner Star Pattern */}
            <path
              d="M 100 65 L 110 90 L 135 100 L 110 110 L 100 135 L 90 110 L 65 100 L 90 90 Z"
              fill={currentColor} fillOpacity="0.1" stroke={currentColor} strokeWidth="1.5"
            />
          </motion.g>

          {/* Center Light Source */}
          <motion.circle
            cx="100" cy="100" r="22"
            fill={currentColor}
            animate={{
              opacity: state === "speaking" ? [0.4, 0.9, 0.4] : [0.5, 0.7, 0.5],
              scale: state === "processing" ? [1, 1.1, 1] : 1
            }}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{ filter: "blur(6px)" }}
          />
          <circle cx="100" cy="100" r="14" fill="white" style={{ filter: "blur(2px)" }} />

          {/* State Text */}
          <text
            x="100" y="45"
            textAnchor="middle"
            fill={currentColor}
            fontSize="7"
            fontFamily="monospace"
            className="uppercase tracking-[0.3em] font-bold"
          >
            System State
          </text>
          <text
            x="100" y="25"
            textAnchor="middle"
            fill="white"
            fontSize="10"
            fontFamily="monospace"
            className="uppercase tracking-[0.2em] font-bold"
          >
            {state === "idle" ? "Standby" : state}
          </text>
        </svg>

        {/* Listening Ripple */}
        {state === "listening" && (
          <div className="absolute inset-0 flex items-center justify-center">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute border border-cyan-400 rounded-full"
                initial={{ width: 100, height: 100, opacity: 0.8 }}
                animate={{ width: 400, height: 400, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
