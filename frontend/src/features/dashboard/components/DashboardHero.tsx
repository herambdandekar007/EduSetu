// frontend/src/features/dashboard/components/DashboardHero.tsx
// 3D Visual Knowledge Sphere Hero Section for SMART EDUCATION AI

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, ArrowRight, BrainCircuit, Compass, Flame, BookOpen, GraduationCap, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { StudentDashboardData } from "../types/dashboard.types";

interface DashboardHeroProps {
  student: StudentDashboardData;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({ student }) => {
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20 p-6 md:p-8 text-slate-900 shadow-sm">
      {/* Subtle ambient light accents */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-indigo-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-purple-500/10 blur-[100px]" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Greeting, Student Status & CTA */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>AI-POWERED ADAPTIVE LEARNING</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {greeting}, <span className="text-indigo-600">{student.fullName}</span> 👋
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
              You are making consistent progress. Your AI tutor has prepared today's personalized curriculum & interview practice drills.
            </p>
          </div>

          {/* Connected Metadata Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span className="font-mono text-indigo-700 font-bold">{student.eduId}</span>
            </span>

            <span className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-xs">
              <GraduationCap className="h-3.5 w-3.5 text-indigo-600" />
              {student.educationLevel}
            </span>

            <span className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-xs">
              <Building className="h-3.5 w-3.5 text-slate-500" />
              {student.institutionName}
            </span>
          </div>

          {/* Primary Call to Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              onClick={() => navigate("/learn")}
              className="h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 font-semibold text-white shadow-sm active:scale-95 transition-all text-xs"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              <span>Continue Learning</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/eduroadmap")}
              className="h-10 rounded-xl border-slate-200 bg-white px-4 font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all text-xs"
            >
              <Compass className="mr-2 h-4 w-4 text-indigo-600" />
              <span>Explore Career Roadmap</span>
            </Button>
          </div>
        </div>

        {/* Right Column: Knowledge Core Display */}
        <div className="lg:col-span-5 flex items-center justify-center">
          <div className="relative w-60 h-60 sm:w-64 sm:h-64 flex items-center justify-center">
            
            {/* Outer Ring 1 */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-indigo-200 border-dashed"
            />

            {/* Orbit Ring 2 */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              className="absolute inset-4 rounded-full border border-purple-200"
              style={{ transform: "rotateX(60deg)" }}
            />

            {/* Central Core */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="relative z-10 flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-[2px] shadow-lg shadow-indigo-500/15"
            >
              <div className="flex h-full w-full flex-col items-center justify-center rounded-3xl bg-white p-3 text-center">
                <BrainCircuit className="h-8 w-8 text-indigo-600 animate-pulse" />
                <span className="mt-1 text-[11px] font-extrabold tracking-wider text-slate-900">
                  EDUMIND AI
                </span>
                <span className="text-[9px] font-mono text-emerald-600 font-bold">
                  98.4% Precision
                </span>
              </div>
            </motion.div>

            {/* Floating Badge 1: Streak */}
            <motion.div
              animate={{ y: [-3, 3, -3] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute top-1 left-0 flex items-center gap-1.5 rounded-2xl border border-amber-200 bg-white px-3 py-1 shadow-sm text-amber-700 text-xs font-bold"
            >
              <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <span>{student.streakDays}d Streak</span>
            </motion.div>

            {/* Floating Badge 2: Verified Node */}
            <motion.div
              animate={{ y: [3, -3, 3] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
              className="absolute bottom-1 right-0 flex items-center gap-1.5 rounded-2xl border border-emerald-200 bg-white px-3 py-1 shadow-sm text-emerald-700 text-xs font-bold"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>EduID Verified</span>
            </motion.div>
          </div>
        </div>

      </div>
    </div>
  );
};
