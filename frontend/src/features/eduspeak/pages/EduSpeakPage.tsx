// features/eduspeak/pages/EduSpeakPage.tsx
// Complete dedicated 🗣️ EduSpeak AI communication & speaking practice workspace.

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mic,
  Languages,
  TrendingUp,
  MessageSquare,
  Volume2,
  Briefcase,
  Sparkles,
  Bot,
  History,
  RotateCcw,
  RefreshCw,
  Target,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  EduSpeakDashboard,
  SpeakingPractice,
  PracticeSessionModal,
  EnglishPractice,
  LanguagePractice,
  PronunciationPractice,
  ConversationPractice,
  CareerCommunication,
  SpeakingAnalysisView,
  SpeakingProgressView,
  SpeakingHistoryView,
  AISpeakingMentor,
  PersonalizedPractice,
} from "../components";
import type {
  EduSpeakProfile,
  SpeakingSessionRecord,
  SpeechAnalysisResult,
  SpeakingProgressStats,
  SpeakingPracticeMode,
  LanguageOption,
} from "../types/eduspeak.types";
import {
  getEduSpeakProfile,
  updateEduSpeakProfile,
  getSpeakingSessions,
  saveSpeakingSession,
  deleteSpeakingSession,
  calculateSpeakingProgress,
} from "../services/eduSpeakService";

