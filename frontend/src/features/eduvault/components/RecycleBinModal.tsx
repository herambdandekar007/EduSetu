import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  FileText,
  Clock,
  ShieldAlert,
} from "lucide-react";
import type { VaultDocument } from "../types/eduvault.types";

export const RecycleBinModal = ({
  open,
  onOpenChange,
  deletedDocuments,
  onRestore,
  onPermanentDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deletedDocuments: VaultDocument[];
  onRestore: (doc: VaultDocument) => void;
  onPermanentDelete: (doc: VaultDocument) => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Trash2 className="h-5 w-5 text-destructive" /> EduVault Recycle Bin
          </DialogTitle>
        </DialogHeader>

        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
          <span>
            Deleted documents remain in the Recycle Bin for 30 days before automatic cleanup. You can restore them anytime.
          </span>
        </div>

        <div className="space-y-3 pt-2">
          {deletedDocuments.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Trash2 className="h-12 w-12 text-muted-foreground mx-auto opacity-40" />
              <p className="text-xs text-muted-foreground">The Recycle Bin is currently empty.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {deletedDocuments.map((doc) => {
                const deletedDate = doc.deletedAt
                  ? new Date(doc.deletedAt).toLocaleDateString()
                  : "Recently";

                return (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-2xl border border-border/70 bg-card/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-foreground truncate">{doc.documentName}</div>
                        <div className="text-muted-foreground text-[11px] mt-0.5">
                          {doc.category} • Deleted: {deletedDate}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRestore(doc)}
                        className="rounded-xl text-xs gap-1 h-8"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Restore
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onPermanentDelete(doc)}
                        className="rounded-xl text-xs text-destructive hover:bg-destructive/10 gap-1 h-8"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete Forever
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
