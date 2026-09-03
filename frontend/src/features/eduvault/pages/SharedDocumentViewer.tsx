import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  FolderLock,
  Lock,
  Download,
  Eye,
  ShieldCheck,
  FileText,
  AlertCircle,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { getShareByToken, recordShareAccess } from "../services/shareService";
import { getVaultDocumentById } from "../services/documentService";
import { resolveVaultFileUrl } from "../services/storageService";
import type { DocumentShare, VaultDocument } from "../types/eduvault.types";
import { VERIFICATION_STATUS_CONFIG } from "../constants/categories";
import { toast } from "sonner";

export const SharedDocumentViewer = () => {
  const { token } = useParams<{ token: string }>();

  const [share, setShare] = useState<DocumentShare | null>(null);
  const [document, setDocument] = useState<VaultDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Security challenge state
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [resolvedUrl, setResolvedUrl] = useState<string>("");

  useEffect(() => {
    if (document) {
      resolveVaultFileUrl(document.fileUrl, document.storagePath, document.id).then((url) => {
        if (url) setResolvedUrl(url);
      });
    }
  }, [document?.fileUrl, document?.storagePath, document?.id]);

  useEffect(() => {
    if (token) {
      loadShareData(token);
    }
  }, [token]);

  const loadShareData = async (accessToken: string) => {
    try {
      setLoading(true);
      setError(null);

      const shareData = await getShareByToken(accessToken);
      if (!shareData) {
        setError("Invalid or expired share link.");
        return;
      }

      if (!shareData.isActive) {
        setError("This share link has been revoked by the document owner.");
        return;
      }

      if (shareData.expiresAt && new Date(shareData.expiresAt).getTime() < Date.now()) {
        setError("This share link has expired.");
        return;
      }

      setShare(shareData);

      // If no password or OTP required, fetch document immediately
      if (!shareData.passwordProtected && !shareData.otpRequired) {
        const docObj = await getVaultDocumentById(shareData.documentId);
        if (docObj) {
          setDocument(docObj);
          setUnlocked(true);
          await recordShareAccess(shareData.id, shareData.accessCount);
        } else {
          setError("Document not found.");
        }
      }
    } catch (err: any) {
      console.error("Shared doc error:", err);
      setError(err.message || "Failed to load shared document");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!share) return;

    if (share.passwordProtected && !password) {
      toast.error("Password is required");
      return;
    }

    if (share.otpRequired && !otp) {
      toast.error("OTP code is required");
      return;
    }

    // Validate password if protected
    if (share.passwordProtected && share.passwordHash) {
      const buffer = new TextEncoder().encode(password);
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

      if (hashHex !== share.passwordHash) {
        toast.error("Incorrect password");
        return;
      }
    }

    // Validate OTP if required
    if (share.otpRequired && share.otpCode) {
      if (otp.trim() !== share.otpCode.trim()) {
        toast.error("Invalid OTP code");
        return;
      }
    }

    // Fetch document
    const docObj = await getVaultDocumentById(share.documentId);
    if (docObj) {
      setDocument(docObj);
      setUnlocked(true);
      await recordShareAccess(share.id, share.accessCount);
      toast.success("Document access granted!");
    } else {
      setError("Document not found.");
    }
  };

  const handleDownload = () => {
    const targetUrl = resolvedUrl || document?.fileUrl;
    if (!targetUrl) return;
    const link = window.document.createElement("a");
    link.href = targetUrl;
    link.download = document?.fileName || `${document?.documentName || "document"}.pdf`;
    link.target = "_blank";
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const isPdf = document?.mimeType?.includes("pdf") || document?.fileName?.toLowerCase().endsWith(".pdf");
  const isImage =
    document?.mimeType?.startsWith("image/") ||
    /\.(jpg|jpeg|png|webp|gif)$/i.test(document?.fileName || "");

  const statusCfg = document
    ? VERIFICATION_STATUS_CONFIG[document.verificationStatus] || VERIFICATION_STATUS_CONFIG.unverified
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-border/50 bg-card/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-md">
            <FolderLock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-foreground">SMART EDUCATION AI • EduVault</h1>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              National Verified Document Ledger
            </p>
          </div>
        </div>

        <Link to="/auth">
          <Button variant="outline" size="sm" className="rounded-xl text-xs">
            Sign In to EduVault
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full p-6 my-auto">
        {loading ? (
          <div className="py-20 text-center text-sm text-muted-foreground space-y-3">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Authenticating access token...</p>
          </div>
        ) : error ? (
          <Card className="rounded-3xl border-destructive/30 bg-destructive/5 p-8 text-center max-w-md mx-auto">
            <CardContent className="space-y-3 p-0">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <h3 className="text-lg font-bold text-foreground">Access Denied</h3>
              <p className="text-xs text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        ) : !unlocked ? (
          /* Password & OTP Challenge Form */
          <Card className="max-w-md mx-auto rounded-3xl border-border/70 bg-card/60 backdrop-blur-md p-6 shadow-lg">
            <CardContent className="space-y-4 p-0">
              <div className="text-center space-y-1">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Protected Document</h3>
                <p className="text-xs text-muted-foreground">
                  Shared by <strong>{share?.ownerName || "Student"}</strong>
                </p>
              </div>

              <form onSubmit={handleUnlock} className="space-y-3">
                {share?.passwordProtected && (
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Passcode</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter security password..."
                      className="rounded-xl h-10 text-xs"
                      required
                    />
                  </div>
                )}

                {share?.otpRequired && (
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">OTP Verification Code</Label>
                    <Input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP..."
                      className="rounded-xl h-10 text-xs"
                      required
                    />
                  </div>
                )}

                <Button type="submit" className="w-full rounded-xl gap-2 mt-2">
                  <KeyRound className="h-4 w-4" /> Unlock Document
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          /* Unlocked Document View */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-card/60 border border-border/70 backdrop-blur-md">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-foreground">{document?.documentName}</h2>
                  {statusCfg && (
                    <Badge variant="outline" className={`text-xs ${statusCfg.badgeClass}`}>
                      {statusCfg.label}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Owner: {share?.ownerName} • Permission: {share?.permission}
                </div>
              </div>

              {share?.permission === "VIEW_DOWNLOAD" && (
                <Button onClick={handleDownload} className="rounded-xl gap-2 shrink-0">
                  <Download className="h-4 w-4" /> Download Official File
                </Button>
              )}
            </div>

            {/* Document Preview Frame */}
            <div className="relative rounded-3xl border border-border/80 bg-background/80 overflow-hidden min-h-[450px] flex items-center justify-center p-4">
              {/* Watermark overlay if VIEW only */}
              {share?.permission === "VIEW" && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-10 rotate-[-25deg] select-none text-4xl font-extrabold text-foreground">
                  EDUVAULT VERIFIED • VIEW ONLY
                </div>
              )}

              {isImage && (resolvedUrl || document?.fileUrl) ? (
                <img
                  src={resolvedUrl || document?.fileUrl}
                  alt={document?.documentName}
                  className="max-h-[600px] w-auto max-w-full object-contain rounded-2xl shadow-sm"
                />
              ) : isPdf && (resolvedUrl || document?.fileUrl) ? (
                <iframe
                  src={resolvedUrl || document?.fileUrl}
                  title={document?.documentName}
                  className="w-full h-[600px] rounded-2xl border border-border/60"
                />
              ) : (
                <div className="text-center p-8 space-y-3">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
                  <p className="text-sm font-semibold">{document?.fileName}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-4 px-6 text-center text-xs text-muted-foreground">
        Secured with End-to-End Cryptographic Audit • SMART EDUCATION AI EduVault
      </footer>
    </div>
  );
};

export default SharedDocumentViewer;
