// features/performance/components/CertificatesView.tsx
// Certificates & Verified Credentials section integrated with EduVault

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ScrollText,
  ShieldCheck,
  Calendar,
  Building,
  ExternalLink,
  Plus,
  ArrowRight,
  Award,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { PerformanceOverviewStats } from "../types/performance.types";

interface CertificatesViewProps {
  stats: PerformanceOverviewStats;
}

export const CertificatesView: React.FC<CertificatesViewProps> = ({ stats }) => {
  const navigate = useNavigate();

  const certificates = [
    {
      id: "cert1",
      title: "Certified Fullstack Software Engineer (React & Node.js)",
      issuer: "National Skill Development Corporation (NSDC)",
      issueDate: "2026-02-15",
      credentialId: "NSDC-2026-CS8891",
      verified: true,
      category: "Technical Certification",
      hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    },
    {
      id: "cert2",
      title: "Advanced Database Management & Distributed SQL",
      issuer: "State Technical University / NPTEL",
      issueDate: "2026-01-20",
      credentialId: "NPTEL-DB-99412",
      verified: true,
      category: "Academic Credential",
      hash: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
    },
    {
      id: "cert3",
      title: "AI & Machine Learning Foundations Certificate",
      issuer: "AICTE / Smart India Learning Mission",
      issueDate: "2025-12-10",
      credentialId: "AICTE-ML-2025-004",
      verified: true,
      category: "Innovation & AI",
      hash: "3a5c88b0a991f8682a32c2c069b18ef22ff8397a61d19d690a61ee4f14d8745c",
    },
    {
      id: "cert4",
      title: "Smart India Hackathon Finalist Certificate",
      issuer: "Ministry of Education Innovation Cell (MIC)",
      issueDate: "2026-02-28",
      credentialId: "SIH-2026-FIN-990",
      verified: true,
      category: "Hackathon & Innovation",
      hash: "a45f901198c21a349bcde4c8996fb92427ae41e4649b934ca495991b7852c999",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. EduVault Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border/70 bg-gradient-to-r from-teal-500/10 via-primary/5 to-transparent backdrop-blur-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-[10px] bg-teal-600">
              EduVault Cryptographic Lock
            </Badge>
            <span className="text-xs text-muted-foreground">
              SHA-256 Audit Verified
            </span>
          </div>
          <h3 className="text-base font-bold text-foreground">
            Official Certificates & Micro-Credentials
          </h3>
          <p className="text-xs text-muted-foreground">
            Securely stored in your decentralized EduVault locker, instantly shareable with recruiters and educators.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => navigate("/eduvault")}
          className="rounded-xl text-xs gap-2 shrink-0 h-9 bg-teal-600 hover:bg-teal-700 text-white"
        >
          Open EduVault Locker
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* 2. Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {certificates.map((cert) => (
          <Card
            key={cert.id}
            className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {cert.category}
                    </Badge>
                    {cert.verified && (
                      <span className="flex items-center gap-1 text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                        <ShieldCheck className="h-3.5 w-3.5" /> Verified Cryptographically
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-foreground leading-snug pt-1">
                    {cert.title}
                  </h4>
                </div>

                <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 shrink-0">
                  <ScrollText className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-1 text-xs text-muted-foreground bg-muted/40 p-3 rounded-xl border border-border/40">
                <div className="flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate font-medium text-foreground">{cert.issuer}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span>ID: <code className="font-mono text-[11px]">{cert.credentialId}</code></span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {cert.issueDate}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                <span className="font-mono text-[9px] text-muted-foreground/80 truncate max-w-[200px]">
                  HASH: {cert.hash.substring(0, 18)}...
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/eduvault")}
                  className="text-xs text-primary hover:underline h-7 p-0 gap-1 font-semibold"
                >
                  View in EduVault <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
