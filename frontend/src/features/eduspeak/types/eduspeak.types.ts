// features/eduspeak/types/eduspeak.types.ts
// Complete TypeScript definitions for 🗣️ EduSpeak

export type LanguageCode =
  | "en-IN"
  | "en-US"
  | "hi-IN"
  | "mr-IN"
  | "ta-IN"
  | "te-IN"
  | "kn-IN"
  | "bn-IN"
  | "gu-IN";

export type ProficiencyLevel = "Beginner" | "Intermediate" | "Advanced" | "Professional";

export type SpeakingPracticeMode =
  | "Daily Conversation"
  | "Self Introduction"
  | "Story Speaking"
  | "Picture Description"
  | "Read Aloud"
  | "Topic Speaking"
  | "Debate Practice"
  | "Group Discussion"
  | "Presentation Practice"
  | "Public Speaking"
  | "Interview Practice"
  | "Free Speaking";

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  speechLocale: string;
}

export interface EduSpeakProfile {
  userId: string;
  eduId?: string;
  preferredLanguage: string;
  currentLevel: ProficiencyLevel;
  overallProgress: number;
  practiceStreak: number;
  totalPracticeMinutes: number;
  sessionsCompleted: number;
  pronunciationScore: number;
  fluencyScore: number;
  grammarScore: number;
  vocabularyScore: number;
  confidenceScore: number;
  weakWords?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SpeechAnalysisResult {
  id: string;
  sessionId?: string;
  transcript: string;
  targetPhrase?: string;
  overallScore: number;
  pronunciationScore: number;
  fluencyScore: number;
  grammarScore: number;
  vocabularyScore: number;
  confidenceScore: number;
  speakingPaceWpm: number;
  corrections: {
    original: string;
    suggested: string;
    explanation: string;
    category: "Grammar" | "Tense" | "Pronunciation" | "Word Choice" | "Structure";
  }[];
  correctedSentence?: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  feedback: string;
  createdAt: string;
}

export interface SpeakingSessionRecord {
  id: string;
  userId: string;
  language: string;
  practiceType: SpeakingPracticeMode;
  topic: string;
  transcript: string;
  durationSeconds: number;
  overallScore: number;
  pronunciationScore: number;
  fluencyScore: number;
  grammarScore: number;
  vocabularyScore: number;
  confidenceScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  feedback: string;
  createdAt: string;
}

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  audioUrl?: string;
}

export interface ConversationSession {
  id: string;
  userId: string;
  language: string;
  scenario: string;
  scenarioTitle: string;
  messages: ConversationMessage[];
  status: "active" | "completed";
  startedAt: string;
  updatedAt: string;
}

export interface PronunciationWord {
  id: string;
  word: string;
  phonetic: string;
  category: "Daily" | "Academic" | "Technical" | "Career" | "Difficult" | "Personal Weakness";
  meaning: string;
  example: string;
  audioGuideText?: string;
  mastered?: boolean;
}

export interface SpeakingTopicPrompt {
  id: string;
  title: string;
  category: string;
  level: ProficiencyLevel;
  prompt: string;
  instructions: string[];
  suggestedDurationSeconds: number;
  keywords: string[];
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface CareerCommTopic {
  id: string;
  careerName: string;
  title: string;
  scenario: string;
  prompt: string;
  keyPhrases: string[];
  durationMinutes: number;
  difficulty: "Intermediate" | "Advanced" | "Professional";
}

export interface SpeakingRecommendation {
  id: string;
  userId: string;
  type: "learn" | "practice" | "repeat" | "revise" | "pronunciation" | "conversation" | "interview" | "presentation";
  title: string;
  reason: string;
  priority: number;
  status: "active" | "completed";
  createdAt: string;
}

export interface SpeakingProgressStats {
  overallProgress: number;
  practiceStreak: number;
  totalPracticeMinutes: number;
  sessionsCompleted: number;
  pronunciationScore: number;
  fluencyScore: number;
  grammarScore: number;
  vocabularyScore: number;
  confidenceScore: number;
  weeklyPracticeMinutes: number;
  weeklySessionsCount: number;
}

export interface SpeakingTopic {
  id: string;
  title: string;
  category: string;
  description: string;
  suggestedDurationSeconds: number;
  starterQuestions: string[];
}

export interface VocabularyWord {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  synonyms: string[];
  mastered: boolean;
}

export interface GrammarRule {
  id: string;
  title: string;
  category: string;
  description: string;
  exampleCorrect: string;
  exampleIncorrect: string;
  tips: string;
}

export interface RealLifeScenario {
  id: string;
  title: string;
  setting: string;
  role: string;
  aiRole: string;
  initialPrompt: string;
  suggestedResponses: string[];
}

export interface SpeakingModule {
  id: string;
  title: string;
  level: ProficiencyLevel | string;
  duration: string;
  completed: boolean;
  lessonsCount: number;
  icon: string;
}