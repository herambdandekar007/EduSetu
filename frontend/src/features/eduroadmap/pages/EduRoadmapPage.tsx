// features/eduroadmap/pages/EduRoadmapPage.tsx
// Dedicated 🗺️ EduRoadmap AI workspace connecting personalized career pathways, skills gap analysis, and adaptive milestones.

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Map,
  Brain,
  TrendingUp,
  Target,
  Compass,
  FolderGit2,
  Cpu,
  Sparkles,
  RefreshCw,
  Bot,
  Layers,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import {
  RoadmapOverview,
  RoadmapTimeline,
  SkillsToLearn,
  SkillGapAnalysis,
  CurrentProgress,
  NextBestSteps,
  CareerPaths,
  RoadmapProjects,
  AdaptiveRoadmap,
} from "../components";
import type {
  UserEduRoadmap,
  RoadmapStep,
  SkillProgressItem,
  SkillGapItem,
  NextBestStep,
  CareerPathOption,
  RoadmapProject,
  RoadmapStats,
} from "../types/roadmap.types";
import {
  getUserRoadmap,
  saveUserRoadmap,
  updateStepProgress,
  toggleStepTask,
  calculateRoadmapStats,
  getAvailableCareerPaths,
} from "../services/roadmapService";
import {
  generateAIRoadmap,
  fetchAINextSteps,
  recalibrateAdaptiveRoadmap,
} from "../services/roadmapAIService";

