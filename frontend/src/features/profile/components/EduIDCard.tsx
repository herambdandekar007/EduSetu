// frontend/src/features/profile/components/EduIDCard.tsx
// Pure Minimalist White & Grayscale Edu Identity Section for SMART EDUCATION AI

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, ShieldCheck, QrCode, FileText, Download } from "lucide-react";
import type { StudentPersonalProfile, EducationDetails } from "../types/profile.types";
import { toast } from "sonner";

interface EduIDCardProps {
  profile: StudentPersonalProfile;
  education?: EducationDetails | null;
  qrModalOpen?: boolean;
  onSetQrModalOpen?: (open: boolean) => void;
}

export const EduIDCard: React.FC<EduIDCardProps> = ({
  profile,
  education,
}) => {
  const [copied, setCopied] = useState(false);

  const eduId = profile.eduId || "EDU-IND-XXXXXXXX";

  const handleCopyEduId = async () => {
    try {
      await navigator.clipboard.writeText(eduId);
      setCopied(true);
      toast.success("EduID copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy EduID");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* ── Main EduID Card ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8 text-black shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-5">
          <div>
            <h2 className="text-lg font-bold text-black flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-700" />
              Edu Identity (EduID)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Your permanent, verified national educational identifier under Smart Education AI.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-9 rounded-lg border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Download / Print
            </Button>
          </div>
        </div>

        {/* Identity Box */}
        <div className="rounded-xl border border-gray-300 bg-gray-50 p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                Permanent Educational ID
              </span>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-black">
                  {eduId}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyEduId}
                  className="h-8 rounded-md border-gray-300 bg-white px-2.5 text-xs text-gray-700 hover:text-black hover:bg-gray-100"
                >
                  {copied ? (
                    <>
                      <Check className="mr-1 h-3.5 w-3.5 text-black" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-3.5 w-3.5" />
                      Copy ID
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800">
              <ShieldCheck className="h-4 w-4 text-gray-700" />
              Status: Verified & Active
            </div>
          </div>

          {/* Connected Identity Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-xs">
            <div className="space-y-1">
              <span className="text-gray-500 font-medium">Student Name</span>
              <p className="font-semibold text-black">{profile.fullName || "Aditya Wargade"}</p>
            </div>

            <div className="space-y-1">
              <span className="text-gray-500 font-medium">Registered Email</span>
              <p className="font-semibold text-black">{profile.email || "student@education.gov.in"}</p>
            </div>

            <div className="space-y-1">
              <span className="text-gray-500 font-medium">Education Level</span>
              <p className="font-semibold text-black">
                {education?.educationLevel || profile.education_level || "College / University"}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-gray-500 font-medium">Institution Node</span>
              <p className="font-semibold text-black">
                {education?.institutionName || education?.collegeName || "COEP Technological University"}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-gray-500 font-medium">State Registry</span>
              <p className="font-semibold text-black">{profile.state || "Maharashtra"}</p>
            </div>

            <div className="space-y-1">
              <span className="text-gray-500 font-medium">Verification Protocol</span>
              <p className="font-semibold text-black">Smart Education AI Standard v2.0</p>
            </div>
          </div>

          {/* Notice */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-xs text-gray-600 space-y-1">
            <p className="font-semibold text-black">Permanent Identity Guarantee:</p>
            <p>
              Your EduID is permanently linked to your records across AI tutoring, speech labs, credentials vault, and academic institutions. Updating your profile details will never change your EduID.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
