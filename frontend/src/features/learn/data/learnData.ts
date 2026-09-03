// features/learn/data/learnData.ts
// Central mock/sample data source for the Learn feature.
// Replace each export with a real API call (services/learnService.ts) when the backend is wired up.

import {
  Subject,
  Topic,
  LearningMaterial,
  Quiz,
  QuizAnalysisData,
  Assignment,
  LearningAssessment,
  PersonalizedLearningRecommendation,
  AdaptiveDifficultySetting,
  PersonalizedRevisionItem,
  NextBestActionItem,
  AssignedSubjectContext,
} from "../types/learn.types";

export const assignedContext: AssignedSubjectContext = {
  educationLevel: "school",
  school: "Delhi Public School",
  state: "Maharashtra",
  board: "CBSE",
  medium: "English",
  classGrade: "Class 10",
};

export const subjects: Subject[] = [
  {
    id: "sub-math",
    name: "Mathematics",
    icon: "Sigma",
    color: "#3B4CCA",
    teacher: "Mrs. Anjali Rao",
    chapters: 14,
    topics: 92,
    subtopics: 210,
    progress: 68,
    completionPercentage: 68,
    quizPerformance: 74,
    assignmentPerformance: 81,
    strongTopics: ["Linear Equations", "Trigonometry Basics"],
    weakTopics: ["Quadratic Equations", "Coordinate Geometry"],
  },
  {
    id: "sub-sci",
    name: "Science",
    icon: "FlaskConical",
    color: "#1C9C86",
    teacher: "Mr. Rohan Mehta",
    chapters: 16,
    topics: 104,
    subtopics: 240,
    progress: 54,
    completionPercentage: 54,
    quizPerformance: 63,
    assignmentPerformance: 70,
    strongTopics: ["Light – Reflection", "Acids & Bases"],
    weakTopics: ["Electricity", "Life Processes"],
  },
  {
    id: "sub-eng",
    name: "English",
    icon: "BookOpen",
    color: "#E8A33D",
    teacher: "Ms. Fatima Khan",
    chapters: 10,
    topics: 58,
    subtopics: 120,
    progress: 82,
    completionPercentage: 82,
    quizPerformance: 88,
    assignmentPerformance: 90,
    strongTopics: ["Grammar", "Letter Writing"],
    weakTopics: ["Poetry Analysis"],
  },
  {
    id: "sub-sst",
    name: "Social Science",
    icon: "Globe2",
    color: "#E85D5D",
    teacher: "Mr. Vikram Singh",
    chapters: 12,
    topics: 76,
    subtopics: 160,
    progress: 41,
    completionPercentage: 41,
    quizPerformance: 58,
    assignmentPerformance: 65,
    strongTopics: ["Nationalism in India"],
    weakTopics: ["Federalism", "Resources & Development"],
  },
];

export const topics: Topic[] = [
  {
    id: "top-1",
    subjectId: "sub-math",
    chapter: "Quadratic Equations",
    name: "Nature of Roots",
    concept: "The discriminant tells us how many real roots a quadratic equation has.",
    explanation:
      "For ax² + bx + c = 0, the discriminant D = b² - 4ac decides whether the roots are real & distinct, real & equal, or imaginary.",
    examples: ["x² - 5x + 6 = 0 → D = 1 → two real roots", "x² + 4x + 4 = 0 → D = 0 → equal roots"],
    activities: ["Plot 3 quadratic graphs and mark the roots", "Discriminant sorting card game"],
    practiceQuestions: 18,
    aiExplanationAvailable: true,
    mastery: 46,
  },
  {
    id: "top-2",
    subjectId: "sub-sci",
    chapter: "Electricity",
    name: "Ohm's Law",
    concept: "Current through a conductor is proportional to the voltage across it.",
    explanation: "V = IR, where R (resistance) stays constant at a fixed temperature.",
    examples: ["A 2Ω resistor with 4V across it carries 2A of current."],
    activities: ["Build a simple circuit and verify V = IR with a multimeter"],
    practiceQuestions: 22,
    aiExplanationAvailable: true,
    mastery: 38,
  },
];