export const EduRoadmapPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [activeTab, setActiveTab] = useState<string>("roadmap");
  const [roadmap, setRoadmap] = useState<UserEduRoadmap | null>(null);
  const [steps, setSteps] = useState<RoadmapStep[]>([]);
  const [skills, setSkills] = useState<SkillProgressItem[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGapItem[]>([]);
  const [nextSteps, setNextSteps] = useState<NextBestStep[]>([]);
  const [projects, setProjects] = useState<RoadmapProject[]>([]);
  const [careerPaths, setCareerPaths] = useState<CareerPathOption[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isAdapting, setIsAdapting] = useState(false);

  // Load or generate initial roadmap
  const loadData = async (forceRegenerate = false) => {
    if (!user) return;
    setIsLoading(true);

    try {
      // 1. Fetch available career paths
      const paths = getAvailableCareerPaths();
      setCareerPaths(paths);

      // 2. Fetch existing stored roadmap from Firestore
      const stored = await getUserRoadmap(user.uid);

      if (stored.roadmap && stored.steps.length && !forceRegenerate) {
        setRoadmap(stored.roadmap);
        setSteps(stored.steps);
        setSkills(stored.skills);
        setSkillGaps(stored.skillGaps);
        setNextSteps(stored.nextSteps);
        setProjects(stored.projects);
      } else {
        // Generate new AI-calibrated roadmap
        setIsRegenerating(true);
        const generated = await generateAIRoadmap({
          careerName: profile?.career_interest || "Software Engineering & Fullstack",
          educationLevel: profile?.education_level || "Undergraduate",
          course: profile?.course || "Computer Science",
          currentSkills: profile?.skills || ["Programming Basics", "Problem Solving"],
          weakTopics: ["Dynamic Programming", "Relational Normalization"],
          strongTopics: ["Arrays", "OOP Principles"],
          learningGaps: ["Operating Systems & Concurrency"],
        });

        // Generate AI Next steps
        const generatedNext = await fetchAINextSteps({
          careerName: generated.careerName,
          currentStage: generated.currentStage,
          completedStepTitles: generated.steps.filter((s) => s.status === "completed").map((s) => s.title),
          weakTopics: ["Dynamic Programming", "Relational Normalization"],
        });

        const newRoadmap: UserEduRoadmap = {
          id: user.uid,
          userId: user.uid,
          eduId: profile?.edu_id,
          careerId: "software-engineer",
          careerName: generated.careerName,
          currentStage: generated.currentStage,
          overallProgress: generated.overallProgress,
          currentMilestone: generated.currentMilestone,
          nextMilestone: generated.nextMilestone,
          status: "active",
          totalSteps: generated.steps.length,
          completedSteps: generated.steps.filter((s) => s.status === "completed").length,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setRoadmap(newRoadmap);
        setSteps(generated.steps);
        setSkills(generated.skills);
        setSkillGaps(generated.skillGaps);
        setProjects(generated.projects);
        setNextSteps(generatedNext);

        // Persist to Firestore
        await saveUserRoadmap(user.uid, {
          roadmap: newRoadmap,
          steps: generated.steps,
          skills: generated.skills,
          skillGaps: generated.skillGaps,
          projects: generated.projects,
          nextSteps: generatedNext,
        });
      }
    } catch (err) {
      console.error("EduRoadmap loadData error:", err);
    } finally {
      setIsLoading(false);
      setIsRegenerating(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, profile]);

  // ── Step Handlers ────────────────────────────────────────────────────────
  const handleToggleTask = async (stepId: string, taskId: string) => {
    if (!user) return;
    const updated = await toggleStepTask(user.uid, stepId, taskId, steps);
    setSteps(updated);
  };

  const handleMarkCompleted = async (stepId: string) => {
    if (!user) return;
    const updated = await updateStepProgress(user.uid, stepId, { status: "completed", progress: 100 }, steps);
    setSteps(updated);
  };

  const handleStartLearning = (step: RoadmapStep) => {
    navigate(`/learn?topic=${encodeURIComponent(step.title)}`);
  };

  const handleAskMentor = (stepOrPrompt: RoadmapStep | string) => {
    const promptText =
      typeof stepOrPrompt === "string"
        ? stepOrPrompt
        : `How should I effectively study and complete roadmap step "${stepOrPrompt.title}"?`;
    navigate(`/edumentor?prompt=${encodeURIComponent(promptText)}`);
  };

  // ── Career Switch Handler ────────────────────────────────────────────────
  const handleSwitchCareer = async (career: CareerPathOption) => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Persist career interest to profile document
      try {
        await updateDoc(doc(db, "profiles", user.uid), {
          career_interest: career.title,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn("Could not update career_interest in profile:", err);
      }

      const generated = await generateAIRoadmap({
        careerName: career.title,
        educationLevel: profile?.education_level || "Undergraduate",
        course: profile?.course || "Computer Science",
        currentSkills: skills.filter((s) => s.currentLevel >= 60).map((s) => s.name),
        weakTopics: skillGaps.map((g) => g.skill),
      });

      const newRoadmap: UserEduRoadmap = {
        id: user.uid,
        userId: user.uid,
        eduId: profile?.edu_id,
        careerId: career.id,
        careerName: career.title,
        currentStage: generated.currentStage,
        overallProgress: generated.overallProgress,
        currentMilestone: generated.currentMilestone,
        nextMilestone: generated.nextMilestone,
        status: "active",
        totalSteps: generated.steps.length,
        completedSteps: generated.steps.filter((s) => s.status === "completed").length,
        createdAt: roadmap?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setRoadmap(newRoadmap);
      setSteps(generated.steps);
      setSkills(generated.skills);
      setSkillGaps(generated.skillGaps);
      setProjects(generated.projects);

      await saveUserRoadmap(user.uid, {
        roadmap: newRoadmap,
        steps: generated.steps,
        skills: generated.skills,
        skillGaps: generated.skillGaps,
        projects: generated.projects,
        nextSteps,
      });

      setActiveTab("roadmap");
    } catch (err) {
      console.error("handleSwitchCareer error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Adaptive Recalibration Handler ───────────────────────────────────────
  const handleAdaptTopic = async (topic: string) => {
    if (!user) return;
    setIsAdapting(true);

    try {
      const res = await recalibrateAdaptiveRoadmap({
        strugglingTopic: topic,
        subject: roadmap?.careerName || "Core Discipline",
        currentSteps: steps,
      });

      if (res && res.insertedStep) {
        const newSteps = [res.insertedStep, ...steps];
        setSteps(newSteps);

        if (roadmap) {
          await saveUserRoadmap(user.uid, {
            roadmap,
            steps: newSteps,
            skills,
            skillGaps,
            projects,
            nextSteps,
          });
        }
      }
    } catch (err) {
      console.error("handleAdaptTopic error:", err);
    } finally {
      setIsAdapting(false);
    }
  };

  if (isLoading || !roadmap) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center animate-pulse">
            <Map className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            Calibrating Personalized EduRoadmap...
          </p>
          <p className="text-xs text-muted-foreground">
            Synthesizing academic milestones, skill gap analysis, and industry competency benchmarks
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const stats: RoadmapStats = calculateRoadmapStats(steps, skills, projects);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="EduRoadmap — Personalized Education & Career Development"
          subtitle="Your dynamic, milestone-driven pathway from current academic foundations to professional mastery."
          icon={<Map className="h-5 w-5 text-white" />}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(true)}
            disabled={isRegenerating}
            className="gap-2 rounded-xl border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`} />
            Regenerate Roadmap
          </Button>
        </PageHeader>

        {/* ── 1. Top Summary Banner ─────────────────────────────────────── */}
        <RoadmapOverview
          roadmap={roadmap}
          stats={stats}
          onExploreCareers={() => setActiveTab("careers")}
          onViewNextSteps={() => setActiveTab("nextsteps")}
          onRegenerateRoadmap={() => loadData(true)}
          isRegenerating={isRegenerating}
        />

        {/* ── 2. Tab Navigation ─────────────────────────────────────────── */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/60 p-1 rounded-2xl border border-border/70 flex flex-wrap gap-1">
            <TabsTrigger
              value="roadmap"
              className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              <Map className="h-4 w-4" />
              My Roadmap
            </TabsTrigger>

            <TabsTrigger
              value="skills"
              className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              <Brain className="h-4 w-4" />
              Skills to Learn
            </TabsTrigger>

            <TabsTrigger
              value="skillgap"
              className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              <Target className="h-4 w-4" />
              Skill Gap Analysis
            </TabsTrigger>

            <TabsTrigger
              value="progress"
              className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              <TrendingUp className="h-4 w-4" />
              Current Progress
            </TabsTrigger>

            <TabsTrigger
              value="nextsteps"
              className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              Next Steps
            </TabsTrigger>

            <TabsTrigger
              value="careers"
              className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              <Compass className="h-4 w-4" />
              Career Paths
            </TabsTrigger>

            <TabsTrigger
              value="projects"
              className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              <FolderGit2 className="h-4 w-4" />
              Projects
            </TabsTrigger>

            <TabsTrigger
              value="engine"
              className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              <Cpu className="h-4 w-4" />
              AI Roadmap Engine
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: My Roadmap Timeline */}
          <TabsContent value="roadmap" className="animate-in fade-in space-y-6">
            <RoadmapTimeline
              steps={steps}
              onToggleTask={handleToggleTask}
              onMarkCompleted={handleMarkCompleted}
              onStartLearning={handleStartLearning}
              onAskMentor={handleAskMentor}
            />
          </TabsContent>

          {/* Tab 2: Skills to Learn */}
          <TabsContent value="skills" className="animate-in fade-in">
            <SkillsToLearn
              skills={skills}
              onPracticeSkill={(sk) => handleAskMentor(`Give me practice problems and code exercises on: ${sk}`)}
              onAskMentorAboutSkill={(sk) => handleAskMentor(`Explain the fundamentals and application of: ${sk}`)}
            />
          </TabsContent>

          {/* Tab 3: Skill Gap Analysis */}
          <TabsContent value="skillgap" className="animate-in fade-in">
            <SkillGapAnalysis
              careerName={roadmap.careerName}
              skillGaps={skillGaps}
              onBridgeGap={(gap) => handleAskMentor(`Create a focused study strategy to master "${gap.skill}".`)}
              onAskMentor={handleAskMentor}
            />
          </TabsContent>

          {/* Tab 4: Current Progress */}
          <TabsContent value="progress" className="animate-in fade-in">
            <CurrentProgress stats={stats} />
          </TabsContent>

          {/* Tab 5: Next Steps */}
          <TabsContent value="nextsteps" className="animate-in fade-in">
            <NextBestSteps
              nextSteps={nextSteps}
              onTakeAction={(st) => handleAskMentor(`How can I accomplish this recommended action: "${st.title}"?`)}
              onAskMentor={handleAskMentor}
            />
          </TabsContent>

          {/* Tab 6: Career Paths */}
          <TabsContent value="careers" className="animate-in fade-in">
            <CareerPaths
              currentCareerId={roadmap.careerId}
              paths={careerPaths}
              onSwitchCareer={handleSwitchCareer}
              onAddSecondaryGoal={(c) => alert(`Added ${c.title} as your secondary learning interest!`)}
              onAskMentor={handleAskMentor}
            />
          </TabsContent>

          {/* Tab 7: Projects */}
          <TabsContent value="projects" className="animate-in fade-in">
            <RoadmapProjects
              projects={projects}
              onStartProject={(p) => handleAskMentor(`Provide an implementation guide and GitHub folder structure for "${p.title}".`)}
              onAskMentor={handleAskMentor}
            />
          </TabsContent>

          {/* Tab 8: AI Roadmap Engine */}
          <TabsContent value="engine" className="animate-in fade-in">
            <AdaptiveRoadmap
              onAdaptTopic={handleAdaptTopic}
              isAdapting={isAdapting}
              onAskMentor={handleAskMentor}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default EduRoadmapPage;
