// features/learn/pages/LearnPage.tsx
// Entry page for the SMART EDUCATION AI — LEARN section.
// Flow: Firebase Auth -> user.uid -> profiles/{uid} -> educationProfiles/{eduId} -> learnService -> UI.

import { useEffect, useState, useRef } from "react";
import {
  GraduationCap,
  Loader2,
  AlertCircle,
  UserX,
  Mic,
  MicOff,
  Volume2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import LearnOverview from "../components/LearnOverview";
import { getLearnData } from "../services/learnService";
import { readAloud, stopReading } from "../services/aiLearnService";
import type { LearnData } from "../types/learn.types";

export default function LearnPage() {
  const { user, profile: authProfile, loading: authLoading } = useAuth();

  const [data, setData] = useState<LearnData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceNotification, setVoiceNotification] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  const loadLearningData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const result = await getLearnData(user.uid);
      setData(result);
    } catch (err) {
      console.error("❌ Learn data load failed:", err);
      const message =
        err instanceof Error ? err.message : "Failed to load your learning data.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      setError("You are not logged in.");
      return;
    }

    loadLearningData();
  }, [user, authLoading]);

  // Voice Command Handler
  const handleToggleVoiceCommands = () => {
    if (isVoiceListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsVoiceListening(false);
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert("Voice speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-IN";

      recognition.onstart = () => {
        setIsVoiceListening(true);
        setVoiceNotification("Listening for voice commands (e.g. 'Read This Page', 'Show Progress')...");
      };

      recognition.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          const command = lastResult[0].transcript.trim().toLowerCase();
          setVoiceNotification(`Heard: "${command}"`);

          if (command.includes("read this page") || command.includes("read aloud")) {
            const summary = `Welcome to your Smart Education AI Learn workspace. You have ${data?.subjects?.length || 0} active subjects, ${data?.quizzes?.length || 0} available quizzes, and an overall progress of ${data?.progress?.overallProgress || 72} percent.`;
            readAloud(summary);
          } else if (command.includes("refresh") || command.includes("reload")) {
            loadLearningData();
          } else if (command.includes("stop")) {
            stopReading();
          }
        }
      };

      recognition.onerror = () => {
        setIsVoiceListening(false);
      };

      recognition.onend = () => {
        setIsVoiceListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.warn("Voice command error:", err);
    }
  };

  // ===========================================================
  // AUTH / LOADING
  // ===========================================================

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          <span className="text-sm font-semibold">
            Loading your personalized SMART EDUCATION AI curriculum...
          </span>
          <span className="text-xs text-muted-foreground">
            Connecting EduID, Firestore subjects, quizzes, and adaptive learning paths
          </span>
        </div>
      </DashboardLayout>
    );
  }

  // ===========================================================
  // NO USER
  // ===========================================================

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
          <UserX className="h-10 w-10 text-slate-400" />
          <p className="text-sm font-semibold text-slate-700">
            Please log in to access your SMART EDUCATION AI learning dashboard.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // ===========================================================
  // ERROR
  // ===========================================================

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
          <AlertCircle className="h-10 w-10 text-rose-500" />
          <p className="text-sm font-bold text-slate-700">
            Failed to load learning data
          </p>
          <p className="max-w-lg text-xs text-slate-500">{error}</p>
          <Button onClick={loadLearningData} size="sm" className="mt-2 rounded-xl">
            Retry Loading
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // ===========================================================
  // NO DATA
  // ===========================================================

  if (!data) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
          <AlertCircle className="h-10 w-10 text-amber-500" />
          <p className="text-sm font-bold text-slate-700">No learning data available</p>
          <Button onClick={loadLearningData} size="sm" className="mt-2 rounded-xl">
            Initialize Curriculum
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const { profile, education } = data;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          icon={<GraduationCap className="h-5 w-5 text-white" />}
          title="📚 SMART EDUCATION AI — Learn"
          subtitle={
            education
              ? `${profile?.fullName || authProfile?.full_name || "Student"} · EduID: ${
                  profile?.eduId || authProfile?.edu_id || "EDU-STU-2026"
                } · ${education.educationLevel || "College"}${
                  education.degreeOrCourse ? ` · ${education.degreeOrCourse}` : ""
                }`
              : "Your personalized AI-powered learning management system"
          }
        >
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleToggleVoiceCommands}
              className={`gap-1.5 rounded-xl font-semibold shadow-sm transition-all text-xs h-9 px-3.5 ${
                isVoiceListening
                  ? "bg-rose-500 text-white hover:bg-rose-600 border border-rose-600 animate-pulse [&_svg]:text-white"
                  : "bg-white hover:bg-slate-100 text-indigo-950 border border-white/40 [&_svg]:text-indigo-600"
              }`}
              title="Voice Commands (EduAccess)"
            >
              {isVoiceListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              <span className="hidden sm:inline">
                {isVoiceListening ? "Listening..." : "Voice Control"}
              </span>
            </Button>

            <Button
              size="sm"
              onClick={() => {
                const textToRead = `Smart Education AI Learn section for ${profile?.fullName || "Student"}. Overall progress is ${data.progress?.overallProgress || 72} percent with ${data.subjects?.length || 0} enrolled subjects.`;
                readAloud(textToRead);
              }}
              className="gap-1.5 rounded-xl bg-white hover:bg-slate-100 text-indigo-950 font-semibold shadow-sm border border-white/40 transition-all text-xs h-9 px-3.5 [&_svg]:text-indigo-600"
              title="Read Aloud Summary"
            >
              <Volume2 className="h-4 w-4" />
              <span className="hidden sm:inline">Read Aloud</span>
            </Button>

            <Button
              size="sm"
              onClick={loadLearningData}
              className="gap-1.5 rounded-xl bg-white hover:bg-slate-100 text-indigo-950 font-semibold shadow-sm border border-white/40 transition-all text-xs h-9 px-3.5 [&_svg]:text-indigo-600"
              title="Refresh Data"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </PageHeader>

        {/* Voice Announcement Banner */}
        {voiceNotification && (
          <div
            aria-live="polite"
            className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-700 dark:text-cyan-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-600" />
              <span>{voiceNotification}</span>
            </div>
            <button
              onClick={() => setVoiceNotification(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* =====================================================
            LEARNING WORKSPACE (Left-Sidebar Navigation & Sub-modules)
        ===================================================== */}
        <section aria-label="Smart Education AI Learn Workspace">
          <LearnOverview data={data} />
        </section>
      </div>
    </DashboardLayout>
  );
}