// features/performance/types/performance.types.ts
// Comprehensive TypeScript interfaces for SMART EDUCATION AI — Achievements & Progress System

export type PerformanceTab =
  | "overview"
  | "academic"
  | "learning"
  | "quizzes"
  | "assignments"
  | "skills"
  | "projects"
  | "activities"
  | "achievements"
  | "certificates"
  | "milestones"
  | "analytics";

export type AnalyticsTimeRange =
  | "7d"
  | "30d"
  | "3m"
  | "6m"
  | "1y"
  | "all";

/* =========================================================
   1. OVERALL PROGRESS & WEIGHTS
========================================================= */

export interface ProgressWeights {
  learning: number;    // default 0.30 (30%)
  quizzes: number;     // default 0.20 (20%)
  assignments: number; // default 0.15 (15%)
  skills: number;      // default 0.15 (15%)
  projects: number;    // default 0.10 (10%)
  activities: number;  // default 0.10 (10%)
}

export interface ProgressBreakdown {
  learningScore: number;
  quizScore: number;
  assignmentScore: number;
  skillScore: number;
  projectScore: number;
  activityScore: number;
  overallScore: number; // calculated weighted 0-100
}

export interface PerformanceOverviewStats {
  overallScore: number;
  streakDays: number;
  activeSubjectsCount: number;
  skillsCount: number;
  quizzesCompletedCount: number;
  assignmentsCompletedCount: number;
  projectsCompletedCount: number;
  certificatesCount: number;
  achievementsCount: number;
  learningHours: number;
  progressBreakdown: ProgressBreakdown;
  lastUpdated: string;
}

/* =========================================================
   2. ACADEMIC PROGRESS
========================================================= */

export interface AcademicRecord {
  id: string;
  userId: string;
  eduId?: string;
  educationLevel: "School" | "High School" | "Diploma" | "Undergraduate" | "Postgraduate" | "Doctorate" | "Other";
  academicYear: string;       // e.g. "2025-2026"
  semester: string;           // e.g. "Semester 3" or "Term 1"
  subject: string;            // e.g. "Mathematics & Statistics"
  examName: string;           // e.g. "Mid-Semester Examination"
  maximumMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;              // e.g. "A+", "A", "B", "O"
  cgpa?: number;
  sgpa?: number;
  resultDate: string;         // YYYY-MM-DD
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

/* =========================================================
   3. SKILL PROGRESS
========================================================= */

export type SkillCategory =
  | "Technical"
  | "Soft Skills"
  | "Academic"
  | "Language"
  | "Digital"
  | "Creative"
  | "Professional";

export type SkillProficiencyLevel =
  | "Beginner"
  | "Intermediate"
  | "Advanced"
  | "Expert";

export interface SkillGrowthLog {
  date: string;
  level: SkillProficiencyLevel;
  progress: number;
  source: "Learn" | "EduRoadmap" | "Project" | "Certificate" | "Manual" | "AI Assessment";
}

export interface SkillProgressItem {
  id: string;
  userId: string;
  eduId?: string;
  skillName: string;
  category: SkillCategory;
  currentLevel: SkillProficiencyLevel;
  previousLevel?: SkillProficiencyLevel;
  progressPercentage: number; // 0-100
  learningEvidence?: string;  // description or link
  verified: boolean;
  growthHistory: SkillGrowthLog[];
  lastUpdated: string;
}

/* =========================================================
   4. PROJECT PROGRESS
========================================================= */

export type ProjectStatus =
  | "Planning"
  | "In Progress"
  | "Completed"
  | "On Hold"
  | "Archived";

export interface ProjectItem {
  id: string;
  userId: string;
  eduId?: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progressPercentage: number; // 0-100
  technologies: string[];
  teamType: "Individual" | "Team";
  teamMembersCount?: number;
  startDate: string;
  targetCompletionDate?: string;
  completionDate?: string;
  githubUrl?: string;
  liveDemoUrl?: string;
  linkedCertificateId?: string;
  syncedToPortfolio: boolean;
  createdAt: string;
  updatedAt: string;
}

/* =========================================================
   5. ACTIVITIES
========================================================= */

export type ActivityCategory =
  | "Workshop"
  | "Seminar"
  | "Hackathon"
  | "Competition"
  | "Sports"
  | "Cultural Activity"
  | "Volunteer Work"
  | "Club Activity"
  | "Training"
  | "Other";

export interface ActivityItem {
  id: string;
  userId: string;
  eduId?: string;
  name: string;
  category: ActivityCategory;
  organizer: string;
  date: string;
  role: string;               // e.g. "Participant", "Organizer", "Team Lead"
  description: string;
  evidenceDocumentUrl?: string;
  certificateId?: string;
  hoursSpent?: number;
  createdAt: string;
  updatedAt: string;
}

/* =========================================================
   6. ACHIEVEMENTS
========================================================= */

export type AchievementCategory =
  | "Academic Achievement"
  | "Hackathon Achievement"
  | "Competition Achievement"
  | "Sports Achievement"
  | "Cultural Achievement"
  | "Leadership Achievement"
  | "Research Achievement"
  | "Innovation Achievement"
  | "Community Achievement"
  | "Other Achievement";

export type AchievementLevel =
  | "Institution Level"
  | "District Level"
  | "State Level"
  | "National Level"
  | "International Level";

export type VerificationStatus =
  | "Unverified"
  | "Pending"
  | "Verified"
  | "Rejected";

export interface AchievementItem {
  id: string;
  userId: string;
  eduId?: string;
  title: string;
  category: AchievementCategory;
  level: AchievementLevel;
  organizer: string;
  date: string;
  position?: string;          // e.g. "1st Place", "Finalist", "Gold Medalist"
  description: string;
  evidenceUrl?: string;
  certificateId?: string;
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  verificationDate?: string;
  createdAt: string;
  updatedAt: string;
}

/* =========================================================
   7. ACHIEVEMENT BADGES
========================================================= */

export interface BadgeItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "Learning" | "Quizzes" | "Projects" | "Achievements" | "Streaks" | "Community";
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;           // 0-100
  criteria: string;
  points: number;
}

