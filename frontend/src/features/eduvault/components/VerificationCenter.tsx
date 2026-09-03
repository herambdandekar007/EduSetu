import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  FileCheck,
  ShieldCheck,
  Clock,
  XCircle,
  Building,
  CheckCircle2,
  Send,
  Sparkles,
  ExternalLink,
  Award,
} from "lucide-react";
import type { VaultDocument, VerificationRequest } from "../types/eduvault.types";
import {
  requestDocumentVerification,
  getVerificationRequestsByStudent,
  updateVerificationStatus,
} from "../services/verificationService";
import { toast } from "sonner";

export const VerificationCenter = ({
  documents,
  onRefresh,
}: {
  documents: VaultDocument[];
  onRefresh: () => void;
}) => {
  const { user, profile } = useAuth();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Request modal state
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadRequests();
    }
  }, [user?.uid]);

  const loadRequests = async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const data = await getVerificationRequestsByStudent(user.uid);
      setRequests(data);
    } catch (err) {
      console.error("Error loading verification requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRequest = (docId?: string) => {
    if (docId) setSelectedDocId(docId);
    else if (unverifiedDocs.length > 0) setSelectedDocId(unverifiedDocs[0].id);
    setInstitutionName(profile?.educationProfile?.boardOrUniversity || "");
    setRequestModalOpen(true);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !selectedDocId) return;

    const docObj = documents.find((d) => d.id === selectedDocId);
    if (!docObj) return;

    try {
      setSubmitting(true);
      await requestDocumentVerification({
        documentId: docObj.id,
        documentName: docObj.documentName,
        studentId: user.uid,
        studentName: profile?.full_name || user.displayName || "Student",
        eduId: profile?.eduId || "",
        institutionName: institutionName || "Issuing University",
      });

      toast.success("Verification request sent to institution! 🏛️");
      setRequestModalOpen(false);
      loadRequests();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  // Demo simulation officer approval
  const handleSimulateVerification = async (req: VerificationRequest, approve: boolean) => {
    if (!user?.uid) return;
    try {
      await updateVerificationStatus({
        requestId: req.id,
        documentId: req.documentId,
        studentId: user.uid,
        status: approve ? "VERIFIED" : "REJECTED",
        verifiedBy: `${req.institutionName} Verification Officer`,
        remarks: approve
          ? "Authenticated against institutional records and cryptographic seal."
          : "Discrepancy found in roll number/records.",
      });

      toast.success(approve ? "Document Officially Verified! 🎉" : "Verification Rejected");
      loadRequests();
      onRefresh();
    } catch (err: any) {
      toast.error("Failed to update status");
    }
  };

  const unverifiedDocs = documents.filter((d) => d.verificationStatus === "unverified");
  const verifiedDocs = documents.filter((d) => d.verificationStatus === "verified");

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-primary/10 border border-emerald-500/20 backdrop-blur-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-500" />
            <h3 className="text-xl font-bold text-foreground">Institutional Verification Center</h3>
          </div>
          <p className="text-xs text-muted-foreground max-w-xl">
            Request official cryptographic verification from universities, boards, and accredited employers to authenticate your EduVault credentials.
          </p>
        </div>

        {unverifiedDocs.length > 0 && (
          <Button onClick={() => handleOpenRequest()} className="rounded-2xl gap-2 shrink-0">
            <FileCheck className="h-4 w-4" /> Request Verification ({unverifiedDocs.length})
          </Button>
        )}
      </div>

      {/* Requests Table / Cards */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Verification Pipeline ({requests.length})
        </h4>

        {requests.length === 0 ? (
          <Card className="rounded-3xl border-dashed border-2 border-border/80 bg-card/30 p-10 text-center">
            <CardContent className="space-y-3 p-0">
              <Clock className="h-10 w-10 text-muted-foreground mx-auto opacity-60" />
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                No verification requests submitted yet. Select any academic document from your vault to initiate institutional verification.
              </p>
              {unverifiedDocs.length > 0 && (
                <Button onClick={() => handleOpenRequest()} size="sm" className="rounded-xl">
                  Select Document to Verify
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const reqDate = req.requestedAt?.seconds
                ? new Date(req.requestedAt.seconds * 1000).toLocaleDateString()
                : "Recent";

              return (
                <Card
                  key={req.id}
                  className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm p-4 hover:border-primary/40 transition-all"
                >
                  <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-sm text-foreground">{req.documentName}</h5>
                        {req.status === "VERIFIED" && (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                            Verified
                          </Badge>
                        )}
                        {req.status === "PENDING" && (
                          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">
                            Pending Review
                          </Badge>
                        )}
                        {req.status === "REJECTED" && (
                          <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-xs">
                            Rejected
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building className="h-3.5 w-3.5 text-primary" /> {req.institutionName}
                        </span>
                        <span>•</span>
                        <span>Requested: {reqDate}</span>
                        {req.verifiedBy && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 font-medium">By: {req.verifiedBy}</span>
                          </>
                        )}
                      </div>

                      {req.remarks && (
                        <p className="text-xs text-foreground/80 bg-muted/40 p-2 rounded-xl mt-2">
                          <strong>Remarks:</strong> {req.remarks}
                        </p>
                      )}
                    </div>

                    {/* Verification status — pending requests show a "Waiting for institution" notice */}
                    {req.status === "PENDING" && (
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                          <Clock className="h-3.5 w-3.5" />
                          Awaiting Institution Review
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Request Modal */}
      <Dialog open={requestModalOpen} onOpenChange={setRequestModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <FileCheck className="h-5 w-5 text-primary" /> Request Document Verification
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Select Document to Verify</Label>
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                required
              >
                {unverifiedDocs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.documentName} ({d.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Issuing University / Institution</Label>
              <Input
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                placeholder="e.g. University of Mumbai / CBSE"
                className="rounded-xl h-10 text-xs"
                required
              />
            </div>

            <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 text-xs text-muted-foreground">
              Once submitted, the institution's credential officer will verify your document against their official ledger.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setRequestModalOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="rounded-xl gap-2">
                <Send className="h-4 w-4" /> {submitting ? "Sending..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
