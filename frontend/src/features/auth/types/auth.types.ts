// frontend/src/features/auth/types/auth.types.ts
// Complete type definitions for SMART EDUCATION AI Authentication System

export interface AccessibilityPreferences {
  enabled: boolean;
  voiceControl: boolean;
  textToSpeech: boolean;
  highContrast: boolean;
  largeText: boolean;
  dyslexiaFont: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  captions: boolean;
  gestureControl: boolean;
  voiceNavigation: boolean;
  largeCursor: boolean;
  focusIndicators: boolean;
  readingGuide: boolean;
}

export const DEFAULT_ACCESSIBILITY_PREFERENCES: AccessibilityPreferences = {
  enabled: false,
  voiceControl: false,
  textToSpeech: false,
  highContrast: false,
  largeText: false,
  dyslexiaFont: false,
  reducedMotion: false,
  screenReader: false,
  captions: false,
  gestureControl: false,
  voiceNavigation: false,
  largeCursor: false,
  focusIndicators: false,
  readingGuide: false,
};

export type EducationLevelType = "School" | "College" | "University" | "Vocational" | "Self-Learner";

export interface SignupEducationData {
  educationLevel: EducationLevelType;
  institutionName: string;
  state: string;
  // School fields
  classOrGrade?: string;
  board?: string;
  medium?: string;
  // College fields
  degreeOrCourse?: string;
  branchOrSpecialization?: string;
  year?: string;
  semester?: string;
  university?: string;
}

export interface SignupFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  accessibilityPreferences: AccessibilityPreferences;
  education: SignupEducationData;
}

export interface AuthState {
  mode: "login" | "signup";
  loginMethod: "eduid" | "email";
  isAccessibilityModalOpen: boolean;
  isForgotPasswordOpen: boolean;
  newlyGeneratedEduId: string | null;
  newlyCreatedUser: {
    fullName: string;
    email: string;
    eduId: string;
  } | null;
}
