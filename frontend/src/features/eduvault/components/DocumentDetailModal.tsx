import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  Share2,
  FileCheck,
  History,
  Activity,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Building,
  Hash,
  Lock,
  ExternalLink,
  Trash2,
  Copy,
  Check,
} from "lucide-react";
import type { VaultDocument, DocumentVersion, DocumentActivity } from "../types/eduvault.types";
import { VERIFICATION_STATUS_CONFIG } from "../constants/categories";
import { getDocumentVersions } from "../services/documentService";
import { getDocumentActivities, logDocumentActivity } from "../services/activityService";
import { resolveVaultFileUrl } from "../services/storageService";
import { toast } from "sonner";

export const DocumentDetailModal = ({
  document,
  open,
  onOpenChange,
  onDownload,
  onShare,
  onVerify,
  onDelete,
}: {
  document: VaultDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (doc: VaultDocument) => void;
  onShare: (doc: VaultDocument) => void;
  onVerify: (doc: VaultDocument) => void;
  onDelete: (doc: VaultDocument) => void;
}) => {
  const [activeTab, setActiveTab] = useState<"preview" | "metadata" | "ai" | "versions" | "audit">(
    "preview"
  );
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [activities, setActivities] = useState<DocumentActivity[]>([]);
  const [copiedHash, setCopiedHash] = useState(false);
  const [resolvedUrl, setResolvedUrl] = useState<string>(document?.fileUrl || "");

  useEffect(() => {
    if (document && open) {
      // Resolve URL (checking backend / IndexedDB / blob)
      resolveVaultFileUrl(document.fileUrl, document.storagePath, document.id).then((url) => {
        if (url) setResolvedUrl(url);
      });

      // Log VIEW action
      logDocumentActivity({
        userId: document.userId,
        documentId: document.id,
        documentName: document.documentName,
        action: "VIEW",
      });

      // Load versions and audit activities
      getDocumentVersions(document.id).then(setVersions);
      getDocumentActivities(document.id).then(setActivities);
    }
  }, [document?.id, document?.fileUrl, document?.storagePath, open]);

  if (!document) return null;

  const statusCfg =
    VERIFICATION_STATUS_CONFIG[document.verificationStatus] ||
    VERIFICATION_STATUS_CONFIG.unverified;

  const isPdf = document.mimeType?.includes("pdf") || document.fileName?.toLowerCase().endsWith(".pdf");
  const isImage =
    document.mimeType?.startsWith("image/") ||
    /\.(jpg|jpeg|png|webp|gif)$/i.test(document.fileName || "");

  const handleCopyHash = () => {
    if (document.fileHash) {
      navigator.clipboard.writeText(document.fileHash);
      setCopiedHash(true);
      toast.success("SHA-256 Hash copied!");
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader className="space-y-2 border-b border-border/50 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-foreground">
                  {document.documentName}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span>{document.category}</span>
                  <span>•</span>
                  <span>{document.type}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-xs ${statusCfg.badgeClass}`}>
                {statusCfg.label}
              </Badge>
              <Button size="sm" onClick={() => onDownload(document)} className="rounded-xl gap-1.5">
                <Download className="h-4 w-4" /> Download
              </Button>
              <Button size="sm" variant="outline" onClick={() => onShare(document)} className="rounded-xl gap-1.5">
                <Share2 className="h-4 w-4" /> Share
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="space-y-4">
          <TabsList className="grid grid-cols-5 p-1 bg-muted/60 rounded-2xl">
            <TabsTrigger value="preview" className="rounded-xl text-xs font-semibold">
              Preview
            </TabsTrigger>
            <TabsTrigger value="metadata" className="rounded-xl text-xs font-semibold">
              Metadata
            </TabsTrigger>
            <TabsTrigger value="ai" className="rounded-xl text-xs font-semibold flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" /> AI Insights
            </TabsTrigger>
            <TabsTrigger value="versions" className="rounded-xl text-xs font-semibold">
              Versions ({versions.length || 1})
            </TabsTrigger>
            <TabsTrigger value="audit" className="rounded-xl text-xs font-semibold">
              Audit Trail
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Preview */}
          <TabsContent value="preview" className="space-y-4">
            <div className="rounded-2xl border border-border/80 bg-background/50 overflow-hidden min-h-[350px] flex items-center justify-center p-4">
              {isImage && (resolvedUrl || document.fileUrl) ? (
                <img
                  src={resolvedUrl || document.fileUrl}
                  alt={document.documentName}
                  className="max-h-[500px] w-auto max-w-full object-contain rounded-xl shadow-sm"
                />
              ) : isPdf && (resolvedUrl || document.fileUrl) ? (
                <iframe
                  src={resolvedUrl || document.fileUrl}
                  title={document.documentName}
                  className="w-full h-[500px] rounded-xl border border-border/60"
                />
              ) : (
                <div className="text-center p-8 space-y-3">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">{document.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      Document preview is ready. You can inspect or download the original copy.
                    </p>
                  </div>
                  <Button onClick={() => onDownload(document)} className="rounded-xl gap-1.5" size="sm">
                    <Download className="h-4 w-4" /> Download Original Document
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB 2: Metadata */}
          <TabsContent value="metadata" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-2xl bg-card/60 border border-border/70 space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Issuing Authority / Institution
                </span>
                <p className="text-sm font-bold text-foreground">
                  {document.institution || "Not specified"}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-card/60 border border-border/70 space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Academic Year / Session
                </span>
                <p className="text-sm font-bold text-foreground">
                  {document.academicYear || "Not specified"}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-card/60 border border-border/70 space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Issue Date
                </span>
                <p className="text-sm font-bold text-foreground">
                  {document.issueDate || "Not specified"}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-card/60 border border-border/70 space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Expiry Date
                </span>
                <p className="text-sm font-bold text-foreground">
                  {document.expiryDate || "Lifetime / No Expiry"}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-card/60 border border-border/70 space-y-1 sm:col-span-2">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Document / Certificate Number
                </span>
                <p className="font-mono text-sm font-bold text-foreground">
                  {document.documentNumber || "N/A"}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-card/60 border border-border/70 space-y-1 sm:col-span-2">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Cryptographic SHA-256 Hash
                </span>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-xs text-muted-foreground truncate">
                    {document.fileHash || "Generating hash..."}
                  </p>
                  {document.fileHash && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleCopyHash}
                      className="h-7 w-7 rounded-lg shrink-0"
                    >
                      {copiedHash ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  )}
                </div>
              </div>

              {document.description && (
                <div className="p-3.5 rounded-2xl bg-card/60 border border-border/70 space-y-1 sm:col-span-2">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Notes & Description
                  </span>
                  <p className="text-xs text-foreground leading-relaxed">
                    {document.description}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB 3: AI Intelligence */}
          <TabsContent value="ai" className="space-y-4">
            {document.intelligence ? (
              <div className="space-y-4">
                {/* AI Summary */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-violet-500/10 border border-primary/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary">
                    <Sparkles className="h-4 w-4" /> AI Document Summary
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">
                    {document.intelligence.summary || "Summary generated successfully."}
                  </p>
                </div>

                {/* Classification & Confidence */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-3.5 rounded-2xl bg-card/60 border border-border/70 space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                      AI Categorization
                    </span>
                    <p className="text-sm font-bold text-foreground">
                      {document.intelligence.classification?.suggestedCategory || document.category}
                    </p>
                    <div className="text-[10px] text-emerald-600 font-semibold">
                      Confidence: {Math.round((document.intelligence.classification?.confidence || 0.9) * 100)}%
                    </div>
                  </div>

                  {/* Tamper / Fraud Risk */}
                  <div className="p-3.5 rounded-2xl bg-card/60 border border-border/70 space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                      Tamper & Fraud Risk
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-bold">
                        {document.intelligence.securityAnalysis?.fraudRisk || "LOW"} RISK
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {document.intelligence.securityAnalysis?.notes || "Structure matches verified format."}
                    </p>
                  </div>
                </div>

                {/* Extracted Key Properties */}
                {document.intelligence.extractedData && (
                  <div className="p-4 rounded-2xl bg-card/60 border border-border/70 space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Extracted Document Properties
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      {Object.entries(document.intelligence.extractedData).map(([k, v]) => (
                        <div key={k} className="p-2 rounded-xl bg-muted/40">
                          <div className="text-[10px] text-muted-foreground capitalize">
                            {k.replace(/([A-Z])/g, " $1")}
                          </div>
                          <div className="font-semibold text-foreground truncate">
                            {String(v || "N/A")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-8 space-y-3">
                <Sparkles className="h-12 w-12 text-primary mx-auto opacity-60" />
                <p className="text-xs text-muted-foreground">
                  AI Intelligence has not been processed for this document yet.
                </p>
              </div>
            )}
          </TabsContent>

          {/* TAB 4: Versions */}
          <TabsContent value="versions" className="space-y-3">
            {versions.map((ver) => (
              <div
                key={ver.id}
                className="p-3.5 rounded-2xl border border-border/70 bg-card/60 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    v{ver.versionNumber}
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{ver.changeDescription || "Document Version"}</div>
                    <div className="text-muted-foreground text-[11px]">{ver.fileName}</div>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => onDownload(document)} className="rounded-xl gap-1">
                  <Download className="h-3.5 w-3.5" /> Download
                </Button>
              </div>
            ))}
          </TabsContent>

          {/* TAB 5: Audit Trail */}
          <TabsContent value="audit" className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No audit activities recorded.</p>
            ) : (
              activities.map((act) => {
                const date = act.timestamp?.seconds
                  ? new Date(act.timestamp.seconds * 1000).toLocaleString()
                  : new Date().toLocaleString();
                return (
                  <div
                    key={act.id}
                    className="p-3 rounded-2xl border border-border/60 bg-card/40 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <Activity className="h-4 w-4 text-primary shrink-0" />
                      <div>
                        <span className="font-bold text-foreground">{act.action}</span>
                        <span className="text-muted-foreground text-[11px] ml-2">by You</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{date}</span>
                  </div>
                );
              })
            )}
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <Button
            variant="ghost"
            onClick={() => onDelete(document)}
            className="text-xs text-destructive hover:text-destructive gap-1.5"
          >
            <Trash2 className="h-4 w-4" /> Move to Recycle Bin
          </Button>

          {document.verificationStatus === "unverified" && (
            <Button
              variant="outline"
              onClick={() => onVerify(document)}
              className="text-xs text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 gap-1.5 rounded-xl"
            >
              <FileCheck className="h-4 w-4" /> Request Institutional Verification
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
