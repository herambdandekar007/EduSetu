import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Copy,
  Check,
  QrCode,
  GraduationCap,
  Sparkles,
  Building,
  Calendar,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const EduVaultIdentityBanner = ({
  verifiedCount = 0,
  totalCount = 0,
}: {
  verifiedCount?: number;
  totalCount?: number;
}) => {
  const { user, profile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const eduId = profile?.eduId || `EDU-${user?.uid?.substring(0, 8).toUpperCase() || "8F4K29XM"}`;
  const studentName = profile?.full_name || profile?.fullName || user?.displayName || "Student";
  const educationLevel =
    profile?.educationProfile?.educationLevel || profile?.education_level || "Undergraduate";
  const institution =
    profile?.educationProfile?.boardOrUniversity ||
    profile?.educationProfile?.degreeOrCourse ||
    "National Skill & Higher Education";
  const academicYear =
    profile?.educationProfile?.year ||
    profile?.educationProfile?.classOrGrade ||
    new Date().getFullYear().toString();

  const handleCopyEduId = () => {
    navigator.clipboard.writeText(eduId);
    setCopied(true);
    toast.success("EduID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-card/90 via-card/60 to-primary/5 p-6 backdrop-blur-md shadow-sm">
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Identity Info */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-violet-600 text-white shadow-md">
              <GraduationCap className="h-8 w-8" />
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-background">
                <ShieldCheck className="h-3.5 w-3.5 text-white" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-extrabold tracking-tight text-foreground">
                  {studentName}
                </h3>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-semibold gap-1">
                  <ShieldCheck className="h-3 w-3" /> Verified Student Identity
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building className="h-3.5 w-3.5 text-primary" /> {institution}
                </span>
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5 text-primary" /> {educationLevel}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-primary" /> Year: {academicYear}
                </span>
              </div>
            </div>
          </div>

          {/* Permanent EduID Badge & QR */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/80 bg-background/80 px-4 py-2.5 shadow-sm w-full sm:w-auto">
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                  National Permanent EduID
                </p>
                <div className="font-mono text-base font-extrabold text-foreground tracking-wider">
                  {eduId}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleCopyEduId}
                  className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                  title="Copy EduID"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowQr(true)}
                  className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                  title="Show QR Code"
                >
                  <QrCode className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Cryptographic Trust Capsule */}
            <div className="flex items-center gap-2 rounded-2xl bg-primary/10 border border-primary/20 px-3.5 py-2.5 text-xs text-primary font-medium">
              <Lock className="h-4 w-4 shrink-0" />
              <span>
                <strong>{verifiedCount}</strong> of <strong>{totalCount}</strong> Credentials Verified
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQr} onOpenChange={setShowQr}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" /> EduID Digital Pass
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
            <div className="p-4 bg-white rounded-2xl shadow-md border border-border/40">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  `https://divyangai.gov.in/verify/eduid/${eduId}`
                )}`}
                alt="EduID QR Code"
                className="h-44 w-44"
              />
            </div>
            <div className="space-y-1">
              <div className="font-mono text-lg font-bold text-foreground">{eduId}</div>
              <p className="text-xs text-muted-foreground">
                Institutions & Employers can scan this QR code to verify your credentials on the national ledger.
              </p>
            </div>
            <Button onClick={() => setShowQr(false)} className="w-full rounded-xl">
              Close Pass
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