/* =========================================================
   8. MILESTONES & JOURNEY
========================================================= */

export interface MilestoneItem {
  id: string;
  title: string;
  category: "Identity" | "Academic" | "Quiz" | "Skill" | "Project" | "Certificate" | "Achievement" | "Hours";
  description: string;
  status: "completed" | "current" | "upcoming";
  completedDate?: string;
  targetDate?: string;
  progressPercent: number;
  iconName: string;
}

/* =========================================================
   9. PROGRESS ANALYTICS & INSIGHTS
========================================================= */

export interface TimeSeriesPoint {
  date: string;
  label: string;
  score: number;
  accuracy?: number;
  studyMinutes?: number;
  cumulativeSkills?: number;
}

export interface SubjectAnalyticsComparison {
  subject: string;
  progress: number;
  quizAverage: number;
  assignmentAverage: number;
  masteryScore: number;
}

export interface SkillCategoryDistribution {
  category: string;
  count: number;
  averageProgress: number;
}

export interface PerformanceAnalyticsReport {
  timeRange: AnalyticsTimeRange;
  performanceTrend: TimeSeriesPoint[];
  learningTrend: TimeSeriesPoint[];
  quizScoreTrend: TimeSeriesPoint[];
  studyTimeTrend: TimeSeriesPoint[];
  subjectComparisons: SubjectAnalyticsComparison[];
  skillDistribution: SkillCategoryDistribution[];
  completionRate: number;
  overallAccuracy: number;
}

export interface PersonalizedInsight {
  id: string;
  type: "positive" | "improvement" | "recommendation" | "streak" | "milestone";
  title: string;
  description: string;
  metric?: string;
  actionLabel?: string;
  actionTab?: PerformanceTab;
  date: string;
}
