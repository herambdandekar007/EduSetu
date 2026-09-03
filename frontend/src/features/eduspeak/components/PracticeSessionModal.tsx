// features/eduspeak/components/PracticeSessionModal.tsx
// Interactive voice recording & speech recognition modal with audio playback and AI analysis.

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Square,
  Play,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Volume2,
  VolumeX,
  CheckCircle2,
  Clock,
  Send,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  startSpeechRecognition,
  AudioRecorderSession,
  playTextToSpeech,
  isSpeechRecognitionSupported,
  requestMicrophoneAccess,
} from "../services/speechService";
import { analyzeSpokenSpeech } from "../services/eduSpeakAIService";
import type { SpeechAnalysisResult, SpeakingPracticeMode } from "../types/eduspeak.types";

interface PracticeSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicTitle: string;
  practiceMode: SpeakingPracticeMode;
  promptInstructions: string;
  suggestedDurationSeconds?: number;
  language?: string;
  onAnalysisComplete: (result: SpeechAnalysisResult, durationSeconds: number) => void;
}

export const PracticeSessionModal: React.FC<PracticeSessionModalProps> = ({
  isOpen,
  onClose,
  topicTitle,
  practiceMode,
  promptInstructions,
  suggestedDurationSeconds = 60,
  language = "en-IN",
  onAnalysisComplete,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(true);

  const recognitionInstanceRef = useRef<{ stop: () => void; abort: () => void } | null>(null);
  const recorderSessionRef = useRef<AudioRecorderSession | null>(null);
  const timerIntervalRef = useRef<any>(null);

  // Clean up on unmount or close
  useEffect(() => {
    if (!isOpen) {
      handleResetSession();
    }
  }, [isOpen]);

  const handleStartRecording = async () => {
    setErrorMessage(null);

    // 1. Check microphone permission
    const perm = await requestMicrophoneAccess();
    if (!perm.granted) {
      setPermissionGranted(false);
      setErrorMessage(perm.error || "Microphone access denied.");
      return;
    }
    setPermissionGranted(true);

    // 2. Start Speech Recognition
    const recInstance = startSpeechRecognition(language, {
      onStart: () => {
        setIsRecording(true);
      },
      onResult: (currentTranscript) => {
        setTranscript(currentTranscript);
      },
      onError: (err) => {
        console.warn("Speech recognition warning:", err);
      },
      onEnd: () => {
        // Recognition completed
      },
    });

    recognitionInstanceRef.current = recInstance;

    // 3. Start Audio Recording for Playback
    try {
      const recorder = new AudioRecorderSession();
      await recorder.start();
      recorderSessionRef.current = recorder;
    } catch (err) {
      console.warn("MediaRecorder start warning:", err);
    }

    // 4. Start timer
    setElapsedSeconds(0);
    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    setIsRecording(true);
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    clearInterval(timerIntervalRef.current);

    if (recognitionInstanceRef.current) {
      recognitionInstanceRef.current.stop();
      recognitionInstanceRef.current = null;
    }

    if (recorderSessionRef.current) {
      try {
        const { audioUrl } = await recorderSessionRef.current.stop();
        setRecordedAudioUrl(audioUrl);
      } catch (err) {
        console.warn("MediaRecorder stop warning:", err);
      }
    }
  };

  const handleResetSession = () => {
    if (isRecording) {
      handleStopRecording();
    }
    setTranscript("");
    setElapsedSeconds(0);
    setRecordedAudioUrl(null);
    setErrorMessage(null);
    setIsAnalyzing(false);
  };

  const handleSubmitForAnalysis = async () => {
    const textToAnalyze = transcript.trim();
    if (!textToAnalyze) {
      setErrorMessage("Please speak a few sentences before submitting for AI analysis.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const result = await analyzeSpokenSpeech({
        transcript: textToAnalyze,
        topic: topicTitle,
        practiceType: practiceMode,
        durationSeconds: elapsedSeconds || 15,
        language,
      });

      onAnalysisComplete(result, elapsedSeconds || 15);
      onClose();
    } catch (err) {
      console.error("AI Analysis error:", err);
      setErrorMessage("Failed to analyze speech. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl rounded-2xl p-6 space-y-6">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="bg-cyan-500/10 text-cyan-600 border-cyan-300 text-[10px] uppercase font-bold">
              {practiceMode}
            </Badge>
            <span className="text-xs text-muted-foreground">Target: ~{suggestedDurationSeconds}s</span>
          </div>
          <DialogTitle className="text-lg md:text-xl font-bold text-foreground">
            {topicTitle}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {promptInstructions}
          </DialogDescription>
        </DialogHeader>

        {/* ── Visual Recording Box ────────────────────────────────────────── */}
        <div className="p-6 rounded-2xl border border-border bg-muted/20 flex flex-col items-center justify-center space-y-5 text-center relative overflow-hidden">
          {/* Animated pulsing wave when recording */}
          {isRecording && (
            <div className="absolute inset-0 bg-cyan-500/5 animate-pulse pointer-events-none" />
          )}

          {/* Timer Display */}
          <div className="flex items-center gap-2 text-2xl font-mono font-extrabold text-foreground">
            <Clock className={`h-5 w-5 ${isRecording ? "text-rose-500 animate-pulse" : "text-muted-foreground"}`} />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          {/* Center Mic Button */}
          <div className="relative">
            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              disabled={isAnalyzing}
              className={`h-20 w-20 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
                isRecording
                  ? "bg-rose-500 text-white shadow-rose-500/30 animate-pulse"
                  : "bg-gradient-to-br from-cyan-600 to-indigo-600 text-white shadow-cyan-500/30"
              }`}
              title={isRecording ? "Click to Stop Speaking" : "Click to Start Speaking"}
              aria-label={isRecording ? "Stop recording speech" : "Start recording speech"}
            >
              {isRecording ? <Square className="h-7 w-7" /> : <Mic className="h-8 w-8" />}
            </button>
          </div>

          <p className="text-xs font-semibold text-foreground">
            {isRecording
              ? "🔴 Recording active... Speak clearly into your microphone."
              : transcript
              ? "Recording stopped. Review your transcript below or speak again."
              : "Click the microphone to start speaking."}
          </p>

          {/* Audio Playback if recorded */}
          {recordedAudioUrl && !isRecording && (
            <div className="w-full max-w-sm pt-2">
              <audio src={recordedAudioUrl} controls className="w-full h-10 rounded-xl" />
            </div>
          )}
        </div>

        {/* ── Live Transcript Box ────────────────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Live Speech Transcript
            </label>
            {transcript && (
              <span className="text-[11px] text-muted-foreground font-mono">
                {transcript.split(/\s+/).filter(Boolean).length} words
              </span>
            )}
          </div>

          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Your spoken transcript will appear here in real-time as you speak..."
            rows={4}
            className="w-full p-3.5 rounded-xl border border-border bg-background text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-cyan-500/40 text-foreground resize-none"
            disabled={isAnalyzing}
          />
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errorMessage}
          </div>
        )}

        {/* ── Footer Controls ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/70">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetSession}
              disabled={isRecording || isAnalyzing || !transcript}
              className="gap-1.5 rounded-xl text-xs flex-1 sm:flex-initial"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-xl text-xs flex-1 sm:flex-initial"
            >
              Cancel
            </Button>
          </div>

          <Button
            onClick={handleSubmitForAnalysis}
            disabled={!transcript.trim() || isRecording || isAnalyzing}
            className="gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white text-xs shadow hover:shadow-md w-full sm:w-auto"
          >
            <Sparkles className={`h-4 w-4 ${isAnalyzing ? "animate-spin" : ""}`} />
            {isAnalyzing ? "AI Analyzing Speech..." : "Submit for AI Analysis"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
