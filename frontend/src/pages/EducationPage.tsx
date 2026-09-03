// frontend/src/pages/EducationPage.tsx
// Smart Education AI — Master Education & Academic Hub

import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Star,
  Search,
  Brain,
  Target,
  Map,
  Bot,
  Mic,
  BarChart3,
  FolderLock,
  Accessibility,
  GraduationCap,
  Users,
  Sparkles,
  Flame,
  Award,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Circle,
  ChevronRight,
  LayoutGrid,
  Send,
  Upload,
  FileText,
  MessageSquare,
  Calendar,
  AlertTriangle,
  CalendarDays,
  ShieldCheck,
  Check,
  Zap,
  Sliders,
  ExternalLink,
  Volume2,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

/* =========================================================
   EDUCATION FEATURE (LIFELONG EDUID & PROFILE)
========================================================= */
import { EducationDashboard } from "../features/education/components";

/* =========================================================
   EDUSPEAK FEATURE IMPORTS
========================================================= */
import {
  Languages,
  DailyVocabulary,
  GrammarLearning,
  AISpeakingPractice,
  FreeSpeaking,
  SpeakCorrectRepeat,
  RealLifeCommunication,
  PronunciationLab,
  SpeakingProgress,
} from "../features/eduspeak/components";
import type { LanguageCode } from "../features/eduspeak/types/eduspeak.types";

/* =========================================================
   EDUVAULT FEATURE IMPORTS
========================================================= */
import { useVaultDocuments } from "../features/eduvault/hooks/useVaultDocuments";
import { DocumentUploadModal } from "../features/eduvault/components/DocumentUploadModal";

/* =========================================================
   EDUMENTOR FEATURE IMPORTS
========================================================= */
import {
  MentorDashboard,
  MentorChat,
  TodaysPlan as MentorTodaysPlan,
  WeaknessPractice,
  QuickActions,
  StudyPlanner,
  ExamPreparation,
} from "../features/edumentor/components";
import {
  fetchStudentLearningContext,
  deriveNextBestAction,
  getTodayStudyPlan,
  getMentorChatSessions,
  deleteMentorChat,
} from "../features/edumentor/services/mentorService";
import type {
  StudentLearningContext,
  DailyStudyPlan,
  MentorChatSession,
  PlanTask,
} from "../features/edumentor/types/mentor.types";

/* =========================================================
   LEARN & ROADMAP SERVICES
========================================================= */
import { getLearnData } from "../features/learn/services/learnService";
import type { LearnData } from "../features/learn/types/learn.types";
import { getUserRoadmap } from "../features/eduroadmap/services/roadmapService";
import type { UserEduRoadmap, RoadmapStep, SkillGapItem, NextBestStep } from "../features/eduroadmap/types/roadmap.types";

/* =========================================================
   FIREBASE
========================================================= */
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

/* =========================================================
   SHARED UI
========================================================= */
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

/* =========================================================
   TYPES
========================================================= */
type SectionId =
  | "overview"
  | "education-profile"
  | "learn"
  | "eduspeak"
  | "edumentor"
  | "eduroadmap"
  | "eduvault"
  | "edumind"
  | "educareer"
  | "performance"
  | "eduaccess"
  | "teacherconnect"
  | "parentconnect";

type EduSpeakSubSection =
  | "dashboard"
  | "languages"
  | "ai-practice"
  | "roleplay"
  | "repeat-drill"
  | "pronunciation"
  | "free-speaking"
  | "vocabulary"
  | "grammar";

interface NavItem {
  id: SectionId;
  icon: ReactNode;
  emoji: string;
  label: string;
  accent: string;
  aiPowered?: boolean;
}

interface PlanItem {
  id: string;
  time: string;
  label: string;
  done: boolean;
}

interface Recommendation {
  id: string;
  icon: ReactNode;
  label: string;
  minutes: number;
  reason: string;
  section: SectionId;
}

/* =========================================================
   CONFIG & PALETTES
========================================================= */
const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "r1",
    icon: <GraduationCap className="h-4 w-4" />,
    label: "Update Academic Profile",
    minutes: 5,
    reason: "Verify your institution, board, and enrolled subjects to synchronize AI tutoring.",
    section: "education-profile",
  },
  {
    id: "r2",
    icon: <BookOpen className="h-4 w-4" />,
    label: "Continue Database Normalization",
    minutes: 20,
    reason: "Pick up from 3NF decomposition where you scored 85% on diagnostic.",
    section: "learn",
  },
  {
    id: "r3",
    icon: <Mic className="h-4 w-4" />,
    label: "90s Voice Self-Introduction",
    minutes: 10,
    reason: "AI Voice Coach recommends daily phonetic drill to improve fluency cadence.",
    section: "eduspeak",
  },
  {
    id: "r4",
    icon: <Bot className="h-4 w-4" />,
    label: "Ask 24/7 AI Mentor a Doubt",
    minutes: 15,
    reason: "Your AI Mentor has prepared answers for today's milestone checkpoints.",
    section: "edumentor",
  },
];

const DEFAULT_PLAN: PlanItem[] = [
  { id: "p1", time: "09:00 AM", label: "Subject Revision: Database Normalization (3NF)", done: true },
  { id: "p2", time: "11:30 AM", label: "Interactive Coding: Dijkstra Shortest Path", done: true },
  { id: "p3", time: "03:00 PM", label: "Spoken English AI Voice Drill: Interview Intro", done: false },
  { id: "p4", time: "05:30 PM", label: "Diagnostic AI Quiz: Graph Algorithms", done: false },
  { id: "p5", time: "08:00 PM", label: "Upload Completed Certificate to EduVault", done: false },
];

