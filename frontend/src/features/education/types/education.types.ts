// frontend/src/features/education/types/education.types.ts
// Complete Type Definitions for SMART EDUCATION AI — Education System

export type EducationLevel =
  | "school"
  | "college"
  | "university"
  | "diploma"
  | "other";

export type InstitutionType =
  | "School"
  | "College"
  | "University"
  | "Diploma Institute"
  | "Training Institute"
  | "Other";

export type SchoolBoard =
  | "CBSE"
  | "ICSE"
  | "State Board"
  | "IB"
  | "Cambridge"
  | "Other";

export type SchoolStream =
  | "General"
  | "Science"
  | "Commerce"
  | "Arts / Humanities"
  | "Vocational"
  | "Other";

export type ProficiencyLevel =
  | "Beginner"
  | "Intermediate"
  | "Advanced"
  | "Expert"
  | "Native";

export type TimelineStatus =
  | "Completed"
  | "Current"
  | "Paused"
  | "Transferred";

export interface InstitutionDetails {
  institutionName: string;
  institutionType: InstitutionType;
  boardOrUniversity?: string;
  institutionCode?: string;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
  contactInfo?: string;
}

export interface AcademicDetails {
  educationLevel: EducationLevel;
  boardOrUniversity: string;
  medium?: string;
  classOrGrade?: string;
  stream?: string;
  degree?: string;
  course?: string;
  branch?: string;
  specialization?: string;
  year?: string;
  semester?: string;
  academicYear?: string;
}

export interface EducationProfile {
  id?: string;
  eduId: string;
  userId: string;
  fullName?: string;
  email?: string;

  educationLevel: EducationLevel;

  institutionName: string;
  institutionType: InstitutionType;
  boardOrUniversity: string;

  medium?: string;
  classOrGrade?: string;
  stream?: string;

  degree?: string;
  course?: string;
  branch?: string;
  specialization?: string;

  year?: string;
  semester?: string;
  academicYear?: string;

  state?: string;
  city?: string;
  country?: string;
  institutionCode?: string;
  website?: string;
  contactInfo?: string;

  skills?: string[];
  interests?: string[];
  languages?: string[];

  profileCompletion?: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface EducationHistoryItem {
  id: string;
  userId: string;
  eduId: string;
  educationLevel: EducationLevel;
  institution: string;
  boardOrUniversity?: string;
  courseOrClass: string;
  streamOrBranch?: string;
  startDate: string;
  endDate: string;
  scoreOrGrade?: string;
  status: TimelineStatus;
  createdAt?: any;
}

export interface EducationSubject {
  id: string;
  userId: string;
  eduId: string;
  name: string;
  subjectCode?: string;
  teacher?: string;
  educationLevel: string;
  year?: string;
  semester?: string;
  credits?: number;
  status?: "Active" | "Completed" | "Upcoming";
  isFavorite?: boolean;
  progress?: number;
  createdAt?: any;
}

export interface SkillItem {
  id: string;
  userId: string;
  eduId: string;
  name: string;
  category: "Technical" | "Academic" | "Soft" | "Creative" | "Professional" | "Other";
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  status: "Learning" | "Mastered" | "Want to Learn";
  createdAt?: any;
}

export interface LanguageItem {
  id: string;
  userId: string;
  eduId: string;
  name: string;
  readingLevel: "Beginner" | "Intermediate" | "Advanced" | "Native";
  writingLevel: "Beginner" | "Intermediate" | "Advanced" | "Native";
  speakingLevel: "Beginner" | "Intermediate" | "Advanced" | "Native";
  createdAt?: any;
}

export interface AIEducationSuggestion {
  focusAreas: string[];
  recommendedSubjects: string[];
  suggestedSkills: string[];
  futureEducationPaths: string[];
  adviceSummary: string;
}