export const learningMaterials: LearningMaterial[] = [
  { id: "mat-1", subjectId: "sub-math", subjectName: "Mathematics", chapter: "Quadratic Equations", title: "NCERT Chapter 4 – Quadratic Equations", type: "Textbook", durationOrPages: "18 pages", addedOn: "2026-06-02" },
  { id: "mat-2", subjectId: "sub-math", subjectName: "Mathematics", chapter: "Quadratic Equations", title: "Teacher's Handwritten Notes", type: "Teacher Notes", durationOrPages: "6 pages", addedOn: "2026-07-10" },
  { id: "mat-3", subjectId: "sub-sci", subjectName: "Science", chapter: "Electricity", title: "Ohm's Law – Explainer Video", type: "Video", durationOrPages: "12 min", addedOn: "2026-07-14" },
  { id: "mat-4", subjectId: "sub-sci", subjectName: "Science", chapter: "Electricity", title: "Circuit Diagrams Pack", type: "Diagram", durationOrPages: "9 images", addedOn: "2026-07-15" },
  { id: "mat-5", subjectId: "sub-eng", subjectName: "English", chapter: "Poetry", title: "Poetry Analysis – Worksheet", type: "Worksheet", durationOrPages: "4 pages", addedOn: "2026-06-28" },
  { id: "mat-6", subjectId: "sub-sst", subjectName: "Social Science", chapter: "Federalism", title: "Previous Year Paper 2025", type: "Previous Year Paper", durationOrPages: "10 pages", addedOn: "2026-05-20" },
];

export const quizzes: Quiz[] = [
  { id: "qz-1", title: "Quadratic Equations – Topic Quiz", subjectName: "Mathematics", chapter: "Quadratic Equations", kind: "Topic Quiz", difficulty: "Medium", questionTypes: ["MCQ", "Short Answer"], totalQuestions: 10, durationMinutes: 15, attempted: true, scorePercent: 60 },
  { id: "qz-2", title: "Electricity – Chapter Quiz", subjectName: "Science", chapter: "Electricity", kind: "Chapter Quiz", difficulty: "Hard", questionTypes: ["MCQ", "Fill in the Blanks"], totalQuestions: 15, durationMinutes: 20, attempted: true, scorePercent: 47 },
  { id: "qz-3", title: "English Grammar – Practice Test", subjectName: "English", kind: "Practice Test", difficulty: "Easy", questionTypes: ["MCQ", "True / False"], totalQuestions: 12, durationMinutes: 10, attempted: false },
  { id: "qz-4", title: "AI Generated Mixed Revision Quiz", subjectName: "Social Science", kind: "AI Generated Quiz", difficulty: "Medium", questionTypes: ["MCQ", "Match the Following"], totalQuestions: 10, durationMinutes: 12, attempted: false },
];

export const quizAnalyses: QuizAnalysisData[] = [
  {
    quizId: "qz-1",
    quizTitle: "Quadratic Equations – Topic Quiz",
    score: 6,
    accuracy: 60,
    correctAnswers: 6,
    wrongAnswers: 4,
    strongConcepts: ["Factorisation Method"],
    weakConcepts: ["Discriminant", "Completing the Square"],
    mistakeAnalysis: [
      { concept: "Discriminant", mistake: "Sign error while computing b² - 4ac" },
      { concept: "Completing the Square", mistake: "Forgot to balance the constant term" },
    ],
    recommendedPractice: ["10 extra discriminant problems", "Watch: Completing the Square, step by step"],
  },
  {
    quizId: "qz-2",
    quizTitle: "Electricity – Chapter Quiz",
    score: 7,
    accuracy: 47,
    correctAnswers: 7,
    wrongAnswers: 8,
    strongConcepts: ["Series Circuits"],
    weakConcepts: ["Ohm's Law application", "Parallel Circuits"],
    mistakeAnalysis: [{ concept: "Ohm's Law", mistake: "Mixed up voltage and current in the formula" }],
    recommendedPractice: ["Revisit Ohm's Law explainer video", "Practice set: Series vs Parallel"],
  },
];

