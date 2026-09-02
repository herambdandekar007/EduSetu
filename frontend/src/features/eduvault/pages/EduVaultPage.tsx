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
    if (!doc.fileUrl) return;

    try {
      // Create temporary download anchor
      const link = document.createElement("a");
      link.href = doc.fileUrl;
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
              variant="outline"
              onClick={() => setSettingsModalOpen(true)}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 rounded-xl gap-1 text-xs"
            >
              <Settings className="h-4 w-4" /> Settings
            </Button>
            <Button
              size="sm"
              onClick={() => handleOpenUpload(false)}
              className="bg-white text-primary hover:bg-white/90 font-bold rounded-xl gap-1 text-xs shadow-md"
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
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-foreground">Recycle Bin Items</h3>
                  <Badge variant="outline" className="text-xs">
                    {deletedDocuments.length} Deleted Document(s)
                  </Badge>
                </div>
                <DocumentListView
                  documents={deletedDocuments}
                  viewMode="list"
                  onDocumentClick={handleDocumentClick}
                  onDownloadClick={handleDownload}
                  onShareClick={handleShareClick}
                  onVerifyClick={() => {}}
                  onEditClick={() => {}}
                  onToggleFavorite={() => {}}
                  onToggleArchive={() => {}}
                  onDeleteClick={permanentDelete}
                />
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
