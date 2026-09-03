import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FolderLock,
  LayoutDashboard,
  FileText,
  FileCheck,
  Trash2,
  ShieldCheck,
  Settings,
  Upload,
  Camera,
  Search,
  Sparkles,
  Share2,
} from "lucide-react";

import { useVaultDocuments } from "../hooks/useVaultDocuments";
import { useVaultStats } from "../hooks/useVaultStats";
import { useVaultActivities } from "../hooks/useVaultActivities";
import { EduVaultIdentityBanner } from "../components/EduVaultIdentityBanner";
import { EduVaultDashboard } from "../components/EduVaultDashboard";
import { DocumentSearchFilter, type FilterState } from "../components/DocumentSearchFilter";
import { DocumentListView } from "../components/DocumentListView";
import { DocumentUploadModal } from "../components/DocumentUploadModal";
import { DocumentDetailModal } from "../components/DocumentDetailModal";
import { DocumentShareModal } from "../components/DocumentShareModal";
import { VerificationCenter } from "../components/VerificationCenter";
import { RecycleBinModal } from "../components/RecycleBinModal";
import { SecurityCenterModal } from "../components/SecurityCenterModal";
import { VaultSettingsModal } from "../components/VaultSettingsModal";
import { logDocumentActivity } from "../services/activityService";
import { sendVaultNotification } from "../services/notificationService";
import { resolveVaultFileUrl } from "../services/storageService";
import type { VaultDocument } from "../types/eduvault.types";
import { toast } from "sonner";

type VaultTabId = "dashboard" | "documents" | "verification" | "recycle" | "security";