const NAV_ITEMS: NavItem[] = [
  { id: "overview", icon: <LayoutGrid className="h-4 w-4" />, emoji: "🏠", label: "Overview", accent: "blue" },
  { id: "education-profile", icon: <GraduationCap className="h-4 w-4" />, emoji: "🎓", label: "Education Profile", accent: "violet", aiPowered: true },
  { id: "learn", icon: <BookOpen className="h-4 w-4" />, emoji: "📚", label: "Learn", accent: "blue", aiPowered: true },
  { id: "eduspeak", icon: <Mic className="h-4 w-4" />, emoji: "🗣️", label: "EduSpeak", accent: "cyan", aiPowered: true },
  { id: "edumentor", icon: <Bot className="h-4 w-4" />, emoji: "🤖", label: "EduMentor", accent: "pink", aiPowered: true },
  { id: "eduroadmap", icon: <Map className="h-4 w-4" />, emoji: "🗺️", label: "EduRoadmap", accent: "amber", aiPowered: true },
  { id: "eduvault", icon: <FolderLock className="h-4 w-4" />, emoji: "📁", label: "EduVault", accent: "rose" },
  { id: "edumind", icon: <Brain className="h-4 w-4" />, emoji: "🧠", label: "EduMind", accent: "violet", aiPowered: true },
  { id: "educareer", icon: <Target className="h-4 w-4" />, emoji: "🎯", label: "EduCareer", accent: "emerald", aiPowered: true },
  { id: "performance", icon: <BarChart3 className="h-4 w-4" />, emoji: "📊", label: "Performance", accent: "indigo" },
  { id: "eduaccess", icon: <Accessibility className="h-4 w-4" />, emoji: "♿", label: "EduAccess", accent: "teal" },
  { id: "teacherconnect", icon: <GraduationCap className="h-4 w-4" />, emoji: "👨‍🏫", label: "Teacher Connect", accent: "orange" },
  { id: "parentconnect", icon: <Users className="h-4 w-4" />, emoji: "👪", label: "Parent Connect", accent: "slate" },
];

const accentMap: Record<string, { bg: string; text: string; bar: string; border: string }> = {
  violet: { bg: "bg-violet-500/10", text: "text-violet-600 dark:text-violet-400", bar: "bg-violet-500", border: "border-violet-500/20" },
  blue: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", bar: "bg-blue-500", border: "border-blue-500/20" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500", border: "border-emerald-500/20" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", bar: "bg-amber-500", border: "border-amber-500/20" },
  pink: { bg: "bg-pink-500/10", text: "text-pink-600 dark:text-pink-400", bar: "bg-pink-500", border: "border-pink-500/20" },
  cyan: { bg: "bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400", bar: "bg-cyan-500", border: "border-cyan-500/20" },
  indigo: { bg: "bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400", bar: "bg-indigo-500", border: "border-indigo-500/20" },
  rose: { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", bar: "bg-rose-500", border: "border-rose-500/20" },
  teal: { bg: "bg-teal-500/10", text: "text-teal-600 dark:text-teal-400", bar: "bg-teal-500", border: "border-teal-500/20" },
  orange: { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", bar: "bg-orange-500", border: "border-orange-500/20" },
  slate: { bg: "bg-slate-500/10", text: "text-slate-600 dark:text-slate-400", bar: "bg-slate-500", border: "border-slate-500/20" },
};

/* =========================================================
   HELPER COMPONENTS
========================================================= */
const ProgressBar = ({ value, accent = "blue" }: { value: number; accent?: string }) => {
  const c = accentMap[accent] ?? accentMap.blue;
  return (
    <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${c.bar}`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
};

const StatPill = ({
  icon,
  label,
  value,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  accent: string;
}) => {
  const c = accentMap[accent] ?? accentMap.violet;
  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm p-4 shadow-sm transition-all hover:border-border">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.bg} ${c.text}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xl font-bold tracking-tight text-foreground truncate">{value}</div>
        <div className="text-xs font-medium text-muted-foreground truncate">{label}</div>
      </div>
    </div>
  );
};

const SectionHeader = ({ item, onBack }: { item: NavItem; onBack: () => void }) => {
  const c = accentMap[item.accent];
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/50 mb-6">
      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.bg} ${c.text}`}>
          {item.icon}
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>{item.emoji}</span> {item.label}
            {item.aiPowered && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 gap-1 text-xs py-0.5">
                <Sparkles className="h-3 w-3" /> AI Engine Active
              </Badge>
            )}
          </h2>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onBack} className="gap-2 rounded-xl">
        <ArrowLeft className="h-4 w-4" />
        Back to Overview
      </Button>
    </div>
  );
};

const sectionBlurb = (id: SectionId): string => {
  const blurbs: Record<string, string> = {
    "education-profile": "Manage lifelong EduID, enrolled institution, dynamic board/degree details, and subjects.",
    learn: "Complete course syllabus, 17+ learning material formats, diagnostic quizzes, and adaptive tracking.",
    eduspeak: "12-mode spoken English trainer, pronunciation lab, real-time voice feedback, and mock interviews.",
    edumentor: "24/7 dedicated AI academic mentor bot for conceptual clarification and exam preparation.",
    eduroadmap: "Milestone-driven roadmap from fundamentals to industry readiness with skill gap detection.",
    eduvault: "Tamper-proof DigiLocker-grade vault for your academic degrees, mark sheets, and certificates.",
    edumind: "AI that analyzes your cognitive strengths, knowledge gaps, and retention trends.",
    educareer: "Discover matched career pathways, market salaries, and skill requirements.",
    performance: "Comprehensive marks tracker, attendance, project logs, and analytics.",
    eduaccess: "Accessibility engine with high-contrast, text-to-speech, and voice controls.",
    teacherconnect: "Direct communication with instructors for assignment reviews and mentoring.",
    parentconnect: "Real-time updates on academic progress, attendance, and quarterly reports.",
  };
  return blurbs[id] || "";
};

