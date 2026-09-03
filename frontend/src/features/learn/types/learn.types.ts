// features/learn/types/learn.types.ts
// Shared types for the entire "Learn" feature (LEARN tab of the app).

/* ---------- 1. MY SUBJECTS ---------- */

export type EducationLevel = "school" | "college";

export interface AssignedSubjectContext {
  educationLevel: EducationLevel;
  school?: string;
  college?: string;
  state: string;
  board: string;
  medium: string;
  classGrade?: string;
  stream?: string;
  degree?: string;
  branch?: string;
  year?: string;
  semester?: string;
}

export interface Subject {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  teacher: string;
  chapters: number;
  topics: number;
  subtopics: number;
  progress: number; // 0-100
  completionPercentage: number; // 0-100
  quizPerformance: number; // 0-100 avg score
  assignmentPerformance: number; // 0-100 avg score
  strongTopics: string[];
  weakTopics: string[];
}

export interface Topic {
  id: string;
  subjectId: string;
  chapter: string;
  name: string;
  concept: string;
  explanation: string;
  examples: string[];
  activities: string[];
  practiceQuestions: number;
  aiExplanationAvailable: boolean;
  mastery: number; // 0-100
}

/* ---------- 2. LEARNING MATERIALS ---------- */

export type MaterialType =
  | "Textbook"
  | "Teacher Notes"
  | "Chapter Notes"
  | "Topic Notes"
  | "Short Notes"
  | "Detailed Notes"
  | "PDF"
  | "PPT"
  | "Video"
  | "Animation"
  | "Diagram"
  | "Image"
  | "Audio Lesson"
  | "Worksheet"
  | "Question Bank"
  | "Previous Year Paper"
  | "Reference Material";

export interface LearningMaterial {
  id: string;
  subjectId: string;
  subjectName: string;
  chapter: string;
  title: string;
  type: MaterialType;
  durationOrPages?: string;
  addedOn: string;
  contentMarkdown?: string;
  summary?: string;
  keyConcepts?: Array<{ concept: string; explanation: string }>;
  practiceQuestions?: string[];
  keyTakeaways?: string[];
}

export type AIMaterialToolKey =
  | "Summarize"
  | "Explain Simply"
  | "Explain with Example"
  | "Important Points"
  | "Generate Questions"
  | "Generate Flashcards"
  | "Generate Revision Notes"
  | "Ask AI"
  | "Read Aloud";

/* ---------- 3. QUIZZES ---------- */

export type QuizKind =
  | "Topic Quiz"
  | "Chapter Quiz"
  | "Subject Quiz"
  | "Revision Quiz"
  | "Practice Test"
  | "AI Generated Quiz"
  | "Timed Quiz";

export type Difficulty = "Easy" | "Medium" | "Hard";

export type QuestionType =
  | "MCQ"
  | "True / False"
  | "Fill in the Blanks"
  | "Match the Following"
  | "Short Answer"
  | "Image Based";

export interface Quiz {
  id: string;
  title: string;
  subjectName: string;
  chapter?: string;
  kind: QuizKind;
  difficulty: Difficulty;
  questionTypes: QuestionType[];
  totalQuestions: number;
  durationMinutes: number;
  attempted: boolean;
  scorePercent?: number;
}

export interface QuizAnalysisData {
  quizId: string;
  quizTitle: string;
  score: number;
  accuracy: number; // %
  correctAnswers: number;
  wrongAnswers: number;
  strongConcepts: string[];
  weakConcepts: string[];
  mistakeAnalysis: { concept: string; mistake: string }[];
  recommendedPractice: string[];
}

/* ---------- 4. ASSIGNMENTS ---------- */

export type AssignmentStatus =
  | "Pending"
  | "Upcoming"
  | "In Progress"
  | "Submitted"
  | "Evaluated"
  | "Overdue";

export interface Assignment {
  id: string;
  subject: string;
  subjectName?: string;
  chapter: string;
  topic: string;
  instructions: string;
  referenceMaterial?: string;
  dueDate: string;
  status: AssignmentStatus;
  submissionStatus: "Pending" | "Not Submitted" | "Submitted" | "Late Submission";
  marks?: { obtained: number; total: number };
  teacherFeedback?: string;
  aiLearningFeedback?: string;
}

/* ---------- 5. AI ADAPTIVE LEARNING ---------- */

export interface LearningAssessment {
  knowledgeLevel: Difficulty;
  topicMastery: number; // %
  strengthDetection: string[];
  weaknessDetection: string[];
  learningGapDetection: string[];
  mistakePatternDetection: string[];
  learningSpeed: "Slow" | "Average" | "Fast";
  accuracy: number; // %
  studyTimeMinutesPerWeek: number;
}

