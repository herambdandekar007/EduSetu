// features/edumentor/pages/EduMentorPage.tsx
// Dedicated EduMentor AI workspace connecting all personal education mentoring modules.

import React, { useEffect, useState } from "react";
import {
  Bot,
  LayoutDashboard,
  MessageSquare,
  Calendar,
  AlertTriangle,
  Sparkles,
  CalendarDays,
  Target,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  MentorDashboard,
  MentorChat,
  TodaysPlan,
  WeaknessPractice,
  QuickActions,
  StudyPlanner,
  ExamPreparation,
} from "../components";
import type {
  StudentLearningContext,
  DailyStudyPlan,
  MentorChatSession,
  PlanTask,
} from "../types/mentor.types";
import {
  fetchStudentLearningContext,
  deriveNextBestAction,
  getTodayStudyPlan,
  getMentorChatSessions,
  deleteMentorChat,
} from "../services/mentorService";

export const EduMentorPage: React.FC = () => {
  const { user, profile } = useAuth();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [context, setContext] = useState<StudentLearningContext | null>(null);
  const [todayPlan, setTodayPlan] = useState<DailyStudyPlan | null>(null);
  const [chatSessions, setChatSessions] = useState<MentorChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const studentCtx = await fetchStudentLearningContext(user.uid, profile?.edu_id);
      setContext(studentCtx);

      const plan = await getTodayStudyPlan(user.uid, profile?.edu_id);
      setTodayPlan(plan);

      const sessions = await getMentorChatSessions(user.uid);
      setChatSessions(sessions);
      if (sessions.length > 0 && !activeSessionId) {
        setActiveSessionId(sessions[0].id);
      }
    } catch (err) {
      console.error("EduMentor loadData error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, profile]);

  const handleSelectQuickAction = (prompt: string) => {
    setChatInitialPrompt(prompt);
    setActiveTab("chat");
  };

  const handleAskMentor = (prompt: string) => {
    setChatInitialPrompt(prompt);
    setActiveTab("chat");
  };

  const handleStartLearning = (subject: string, topic: string) => {
    setChatInitialPrompt(`Explain the complete syllabus and roadmap for learning "${topic}" in ${subject}.`);
    setActiveTab("chat");
  };

  const handlePracticeWeakness = (_subject: string, _topic: string) => {
    setActiveTab("weakness");
  };

  const handleAskAboutTask = (task: PlanTask) => {
    setChatInitialPrompt(`How should I effectively study and complete today's task: "${task.taskName}" on ${task.topic} in ${task.subject}?`);
    setActiveTab("chat");
  };

  const handleNewChatSession = () => {
    const newId = `session_${user?.uid || "guest"}_${Date.now()}`;
    setActiveSessionId(newId);
    setActiveTab("chat");
  };

  const handleDeleteChatSession = async (sessionId: string) => {
    try {
      await deleteMentorChat(sessionId);
      setChatSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
      }
    } catch (err) {
      console.error("Failed to delete chat session:", err);
    }
  };

  if (isLoading || !context) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center animate-pulse">
            <Bot className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            Loading EduMentor AI Assistant...
          </p>
          <p className="text-xs text-muted-foreground">
            Calibrating student learning parameters and diagnostic history
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const nextBestAction = deriveNextBestAction(context);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="EduMentor — Personal AI Education Mentor"
          subtitle="Your real-time personalized AI guide for daily study schedules, weakness improvement, and exam preparation."
          icon={<Bot className="h-5 w-5 text-white" />}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="gap-2 rounded-xl border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Learning Data
          </Button>
        </PageHeader>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/60 p-1 rounded-2xl border border-border/70 flex flex-wrap gap-1">
            <TabsTrigger
              value="dashboard"
              className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </TabsTrigger>

            <TabsTrigger
              value="chat"
              className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              <MessageSquare className="h-4 w-4" />
              Ask EduMentor
            </TabsTrigger>

            <TabsTrigger
              value="plan"
              className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              <Calendar className="h-4 w-4" />
              Today's Plan
            </TabsTrigger>

            <TabsTrigger
              value="weakness"
              className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              <AlertTriangle className="h-4 w-4" />
              Weakness Practice
            </TabsTrigger>

            <TabsTrigger
              value="actions"
              className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              Quick Actions
            </TabsTrigger>

            <TabsTrigger
              value="planner"
              className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              <CalendarDays className="h-4 w-4" />
              Study Planner
            </TabsTrigger>

            <TabsTrigger
              value="examprep"
              className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              <Target className="h-4 w-4" />
              Exam Prep
            </TabsTrigger>
          </TabsList>

          {/* 1. Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 animate-in fade-in">
            <MentorDashboard
              context={context}
              todayPlan={todayPlan}
              nextBestAction={nextBestAction}
              onStartLearning={handleStartLearning}
              onPracticeWeakness={handlePracticeWeakness}
              onAskEduMentor={handleAskMentor}
              onTabChange={setActiveTab}
            />
          </TabsContent>

          {/* 2. Ask EduMentor Chat Tab */}
          <TabsContent value="chat" className="animate-in fade-in">
            <MentorChat
              context={context}
              sessions={chatSessions}
              activeSessionId={activeSessionId}
              initialPrompt={chatInitialPrompt}
              onSelectSession={setActiveSessionId}
              onNewSession={handleNewChatSession}
              onDeleteSession={handleDeleteChatSession}
            />
          </TabsContent>

          {/* 3. Today's Plan Tab */}
          <TabsContent value="plan" className="animate-in fade-in">
            <TodaysPlan
              context={context}
              plan={todayPlan}
              onUpdatePlan={setTodayPlan}
              onStartTask={handleStartLearning}
              onAskAIAboutTask={handleAskAboutTask}
            />
          </TabsContent>

          {/* 4. Weakness Practice Tab */}
          <TabsContent value="weakness" className="animate-in fade-in">
            <WeaknessPractice
              context={context}
              onAskMentorAboutConcept={(topic) => handleAskMentor(`Explain the key concepts of ${topic} and provide simple analogies.`)}
            />
          </TabsContent>

          {/* 5. Quick Actions Tab */}
          <TabsContent value="actions" className="animate-in fade-in">
            <QuickActions onSelectAction={handleSelectQuickAction} />
          </TabsContent>

          {/* 6. Study Planner Tab */}
          <TabsContent value="planner" className="animate-in fade-in">
            <StudyPlanner
              context={context}
              onApplyPlan={(p) => {
                setTodayPlan(p);
                setActiveTab("plan");
              }}
            />
          </TabsContent>

          {/* 7. Exam Prep Tab */}
          <TabsContent value="examprep" className="animate-in fade-in">
            <ExamPreparation
              context={context}
              onAskMentorExamDoubt={(topic) => handleAskMentor(`What are the most frequent exam questions asked from ${topic}?`)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default EduMentorPage;