/* =========================================================
   1. OVERVIEW SECTION
========================================================= */
const OverviewSection = ({ onOpenSection }: { onOpenSection: (id: SectionId) => void }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const studentName = profile?.full_name || profile?.fullName || user?.displayName || "Student";
  const eduId = profile?.edu_id || profile?.eduId || "EDU-STU-2026";

  return (
    <div className="space-y-8">
      {/* 1. Hero Welcome Header */}
      <div className="p-6 md:p-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase px-3 py-1 rounded-full bg-primary text-primary-foreground tracking-wider flex items-center gap-1.5 shadow-sm">
                <Sparkles className="h-3 w-3" /> SMART EDUCATION AI HUB
              </span>
              <Badge variant="outline" className="text-xs bg-background/80 backdrop-blur-sm border-primary/30 font-mono text-primary font-bold">
                🆔 Permanent ID: {eduId}
              </Badge>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Welcome back, {studentName}! 👋
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your EduID-connected learning ecosystem is active. AI adaptive tracks, spoken English practice, certificate vault, and 24/7 mentorship are synchronized.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              onClick={() => onOpenSection("education-profile")}
              className="gap-2 rounded-2xl bg-primary text-primary-foreground shadow hover:shadow-md font-bold text-xs"
            >
              <GraduationCap className="h-4 w-4" />
              Education Profile
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenSection("learn")}
              className="gap-2 rounded-2xl bg-card/80 backdrop-blur-sm border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 font-bold text-xs"
            >
              <BookOpen className="h-4 w-4" />
              Open Syllabus
            </Button>
          </div>
        </div>

        {/* 4 Hero Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6">
          <StatPill icon={<TrendingUp className="h-5 w-5" />} label="Overall Progress" value="72%" accent="blue" />
          <StatPill icon={<Flame className="h-5 w-5" />} label="Learning Streak" value="12 Days" accent="orange" />
          <StatPill icon={<Award className="h-5 w-5" />} label="Skills Mastered" value="18" accent="emerald" />
          <StatPill icon={<Star className="h-5 w-5" />} label="Academic Level" value="Year 3 • Sem 6" accent="violet" />
        </div>
      </div>

      {/* 2. AI Daily Recommendations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold tracking-tight text-foreground">AI Daily Recommendations</h3>
          </div>
          <span className="text-xs text-muted-foreground">Updated in real-time</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {RECOMMENDATIONS.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex"
            >
              <Card className="flex flex-col justify-between w-full border-border/70 bg-card/60 backdrop-blur-sm hover:border-primary/40 hover:shadow-md transition-all rounded-2xl">
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                      {item.icon}
                    </span>
                    <Badge variant="secondary" className="text-xs font-normal">
                      {item.minutes} min
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-sm mt-3 text-foreground">{item.label}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 flex-1">{item.reason}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-3 justify-between px-0 text-primary hover:bg-transparent hover:text-primary/80 group text-xs font-bold"
                    onClick={() => onOpenSection(item.section)}
                  >
                    Start module
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 3. Learning Ecosystem Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold tracking-tight text-foreground">Education AI Modules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {NAV_ITEMS.filter((item) => item.id !== "overview").map((item, index) => {
            const c = accentMap[item.accent];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex"
              >
                <Card
                  onClick={() => onOpenSection(item.id)}
                  className="flex flex-col justify-between w-full cursor-pointer border-border/70 bg-card/50 backdrop-blur-sm hover:border-primary/40 hover:shadow-lg transition-all rounded-2xl group relative overflow-hidden"
                >
                  <CardContent className="p-5 flex flex-col h-full justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${c.bg} ${c.text} text-xl`}>
                          {item.emoji}
                        </div>
                        {item.aiPowered && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-transparent text-xs font-semibold">
                            <Sparkles className="h-3 w-3 mr-1" /> AI Powered
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                        {item.label}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{sectionBlurb(item.id)}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-end text-xs font-semibold text-primary">
                      <span className="flex items-center gap-1 group-hover:underline">
                        Open Section <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   2. LEARN SECTION
========================================================= */
const LearnSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [learnData, setLearnData] = useState<LearnData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    let isMounted = true;
    getLearnData(user.uid)
      .then((data) => {
        if (isMounted) setLearnData(data);
      })
      .catch((err) => console.warn("Failed to load learn data in EducationPage:", err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [user]);

  const subjects = learnData?.subjects || [];
  const filtered = subjects.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <Card className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-primary/5 to-background shadow-sm overflow-hidden">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-600 text-white">
                📚 SMART EDUCATION AI — LEARN
              </span>
              <Badge variant="outline" className="text-xs">
                EduID-Connected Curriculum
              </Badge>
            </div>
            <h3 className="text-xl font-bold text-foreground">
              AI-Powered Personalized Learning Management System
            </h3>
            <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
              Explore your personalized syllabus, 17+ learning material formats, interactive quizzes, assignments, and continuous AI adaptive mastery tracking.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={() => navigate("/learn")}
              className="gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs shadow hover:shadow-md font-bold"
            >
              <BookOpen className="h-4 w-4" />
              Open Full 📚 Learn Workspace
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl border border-border/70 bg-card space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">My Subjects</span>
          <h4 className="text-lg font-bold text-foreground">{isLoading ? "..." : `${subjects.length} Active`}</h4>
          <p className="text-[11px] text-muted-foreground">Personalized by EduID</p>
        </div>

        <div className="p-4 rounded-2xl border border-border/70 bg-card space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Learning Materials</span>
          <h4 className="text-lg font-bold text-indigo-600">{isLoading ? "..." : `${learnData?.materials?.length || 0} Available`}</h4>
          <p className="text-[11px] text-muted-foreground">Notes, PDFs, Videos</p>
        </div>

        <div className="p-4 rounded-2xl border border-border/70 bg-card space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Quizzes & Tests</span>
          <h4 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {isLoading ? "..." : `${learnData?.progress?.quizPerformance ?? 78}% Avg Score`}
          </h4>
          <p className="text-[11px] text-muted-foreground">Diagnostic AI analysis</p>
        </div>

        <div className="p-4 rounded-2xl border border-border/70 bg-card space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Adaptive Mastery</span>
          <h4 className="text-lg font-bold text-cyan-600">
            {isLoading ? "..." : `${learnData?.progress?.overallProgress ?? 72}% Completed`}
          </h4>
          <button onClick={() => navigate("/learn")} className="text-[11px] text-indigo-600 hover:underline font-semibold flex items-center gap-1">
            Open Learn Hub →
          </button>
        </div>
      </div>

      {/* Subject Directory */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-foreground">Assigned Syllabus Subjects</h3>
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-xl text-xs"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-sm font-semibold text-muted-foreground">
            Synchronizing student curriculum...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm border border-dashed rounded-2xl text-muted-foreground">
            No subjects found. Add subjects in Education Profile or click Open Learn Workspace.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((subject) => (
              <Card key={subject.id} className="rounded-2xl border-border/70 bg-card/60 hover:border-indigo-500/40 transition-all">
                <CardContent className="p-5 space-y-3.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="outline" className="text-[10px] font-semibold mb-1">
                        {subject.id}
                      </Badge>
                      <h4 className="font-bold text-base text-foreground">{subject.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {subject.teacher} • {subject.chapters} Chapters • {subject.topics} Topics
                      </p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">
                      {subject.quizPerformance ? `${subject.quizPerformance}% Avg` : "Active"}
                    </Badge>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground">Syllabus Completion</span>
                      <span className="font-bold text-foreground">{subject.progress}%</span>
                    </div>
                    <ProgressBar value={subject.progress} accent="indigo" />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/learn?tab=subjects&subjectId=${subject.id}`)}
                      className="text-xs rounded-xl gap-1 font-bold"
                    >
                      <BookOpen className="h-3.5 w-3.5" /> Start Learning
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/learn?tab=materials&subjectId=${subject.id}`)}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-bold"
                    >
                      View Materials →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* =========================================================
   3. EDUSPEAK SECTION
========================================================= */
const EduSpeakSection = () => {
  const navigate = useNavigate();
  const [activeSubTab, setActiveSubTab] = useState<EduSpeakSubSection>("dashboard");
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("en-US");

  const subNavItems: { id: EduSpeakSubSection; label: string; icon: string }[] = [
    { id: "dashboard", label: "Overview", icon: "📊" },
    { id: "languages", label: "Languages", icon: "🌐" },
    { id: "ai-practice", label: "AI Practice", icon: "🤖" },
    { id: "roleplay", label: "Real Life Dialogues", icon: "💬" },
    { id: "repeat-drill", label: "Speak & Correct", icon: "🔄" },
    { id: "pronunciation", label: "Pronunciation Lab", icon: "🎧" },
    { id: "free-speaking", label: "Free Speech", icon: "🎙️" },
    { id: "vocabulary", label: "Vocabulary", icon: "📖" },
    { id: "grammar", label: "Grammar Rules", icon: "📝" },
  ];

  const renderSubSection = () => {
    switch (activeSubTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <SpeakingProgress />
            <DailyVocabulary />
          </div>
        );
      case "languages":
        return <Languages selectedLanguage={selectedLanguage} onSelectLanguage={setSelectedLanguage} />;
      case "ai-practice":
        return <AISpeakingPractice />;
      case "roleplay":
        return <RealLifeCommunication />;
      case "repeat-drill":
        return <SpeakCorrectRepeat />;
      case "pronunciation":
        return <PronunciationLab />;
      case "free-speaking":
        return <FreeSpeaking />;
      case "vocabulary":
        return <DailyVocabulary />;
      case "grammar":
        return <GrammarLearning />;
      default:
        return <SpeakingProgress />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-primary/5 to-background shadow-sm">
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-cyan-600 text-white">
                🗣️ EDUSPEAK AI VOICE COACH
              </span>
              <Badge variant="outline" className="text-xs">
                Spoken English & Communication
              </Badge>
            </div>
            <h3 className="text-lg font-bold text-foreground">
              AI Voice-based English Speaking & Pronunciation Lab
            </h3>
            <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
              Practice 12 speaking modes, conversational mock interviews, pronunciation drills, and regional language translations with real-time AI speech feedback.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={() => navigate("/eduspeak")}
              className="gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs shadow hover:shadow-md font-bold"
            >
              <Mic className="h-4 w-4" />
              Open Full 🗣️ EduSpeak
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sub Tabs Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {subNavItems.map((item) => {
          const active = activeSubTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSubTab(item.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all shrink-0 ${
                active
                  ? "border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 ring-1 ring-cyan-500/20 shadow-sm"
                  : "border-border/70 bg-card/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
        >
          {renderSubSection()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/* =========================================================
   4. EDUMENTOR SECTION
========================================================= */
const EduMentorSection = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [mentorTab, setMentorTab] = useState("dashboard");
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
      const studentCtx = await fetchStudentLearningContext(user.uid, profile?.edu_id || profile?.eduId);
      setContext(studentCtx);

      const plan = await getTodayStudyPlan(user.uid, profile?.edu_id || profile?.eduId);
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
    setMentorTab("chat");
  };

  const handleAskMentor = (prompt: string) => {
    setChatInitialPrompt(prompt);
    setMentorTab("chat");
  };

  const handleStartLearning = (subject: string, topic: string) => {
    setChatInitialPrompt(`Explain the complete syllabus and roadmap for learning "${topic}" in ${subject}.`);
    setMentorTab("chat");
  };

  const handlePracticeWeakness = (_subject: string, _topic: string) => {
    setMentorTab("weakness");
  };

  const handleAskAboutTask = (task: PlanTask) => {
    setChatInitialPrompt(`How should I effectively study and complete today's task: "${task.taskName}" on ${task.topic} in ${task.subject}?`);
    setMentorTab("chat");
  };

  const handleNewChatSession = () => {
    const newId = `session_${user?.uid || "guest"}_${Date.now()}`;
    setActiveSessionId(newId);
    setMentorTab("chat");
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
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3 rounded-2xl border border-border/70 bg-card p-8">
        <Bot className="h-8 w-8 text-pink-500 animate-bounce" />
        <p className="text-sm font-semibold text-foreground">Synchronizing AI Mentor data...</p>
      </div>
    );
  }

  const nextBestAction = deriveNextBestAction(context);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card className="rounded-3xl border border-pink-500/30 bg-gradient-to-br from-pink-500/10 via-primary/5 to-background shadow-sm">
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-pink-600 text-white">
                🤖 24/7 AI PERSONAL TUTOR
              </span>
              <Badge variant="outline" className="text-xs">
                Context-Aware Mentor
              </Badge>
            </div>
            <h3 className="text-lg font-bold text-foreground">
              EduMentor Academic & Doubt-Solving Assistant
            </h3>
            <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
              Ask any question from your syllabus, generate revision flashcards, test your understanding with adaptive MCQ checks, and receive targeted remediation plans.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={() => navigate("/edumentor")}
              className="gap-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs shadow hover:shadow-md font-bold"
            >
              <Bot className="h-4 w-4" />
              Open Full 🤖 EduMentor
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={mentorTab} onValueChange={setMentorTab} className="w-full">
        <TabsList className="grid grid-cols-3 sm:grid-cols-6 h-auto p-1 bg-muted/60 rounded-2xl">
          <TabsTrigger value="dashboard" className="text-xs py-2 rounded-xl gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="chat" className="text-xs py-2 rounded-xl gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" /> Mentor Chat
          </TabsTrigger>
          <TabsTrigger value="today" className="text-xs py-2 rounded-xl gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> Today's Plan
          </TabsTrigger>
          <TabsTrigger value="weakness" className="text-xs py-2 rounded-xl gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" /> Weakness
          </TabsTrigger>
          <TabsTrigger value="planner" className="text-xs py-2 rounded-xl gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" /> Planner
          </TabsTrigger>
          <TabsTrigger value="examprep" className="text-xs py-2 rounded-xl gap-1.5">
            <Award className="h-3.5 w-3.5" /> Exam Prep
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="animate-in fade-in space-y-6 mt-6">
          <MentorDashboard
            context={context}
            todayPlan={todayPlan}
            nextBestAction={nextBestAction}
            onStartLearning={handleStartLearning}
            onPracticeWeakness={handlePracticeWeakness}
            onAskEduMentor={handleAskMentor}
            onTabChange={setMentorTab}
          />
          <QuickActions onSelectAction={handleSelectQuickAction} />
        </TabsContent>

        <TabsContent value="chat" className="animate-in fade-in space-y-6 mt-6">
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

        <TabsContent value="today" className="animate-in fade-in space-y-6 mt-6">
          <MentorTodaysPlan
            context={context}
            plan={todayPlan}
            onUpdatePlan={setTodayPlan}
            onStartTask={handleStartLearning}
            onAskAIAboutTask={handleAskAboutTask}
          />
        </TabsContent>

        <TabsContent value="weakness" className="animate-in fade-in mt-6">
          <WeaknessPractice
            context={context}
            onAskMentorAboutConcept={(topic) => handleAskMentor(`Explain common misconceptions and give practice drills for "${topic}".`)}
          />
        </TabsContent>

        <TabsContent value="planner" className="animate-in fade-in mt-6">
          <StudyPlanner
            context={context}
            onApplyPlan={(p) => {
              setTodayPlan(p);
              setMentorTab("today");
            }}
          />
        </TabsContent>

        <TabsContent value="examprep" className="animate-in fade-in mt-6">
          <ExamPreparation
            context={context}
            onAskMentorExamDoubt={(topic) => handleAskMentor(`What are the most frequent exam questions asked from ${topic}?`)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

/* =========================================================
   5. EDUROADMAP SECTION
========================================================= */
const EduRoadmapSection = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [roadmapData, setRoadmapData] = useState<UserEduRoadmap | null>(null);
  const [steps, setSteps] = useState<RoadmapStep[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGapItem[]>([]);
  const [nextSteps, setNextSteps] = useState<NextBestStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    let isMounted = true;
    getUserRoadmap(user.uid)
      .then((data) => {
        if (!isMounted) return;
        setRoadmapData(data.roadmap);
        setSteps(data.steps || []);
        setSkillGaps(data.skillGaps || []);
        setNextSteps(data.nextSteps || []);
      })
      .catch((err) => console.warn("Failed to load roadmap in EducationPage:", err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [user]);

  const activeStep =
    steps.find((s) => s.status === "in_progress") ||
    steps.find((s) => s.status === "recommended") ||
    steps[0];
  const completedCount = steps.filter((s) => s.status === "completed").length;
  const progressPct =
    roadmapData?.overallProgress ??
    (steps.length ? Math.round((completedCount / steps.length) * 100) : 68);

  return (
    <div className="space-y-6">
      {/* Active Roadmap Banner */}
      <Card className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-primary/5 to-background shadow-sm">
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-600 text-white">
                🗺️ ACTIVE CAREER ROADMAP
              </span>
              <Badge variant="outline" className="text-xs">
                {roadmapData?.careerName || profile?.career_interest || "Software Engineering & Fullstack"}
              </Badge>
            </div>
            <h3 className="text-lg font-bold text-foreground">
              Personalized Milestone Pathway
            </h3>
            <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
              Step-by-step roadmap from current skills and syllabus topics to career mastery. Includes skill gap analysis, next best actions, and capstone projects.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={() => navigate("/eduroadmap")}
              className="gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs shadow hover:shadow-md font-bold"
            >
              <Map className="h-4 w-4" />
              Open Full 🗺️ EduRoadmap
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Real Roadmap Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl border border-border/70 bg-card space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Current Stage</span>
          <h4 className="text-sm font-bold text-foreground">
            {isLoading ? "Loading..." : activeStep?.stage || roadmapData?.currentStage || "Foundation"}
          </h4>
          <p className="text-[11px] text-amber-600 font-medium">
            Milestone {completedCount + 1} of {steps.length || 7} Active
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-border/70 bg-card space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Readiness Score</span>
          <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {isLoading ? "..." : `${progressPct}% Industry Ready`}
          </h4>
          <p className="text-[11px] text-muted-foreground">Validated via diagnostic checks</p>
        </div>

        <div className="p-4 rounded-2xl border border-border/70 bg-card space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Next Action</span>
          <h4 className="text-sm font-bold text-foreground truncate" title={activeStep?.title}>
            {isLoading ? "..." : activeStep?.title || roadmapData?.nextMilestone || "Core Foundations"}
          </h4>
          <p className="text-[11px] text-muted-foreground">Estimated: {activeStep?.estimatedDuration || "3 Days"}</p>
        </div>

        <div className="p-4 rounded-2xl border border-border/70 bg-card space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Skill Gaps</span>
          <h4 className="text-sm font-bold text-rose-500">
            {isLoading ? "..." : `${skillGaps.length || 2} Critical Gaps`}
          </h4>
          <button onClick={() => navigate("/eduroadmap")} className="text-[11px] text-amber-600 hover:underline font-semibold">
            Bridge Gaps in EduRoadmap →
          </button>
        </div>
      </div>

      {/* Live Next Best Actions Widget */}
      {nextSteps.length > 0 && (
        <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Prioritized Next Best Actions for Your Roadmap
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/eduroadmap")}
              className="text-xs text-amber-600 hover:text-amber-700"
            >
              View All Milestones →
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {nextSteps.slice(0, 2).map((step) => (
              <div
                key={step.id}
                className="p-3.5 rounded-xl border border-border/70 bg-card/80 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold text-amber-600 border-amber-500/30">
                      {step.type}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-medium">{step.estimatedTime}</span>
                  </div>
                  <h5 className="text-xs font-bold text-foreground">{step.title}</h5>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{step.reason}</p>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/edumentor?prompt=${encodeURIComponent(`Guide me on: ${step.title}`)}`)}
                    className="text-[11px] h-7 rounded-lg gap-1"
                  >
                    <Bot className="h-3 w-3 text-pink-500" /> Ask EduMentor
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/learn?topic=${encodeURIComponent(step.subjectOrSkill || step.title)}`)}
                    className="text-[11px] h-7 rounded-lg gap-1 bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <BookOpen className="h-3 w-3" /> Learn Topic
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   6. EDUVAULT SECTION
========================================================= */
const EduVaultSection = () => {
  const { documents, refresh } = useVaultDocuments();
  const [uploadOpen, setUploadOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-2xl bg-gradient-to-r from-rose-500/10 via-primary/10 to-violet-500/10 border border-rose-500/20">
        <div>
          <h4 className="text-base font-bold text-foreground flex items-center gap-2">
            <FolderLock className="h-5 w-5 text-rose-500" /> EduVault Document Repository
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your verified degrees, mark sheets, and career credentials with permanent EduID linking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setUploadOpen(true)} className="rounded-xl gap-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold">
            <Upload className="h-4 w-4" /> Upload Doc
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate("/eduvault")} className="rounded-xl gap-1.5 text-xs bg-background font-bold">
            Open Full Vault <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {documents.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-2 border-border/80 bg-muted/20 text-center p-8">
          <CardContent className="space-y-3 p-0">
            <FolderLock className="h-10 w-10 text-muted-foreground mx-auto opacity-50" />
            <div className="space-y-1">
              <h5 className="font-bold text-sm text-foreground">No documents in vault yet</h5>
              <p className="text-xs text-muted-foreground">
                Upload your degree, semester mark sheets, or certifications.
              </p>
            </div>
            <Button size="sm" onClick={() => setUploadOpen(true)} className="rounded-xl gap-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold">
              <Upload className="h-4 w-4" /> Upload First Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {documents.slice(0, 6).map((doc) => (
            <Card key={doc.id} className="rounded-2xl border-border/70 hover:border-rose-500/40 hover:shadow-sm transition-all h-full cursor-pointer" onClick={() => navigate("/eduvault")}>
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-11 w-11 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-foreground truncate block">{doc.documentName}</span>
                    <span className="text-xs text-muted-foreground truncate block">{doc.category} • {doc.type}</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0 capitalize border-emerald-500/30 text-emerald-600">
                  {doc.verificationStatus}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DocumentUploadModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploadSuccess={() => refresh()}
      />
    </div>
  );
};

/* =========================================================
   7. EDUMIND SECTION
========================================================= */
const EduMindSection = () => (
  <div className="space-y-5">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="rounded-2xl border-border/70">
        <CardContent className="p-5 space-y-3">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Identified Strengths
          </h3>
          <div className="space-y-2">
            {["Relational Database Architecture (SQL)", "Discrete Mathematics & Logic", "Linear Data Structures"].map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-xs p-2.5 rounded-xl bg-muted/40 text-foreground font-medium">
                <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/70">
        <CardContent className="p-5 space-y-3">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Focus Areas for Improvement
          </h3>
          <div className="space-y-2">
            {["Graph Algorithms (Dijkstra edge relaxation)", "Bayesian Conditional Probability", "Operating System Thread Locks"].map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-xs p-2.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium">
                <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>

    <Card className="rounded-2xl border-border/70">
      <CardContent className="p-5 space-y-3">
        <h3 className="font-bold text-base text-foreground">Cognitive Learning Style Profile</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          AI analysis shows high visual & hands-on practical retention (78%). Spaced revision every 4 days recommended for theoretical proofs.
        </p>
      </CardContent>
    </Card>
  </div>
);

/* =========================================================
   8. EDUCAREER SECTION
========================================================= */
const EduCareerSection = () => (
  <div className="space-y-5">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[
        { title: "Full Stack Developer", match: "88% Match", salary: "₹8 - ₹16 LPA", demand: "High Demand", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" },
        { title: "AI/ML Solutions Engineer", match: "76% Match", salary: "₹10 - ₹22 LPA", demand: "Trending", color: "text-violet-600 bg-violet-500/10 border-violet-500/20" },
        { title: "Database & Cloud Architect", match: "82% Match", salary: "₹9 - ₹18 LPA", demand: "Stable", color: "text-blue-600 bg-blue-500/10 border-blue-500/20" },
      ].map((track) => (
        <Card key={track.title} className="rounded-2xl border-border/70 hover:border-primary/40 transition-all">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Badge className={`${track.color} text-[10px] font-bold`}>{track.demand}</Badge>
              <span className="text-xs font-bold text-foreground">{track.match}</span>
            </div>
            <h4 className="font-bold text-base text-foreground">{track.title}</h4>
            <p className="text-xs text-muted-foreground">Market Salary: <span className="font-semibold text-foreground">{track.salary}</span></p>
            <Button size="sm" variant="outline" className="w-full text-xs rounded-xl mt-2 font-bold">
              View Skill Gap Map
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

/* =========================================================
   9. PERFORMANCE SECTION
========================================================= */
const PerformanceSection = () => {
  const subjects = [
    { name: "Database Management Systems", value: 85 },
    { name: "Data Structures & Algorithms", value: 78 },
    { name: "Operating Systems", value: 74 },
    { name: "Mathematics & Statistics", value: 65 },
  ];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <StatPill icon={<BarChart3 className="h-5 w-5" />} label="Average Marks" value="79%" accent="indigo" />
        <StatPill icon={<CheckCircle2 className="h-5 w-5" />} label="Attendance" value="92%" accent="emerald" />
        <StatPill icon={<FileText className="h-5 w-5" />} label="Projects Done" value="6" accent="blue" />
        <StatPill icon={<Award className="h-5 w-5" />} label="Achievements" value="4" accent="amber" />
      </div>
      <Card className="rounded-2xl border-border/70">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-bold text-base text-foreground">Course Subject Breakdown</h3>
          <div className="space-y-4">
            {subjects.map((subject) => (
              <div key={subject.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="font-semibold text-foreground">{subject.name}</span>
                  <span className="text-muted-foreground font-bold">{subject.value}%</span>
                </div>
                <ProgressBar value={subject.value} accent="indigo" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/* =========================================================
   10. EDUACCESS SECTION
========================================================= */
const EduAccessSection = () => {
  const [settings, setSettings] = useState({
    highContrast: false,
    tts: true,
    screenReader: false,
    voiceControl: false,
  });

  const items = [
    { key: "highContrast", label: "High Contrast Mode", desc: "Enhances text legibility for visually impaired students." },
    { key: "tts", label: "Text-to-Speech Engine", desc: "Reads out chapter summaries and quizzes automatically." },
    { key: "screenReader", label: "Screen Reader Support", desc: "Optimizes ARIA labels for accessibility assistive tech." },
    { key: "voiceControl", label: "Voice Navigation", desc: "Navigate syllabus and tests with speech recognition." },
  ] as const;

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Configure accessibility and assistive learning options across your workspace.</p>
      <div className="grid sm:grid-cols-2 gap-3.5">
        {items.map((item) => (
          <Card key={item.key} className="rounded-2xl border-border/70">
            <CardContent className="p-4 flex justify-between items-center gap-4">
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-foreground block">{item.label}</span>
                <span className="text-[11px] text-muted-foreground block">{item.desc}</span>
              </div>
              <Switch
                checked={settings[item.key]}
                onCheckedChange={(value) => setSettings((prev) => ({ ...prev, [item.key]: value }))}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

/* =========================================================
   11. TEACHER CONNECT SECTION
========================================================= */
const TeacherConnectSection = () => (
  <Card className="rounded-2xl border-border/70">
    <CardContent className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold">
          SK
        </div>
        <div>
          <h4 className="text-sm font-bold text-foreground">Prof. S. Kulkarni</h4>
          <p className="text-xs text-muted-foreground">Department of Computer Science • DBMS Lead</p>
        </div>
      </div>
      <p className="text-xs text-foreground leading-relaxed p-3.5 rounded-xl bg-muted/40">
        "Your ER diagram normalization assignment was well constructed. Please make sure to test multi-valued dependency edge cases before next week's exam."
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold">
          Reply to Instructor
        </Button>
      </div>
    </CardContent>
  </Card>
);

/* =========================================================
   12. PARENT CONNECT SECTION
========================================================= */
const ParentConnectSection = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      <StatPill icon={<CheckCircle2 className="h-5 w-5" />} label="Attendance" value="92%" accent="emerald" />
      <StatPill icon={<TrendingUp className="h-5 w-5" />} label="Academic Progress" value="79%" accent="blue" />
      <StatPill icon={<BookOpen className="h-5 w-5" />} label="Syllabus Completion" value="72%" accent="violet" />
      <StatPill icon={<Award className="h-5 w-5" />} label="Certificates Earned" value="4" accent="amber" />
    </div>
    <Card className="rounded-2xl border-border/70">
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-foreground">Quarterly Performance Summary</h4>
          <p className="text-xs text-muted-foreground">Verified by University Academic Council</p>
        </div>
        <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1.5 font-bold">
          <FileText className="h-3.5 w-3.5" /> Download Report Card
        </Button>
      </CardContent>
    </Card>
  </div>
);

/* =========================================================
   SCHEDULE CHECKLIST WIDGET
========================================================= */
const ScheduleChecklist = ({ plan, onToggle }: { plan: PlanItem[]; onToggle: (id: string) => void }) => (
  <Card className="rounded-2xl border-border/70 bg-card/60 backdrop-blur-sm shadow-sm">
    <CardContent className="p-4 divide-y divide-border/60">
      {plan.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onToggle(item.id)}
          className="w-full flex items-center gap-3 py-3 px-2 rounded-xl text-left hover:bg-muted/40 transition-colors group"
        >
          {item.done ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground/60 group-hover:text-primary shrink-0 transition-colors" />
          )}
          <span className="text-xs font-medium text-muted-foreground w-20 shrink-0">{item.time}</span>
          <span className={`text-xs ${item.done ? "line-through text-muted-foreground" : "font-semibold text-foreground"}`}>
            {item.label}
          </span>
        </button>
      ))}
    </CardContent>
  </Card>
);

/* =========================================================
   MAIN EDUCATION PAGE COMPONENT
========================================================= */
const EducationPage = () => {
  const [plan, setPlan] = useState<PlanItem[]>(DEFAULT_PLAN);
  const [activeSection, setActiveSection] = useState<SectionId>("overview");

  const togglePlanItem = (id: string) => {
    setPlan((prev) => prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  };

  const activeNavItem = NAV_ITEMS.find((item) => item.id === activeSection)!;

  const renderSection = () => {
    switch (activeSection) {
      case "overview": return <OverviewSection onOpenSection={setActiveSection} />;
      case "education-profile": return <EducationDashboard />;
      case "learn": return <LearnSection />;
      case "eduspeak": return <EduSpeakSection />;
      case "edumentor": return <EduMentorSection />;
      case "eduroadmap": return <EduRoadmapSection />;
      case "eduvault": return <EduVaultSection />;
      case "edumind": return <EduMindSection />;
      case "educareer": return <EduCareerSection />;
      case "performance": return <PerformanceSection />;
      case "eduaccess": return <EduAccessSection />;
      case "teacherconnect": return <TeacherConnectSection />;
      case "parentconnect": return <ParentConnectSection />;
      default: return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* Master Page Header */}
        <PageHeader
          icon={<GraduationCap className="h-5 w-5 text-white" />}
          title="🎓 Smart Education AI"
          subtitle="Your personalized AI-powered education and career workspace"
        >
          <Badge className="bg-white/15 text-white border-white/20 gap-1.5 hidden sm:inline-flex rounded-xl px-3 py-1 text-xs">
            <Sparkles className="h-3.5 w-3.5" /> AI Engine Active
          </Badge>
        </PageHeader>

        {/* Global Hub Navigation Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {NAV_ITEMS.map((item) => {
            const c = accentMap[item.accent];
            const active = item.id === activeSection;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-2xl border px-4 py-2.5 text-xs font-bold transition-all shrink-0 shadow-sm ${
                  active
                    ? `${c.bg} ${c.text} ${c.border} ring-2 ring-primary/20 scale-[1.02]`
                    : "border-border/70 bg-card/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <span>{item.emoji}</span>
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Section Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {activeSection !== "overview" && (
              <SectionHeader item={activeNavItem} onBack={() => setActiveSection("overview")} />
            )}

            {renderSection()}

            {/* Daily Schedule widget */}
            {(activeSection === "overview" || activeSection === "edumentor") && (
              <div className="mt-8 space-y-3">
                <h3 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" /> Today's Learning Checklist
                </h3>
                <ScheduleChecklist plan={plan} onToggle={togglePlanItem} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default EducationPage;