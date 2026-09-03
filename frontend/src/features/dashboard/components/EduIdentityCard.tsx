// frontend/src/features/dashboard/components/EduIdentityCard.tsx
// 3D Holographic Student Identity Card for SMART EDUCATION AI Dashboard

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  IdCard,
  Copy,
  Check,
  QrCode,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  User,
  GraduationCap,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { StudentDashboardData } from "../types/dashboard.types";
import { toast } from "sonner";

interface EduIdentityCardProps {
  student: StudentDashboardData;
}

export const EduIdentityCard: React.FC<EduIdentityCardProps> = ({ student }) => {
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotate({
      x: -(y / rect.height) * 12,
      y: (x / rect.width) * 12,
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(student.eduId);
      setCopied(true);
      toast.success("EduID copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy EduID");
    }
  };

  return (
    <>
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ rotateX: rotate.x, rotateY: rotate.y }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        style={{ transformStyle: "preserve-3d", perspective: 1000 }}
        className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 text-slate-900 shadow-sm transition-shadow hover:shadow-md"
      >
        <div className="relative z-10 space-y-5">
          {/* Card Top Row: Brand & Microchip */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs shadow-xs">
                <IdCard className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold tracking-widest text-indigo-700 uppercase block leading-none">
                  EduID Identity Card
                </span>
                <span className="text-[9px] text-slate-400">Verified Student Node</span>
              </div>
            </div>

            {/* Smart Holographic Chip */}
            <div className="flex h-7 w-9 items-center justify-center rounded-md border border-amber-300 bg-amber-50 p-1">
              <div className="h-full w-full rounded border border-amber-400 bg-amber-200/50" />
            </div>
          </div>

          {/* Student Info Row */}
          <div className="flex items-center gap-4 pt-1">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-0.5 overflow-hidden shadow-xs">
              {student.avatarUrl || student.photoURL ? (
                <img src={student.avatarUrl || student.photoURL} alt={student.fullName} className="h-full w-full object-cover rounded-xl" />
              ) : (
                <User className="h-8 w-8 text-indigo-600" />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                {student.fullName}
              </h3>
              <p className="text-xs font-medium text-indigo-600">{student.educationLevel}</p>
              <p className="text-[11px] text-slate-500 truncate max-w-[190px]">
                {student.institutionName}
              </p>
            </div>
          </div>

          {/* EduID Box with Copy & QR */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div>
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">
                Permanent EduID
              </span>
              <span className="font-mono text-sm font-extrabold tracking-wider text-indigo-700">
                {student.eduId}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCopy}
                className="h-8 w-8 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
                title="Copy EduID"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setQrOpen(true)}
                className="h-8 w-8 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
                title="Open QR Code"
              >
                <QrCode className="h-4 w-4 text-indigo-600" />
              </Button>
            </div>
          </div>

          {/* Profile Completion Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Profile Strength</span>
              <span className="font-mono font-bold text-indigo-600">{student.profileCompletion}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-600"
                style={{ width: `${student.profileCompletion}%` }}
              />
            </div>
          </div>

          {/* Card Footer Link */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Active Student
            </span>
            <Link
              to="/profile"
              className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 text-[11px] group transition-colors"
            >
              <span>View Full Profile</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* QR Code Verification Modal */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 sm:max-w-sm text-center shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Verified EduID QR Code</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Scan this code to verify student credentials on institutional terminals.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs mx-auto w-48 h-48">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                `SMART_EDU_AI:${student.eduId}:${student.fullName}`
              )}`}
              alt="EduID QR Code"
              className="h-full w-full object-contain"
            />
          </div>

          <div className="space-y-1">
            <p className="font-mono text-sm font-black text-indigo-600">{student.eduId}</p>
            <p className="text-xs text-slate-600">{student.fullName}</p>
          </div>

          <Button
            onClick={() => setQrOpen(false)}
            className="mt-4 w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
          >
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};
