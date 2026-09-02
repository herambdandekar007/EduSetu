// features/edumentor/types/mentor.types.ts
// Comprehensive TypeScript definitions for the EduMentor Personal AI Education Mentor.

export type MentorResponseMode =
  | "simple"
  | "detailed"
  | "with_examples"
  | "step_by_step"
  | "exam_focused";

export interface StudentLearningContext {
  userId: string;
  eduId?: string;
  name: string;
  educationLevel?: string;
  schoolOrCollege?: string;
  course?: string;
  branch?: string;
  classOrYear?: string;
  semester?: string;
  subjects: string[];
  skills: string[];
  strongTopics: string[];
  weakTopics: string[];
  learningGaps: string[];
  recentAccuracy: number;
  studyStreakDays: number;
  overallProgressPct: number;
  careerInterests: string[];
  lastStudyActivity?: string;
}

export interface MentorChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode?: MentorResponseMode;
  timestamp: string;
  followUps?: string[];
}

export interface MentorChatSession {
  id: string;
  userId: string;
  eduId?: string;
  title: string;
  messages: MentorChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export type TaskDifficulty = "Easy" | "Medium" | "Hard";
export type TaskPriority = "High" | "Medium" | "Low";

export interface PlanTask {
  id: string;
  taskName: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  difficulty: TaskDifficulty;
  priority: TaskPriority;
  isCompleted: boolean;
  learningObjective?: string;
  completedAt?: string;
}

export interface DailyStudyPlan {
  id: string;
  userId: string;
  eduId?: string;
  date: string;
  title: string;
  summary: string;
  estimatedTotalHours: number;
  tasks: PlanTask[];
  completionPercentage: number;
  mentorTips?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WeakTopicItem {
  id: string;
  subject: string;
  topic: string;
  masteryPct: number;
  difficultyLevel: TaskDifficulty;
  lastAttemptScore?: number;
  learningGapDescription?: string;
}

export interface PracticeQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  hint: string;
  explanation: string;
  conceptTested: string;
}

export interface PracticeSession {
  id: string;
  userId: string;
  subject: string;
  topic: string;
  difficulty: TaskDifficulty;
  conceptSummary?: string;
  questions: PracticeQuestion[];
  userAnswers: Record<number, number>; // questionIndex -> chosen optionIndex
  score: number;
  isCompleted: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface HighYieldTopic {
  subject: string;
  topic: string;
  weightage: string;
  priority: "High" | "Medium";
}

export interface PhaseStrategy {
  phaseName: string;
  daysSpan: string;
  focus: string;
  milestone: string;
}

export interface DayRevisionSchedule {
  day: number;
  subject: string;
  tasks: string[];
}

export interface ExamPrepPlan {
  id: string;
  userId: string;
  eduId?: string;
  examName: string;
  examDate: string;
  daysRemaining: number;
  readinessScore: number;
  subjects: string[];
  highYieldTopics: HighYieldTopic[];
  phaseStrategy: PhaseStrategy[];
  revisionPlan: DayRevisionSchedule[];
  mentorExamAdvice: string[];
  practiceScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface NextBestActionItem {
  title: string;
  reason: string;
  subject: string;
  topic: string;
  actionType: "learn" | "practice" | "revise" | "quiz" | "exam";
  priority: "High" | "Medium";
}

export interface MentorStats {
  todayProgressPct: number;
  studyStreakDays: number;
  completedTasksCount: number;
  totalTasksToday: number;
  weakTopicsCount: number;
  strongTopicsCount: number;
  averageQuizScore: number;
  recommendedAction: NextBestActionItem;
}
