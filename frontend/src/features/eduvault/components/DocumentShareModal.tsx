import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Share2,
  Lock,
  QrCode,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  KeyRound,
  XCircle,
  Eye,
  Download,
  AlertCircle,
} from "lucide-react";
import type { VaultDocument, DocumentShare, DocumentPermission } from "../types/eduvault.types";
import { createDocumentShare, getSharesForDocument, revokeShare } from "../services/shareService";
import { toast } from "sonner";

export const DocumentShareModal = ({
  document,
  open,
  onOpenChange,
}: {
  document: VaultDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { user, profile } = useAuth();
  const [recipientEmail, setRecipientEmail] = useState("");
  const [permission, setPermission] = useState<DocumentPermission>("VIEW_DOWNLOAD");
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [password, setPassword] = useState("");
  const [requireOtp, setRequireOtp] = useState(false);

  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [activeShares, setActiveShares] = useState<DocumentShare[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (document && open) {
      setGeneratedLink(null);
      loadActiveShares(document.id);
    }
  }, [document?.id, open]);

  const loadActiveShares = async (docId: string) => {
    const shares = await getSharesForDocument(docId);
    setActiveShares(shares.filter((s) => s.isActive));
  };

  if (!document) return null;

  const handleCreateShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    if (passwordProtected && !password.trim()) {
      toast.error("Please enter a password for protection");
      return;
    }

    try {
      setLoading(true);
      const studentName = profile?.full_name || profile?.fullName || user.displayName || "Student";

      const { share, shareUrl } = await createDocumentShare({
        documentId: document.id,
        documentName: document.documentName,
        ownerId: user.uid,
        ownerName: studentName,
        recipientEmail,
        permission,
        expiresInDays,
        password: passwordProtected ? password : undefined,
        requireOtp,
      });

      setGeneratedLink(shareUrl);
      toast.success("Secure share link generated! 🔗");
      loadActiveShares(document.id);
    } catch (err: any) {
      toast.error(err.message || "Failed to create share link");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRevoke = async (shareId: string) => {
    if (!user?.uid) return;
    try {
      await revokeShare(shareId, user.uid);
      setActiveShares((prev) => prev.filter((s) => s.id !== shareId));
      toast.success("Share link revoked immediately 🚫");
    } catch (err: any) {
      toast.error("Failed to revoke share link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Share2 className="h-5 w-5 text-primary" /> Secure Document Sharing
          </DialogTitle>
        </DialogHeader>

        <div className="p-3.5 rounded-2xl bg-card/60 border border-border/70 text-xs">
          <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
            Sharing Document
          </span>
          <div className="font-bold text-sm text-foreground truncate mt-0.5">
            {document.documentName}
          </div>
        </div>

        {/* Form to create share */}
        <form onSubmit={handleCreateShare} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs font-semibold">Recipient Email (Optional)</Label>
              <Input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="e.g. recruiter@company.com"
                className="rounded-xl h-10 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Access Permission</Label>
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value as DocumentPermission)}
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="VIEW_DOWNLOAD">View + Download</option>
                <option value="VIEW">View Only (Watermarked)</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Link Expiration</Label>
              <select
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(Number(e.target.value))}
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value={1}>1 Day</option>
                <option value={7}>7 Days (Recommended)</option>
                <option value={30}>30 Days</option>
                <option value={0}>Never Expire</option>
              </select>
            </div>
          </div>

          {/* Password Protection Toggle */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-card/60 border border-border/70">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-foreground">Password Protect Link</span>
              </div>
              <Switch checked={passwordProtected} onCheckedChange={setPasswordProtected} />
            </div>

            {passwordProtected && (
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter access password..."
                className="rounded-xl h-9 text-xs mt-2"
                required
              />
            )}
          </div>

          {/* OTP Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-card/60 border border-border/70">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-primary" />
              <div>
                <div className="text-xs font-bold text-foreground">Require OTP Verification</div>
                <div className="text-[10px] text-muted-foreground">
                  Generates an OTP challenge for extra security
                </div>
              </div>
            </div>
            <Switch checked={requireOtp} onCheckedChange={setRequireOtp} />
          </div>

          <Button type="submit" disabled={loading} className="w-full rounded-xl gap-2">
            <Share2 className="h-4 w-4" /> {loading ? "Generating..." : "Generate Secure Link"}
          </Button>
        </form>

        {/* Generated Link Display */}
        {generatedLink && (
          <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-primary">
              <span>Your Secure Link is Ready</span>
              <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                Active
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Input
                value={generatedLink}
                readOnly
                className="bg-background text-xs h-10 rounded-xl"
              />
              <Button size="icon" onClick={handleCopy} className="h-10 w-10 rounded-xl shrink-0">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex justify-center pt-2">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                  generatedLink
                )}`}
                alt="Share QR"
                className="h-28 w-28 rounded-xl bg-white p-2 border border-border/60"
              />
            </div>
          </div>
        )}

        {/* Active Shares List */}
        {activeShares.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Active Share Links ({activeShares.length})
            </h5>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {activeShares.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-2xl border border-border/60 bg-card/40 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground truncate">
                      {s.recipientEmail || "Public Access Link"}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Permission: {s.permission} • Accesses: {s.accessCount || 0}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRevoke(s.id)}
                    className="text-xs text-destructive hover:text-destructive gap-1 h-8 rounded-xl shrink-0"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Revoke
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