export const EduSpeakPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [activeTab, setActiveTab] = useState<string>("overview");
  const [speakProfile, setSpeakProfile] = useState<EduSpeakProfile | null>(null);
  const [sessions, setSessions] = useState<SpeakingSessionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active Practice Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTopic, setModalTopic] = useState<{
    title: string;
    mode: SpeakingPracticeMode;
    instructions: string;
    durationSeconds: number;
    language?: string;
  }>({
    title: "Professional Self Introduction",
    mode: "Self Introduction",
    instructions: "Speak for 90 seconds introducing your name, college, technical background, and career aspirations.",
    durationSeconds: 90,
    language: "en-IN",
  });

  // Recent Evaluation View State
  const [latestAnalysis, setLatestAnalysis] = useState<SpeechAnalysisResult | null>(null);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const p = await getEduSpeakProfile(user.uid, profile?.edu_id);
      setSpeakProfile(p);

      const s = await getSpeakingSessions(user.uid);
      setSessions(s);
    } catch (err) {
      console.error("EduSpeak loadData error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, profile]);

  const handleLaunchPractice = (topic: {
    title: string;
    mode: SpeakingPracticeMode;
    instructions: string;
    durationSeconds: number;
    language?: string;
  }) => {
    setModalTopic(topic);
    setIsModalOpen(true);
  };

  const handleAnalysisComplete = async (
    result: SpeechAnalysisResult,
    durationSeconds: number
  ) => {
    setLatestAnalysis(result);
    setActiveTab("analysis");

    if (!user || !speakProfile) return;

    // Save session to Firestore
    const newSession: Omit<SpeakingSessionRecord, "id"> = {
      userId: user.uid,
      language: modalTopic.language || speakProfile.preferredLanguage || "English",
      practiceType: modalTopic.mode,
      topic: modalTopic.title,
      transcript: result.transcript,
      durationSeconds: durationSeconds || 30,
      overallScore: result.overallScore,
      pronunciationScore: result.pronunciationScore,
      fluencyScore: result.fluencyScore,
      grammarScore: result.grammarScore,
      vocabularyScore: result.vocabularyScore,
      confidenceScore: result.confidenceScore,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      recommendations: result.recommendations,
      feedback: result.feedback,
      createdAt: new Date().toISOString(),
    };

    const savedId = await saveSpeakingSession(user.uid, newSession);
    setSessions((prev) => [{ id: savedId, ...newSession }, ...prev]);
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!user) return;
    await deleteSpeakingSession(sessionId);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const handleChangeLanguage = async (lang: LanguageOption) => {
    if (!user || !speakProfile) return;
    await updateEduSpeakProfile(user.uid, { preferredLanguage: lang.name });
    setSpeakProfile((prev) => (prev ? { ...prev, preferredLanguage: lang.name } : null));
  };

  if (isLoading || !speakProfile) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-cyan-600/20 text-cyan-600 flex items-center justify-center animate-pulse">
            <Mic className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            Initializing EduSpeak AI Speaking Coach...
          </p>
          <p className="text-xs text-muted-foreground">
            Calibrating speech recognition locales, phonetic models, and fluency diagnostics
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const stats: SpeakingProgressStats = calculateSpeakingProgress(speakProfile, sessions);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="EduSpeak — AI Voice Speaking & Communication Coach"
          subtitle="Real-time voice evaluation, spoken fluency diagnostics, multi-language speech drills, and mock interview simulations."
          icon={<Mic className="h-5 w-5 text-white" />}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="gap-2 rounded-xl border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Speaking Stats
          </Button>
        </PageHeader>

        {/* ── 1. Top Overview Dashboard ─────────────────────────────────── */}
        <EduSpeakDashboard
          profile={speakProfile}
          stats={stats}
          onStartDailyPractice={() =>
            handleLaunchPractice({
              title: "Daily Speaking: Introduce Yourself in a Job Interview",
              mode: "Self Introduction",
              instructions: "Speak for 90 seconds covering your background, projects, and career aspirations.",
              durationSeconds: 90,
            })
          }
          onOpenConversation={() => setActiveTab("conversation")}
          onOpenPronunciation={() => setActiveTab("pronunciation")}
          onOpenMentor={() => setActiveTab("mentor")}
          onTabChange={setActiveTab}
        />

        {/* ── 2. Tab Navigation Bar ─────────────────────────────────────── */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/60 p-1 rounded-2xl border border-border/70 flex flex-wrap gap-1">
            <TabsTrigger
              value="overview"
              className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <Mic className="h-4 w-4" />
              Speaking Practice
            </TabsTrigger>

            <TabsTrigger
              value="english"
              className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <span className="text-xs">🇬🇧</span>
              English
            </TabsTrigger>

            <TabsTrigger
              value="languages"
              className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <Languages className="h-4 w-4" />
              Other Languages
            </TabsTrigger>

            <TabsTrigger
              value="progress"
              className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <TrendingUp className="h-4 w-4" />
              Speaking Progress
            </TabsTrigger>

            <TabsTrigger
              value="conversation"
              className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <MessageSquare className="h-4 w-4" />
              Conversation Practice
            </TabsTrigger>

            <TabsTrigger
              value="pronunciation"
              className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <Volume2 className="h-4 w-4" />
              Pronunciation Lab
            </TabsTrigger>

            <TabsTrigger
              value="career"
              className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <Briefcase className="h-4 w-4" />
              Career Communication
            </TabsTrigger>

            <TabsTrigger
              value="personalized"
              className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <Target className="h-4 w-4" />
              Personalized Plan
            </TabsTrigger>

            <TabsTrigger
              value="mentor"
              className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <Bot className="h-4 w-4" />
              AI Speaking Coach
            </TabsTrigger>

            <TabsTrigger
              value="history"
              className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <History className="h-4 w-4" />
              Speaking History
            </TabsTrigger>

            {latestAnalysis && (
              <TabsTrigger
                value="analysis"
                className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-sm bg-cyan-500/10 text-cyan-600 border border-cyan-300"
              >
                <Sparkles className="h-4 w-4" />
                Latest Speech Report
              </TabsTrigger>
            )}
          </TabsList>

          {/* 1. Speaking Practice (12 Modes) */}
          <TabsContent value="overview" className="space-y-6 animate-in fade-in">
            <SpeakingPractice
              onSelectTopic={handleLaunchPractice}
              onOpenFreeSpeaking={() =>
                handleLaunchPractice({
                  title: "Free Speech Expression",
                  mode: "Free Speaking",
                  instructions: "Speak freely about any subject of your choice.",
                  durationSeconds: 60,
                })
              }
            />
          </TabsContent>

          {/* 2. English Track */}
          <TabsContent value="english" className="animate-in fade-in">
            <EnglishPractice
              currentLevel={speakProfile.currentLevel}
              onSelectPracticeTopic={handleLaunchPractice}
            />
          </TabsContent>

          {/* 3. Other Languages */}
          <TabsContent value="languages" className="animate-in fade-in">
            <LanguagePractice
              currentLanguage={speakProfile.preferredLanguage}
              onChangeLanguage={handleChangeLanguage}
              onSelectPracticeTopic={handleLaunchPractice}
            />
          </TabsContent>

          {/* 4. Speaking Progress */}
          <TabsContent value="progress" className="animate-in fade-in">
            <SpeakingProgressView stats={stats} />
          </TabsContent>

          {/* 5. Conversation Practice */}
          <TabsContent value="conversation" className="animate-in fade-in">
            <ConversationPractice userId={user?.uid || "guest"} />
          </TabsContent>

          {/* 6. Pronunciation Lab */}
          <TabsContent value="pronunciation" className="animate-in fade-in">
            <PronunciationPractice onPracticeWord={handleLaunchPractice} />
          </TabsContent>

          {/* 7. Career Communication */}
          <TabsContent value="career" className="animate-in fade-in">
            <CareerCommunication
              careerGoal={profile?.career_interest || "Software Engineering"}
              onSelectTopic={handleLaunchPractice}
              onAskMentor={(p) => setActiveTab("mentor")}
            />
          </TabsContent>

          {/* 8. Personalized Practice */}
          <TabsContent value="personalized" className="animate-in fade-in">
            <PersonalizedPractice
              profile={speakProfile}
              onSelectTopic={handleLaunchPractice}
              onAskMentor={(p) => setActiveTab("mentor")}
            />
          </TabsContent>

          {/* 9. AI Speaking Mentor */}
          <TabsContent value="mentor" className="animate-in fade-in">
            <AISpeakingMentor
              profile={speakProfile}
              onLaunchDrill={handleLaunchPractice}
            />
          </TabsContent>

          {/* 10. Speaking History */}
          <TabsContent value="history" className="animate-in fade-in">
            <SpeakingHistoryView
              sessions={sessions}
              onDeleteSession={handleDeleteSession}
              onPracticeAgain={(s) =>
                handleLaunchPractice({
                  title: s.topic,
                  mode: s.practiceType,
                  instructions: `Practice this topic again: "${s.topic}"`,
                  durationSeconds: s.durationSeconds || 60,
                })
              }
            />
          </TabsContent>

          {/* 11. Latest Speech Report */}
          {latestAnalysis && (
            <TabsContent value="analysis" className="animate-in fade-in">
              <SpeakingAnalysisView
                analysis={latestAnalysis}
                onPracticeAgain={() => setActiveTab("overview")}
                onAskMentor={(p) => setActiveTab("mentor")}
              />
            </TabsContent>
          )}
        </Tabs>

        {/* ── 3. The Voice Recording & AI Evaluation Modal ────────────────── */}
        <PracticeSessionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          topicTitle={modalTopic.title}
          practiceMode={modalTopic.mode}
          promptInstructions={modalTopic.instructions}
          suggestedDurationSeconds={modalTopic.durationSeconds}
          language={modalTopic.language || "en-IN"}
          onAnalysisComplete={handleAnalysisComplete}
        />
      </div>
    </DashboardLayout>
  );
};

export default EduSpeakPage;
