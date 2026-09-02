// features/eduspeak/components/SpeakingHistoryView.tsx
// Speaking history log with transcript review, feedback scorecards, and safe deletion confirmation.

import React, { useState } from "react";
import {
  History,
  Trash2,
  Volume2,
  Calendar,
  Clock,
  Award,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { playTextToSpeech } from "../services/speechService";
import type { SpeakingSessionRecord } from "../types/eduspeak.types";

interface SpeakingHistoryViewProps {
  sessions: SpeakingSessionRecord[];
  onDeleteSession: (sessionId: string) => Promise<void>;
  onPracticeAgain: (session: SpeakingSessionRecord) => void;
}

export const SpeakingHistoryView: React.FC<SpeakingHistoryViewProps> = ({
  sessions,
  onDeleteSession,
  onPracticeAgain,
}) => {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<SpeakingSessionRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteSession(sessionToDelete.id);
      setSessionToDelete(null);
    } catch (err) {
      console.error("Delete session error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleListenTranscript = (text: string) => {
    playTextToSpeech(text);
  };

  if (!sessions.length) {
    return (
      <div className="text-center p-12 rounded-2xl border border-dashed border-border/70 bg-card/50 space-y-3">
        <History className="h-10 w-10 text-muted-foreground mx-auto" />
        <h4 className="text-sm font-bold text-foreground">No speaking sessions recorded yet</h4>
        <p className="text-xs text-muted-foreground">
          Complete your first speaking practice drill to generate a verified transcript and performance scorecard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((item) => {
        const isExpanded = expandedSessionId === item.id;
        const formattedDate = item.createdAt
          ? new Date(item.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Recently";

        return (
          <Card
            key={item.id}
            className="rounded-2xl border-border/70 bg-card hover:border-border transition-all"
          >
            <CardContent className="p-5 space-y-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold text-cyan-600 border-cyan-300">
                      {item.practiceType || "Speaking Practice"}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                      <Clock className="h-3 w-3" />
                      {item.durationSeconds || 30}s
                    </span>
                    <span className="text-xs text-muted-foreground">• {formattedDate}</span>
                  </div>

                  <h3 className="text-base font-bold text-foreground">{item.topic}</h3>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                  <div className="h-10 px-3 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-bold text-sm">
                    {item.overallScore}% Score
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setExpandedSessionId(isExpanded ? null : item.id)}
                    className="h-9 w-9 rounded-xl"
                    aria-label={isExpanded ? "Collapse session details" : "Expand session details"}
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSessionToDelete(item)}
                    className="h-9 w-9 rounded-xl text-muted-foreground hover:text-rose-500"
                    title="Delete Session"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Transcript Preview */}
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                "{item.transcript}"
              </p>

              {/* ── Expandable Details ──────────────────────────────────────── */}
              {isExpanded && (
                <div className="pt-3 border-t border-border/60 space-y-4 animate-in fade-in">
                  {/* Full Transcript */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Full Spoken Transcript
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleListenTranscript(item.transcript)}
                        className="h-6 text-xs text-primary gap-1"
                      >
                        <Volume2 className="h-3 w-3" />
                        Listen Audio
                      </Button>
                    </div>
                    <div className="p-3.5 rounded-xl bg-muted/40 text-xs leading-relaxed text-foreground border border-border/60">
                      {item.transcript}
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-2.5 rounded-xl bg-background border border-border text-center">
                      <span className="text-[10px] text-muted-foreground">Pronunciation</span>
                      <p className="text-sm font-bold text-foreground">{item.pronunciationScore || 78}%</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-background border border-border text-center">
                      <span className="text-[10px] text-muted-foreground">Fluency</span>
                      <p className="text-sm font-bold text-foreground">{item.fluencyScore || 75}%</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-background border border-border text-center">
                      <span className="text-[10px] text-muted-foreground">Grammar</span>
                      <p className="text-sm font-bold text-foreground">{item.grammarScore || 70}%</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-background border border-border text-center">
                      <span className="text-[10px] text-muted-foreground">Vocabulary</span>
                      <p className="text-sm font-bold text-foreground">{item.vocabularyScore || 72}%</p>
                    </div>
                  </div>

                  {/* Feedback summary */}
                  {item.feedback && (
                    <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-foreground/90 leading-relaxed">
                      <strong>AI Coach Summary: </strong>
                      {item.feedback}
                    </div>
                  )}

                  {/* Bottom Action */}
                  <div className="flex justify-end pt-1">
                    <Button
                      size="sm"
                      onClick={() => onPracticeAgain(item)}
                      className="gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs shadow-xs"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Practice This Topic Again
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* ── Delete Confirmation Dialog ─────────────────────────────────── */}
      <Dialog open={!!sessionToDelete} onOpenChange={() => setSessionToDelete(null)}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Trash2 className="h-5 w-5 text-rose-500" />
              Delete Speaking Session Record
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-2 leading-relaxed">
              Are you sure you want to delete the speaking practice record for{" "}
              <strong className="text-foreground">"{sessionToDelete?.topic}"</strong>? This will permanently remove the transcript from your profile history.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setSessionToDelete(null)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow"
            >
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
