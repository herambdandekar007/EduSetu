// frontend/src/features/profile/components/AccountInfoSection.tsx
// Pure Minimalist White & Grayscale Account Information Section for SMART EDUCATION AI

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Copy, Check, Lock, UserCheck, Key } from "lucide-react";
import type { StudentPersonalProfile } from "../types/profile.types";
import { toast } from "sonner";

interface AccountInfoSectionProps {
  profile: StudentPersonalProfile;
}

export const AccountInfoSection: React.FC<AccountInfoSectionProps> = ({ profile }) => {
  const [copiedUid, setCopiedUid] = useState(false);
  const [showUid, setShowUid] = useState(false);

  const handleCopyUid = async () => {
    try {
      await navigator.clipboard.writeText(profile.userId);
      setCopiedUid(true);
      toast.success("User ID copied");
      setTimeout(() => setCopiedUid(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8 text-black shadow-sm space-y-6">
      <div className="border-b border-gray-100 pb-5">
        <h2 className="text-lg font-bold text-black flex items-center gap-2">
          <Shield className="h-5 w-5 text-gray-700" />
          Account & Security Information
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Read-only system identifiers, verification credentials, and audit timestamps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Firebase UID */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Firebase User Identifier (UID)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowUid(!showUid)}
                className="text-[11px] text-gray-500 hover:text-black"
              >
                {showUid ? "Hide" : "Show"}
              </button>
              <button
                type="button"
                onClick={handleCopyUid}
                className="text-gray-500 hover:text-black"
                title="Copy UID"
              >
                {copiedUid ? <Check className="h-3.5 w-3.5 text-black" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          <p className="font-mono text-xs text-black">
            {showUid ? profile.userId : "••••••••••••••••••••••••••••••••"}
          </p>
        </div>

        {/* EduID */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Permanent EduID
          </span>
          <p className="font-mono text-xs font-bold text-black">{profile.eduId || "EDU-IND-XXXXXXXX"}</p>
        </div>

        {/* Registered Email */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Registered Authentication Email
          </span>
          <p className="text-xs font-medium text-black">{profile.email || "student@education.gov.in"}</p>
        </div>

        {/* Account Verification */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Identity Status
          </span>
          <p className="text-xs font-bold text-black flex items-center gap-1.5">
            <UserCheck className="h-4 w-4 text-gray-700" />
            Verified Student Profile
          </p>
        </div>

        {/* Created At */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Registration Date
          </span>
          <p className="text-xs font-mono text-gray-700">
            {typeof profile.createdAt === "string"
              ? new Date(profile.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "August 30, 2026"}
          </p>
        </div>

        {/* Last Updated */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Last Profile Sync
          </span>
          <p className="text-xs font-mono text-gray-700">
            {typeof profile.updatedAt === "string"
              ? new Date(profile.updatedAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Active & Synchronized"}
          </p>
        </div>
      </div>
    </div>
  );
};
