import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Star,
  MoreVertical,
  Eye,
  Download,
  Share2,
  FileCheck,
  Archive,
  Trash2,
  Edit,
  ShieldCheck,
  Clock,
  ExternalLink,
  Sparkles,
  Lock,
} from "lucide-react";
import type { VaultDocument } from "../types/eduvault.types";
import { VERIFICATION_STATUS_CONFIG } from "../constants/categories";

const formatBytes = (bytes: number): string => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const DocumentListView = ({
  documents,
  viewMode,
  onDocumentClick,
  onDownloadClick,
  onShareClick,
  onVerifyClick,
  onEditClick,
  onToggleFavorite,
  onToggleArchive,
  onDeleteClick,
}: {
  documents: VaultDocument[];
  viewMode: "grid" | "list";
  onDocumentClick: (doc: VaultDocument) => void;
  onDownloadClick: (doc: VaultDocument) => void;
  onShareClick: (doc: VaultDocument) => void;
  onVerifyClick: (doc: VaultDocument) => void;
  onEditClick: (doc: VaultDocument) => void;
  onToggleFavorite: (doc: VaultDocument) => void;
  onToggleArchive: (doc: VaultDocument) => void;
  onDeleteClick: (doc: VaultDocument) => void;
}) => {
  if (documents.length === 0) {
    return (
      <Card className="rounded-3xl border-dashed border-2 border-border/80 bg-card/30 p-12 text-center">
        <CardContent className="flex flex-col items-center justify-center space-y-3 p-0">
          <div className="h-14 w-14 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center">
            <FileText className="h-7 w-7 opacity-70" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-foreground">No documents found</h4>
            <p className="text-xs text-muted-foreground max-w-sm">
              No documents matched your current search filters or category. Try clearing filters or uploading new credentials.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-2.5">
        {documents.map((doc) => {
          const statusCfg =
            VERIFICATION_STATUS_CONFIG[doc.verificationStatus] ||
            VERIFICATION_STATUS_CONFIG.unverified;
          const createdDate = doc.createdAt?.seconds
            ? new Date(doc.createdAt.seconds * 1000).toLocaleDateString()
            : doc.createdAt
            ? new Date(doc.createdAt).toLocaleDateString()
            : "Recent";

          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm p-3.5 hover:border-primary/40 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              {/* Left Info */}
              <div
                className="flex items-center gap-3.5 min-w-0 cursor-pointer flex-1"
                onClick={() => onDocumentClick(doc)}
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-sm text-foreground truncate hover:text-primary transition-colors">
                      {doc.documentName}
                    </h5>
                    {doc.isFavorite && (
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                    )}
                    {doc.isArchived && (
                      <Badge variant="secondary" className="text-[10px] py-0">
                        Archived
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span className="font-medium text-foreground/80">{doc.category}</span>
                    <span>•</span>
                    <span>{doc.type}</span>
                    <span>•</span>
                    <span>{formatBytes(doc.fileSize)}</span>
                    <span>•</span>
                    <span>{createdDate}</span>
                  </div>
                </div>
              </div>

              {/* Right Badges and Action Menu */}
              <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                <Badge variant="outline" className={`text-[11px] font-medium ${statusCfg.badgeClass}`}>
                  {statusCfg.label}
                </Badge>

                {/* Favorite Star Button */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onToggleFavorite(doc)}
                  className="h-8 w-8 rounded-lg hover:bg-muted"
                  title={doc.isFavorite ? "Remove favorite" : "Mark favorite"}
                >
                  <Star
                    className={`h-4 w-4 ${
                      doc.isFavorite ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                    }`}
                  />
                </Button>

                {/* Dropdown Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-muted">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-2xl">
                    <DropdownMenuItem onClick={() => onDocumentClick(doc)} className="gap-2 cursor-pointer">
                      <Eye className="h-4 w-4" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDownloadClick(doc)} className="gap-2 cursor-pointer">
                      <Download className="h-4 w-4" /> Download File
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onShareClick(doc)} className="gap-2 cursor-pointer">
                      <Share2 className="h-4 w-4" /> Share Link
                    </DropdownMenuItem>
                    {doc.verificationStatus === "unverified" && (
                      <DropdownMenuItem onClick={() => onVerifyClick(doc)} className="gap-2 cursor-pointer">
                        <FileCheck className="h-4 w-4 text-emerald-500" /> Request Verification
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onEditClick(doc)} className="gap-2 cursor-pointer">
                      <Edit className="h-4 w-4" /> Edit Metadata
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleArchive(doc)} className="gap-2 cursor-pointer">
                      <Archive className="h-4 w-4" /> {doc.isArchived ? "Unarchive" : "Archive"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDeleteClick(doc)}
                      className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" /> Move to Recycle Bin
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }

  // Grid View
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc) => {
        const statusCfg =
          VERIFICATION_STATUS_CONFIG[doc.verificationStatus] ||
          VERIFICATION_STATUS_CONFIG.unverified;
        const createdDate = doc.createdAt?.seconds
          ? new Date(doc.createdAt.seconds * 1000).toLocaleDateString()
          : doc.createdAt
          ? new Date(doc.createdAt).toLocaleDateString()
          : "Recent";

        return (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.15 }}
          >
            <Card className="rounded-3xl border-border/70 bg-card/60 backdrop-blur-sm hover:border-primary/40 hover:shadow-md transition-all h-full flex flex-col justify-between overflow-hidden">
              <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                <div>
                  {/* Top card header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div
                      className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 cursor-pointer"
                      onClick={() => onDocumentClick(doc)}
                    >
                      <FileText className="h-5 w-5" />
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onToggleFavorite(doc)}
                        className="h-7 w-7 rounded-lg hover:bg-muted"
                      >
                        <Star
                          className={`h-3.5 w-3.5 ${
                            doc.isFavorite ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                          }`}
                        />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg hover:bg-muted">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-2xl">
                          <DropdownMenuItem onClick={() => onDocumentClick(doc)} className="gap-2 cursor-pointer">
                            <Eye className="h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDownloadClick(doc)} className="gap-2 cursor-pointer">
                            <Download className="h-4 w-4" /> Download File
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onShareClick(doc)} className="gap-2 cursor-pointer">
                            <Share2 className="h-4 w-4" /> Share Link
                          </DropdownMenuItem>
                          {doc.verificationStatus === "unverified" && (
                            <DropdownMenuItem onClick={() => onVerifyClick(doc)} className="gap-2 cursor-pointer">
                              <FileCheck className="h-4 w-4 text-emerald-500" /> Request Verification
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => onEditClick(doc)} className="gap-2 cursor-pointer">
                            <Edit className="h-4 w-4" /> Edit Metadata
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onToggleArchive(doc)} className="gap-2 cursor-pointer">
                            <Archive className="h-4 w-4" /> {doc.isArchived ? "Unarchive" : "Archive"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDeleteClick(doc)}
                            className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" /> Move to Recycle Bin
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Document Title & Category */}
                  <div className="space-y-1 cursor-pointer" onClick={() => onDocumentClick(doc)}>
                    <h5 className="font-bold text-base text-foreground line-clamp-1 hover:text-primary transition-colors">
                      {doc.documentName}
                    </h5>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {doc.category} • {doc.type}
                    </p>
                  </div>

                  {/* Tags */}
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {doc.tags.slice(0, 3).map((t) => (
                        <Badge key={t} variant="secondary" className="text-[10px] rounded-lg px-2 py-0">
                          #{t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Card Footer */}
                <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                  <Badge variant="outline" className={`text-[10px] font-medium ${statusCfg.badgeClass}`}>
                    {statusCfg.label}
                  </Badge>

                  <span className="text-[11px] text-muted-foreground">{formatBytes(doc.fileSize)}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