export const EduVaultPage = () => {
  const {
    documents,
    allDocumentsWithDeleted,
    deletedDocuments,
    loading,
    refresh,
    toggleFavorite,
    toggleArchive,
    softDelete,
    restore,
    permanentDelete,
    updateMetadata,
  } = useVaultDocuments();

  const stats = useVaultStats(documents, allDocumentsWithDeleted);
  const { activities, refresh: refreshActivities } = useVaultActivities();

  // Navigation & view states
  const [activeTab, setActiveTab] = useState<VaultTabId>("dashboard");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    query: "",
    category: "all",
    type: "all",
    status: "all",
    onlyFavorites: false,
    onlyArchived: false,
    sortBy: "date_desc",
  });

  // Modals state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<VaultDocument | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [shareDoc, setShareDoc] = useState<VaultDocument | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [recycleModalOpen, setRecycleModalOpen] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Filter and sort active documents
  const filteredDocuments = useMemo(() => {
    return documents
      .filter((doc) => {
        // Query search
        if (filters.query) {
          const q = filters.query.toLowerCase();
          const matchName = doc.documentName.toLowerCase().includes(q);
          const matchCat = doc.category.toLowerCase().includes(q);
          const matchType = doc.type.toLowerCase().includes(q);
          const matchInst = (doc.institution || "").toLowerCase().includes(q);
          const matchDocNum = (doc.documentNumber || "").toLowerCase().includes(q);
          const matchTags = doc.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchName && !matchCat && !matchType && !matchInst && !matchDocNum && !matchTags) {
            return false;
          }
        }

        // Category filter
        if (filters.category !== "all" && doc.category !== filters.category) {
          return false;
        }

        // BUG-12 FIX: Apply type filter (was missing — only category was checked)
        if (filters.type !== "all" && doc.type !== filters.type) {
          return false;
        }

        // Status filter
        if (filters.status !== "all" && doc.verificationStatus !== filters.status) {
          return false;
        }

        // Favorites filter
        if (filters.onlyFavorites && !doc.isFavorite) {
          return false;
        }

        // Archive filter
        if (filters.onlyArchived && !doc.isArchived) {
          return false;
        }
        if (!filters.onlyArchived && doc.isArchived) {
          return false; // Hide archived from standard view
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === "name_asc") {
          return a.documentName.localeCompare(b.documentName);
        }
        if (filters.sortBy === "size_desc") {
          return (b.fileSize || 0) - (a.fileSize || 0);
        }
        if (filters.sortBy === "date_asc") {
          const tA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
          const tB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
          return tA - tB;
        }
        // default date_desc
        const tA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
        const tB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
        return tB - tA;
      });
  }, [documents, filters]);

  // Handlers
  const handleOpenUpload = (camera: boolean = false) => {
    setCameraMode(camera);
    setUploadModalOpen(true);
  };

  const handleDocumentClick = (doc: VaultDocument) => {
    setSelectedDoc(doc);
    setDetailModalOpen(true);
  };

  const handleShareClick = (doc: VaultDocument) => {
    setShareDoc(doc);
    setShareModalOpen(true);
  };

  const handleDownload = async (doc: VaultDocument) => {
    try {
      const resolvedUrl = await resolveVaultFileUrl(doc.fileUrl, doc.storagePath, doc.id);
      if (!resolvedUrl && !doc.fileUrl) {
        toast.error("File URL is not available");
        return;
      }

      // Create temporary download anchor
      const link = document.createElement("a");
      link.href = resolvedUrl || doc.fileUrl;
      link.download = doc.fileName || `${doc.documentName}.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Audit download activity
      await logDocumentActivity({
        userId: doc.userId,
        documentId: doc.id,
        documentName: doc.documentName,
        action: "DOWNLOAD",
      });

      await sendVaultNotification({
        userId: doc.userId,
        type: "DOCUMENT_DOWNLOADED",
        title: "Document Downloaded",
        message: `"${doc.documentName}" was downloaded from your vault.`,
        relatedDocumentId: doc.id,
      });

      toast.success(`Downloading "${doc.documentName}"`);
    } catch (err) {
      toast.error("Failed to download document");
    }
  };

  const handleVerifyRequest = (doc: VaultDocument) => {
    setSelectedDoc(doc);
    setActiveTab("verification");
  };

  const navTabs: { id: VaultTabId; label: string; icon: any; badge?: number }[] = [
    { id: "dashboard", label: "Vault Dashboard", icon: LayoutDashboard },
    { id: "documents", label: "My Documents", icon: FileText, badge: stats.totalDocuments },
    { id: "verification", label: "Credential Verification", icon: FileCheck, badge: stats.pendingVerification },
    { id: "recycle", label: "Recycle Bin", icon: Trash2, badge: stats.recycleBinCount },
    { id: "security", label: "Security & Audit", icon: ShieldCheck },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* Page Header */}
        <PageHeader
          icon={<FolderLock className="h-5 w-5 text-white" />}
          title="📁 EduVault Document Management"
          subtitle="Tamper-proof academic & career repository linked to your permanent EduID"
        >
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setSettingsModalOpen(true)}
              className="bg-white hover:bg-slate-100 text-indigo-950 font-semibold shadow-sm border border-white/40 transition-all text-xs h-9 px-3.5 [&_svg]:text-indigo-600 rounded-xl gap-1.5"
            >
              <Settings className="h-4 w-4" /> Settings
            </Button>
            <Button
              size="sm"
              onClick={() => handleOpenUpload(false)}
              className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold rounded-xl gap-1.5 text-xs h-9 px-3.5 shadow-md border border-indigo-400/40"
            >
              <Upload className="h-4 w-4" /> Upload Document
            </Button>
          </div>
        </PageHeader>

        {/* Identity & EduID Banner */}
        <EduVaultIdentityBanner
          verifiedCount={stats.totalVerified}
          totalCount={stats.totalDocuments}
        />

        {/* Tab Switcher */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-2xl border px-4 py-2.5 text-xs font-semibold transition-all shrink-0 ${
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border/70 bg-card/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <Badge
                    variant={active ? "secondary" : "default"}
                    className="ml-1 text-[10px] px-1.5 py-0 rounded-full"
                  >
                    {tab.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        {/* Dynamic Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "dashboard" && (
              <EduVaultDashboard
                stats={stats}
                onUploadClick={() => handleOpenUpload(false)}
                onScanClick={() => handleOpenUpload(true)}
                onSearchClick={() => setActiveTab("documents")}
                onShareClick={() => {
                  if (documents.length > 0) handleShareClick(documents[0]);
                  else handleOpenUpload(false);
                }}
                onVerifyClick={() => setActiveTab("verification")}
                onDocumentClick={handleDocumentClick}
                onViewAllClick={() => setActiveTab("documents")}
              />
            )}

            {activeTab === "documents" && (
              <div className="space-y-6">
                <DocumentSearchFilter
                  filters={filters}
                  onFilterChange={setFilters}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  totalResults={filteredDocuments.length}
                />

                <DocumentListView
                  documents={filteredDocuments}
                  viewMode={viewMode}
                  onDocumentClick={handleDocumentClick}
                  onDownloadClick={handleDownload}
                  onShareClick={handleShareClick}
                  onVerifyClick={handleVerifyRequest}
                  onEditClick={handleDocumentClick}
                  onToggleFavorite={toggleFavorite}
                  onToggleArchive={toggleArchive}
                  onDeleteClick={softDelete}
                />
              </div>
            )}

            {activeTab === "verification" && (
              <VerificationCenter documents={documents} onRefresh={refresh} />
            )}

            {activeTab === "recycle" && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
                  <Trash2 className="h-4 w-4 shrink-0 text-amber-500" />
                  <span>Documents in the Recycle Bin are retained for 30 days before automatic cleanup. You can restore or permanently delete them below.</span>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-foreground">Recycle Bin</h3>
                  <Badge variant="outline" className="text-xs">
                    {deletedDocuments.length} Deleted Document(s)
                  </Badge>
                </div>
                {deletedDocuments.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <Trash2 className="h-14 w-14 text-muted-foreground mx-auto opacity-30" />
                    <p className="text-sm text-muted-foreground">The Recycle Bin is currently empty.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {deletedDocuments.map((doc) => (
                      <div key={doc.id} className="p-3.5 rounded-2xl border border-border/70 bg-card/60 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                            <Trash2 className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-foreground truncate">{doc.documentName}</div>
                            <div className="text-muted-foreground text-[11px] mt-0.5">
                              {doc.category} • Deleted: {doc.deletedAt ? new Date(doc.deletedAt).toLocaleDateString() : "Recently"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {/* BUG-07 FIX: Restore button now present in tab (was missing) */}
                          <button
                            type="button"
                            onClick={() => restore(doc)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border text-xs font-semibold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-colors"
                          >
                            ♻️ Restore
                          </button>
                          <button
                            type="button"
                            onClick={() => permanentDelete(doc)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            🗑️ Delete Forever
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-card/60 border border-border/80 backdrop-blur-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-emerald-500" /> Vault Security Center
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Audit trail, hash verification, and access controls for all your documents
                      </p>
                    </div>
                    <Button onClick={() => setSecurityModalOpen(true)} className="rounded-xl gap-1.5 text-xs">
                      <ShieldCheck className="h-4 w-4" /> Run Full Security Check
                    </Button>
                  </div>
                </div>

                {/* Audit Activities List */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Real-time Audit Log ({activities.length})
                  </h4>
                  <div className="space-y-2">
                    {activities.map((act) => {
                      const date = act.timestamp?.seconds
                        ? new Date(act.timestamp.seconds * 1000).toLocaleString()
                        : "Recent";
                      return (
                        <div
                          key={act.id}
                          className="p-3.5 rounded-2xl border border-border/70 bg-card/60 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="font-mono text-[10px]">
                              {act.action}
                            </Badge>
                            <span className="font-bold text-foreground">
                              {act.documentName || "EduVault Event"}
                            </span>
                            {act.metadata?.institutionName && (
                              <span className="text-muted-foreground">
                                to {act.metadata.institutionName}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground">{date}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Modals & Dialogs */}
        <DocumentUploadModal
          open={uploadModalOpen}
          onOpenChange={setUploadModalOpen}
          initialCameraMode={cameraMode}
          onUploadSuccess={(doc) => {
            refresh();
            refreshActivities();
          }}
        />

        <DocumentDetailModal
          document={selectedDoc}
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          onDownload={handleDownload}
          onShare={handleShareClick}
          onVerify={handleVerifyRequest}
          onDelete={(doc) => {
            softDelete(doc);
            setDetailModalOpen(false);
          }}
        />

        <DocumentShareModal
          document={shareDoc}
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
        />

        <RecycleBinModal
          open={recycleModalOpen}
          onOpenChange={setRecycleModalOpen}
          deletedDocuments={deletedDocuments}
          onRestore={restore}
          onPermanentDelete={permanentDelete}
        />

        <SecurityCenterModal
          open={securityModalOpen}
          onOpenChange={setSecurityModalOpen}
          activities={activities}
          documents={documents}
        />

        <VaultSettingsModal
          open={settingsModalOpen}
          onOpenChange={setSettingsModalOpen}
        />
      </div>
    </DashboardLayout>
  );
};

export default EduVaultPage;
