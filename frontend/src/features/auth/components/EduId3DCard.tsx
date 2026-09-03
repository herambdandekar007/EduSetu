// frontend/src/features/auth/components/EduId3DCard.tsx
// Interactive 3D Holographic EduID Card with Mouse Tilt, Depth Physics, and 3D Flip

import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Sparkles, QrCode, Cpu, ShieldCheck, CheckCircle2, Award, Wifi, RotateCw } from "lucide-react";

interface EduId3DCardProps {
  studentName?: string;
  eduId?: string;
  educationLevel?: string;
  isFlippedExternal?: boolean;
}

export const EduId3DCard: React.FC<EduId3DCardProps> = ({
  studentName = "STUDENT IDENTITY",
  eduId = "EDU-IN-2026-X8F42A",
  educationLevel = "Undergraduate / Lifelong Learner",
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Mouse physics coordinates
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring smoothing
  const springConfig = { damping: 20, stiffness: 150 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [14, -14]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-18, 18]), springConfig);
  const shineX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
  const shineY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center py-4"
      style={{ perspective: 1200 }}
    >
      {/* Outer ambient glow pod */}
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-indigo-500/20 via-purple-500/25 to-pink-500/20 blur-2xl" />

      {/* 3D Interactive Card Shell */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        }}
        className="relative h-[250px] w-full max-w-[390px] cursor-pointer select-none rounded-2xl p-[1.5px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] transition-shadow duration-300 hover:shadow-[0_35px_60px_-15px_rgba(99,102,241,0.4)]"
      >
        {/* Holographic animated gradient border */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(236,72,153,0.8), rgba(56,189,248,0.9), rgba(168,85,247,0.9))",
          }}
        />

        {/* Card Body with 3D Flip container */}
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative h-full w-full rounded-2xl overflow-hidden"
        >
          {/* ════════════════ FRONT SIDE ════════════════ */}
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              background:
                "linear-gradient(135deg, rgba(17, 24, 39, 0.94) 0%, rgba(30, 27, 75, 0.96) 50%, rgba(15, 23, 42, 0.94) 100%)",
            }}
            className="absolute inset-0 flex flex-col justify-between p-5 text-white backdrop-blur-xl border border-white/10"
          >
            {/* Specular sheen layer */}
            <motion.div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                background: `radial-gradient(circle at ${shineX} ${shineY}, rgba(255,255,255,0.8) 0%, transparent 60%)`,
              }}
            />

            {/* Header: Brand + Verified Tag */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-[11px] font-black tracking-widest text-indigo-200 uppercase">
                    SMART EDUCATION AI
                  </div>
                  <div className="text-[8px] font-medium tracking-wider text-purple-300/80">
                    NATIONAL EDUID PROTOCOL
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[9px] font-semibold text-emerald-300">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                <span>ACTIVE</span>
              </div>
            </div>

            {/* Middle: Smart Chip + Hologram + QR */}
            <div className="relative z-10 flex items-center justify-between my-auto">
              <div className="flex items-center gap-3">
                {/* Golden Electronic Chip visual */}
                <div className="relative flex h-10 w-12 items-center justify-center rounded-md border border-amber-400/60 bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 shadow-md">
                  <div className="absolute inset-1 rounded-sm border border-amber-700/40 grid grid-cols-2 gap-0.5">
                    <div className="border-r border-b border-amber-800/30" />
                    <div className="border-b border-amber-800/30" />
                    <div className="border-r border-amber-800/30" />
                    <div />
                  </div>
                  <Wifi className="h-3.5 w-3.5 text-amber-950/80 rotate-90" />
                </div>

                <div className="space-y-0.5">
                  <div className="text-[9px] uppercase tracking-wider text-white/50 font-mono">
                    LIFELONG IDENTITY
                  </div>
                  <div className="text-sm font-bold tracking-tight text-white line-clamp-1">
                    {studentName}
                  </div>
                  <div className="text-[10px] text-indigo-300/80">
                    {educationLevel}
                  </div>
                </div>
              </div>

              {/* Holographic QR Code Box */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 p-1 backdrop-blur-md shadow-inner">
                <QrCode className="h-10 w-10 text-white/90" />
              </div>
            </div>

            {/* Footer: EduID Number & Security Features */}
            <div className="relative z-10 flex items-end justify-between border-t border-white/10 pt-2.5">
              <div>
                <div className="text-[8px] font-semibold uppercase tracking-widest text-indigo-300/70">
                  PERMANENT EDU-ID
                </div>
                <div className="font-mono text-base font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-pink-200">
                  {eduId}
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[8px] text-white/60 font-mono">
                <ShieldCheck className="h-3 w-3 text-cyan-400" />
                <span>SHA-256 SECURED</span>
              </div>
            </div>
          </div>

          {/* ════════════════ BACK SIDE ════════════════ */}
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background:
                "linear-gradient(135deg, rgba(30, 27, 75, 0.98) 0%, rgba(17, 24, 39, 0.98) 100%)",
            }}
            className="absolute inset-0 flex flex-col justify-between p-5 text-white backdrop-blur-xl border border-white/10"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[10px] font-bold tracking-widest text-indigo-300 uppercase">
                CONNECTED ECOSYSTEM
              </span>
              <span className="text-[9px] font-mono text-white/50">GOV-EDU VERIFIED</span>
            </div>

            {/* Neural ecosystem nodes */}
            <div className="grid grid-cols-2 gap-2 my-auto text-[10px]">
              <div className="flex items-center gap-1.5 rounded-lg bg-white/5 p-2 border border-white/5">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                <span>EduVault Credentials</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-white/5 p-2 border border-white/5">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                <span>EduMentor 24/7 AI</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-white/5 p-2 border border-white/5">
                <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
                <span>EduSpeak Speech Lab</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-white/5 p-2 border border-white/5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>AI Job Match Matrix</span>
              </div>
            </div>

            {/* Security barcode */}
            <div className="border-t border-white/10 pt-2 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-mono text-[8px] text-white/40">
                  DIGITAL CREDENTIAL HASH: {eduId.replace(/-/g, "").toLowerCase()}
                </div>
                <div className="flex gap-1 h-3 items-center opacity-60">
                  <div className="w-1 bg-white h-full" />
                  <div className="w-0.5 bg-white h-full" />
                  <div className="w-2 bg-white h-full" />
                  <div className="w-0.5 bg-white h-full" />
                  <div className="w-1.5 bg-white h-full" />
                  <div className="w-0.5 bg-white h-full" />
                  <div className="w-3 bg-white h-full" />
                  <div className="w-1 bg-white h-full" />
                  <div className="w-2 bg-white h-full" />
                </div>
              </div>
              <Award className="h-6 w-6 text-amber-400/80" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Interactive 3D Flip Hint Button */}
      <button
        type="button"
        onClick={() => setIsFlipped(!isFlipped)}
        className="mt-3.5 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/70 backdrop-blur-md transition-all hover:bg-white/15 hover:text-white"
      >
        <RotateCw className="h-3 w-3 text-indigo-400 animate-spin-slow" />
        <span>Click to {isFlipped ? "View Front" : "Flip 3D Card"}</span>
      </button>
    </div>
  );
};
