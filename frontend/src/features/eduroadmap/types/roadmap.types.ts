// features/eduroadmap/types/roadmap.types.ts
// Complete TypeScript definitions for 🗺️ EduRoadmap

export type RoadmapStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "locked"
  | "recommended";

export type RoadmapStage =
  | "Foundation"
  | "Core Knowledge"
  | "Technical Skills"
  | "Practice & Assessment"
  | "Advanced Learning"
  | "Specialization"
  | "Projects"
  | "Portfolio"
  | "Career Readiness";

export type SkillPriority = "Low" | "Medium" | "High" | "Critical";

export type SkillGroup = "current" | "strong" | "improve" | "missing";

export interface LearningResource {
  title: string;
  url?: string;
  type: "article" | "video" | "doc" | "course";
  duration?: string;
}

export interface PracticeTask {
  id: string;
  title: string;
  completed: boolean;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface QuizAssessment {
  title: string;
  questionsCount: number;
  passed?: boolean;
  score?: number;
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  stage: string;
  order: number;
  status: RoadmapStatus;
  progress: number; // 0 - 100
  skillsRequired: string[];
  learningResources: LearningResource[];
  practiceTasks: PracticeTask[];
  quizAssessment?: QuizAssessment;
  estimatedDuration: string;
  completedAt?: string;
  isUnlocked?: boolean;
}

export interface SkillProgressItem {
  id: string;
  name: string;
  category: string;
  currentLevel: number; // 0 - 100
  requiredLevel: number; // 0 - 100
  priority: SkillPriority;
  group: SkillGroup;
  relatedStepIds?: string[];
  relatedSteps?: string[];
}

export interface SkillGapItem {
  id: string;
  skill: string;
  category: string;
  currentLevel: number;
  requiredLevel: number;
  gapPercentage: number;
  priority: SkillPriority;
  recommendation: string;
  relatedStepTitle?: string;
}

export interface NextBestStep {
  id: string;
  type: "learn" | "practice" | "revise" | "skill" | "quiz" | "project";
  title: string;
  subjectOrSkill: string;
  reason: string;
  estimatedTime: string;
  priority: number;
  recommendedActions: string[];
  status: "active" | "completed" | "dismissed";
}

export interface CareerPathOption {
  id: string;
  title: string;
  description: string;
  category: string;
  requiredSkills: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedStages: number;
  readinessScore: number;
  salaryRange?: string;
  marketDemand?: "High" | "Very High" | "Emerging";
  isPrimary?: boolean;
  isSecondary?: boolean;
}

export interface RoadmapProject {
  id: string;
  title: string;
  category: "Beginner" | "Intermediate" | "Advanced" | "Portfolio";
  difficulty: "Easy" | "Medium" | "Hard";
  requiredSkills: string[];
  description: string;
  estimatedDuration: string;
  relatedCareer: string;
  relatedRoadmapStep: string;
  status: "Recommended" | "In Progress" | "Completed";
  progress?: number;
  repoUrl?: string;
  demoUrl?: string;
}

export interface UserEduRoadmap {
  id: string;
  userId: string;
  eduId?: string;
  careerId: string;
  careerName: string;
  currentStage: string;
  overallProgress: number;
  currentMilestone: string;
  nextMilestone: string;
  status: "active" | "completed" | "archived";
  totalSteps: number;
  completedSteps: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapStats {
  overallProgress: number;
  completedMilestones: number;
  inProgressMilestones: number;
  remainingMilestones: number;
  totalSkills: number;
  completedSkills: number;
  skillsInProgress: number;
  quizProgress: number;
  projectProgress: number;
}
