// frontend/src/features/auth/components/FloatingEducationObjects.tsx
// 3D Floating Interactive Education & AI Icons with Smooth Oscillations

import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, Brain, BookOpen, Rocket, ShieldCheck, Sparkles, FolderLock, Award } from "lucide-react";

interface FloatingItem {
  id: string;
  icon: any;
  label: string;
  gradient: string;
  borderColor: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  delay: number;
  duration: number;
  rotateRange: number[];
  yRange: number[];
}

const ITEMS: FloatingItem[] = [
  {
    id: "cap",
    icon: GraduationCap,
    label: "One EduID",
    gradient: "from-indigo-600/30 to-purple-600/30",
    borderColor: "rgba(168, 85, 247, 0.4)",
    top: "14%",
    left: "6%",
    delay: 0,
    duration: 6,
    rotateRange: [-4, 6, -4],
    yRange: [0, -18, 0],
  },
  {
    id: "brain",
    icon: Brain,
    label: "AI Neural Mentor",
    gradient: "from-pink-600/30 to-purple-600/30",
    borderColor: "rgba(236, 72, 153, 0.4)",
    top: "35%",
    left: "2%",
    delay: 1.2,
    duration: 7.5,
    rotateRange: [5, -5, 5],
    yRange: [0, 16, 0],
  },
  {
    id: "vault",
    icon: FolderLock,
    label: "Secure EduVault",
    gradient: "from-blue-600/30 to-cyan-600/30",
    borderColor: "rgba(56, 189, 248, 0.4)",
    bottom: "22%",
    left: "8%",
    delay: 2.1,
    duration: 6.8,
    rotateRange: [-6, 3, -6],
    yRange: [0, -14, 0],
  },
  {
    id: "rocket",
    icon: Rocket,
    label: "Career Growth",
    gradient: "from-amber-600/30 to-rose-600/30",
    borderColor: "rgba(244, 63, 94, 0.4)",
    top: "18%",
    right: "6%",
    delay: 0.8,
    duration: 8,
    rotateRange: [8, -4, 8],
    yRange: [0, 20, 0],
  },
  {
    id: "books",
    icon: BookOpen,
    label: "Smart Subjects",
    gradient: "from-emerald-600/30 to-teal-600/30",
    borderColor: "rgba(52, 211, 153, 0.4)",
    bottom: "28%",
    right: "5%",
    delay: 1.7,
    duration: 6.2,
    rotateRange: [-5, 5, -5],
    yRange: [0, -16, 0],
  },
];

export const FloatingEducationObjects: React.FC = () => {
  return (
    <div className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{
              opacity: [0.75, 0.95, 0.75],
              scale: [1, 1.05, 1],
              rotate: item.rotateRange,
              y: item.yRange,
            }}
            transition={{
              duration: item.duration,
              delay: item.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              top: item.top,
              bottom: item.bottom,
              left: item.left,
              right: item.right,
              transformStyle: "preserve-3d",
              perspective: 1000,
            }}
            className="group flex items-center gap-2.5 rounded-2xl border px-3.5 py-2 backdrop-blur-md shadow-2xl transition-all duration-300"
          >
            {/* Background pill */}
            <div
              className={`absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r ${item.gradient} opacity-80`}
            />

            {/* Glowing icon circle */}
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white shadow-inner"
              style={{ borderColor: item.borderColor }}
            >
              <Icon className="h-4 w-4 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            </div>

            {/* Label */}
            <span className="text-xs font-semibold tracking-wide text-white/90 drop-shadow">
              {item.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};
