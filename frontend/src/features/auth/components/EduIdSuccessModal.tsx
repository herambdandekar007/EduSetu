// frontend/src/features/auth/components/EduIdSuccessModal.tsx
// Animated 3D EduID Generation Celebratory Success Screen

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Copy, Check, ArrowRight, ShieldCheck, Award, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EduId3DCard } from "./EduId3DCard";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface EduIdSuccessModalProps {
  studentName: string;
  email: string;
  eduId: string;
  onContinue: () => void;
}

export const EduIdSuccessModal: React.FC<EduIdSuccessModalProps> = ({
  studentName,
  email,
  eduId,
  onContinue,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyEduId = () => {
    navigator.clipboard.writeText(eduId);
    setCopied(true);
    toast.success("EduID copied to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-slate-950/80 p-7 md:p-8 text-center text-white shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-3xl"
    >
      {/* Radiant celebratory glow halo */}
      <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500/30 via-indigo-500/40 to-pink-500/30 blur-xl opacity-80" />

      <div className="relative z-10 space-y-5">
        {/* Badge & Heading */}
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-[11px] font-bold text-emerald-300 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>AUTHENTICATED LIFELONG CREDENTIAL</span>
          </div>

          <h2 className="mt-3 text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            🎉 Your EduID is Ready!
          </h2>
          <p className="text-xs text-indigo-200/80 mt-1 max-w-md mx-auto">
            One Student. One EduID. One Lifelong Education Journey.
          </p>
        </div>

        {/* 3D Holographic EduID Card Display */}
        <div className="my-2">
          <EduId3DCard
            studentName={studentName.toUpperCase()}
            eduId={eduId}
            educationLevel="Verified Student • Smart Education AI"
          />
        </div>

        {/* EduID Copy Pill */}
        <div className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/5 p-3 backdrop-blur-md">
          <div className="text-left">
            <div className="text-[10px] font-mono uppercase tracking-wider text-indigo-300/70">
              YOUR PERMANENT EDU-ID
            </div>
            <div className="font-mono text-base font-black tracking-wider text-white">
              {eduId}
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={handleCopyEduId}
            variant="outline"
            className="border-white/20 bg-white/10 text-white hover:bg-white/20 text-xs h-9"
          >
            {copied ? (
              <>
                <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied</span>
              </>
            ) : (
              <>
                <Copy className="mr-1.5 h-3.5 w-3.5 text-indigo-300" />
                <span>Copy EduID</span>
              </>
            )}
          </Button>
        </div>

        {/* Informative Explanation */}
        <p className="text-[11px] text-white/60 leading-relaxed max-w-md mx-auto">
          Your <strong>EduID</strong> is your permanent identity across your learning, achievements,
          career journey, verified documents in EduVault, and personalized AI guidance.
        </p>

        {/* Primary CTA */}
        <Button
          type="button"
          onClick={onContinue}
          className="h-12 w-full rounded-2xl bg-gradient-to-r from-emerald-500 via-indigo-600 to-purple-600 font-extrabold text-white text-sm shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all hover:opacity-95 hover:scale-[1.01] active:scale-[0.98]"
        >
          <span>Enter Smart Education AI Dashboard</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};
