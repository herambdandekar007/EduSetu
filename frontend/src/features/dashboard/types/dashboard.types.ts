// frontend/src/features/dashboard/types/dashboard.types.ts
// Comprehensive TypeScript definitions for SMART EDUCATION AI 3D Dashboard

export interface StudentDashboardData {
  userId: string;
  fullName: string;
  firstName: string;
  eduId: string;
  email: string;
  avatarUrl?: string;
  photoURL?: string;
  educationLevel: string;
  institutionName: string;
  profileCompletion: number;
  learningStatus: string;
  streakDays: number;
  userPoints: number;
}

export interface LearningIntelligenceData {
  strengths: string[];
  weaknesses: string[];
  learningSpeed: string; // e.g. "Optimal (1.2x)"
  studyConsistency: number; // e.g. 92%
  conceptMastery: number; // e.g. 84%
  accuracyRate: number; // e.g. 88%
  activeLearningMinutesThisWeek: number;
}

export interface OverallLearningProgress {
  overallPercentage: number;
  subjectsCompleted: number;
  totalSubjects: number;
  topicsCompleted: number;
  totalTopics: number;
  learningMaterialsCompleted: number;
  quizAccuracy: number;
  studyHoursTotal: number;
  weeklyTargetHours: number;
  weeklyCompletedHours: number;
}

export interface TodayTaskItem {
  id: string;
  title: string;
  subject: string;
  estimatedMinutes: number;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
  actionUrl: string;
  category: "Study" | "Quiz" | "Speech" | "Revision" | "Assignment";
}

export interface AIRecommendationItem {
  id: string;
  title: string;
  category: "Weakness Drill" | "Next Skill" | "Revision" | "Career Skill" | "Speech Lab";
  reason: string;
  subject?: string;
  actionUrl: string;
  actionLabel: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

export interface RoadmapOverviewData {
  targetCareer: string;
  currentStage: string;
  nextSkill: string;
  upcomingMilestone: string;
  skillsRemainingCount: number;
  completionPercentage: number;
  milestones: {
    id: string;
    title: string;
    status: "Completed" | "Current" | "Upcoming";
    stepNumber: number;
  }[];
}

export interface CareerDirectionData {
  primaryCareer: string;
  careerMatchPercentage: number;
  readinessScore: number;
  skillsToImprove: string[];
  topAlternativeCareers: { name: string; matchScore: number }[];
}

export interface PerformanceOverviewData {
  overallMarksScore: number;
  quizPerformanceScore: number;
  assignmentScore: number;
  attendanceScore: number;
  activityScore: number;
  timeFilter: "weekly" | "monthly" | "semester" | "overall";
  recentWeeklyScores: { label: string; score: number }[];
}

export interface RecentAchievementItem {
  id: string;
  title: string;
  category: "Hackathon" | "Certificate" | "Quiz Mastery" | "Streak Milestone" | "Project";
  organization: string;
  date: string;
  iconName?: string;
}

export interface UpcomingTaskItem {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  priority: "High" | "Medium" | "Low";
  type: "Assignment" | "Quiz" | "Exam" | "Project";
  completed: boolean;
}

export interface DashboardNotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "ai_insight" | "reminder" | "achievement" | "verification";
  read: boolean;
}