export const assignments: Assignment[] = [
  {
    id: "asg-1",
    subject: "Mathematics",
    chapter: "Quadratic Equations",
    topic: "Nature of Roots",
    instructions: "Solve all 10 problems from the worksheet showing full working.",
    referenceMaterial: "NCERT Chapter 4",
    dueDate: "2026-08-29",
    status: "Pending",
    submissionStatus: "Not Submitted",
  },
  {
    id: "asg-2",
    subject: "Science",
    chapter: "Electricity",
    topic: "Ohm's Law",
    instructions: "Draw and label 3 circuit diagrams with calculations.",
    dueDate: "2026-08-24",
    status: "Overdue",
    submissionStatus: "Not Submitted",
  },
  {
    id: "asg-3",
    subject: "English",
    chapter: "Poetry",
    topic: "Poetry Analysis",
    instructions: "Write a 200-word analysis of the assigned poem.",
    dueDate: "2026-08-18",
    status: "Evaluated",
    submissionStatus: "Submitted",
    marks: { obtained: 18, total: 20 },
    teacherFeedback: "Well structured; add more textual evidence next time.",
    aiLearningFeedback: "Strong vocabulary use. Practice citing specific lines for higher marks.",
  },
  {
    id: "asg-4",
    subject: "Social Science",
    chapter: "Federalism",
    topic: "Federalism in India",
    instructions: "Prepare short notes comparing federal and unitary systems.",
    dueDate: "2026-09-02",
    status: "Upcoming",
    submissionStatus: "Not Submitted",
  },
];

export const learningAssessment: LearningAssessment = {
  knowledgeLevel: "Medium",
  topicMastery: 61,
  strengthDetection: ["Grammar", "Series Circuits", "Linear Equations"],
  weaknessDetection: ["Quadratic Equations", "Electricity", "Federalism"],
  learningGapDetection: ["Coordinate Geometry fundamentals missing before starting Circles chapter"],
  mistakePatternDetection: ["Frequently swaps formula variables under time pressure"],
  learningSpeed: "Average",
  accuracy: 66,
  studyTimeMinutesPerWeek: 420,
};

export const personalizedLearning: PersonalizedLearningRecommendation = {
  recommendedTopic: "Quadratic Equations – Discriminant",
  recommendedMaterial: "Teacher's Handwritten Notes (Quadratic Equations)",
  recommendedVideo: "Ohm's Law – Explainer Video",
  recommendedPractice: "10 extra discriminant problems",
  recommendedQuiz: "AI Generated Mixed Revision Quiz",
  recommendedRevision: "Electricity – Ohm's Law application",
};

export const adaptiveDifficultySettings: AdaptiveDifficultySetting[] = [
  { subjectName: "Mathematics", currentLevel: "Medium", autoAdjust: true, reason: "Recent quiz accuracy hovering around 60%" },
  { subjectName: "Science", currentLevel: "Easy", autoAdjust: true, reason: "Struggling with Electricity fundamentals" },
  { subjectName: "English", currentLevel: "Hard", autoAdjust: false, reason: "Consistently scoring above 85%" },
  { subjectName: "Social Science", currentLevel: "Medium", autoAdjust: true, reason: "Mixed performance across chapters" },
];

export const personalizedRevisionQueue: PersonalizedRevisionItem[] = [
  { id: "rev-1", topic: "Discriminant", subjectName: "Mathematics", reason: "Weak Topic", dueIn: "Today" },
  { id: "rev-2", topic: "Ohm's Law application", subjectName: "Science", reason: "Past Mistake", dueIn: "Today" },
  { id: "rev-3", topic: "Linear Equations", subjectName: "Mathematics", reason: "Spaced Revision", dueIn: "In 2 days" },
  { id: "rev-4", topic: "Nationalism in India", subjectName: "Social Science", reason: "Upcoming Exam", dueIn: "In 4 days" },
  { id: "rev-5", topic: "Acids & Bases", subjectName: "Science", reason: "Forgotten Topic", dueIn: "In 6 days" },
];

export const nextBestActions: NextBestActionItem[] = [
  { id: "nba-1", question: "What should I learn?", actionLabel: "Start: Coordinate Geometry basics", target: "topic", subjectName: "Mathematics" },
  { id: "nba-2", question: "What should I revise?", actionLabel: "Revise: Discriminant", target: "revision", subjectName: "Mathematics" },
  { id: "nba-3", question: "What should I practice?", actionLabel: "Practice: 10 Ohm's Law problems", target: "practice", subjectName: "Science" },
  { id: "nba-4", question: "Which quiz should I take?", actionLabel: "Take: AI Generated Mixed Revision Quiz", target: "quiz", subjectName: "Social Science" },
  { id: "nba-5", question: "What should I learn next?", actionLabel: "Next up: Federalism in India", target: "topic", subjectName: "Social Science" },
];