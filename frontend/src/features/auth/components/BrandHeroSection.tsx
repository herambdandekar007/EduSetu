// frontend/src/features/auth/components/BrandHeroSection.tsx
// Left Hero Section with SMART EDUCATION AI Animated Branding and Ecosystem Features

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Sparkles,
  Brain,
  BookOpen,
  Target,
  Map,
  Bot,
  Mic,
  FolderLock,
  ShieldCheck,
  Award,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { EduId3DCard } from "./EduId3DCard";

const HIGHLIGHTS = [
  { icon: Brain, label: "AI Personalized Learning", desc: "Adaptive study tools & real-time revision", color: "from-purple-500 to-indigo-500" },
  { icon: GraduationCap, label: "Unique Permanent EduID", desc: "One lifetime academic credential identifier", color: "from-indigo-500 to-cyan-500" },
  { icon: Bot, label: "24/7 AI Mentor", desc: "Curriculum-aligned concept breakdowns", color: "from-pink-500 to-rose-500" },
  { icon: FolderLock, label: "Secure EduVault", desc: "Tamper-proof digital locker & QR shares", color: "from-cyan-500 to-blue-500" },
  { icon: Mic, label: "EduSpeak Voice Lab", desc: "Real-time speech & pronunciation coach", color: "from-emerald-500 to-teal-500" },
  { icon: Map, label: "Career Roadmap Engine", desc: "Dynamic stage-by-stage milestone graphs", color: "from-amber-500 to-orange-500" },
];

export const BrandHeroSection: React.FC<{ previewEduId?: string }> = ({ previewEduId }) => {
  const [activeHighlightIndex, setActiveHighlightIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHighlightIndex((prev) => (prev + 1) % HIGHLIGHTS.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const active = HIGHLIGHTS[activeHighlightIndex];
  const ActiveIcon = active.icon;

  return (
    <div className="relative flex flex-col justify-between p-8 lg:p-12 text-white h-full z-10">
      {/* ── Top Header & Logo ── */}
      <div className="space-y-6">
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 shadow-[0_0_25px_rgba(99,102,241,0.5)] p-0.5">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-slate-950/80 backdrop-blur-sm">
              <GraduationCap className="h-7 w-7 text-indigo-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white drop-shadow-md">
                SMART EDUCATION AI
              </h1>
              <span className="rounded-full border border-indigo-400/40 bg-indigo-500/20 px-2 py-0.5 text-[9px] font-extrabold text-indigo-300">
                PRO
              </span>
            </div>
            <p className="text-[11px] font-bold tracking-widest text-indigo-300/80 uppercase">
              National Digital Education Protocol
            </p>
          </div>
        </div>

        {/* ── Main Hero Copy ── */}
        <div className="space-y-3 pt-2">
          <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight">
            One Student. <br />
            <span className="bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
              One EduID.
            </span> <br />
            One Lifelong Journey.
          </h2>

          <p className="text-xs lg:text-sm text-indigo-200/75 leading-relaxed max-w-lg">
            Your intelligent education ecosystem for learning, skills, career growth, verified
            documents, and personalized AI guidance.
          </p>
        </div>

        {/* ── Central 3D Card Interactive Preview ── */}
        <div className="hidden xl:block py-2">
          <EduId3DCard
            studentName="AADITYA SHARMA"
            eduId={previewEduId || "EDU-IN-2026-X8F42A"}
            educationLevel="B.Tech Computer Science & AI"
          />
        </div>
      </div>

      {/* ── Bottom Rotating Feature Highlights Bar ── */}
      <div className="space-y-4 pt-6">
        <div className="rounded-2xl border border-white/15 bg-slate-900/60 p-4 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300/80">
              ECOSYSTEM CAPABILITIES
            </span>
            <div className="flex gap-1">
              {HIGHLIGHTS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === activeHighlightIndex ? "w-5 bg-indigo-400" : "w-1.5 bg-white/20"
                  }`}
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3"
            >
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${active.color} text-white shadow-md`}
              >
                <ActiveIcon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{active.label}</h4>
                <p className="text-xs text-indigo-200/70">{active.desc}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-between text-[11px] text-indigo-300/60 pt-1">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>WCAG 2.1 AAA Accessibility</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-cyan-400" />
            <span>National EduID Standard</span>
          </div>
        </div>
      </div>
    </div>
  );
};
