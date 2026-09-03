import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  ShieldCheck,
  Clock,
  HardDrive,
  Upload,
  Camera,
  Search,
  Share2,
  AlertTriangle,
  FileCheck,
  Star,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import type { VaultStats, VaultDocument } from "../types/eduvault.types";
import { VERIFICATION_STATUS_CONFIG } from "../constants/categories";

const formatBytes = (bytes: number, decimals: number = 1): string => {
  if (!bytes) return "0 MB";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const EduVaultDashboard = ({
  stats,
  onUploadClick,
  onScanClick,
  onSearchClick,
  onShareClick,
  onVerifyClick,
  onDocumentClick,
  onViewAllClick,
}: {
  stats: VaultStats;
  onUploadClick: () => void;
  onScanClick: () => void;
  onSearchClick: () => void;
  onShareClick: () => void;
  onVerifyClick: () => void;
  onDocumentClick: (doc: VaultDocument) => void;
  onViewAllClick: () => void;
}) => {
  const percentUsed = Math.min(
    100,
    Math.round((stats.storageUsedBytes / (stats.storageQuotaBytes || 1)) * 100)
  );

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Documents */}
        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm shadow-sm hover:border-primary/40 transition-all">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {stats.totalDocuments}
              </div>
              <div className="text-xs font-medium text-muted-foreground truncate">
                Total Documents
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verified Documents */}
        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm shadow-sm hover:border-emerald-500/40 transition-all">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {stats.totalVerified}
              </div>
              <div className="text-xs font-medium text-muted-foreground truncate">
                Verified Credentials
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Verification */}
        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm shadow-sm hover:border-amber-500/40 transition-all">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {stats.pendingVerification}
              </div>
              <div className="text-xs font-medium text-muted-foreground truncate">
                Pending Verification
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage Quota */}
        <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm shadow-sm hover:border-violet-500/40 transition-all">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <HardDrive className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground">{formatBytes(stats.storageUsedBytes)}</span>
                <span className="text-muted-foreground text-[10px]">
                  of {formatBytes(stats.storageQuotaBytes)}
                </span>
              </div>
              <Progress value={percentUsed} className="h-1.5 mt-2 bg-muted/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Warning Alert */}
      {stats.expiringCount > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
            <div className="text-xs">
              <strong>{stats.expiringCount} document(s) expiring within 30 days.</strong> Please review or re-issue renewals.
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={onViewAllClick} className="rounded-xl text-xs h-8">
            View Expiring
          </Button>
        </div>
      )}

      {/* Quick Action Dock */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Quick Actions
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <Button
            onClick={onUploadClick}
            className="flex flex-col items-center justify-center h-20 rounded-2xl gap-2 shadow-sm"
          >
            <Upload className="h-5 w-5" />
            <span className="text-xs font-semibold">Upload Doc</span>
          </Button>

          <Button
            onClick={onScanClick}
            variant="outline"
            className="flex flex-col items-center justify-center h-20 rounded-2xl gap-2 border-border/70 hover:bg-muted/60"
          >
            <Camera className="h-5 w-5 text-primary" />
            <span className="text-xs font-semibold">Scan with Camera</span>
          </Button>

          <Button
            onClick={onSearchClick}
            variant="outline"
            className="flex flex-col items-center justify-center h-20 rounded-2xl gap-2 border-border/70 hover:bg-muted/60"
          >
            <Search className="h-5 w-5 text-indigo-500" />
            <span className="text-xs font-semibold">Smart Search</span>
          </Button>

          <Button
            onClick={onShareClick}
            variant="outline"
            className="flex flex-col items-center justify-center h-20 rounded-2xl gap-2 border-border/70 hover:bg-muted/60"
          >
            <Share2 className="h-5 w-5 text-cyan-500" />
            <span className="text-xs font-semibold">Share Securely</span>
          </Button>

          <Button
            onClick={onVerifyClick}
            variant="outline"
            className="flex flex-col items-center justify-center h-20 rounded-2xl gap-2 border-border/70 hover:bg-muted/60 col-span-2 sm:col-span-1"
          >
            <FileCheck className="h-5 w-5 text-emerald-500" />
            <span className="text-xs font-semibold">Verify Credential</span>
          </Button>
        </div>
      </div>

      {/* Recent Uploads Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" /> Recent Documents
          </h4>
          {stats.totalDocuments > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewAllClick}
              className="text-xs text-primary hover:text-primary/80 gap-1"
            >
              View All ({stats.totalDocuments}) <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {stats.recentUploads.length === 0 ? (
          <Card className="rounded-2xl border-dashed border-2 border-border/80 bg-muted/20">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <FileText className="h-6 w-6" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h5 className="font-semibold text-foreground text-sm">No documents uploaded yet</h5>
                <p className="text-xs text-muted-foreground">
                  Upload your degrees, mark sheets, certificates, or resumes to build your secure digital vault.
                </p>
              </div>
              <Button onClick={onUploadClick} size="sm" className="rounded-xl gap-2">
                <Upload className="h-4 w-4" /> Upload First Document
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {stats.recentUploads.map((doc) => {
              const statusCfg =
                VERIFICATION_STATUS_CONFIG[doc.verificationStatus] ||
                VERIFICATION_STATUS_CONFIG.unverified;
              return (
                <motion.div
                  key={doc.id}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.15 }}
                >
                  <Card
                    onClick={() => onDocumentClick(doc)}
                    className="cursor-pointer rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm hover:border-primary/40 hover:shadow-md transition-all h-full"
                  >
                    <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5" />
                          </div>
                          <Badge variant="outline" className={`text-[10px] ${statusCfg.badgeClass}`}>
                            {statusCfg.label}
                          </Badge>
                        </div>
                        <h5 className="font-bold text-sm text-foreground line-clamp-1">
                          {doc.documentName}
                        </h5>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {doc.category} • {doc.type}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{formatBytes(doc.fileSize)}</span>
                        {doc.isFavorite && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