export interface PersonalizedLearningRecommendation {
  recommendedTopic: string;
  recommendedMaterial: string;
  recommendedVideo: string;
  recommendedPractice: string;
  recommendedQuiz: string;
  recommendedRevision: string;
}

export interface AdaptiveDifficultySetting {
  subjectName: string;
  currentLevel: Difficulty;
  autoAdjust: boolean;
  reason: string;
}

export interface PersonalizedRevisionItem {
  id: string;
  topic: string;
  subjectName: string;
  reason: "Weak Topic" | "Past Mistake" | "Forgotten Topic" | "Upcoming Exam" | "Spaced Revision";
  dueIn: string;
}

export interface NextBestActionItem {
  id: string;
  question:
    | "What should I learn?"
    | "What should I revise?"
    | "What should I practice?"
    | "Which quiz should I take?"
    | "What should I learn next?";
  actionLabel: string;
  target: string;
  subjectName: string;
}

/* ---------- 6. STUDENT PROFILE (Firestore: profiles/{userId}) ---------- */
/*
 * The profile document is written by ProfilePage / AuthContext and mixes
 * camelCase (userId, eduId, email) with snake_case fields. Both shapes are
 * kept optional so the Learn feature can read any existing profile safely.
 */

export interface StudentProfile {
  userId: string;
  fullName?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  date_of_birth?: string | null;
  bio?: string;

  disability_type?: string;
  disability_percentage?: number;
  udid_number?: string;
  assistive_tech?: string;

  education_level?: string;
  educationLevel?: string;
  educationProfile?: string | Record<string, string>;
  school_college?: string;
  board_university?: string;
  course?: string;
  specialization?: string;

  skills?: string[];
  languages?: string[];

  city?: string;
  state?: string;
  pincode?: string;

  age?: number | null;
  income?: number | null;

  guardian_name?: string;
  guardian_phone?: string;

  work_experience_years?: number;
  preferred_job_type?: string;
  preferred_locations?: string[];

  marital_status?: string;
  avatarUrl?: string;
  eduId?: string;
  profileCompleted?: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

/* ---------- 7. STUDENT EDUCATION ---------- */

export interface StudentEducation {
  userId: string;
  eduId?: string;
  educationLevel: string;
  boardOrUniversity?: string;
  medium?: string;
  classOrGrade?: string;
  stream?: string;
  degreeOrCourse?: string;
  branchOrSpecialization?: string;
  year?: string;
  semester?: string;
  schoolOrCollegeName?: string;
  state?: string;
  city?: string;
  skills: string[];
  languages: string[];
}

/* ---------- 8. QUIZ ATTEMPT (Firestore: quizAttempts/{attemptId}) ---------- */

export interface QuizAnswerRecord {
  questionId: string;
  concept?: string;
  isCorrect: boolean;
  mistake?: string;
}

export interface QuizAttempt {
  id?: string;
  userId: string;
  quizId: string;
  quizTitle: string;
  submittedAt?: unknown;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number; // %
  answers: QuizAnswerRecord[];
  strongConcepts: string[];
  weakConcepts: string[];
  recommendedPractice: string[];
}

/* ---------- 9. LEARNING PROGRESS (Firestore: learningProgress/{userId}) ---------- */

export interface LearningProgress {
  userId: string;
  overallProgress?: number;
  streakDays?: number;
  subjectProgress: { subjectName: string; progress: number }[]; // 0-100 each
  topicMastery: Record<string, number>; // topic name -> 0-100
  quizPerformance: number; // avg %
  assignmentPerformance: number; // avg %
  studyTimeMinutes: number;
  completedMaterials?: string[]; // material ids
  weakTopics: string[];
  strongTopics: string[];
  updatedAt?: unknown;
}

/* ---------- 10. LEARNING RECOMMENDATION (Firestore: recommendations/{id}) ---------- */

export type RecommendationKind =
  | "topic"
  | "material"
  | "video"
  | "practice"
  | "quiz"
  | "revision";

export interface LearningRecommendation {
  id: string;
  userId?: string;
  kind: RecommendationKind;
  title: string;
  subject?: string;
  subjectName?: string;
  reason?: string;
  targetId?: string;
  priority?: number;
  createdAt?: unknown;
}

/* ---------- 11. AGGREGATED LEARN DATA ---------- */

export interface LearnData {
  profile: StudentProfile | null;
  education: StudentEducation | null;
  subjects: Subject[];
  topics: Topic[];
  materials: LearningMaterial[];
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  assignments: Assignment[];
  progress: LearningProgress | null;
  recommendations: LearningRecommendation[];
}