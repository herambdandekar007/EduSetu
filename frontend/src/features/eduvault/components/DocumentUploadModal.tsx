import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Upload,
  Camera,
  FileText,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  Trash2,
} from "lucide-react";
import { DOCUMENT_CATEGORIES } from "../constants/categories";
import { uploadVaultFile } from "../services/storageService";
import { createVaultDocument, updateVaultDocument } from "../services/documentService";
import { analyzeDocumentWithAI } from "../services/intelligenceService";
import type { VaultDocument } from "../types/eduvault.types";
import { toast } from "sonner";

export const DocumentUploadModal = ({
  open,
  onOpenChange,
  initialCameraMode = false,
  onUploadSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCameraMode?: boolean;
  onUploadSuccess: (doc: VaultDocument) => void;
}) => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<"file" | "camera">(
    initialCameraMode ? "camera" : "file"
  );

  // Selected file(s)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [capturedPages, setCapturedPages] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Form Fields
  const [documentName, setDocumentName] = useState("");
  const [category, setCategory] = useState(DOCUMENT_CATEGORIES[0].name);
  const [type, setType] = useState(DOCUMENT_CATEGORIES[0].subcategories[0].types[0]);
  const [institution, setInstitution] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(["academic"]);
  const [runAiIntelligence, setRunAiIntelligence] = useState(true);

  // Statuses
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [aiStatus, setAiStatus] = useState<string | null>(null);

  useEffect(() => {
    if (initialCameraMode) {
      setActiveTab("camera");
    } else {
      setActiveTab("file");
    }
  }, [initialCameraMode, open]);

  // Handle Camera Stream
  useEffect(() => {
    if (open && activeTab === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [open, activeTab]);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCapturing(true);
      }
    } catch (err) {
      console.warn("Camera access not available or denied:", err);
      setIsCapturing(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedPages((prev) => [...prev, dataUrl]);
      if (!documentName) {
        setDocumentName(`Scan_${new Date().toLocaleDateString().replace(/\//g, "-")}`);
      }
      toast.success(`Page ${capturedPages.length + 1} captured`);
    }
  };

  const removePage = (index: number) => {
    setCapturedPages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!documentName) {
        setDocumentName(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (!documentName) {
        setDocumentName(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    const catObj = DOCUMENT_CATEGORIES.find((c) => c.name === newCat);
    if (catObj && catObj.subcategories[0]?.types[0]) {
      setType(catObj.subcategories[0].types[0]);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) {
      toast.error("Please sign in to upload documents");
      return;
    }

    if (!documentName.trim()) {
      toast.error("Please enter a document name");
      return;
    }

    let fileToUpload: File | null = selectedFile;

    // If camera scanned pages are used
    if (activeTab === "camera" && capturedPages.length > 0 && !fileToUpload) {
    // BUG-09 FIX: merge ALL captured pages into one file instead of only using page 0
    if (capturedPages.length === 1) {
      // Single page: simple conversion
      const byteString = atob(capturedPages[0].split(",")[1]);
      const mimeString = capturedPages[0].split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      const blob = new Blob([ab], { type: mimeString });
      fileToUpload = new File([blob], `${documentName.replace(/\s+/g, "_")}.jpg`, { type: mimeString });
    } else {
      // Multiple pages: stitch them vertically on a canvas then export as JPEG
      const images = await Promise.all(
        capturedPages.map(
          (dataUrl) =>
            new Promise<HTMLImageElement>((res) => {
              const img = new Image();
              img.onload = () => res(img);
              img.src = dataUrl;
            })
        )
      );
      const totalHeight = images.reduce((h, img) => h + img.naturalHeight, 0);
      const maxWidth = Math.max(...images.map((img) => img.naturalWidth));
      const canvas = document.createElement("canvas");
      canvas.width = maxWidth;
      canvas.height = totalHeight;
      const ctx = canvas.getContext("2d")!;
      let y = 0;
      for (const img of images) {
        ctx.drawImage(img, 0, y, img.naturalWidth, img.naturalHeight);
        y += img.naturalHeight;
      }
      const mergedDataUrl = canvas.toDataURL("image/jpeg", 0.88);
      const byteString = atob(mergedDataUrl.split(",")[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      const blob = new Blob([ab], { type: "image/jpeg" });
      fileToUpload = new File([blob], `${documentName.replace(/\s+/g, "_")}_${capturedPages.length}pages.jpg`, { type: "image/jpeg" });
    }
    }

    if (!fileToUpload) {
      toast.error("Please select a file or capture a document page");
      return;
    }

    try {
      setUploading(true);
      setProgress(20);
      setAiStatus("Encrypting and uploading file to secure vault...");

      const tempDocId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const uploadResult = await uploadVaultFile({
        userId: user.uid,
        documentId: tempDocId,
        file: fileToUpload,
        onProgress: (p) => setProgress(p),
      });

      setProgress(85);
      setAiStatus("Saving document metadata to secure database...");

      const eduId = profile?.eduId || "";

      const createdDoc = await createVaultDocument({
        userId: user.uid,
        eduId,
        documentName,
        category,
        type,
        institution: institution || (profile?.educationProfile?.boardOrUniversity || ""),
        academicYear: academicYear || (profile?.educationProfile?.year || ""),
        issueDate: issueDate || null,
        expiryDate: expiryDate || null,
        documentNumber: documentNumber || null,
        description: description || "",
        fileName: fileToUpload.name,
        fileUrl: uploadResult.fileUrl,
        storagePath: uploadResult.storagePath,
        mimeType: uploadResult.mimeType,
        fileSize: uploadResult.fileSize,
        verificationStatus: "unverified",
        isFavorite: false,
        isArchived: false,
        isDeleted: false,
        tags,
        fileHash: uploadResult.fileHash,
        hashAlgorithm: "SHA-256",
      });

      setProgress(100);
      toast.success(`"${documentName}" uploaded successfully! 📁`);
      onUploadSuccess(createdDoc);
      onOpenChange(false);

      // BUG-04 FIX: Run AI in background but do NOT call onUploadSuccess again.
      // Instead silently update the document record — avoids double Firestore re-fetch.
      if (runAiIntelligence) {
        toast.info("AI Document Intelligence is analyzing your credential in background... ✨");
        analyzeDocumentWithAI({
          documentName,
          fileName: fileToUpload.name,
          category,
          type,
          mimeType: uploadResult.mimeType,
          fileSize: uploadResult.fileSize,
        })
          .then(async (aiResult) => {
            if (aiResult && user?.uid) {
              await updateVaultDocument(createdDoc.id, user.uid, { intelligence: aiResult });
            }
          })
          .catch((aiErr) => console.warn("[EduVault] Background AI intelligence notice:", aiErr));
      }

      // BUG-11 FIX: Reset all form fields including tags
      setSelectedFile(null);
      setCapturedPages([]);
      setDocumentName("");
      setDescription("");
      setDocumentNumber("");
      setTags(["academic"]);
    } catch (err: any) {
      console.error("[EduVault Upload Error]:", err);
      toast.error(err.message || "Failed to upload document");
    } finally {
      setUploading(false);
      setProgress(0);
      setAiStatus(null);
    }
  };

  const currentCategoryObj = DOCUMENT_CATEGORIES.find((c) => c.name === category);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Upload className="h-5 w-5 text-primary" /> Upload to EduVault
          </DialogTitle>
        </DialogHeader>

        {/* Tab switcher: File vs Camera Scan */}
        <div className="flex gap-2 p-1 bg-muted/60 rounded-xl border border-border/50 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab("file")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "file"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Upload className="h-4 w-4" /> Device File Upload
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("camera")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "camera"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Camera className="h-4 w-4" /> Camera Document Scanner
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Picker or Camera Scanner View */}
          {activeTab === "file" ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-border/80 hover:border-primary/50 rounded-2xl p-6 text-center bg-card/40 transition-colors"
            >
              {selectedFile ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="h-5 w-5 shrink-0" />
                    <span className="text-xs font-bold truncate">{selectedFile.name}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedFile(null)}
                    className="h-7 w-7 rounded-lg hover:bg-primary/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div className="text-xs text-foreground font-semibold">
                    Drag & drop files or <label className="text-primary hover:underline cursor-pointer">browse<input type="file" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.txt" className="hidden" /></label>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Supports PDF, PNG, JPEG, WEBP, DOCX (Up to 50MB)
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!isCapturing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white/80 bg-black/60">
                    <Camera className="h-8 w-8 mb-2 opacity-60" />
                    <p className="text-xs">Camera preview unavailable. You can upload a photo directly.</p>
                  </div>
                )}
                {isCapturing && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={capturePhoto}
                      className="rounded-full bg-white text-black hover:bg-white/90 shadow-lg px-4 py-2 text-xs font-bold gap-1.5"
                    >
                      <Camera className="h-4 w-4" /> Snap Page {capturedPages.length + 1}
                    </Button>
                  </div>
                )}
              </div>

              {/* Scanned Pages Thumbnails */}
              {capturedPages.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-foreground">
                    Captured Pages ({capturedPages.length})
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {capturedPages.map((page, idx) => (
                      <div key={idx} className="relative h-16 w-14 shrink-0 rounded-lg overflow-hidden border border-border/70 group">
                        <img src={page} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePage(idx)}
                          className="absolute top-1 right-1 h-4 w-4 bg-black/70 text-white rounded flex items-center justify-center hover:bg-rose-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form Metadata Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs font-semibold">Document Title *</Label>
              <Input
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="e.g. B.Tech Degree Certificate"
                className="rounded-xl h-10 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Category</Label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {DOCUMENT_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Document Type</Label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {currentCategoryObj?.subcategories.flatMap((sub) =>
                  sub.types.map((t) => (
                    <option key={t} value={t}>
                      {sub.name} • {t}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Issuing Institution / Authority</Label>
              <Input
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Mumbai University / CBSE"
                className="rounded-xl h-10 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Academic Year / Session</Label>
              <Input
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="e.g. 2024-2025"
                className="rounded-xl h-10 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Issue Date</Label>
              <Input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="rounded-xl h-10 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Expiry Date (Optional)</Label>
              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="rounded-xl h-10 text-xs"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs font-semibold">Registration / Document Number</Label>
              <Input
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="e.g. CERT-2024-998812"
                className="rounded-xl h-10 text-xs"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs font-semibold">Description / Notes</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description or personal notes..."
                rows={2}
                className="rounded-xl text-xs"
              />
            </div>

            {/* Tags input */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-semibold">Tags & Keywords</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Type tag and press Add..."
                  className="rounded-xl h-9 text-xs"
                />
                <Button type="button" size="sm" variant="outline" onClick={handleAddTag} className="rounded-xl h-9 text-xs">
                  <Plus className="h-3.5 w-3.5" /> Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {tags.map((t) => (
                  <Badge key={t} variant="secondary" className="gap-1 text-[11px] rounded-lg">
                    #{t}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(t)} />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* AI Intelligence Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-foreground">AI Document Intelligence</div>
                <div className="text-[10px] text-muted-foreground">
                  Extract OCR text, verify metadata, and inspect tamper risks automatically
                </div>
              </div>
            </div>
            <Switch
              checked={runAiIntelligence}
              onCheckedChange={setRunAiIntelligence}
            />
          </div>

          {/* Upload Progress & AI Status */}
          {uploading && (
            <div className="space-y-2 p-3 rounded-2xl bg-muted/40 border border-border/60">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-primary">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> {aiStatus || "Uploading..."}
                </span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={uploading}
              className="rounded-xl gap-2 min-w-32"
            >
              {uploading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" /> Save to Vault
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
