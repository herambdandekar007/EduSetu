export type MistakeCategory =
  | "Grammar"
  | "Tense"
  | "Articles"
  | "Prepositions"
  | "Subject-Verb Agreement"
  | "Word Choice";

export interface SpeakingMistake {
  original: string;
  correction: string;
  category: MistakeCategory;
  explanation: string;
  severity: "low" | "medium" | "high";
}

export interface SpeakingAnalysisResponse {
  transcript: string;
  mode: "initial" | "repeat";
  originalTranscript?: string;
  prevCorrectedSentence?: string;
  grammar: {
    score: number;
    explanation: string;
  };
  vocabulary: {
    score: number;
    suggestions: string[];
  };
  sentence: {
    score: number;
    naturalness: string;
    correction: string;
  };
  mistakes: SpeakingMistake[];
  correctedSentence: string;
  overallScore: number;
  feedback: string;
  // Second attempt specific fields
  beforeScore?: number;
  afterScore?: number;
  improvementScore?: number;
  fixedMistakes?: boolean;
}

export interface SpeakingAttemptDoc {
  id?: string;
  userId: string;
  sessionId: string;
  attemptNumber: 1 | 2;
  transcript: string;
  correctedSentence: string;
  grammarScore: number;
  vocabularyScore: number;
  sentenceScore: number;
  overallScore: number;
  mistakes: SpeakingMistake[];
  submittedAt: any;
}

export interface SpeakingSessionDoc {
  id?: string;
  userId: string;
  initialAttemptId: string;
  repeatAttemptId?: string;
  beforeScore: number;
  afterScore?: number;
  improvementScore?: number;
  createdAt: any;
}
