// frontend/src/features/profile/types/profile.types.ts
// Complete TypeScript definitions for SMART EDUCATION AI — Pure Minimalist Monochromatic Profile

export type StudentType = "general" | "pwd";

export type EducationLevelType =
  | "School"
  | "High School"
  | "Diploma"
  | "Undergraduate / College"
  | "Postgraduate"
  | "PhD / Doctorate"
  | "Vocational / Certification"
  | "Other";

export type SkillCategory =
  | "Technical"
  | "Communication"
  | "Academic"
  | "Creative"
  | "Leadership"
  | "Other";

export type SkillProficiency = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export type LanguageProficiency = "Beginner" | "Intermediate" | "Advanced" | "Fluent";

export interface UserLanguage {
  id: string;
  userId: string;
  name: string;
  reading: LanguageProficiency;
  writing: LanguageProficiency;
  speaking: LanguageProficiency;
  createdAt?: any;
}

export type PortfolioItemType =
  | "project"
  | "certificate"
  | "achievement"
  | "competition"
  | "hackathon"
  | "research"
  | "internship"
  | "activity";

export type PortfolioVisibility = "private" | "teachers" | "institutions" | "public";

export interface StudentPersonalProfile {
  userId: string;
  eduId?: string;
  fullName: string;
  email: string;
  phone: string;
  photoURL?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  age?: number;
  gender: string;
  nationality?: string;
  address?: string;
  city: string;
  state: string;
  district?: string;
  pincode: string;
  bio?: string;
  
  // Student Type & Identity
  studentType: StudentType;
  accessibilityRequired?: boolean;
  
  // Disability Details (Optional for PwD)
  disabilityType?: string;
  disabilityPercentage?: number;
  udidNumber?: string;
  assistiveTech?: string;
  
  // Guardian & Emergency
  guardianName?: string;
  guardianPhone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  
  // Career Preferences & Socials
  careerGoals?: string;
  preferredJobType?: string;
  preferredLocations?: string[];
  workExperienceYears?: number;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  languages?: string[];
  
  // System Metadata
  profileCompleted?: boolean;
  profileCompletion?: number;
  verifiedStatus?: boolean;
  createdAt?: any;
  updatedAt?: any;
  
  // Backward compatibility fields
  full_name?: string;
  date_of_birth?: string;
  disability_type?: string;
  disability_percentage?: number;
  udid_number?: string;
  assistive_tech?: string;
  education_level?: string;
}

export interface EducationDetails {
  eduId: string;
  userId: string;
  educationLevel: EducationLevelType | "";
  institutionName: string;
  boardOrUniversity?: string;
  
  // School-specific
  schoolBoard?: string;
  schoolClass?: string;
  schoolMedium?: string;
  schoolStream?: string;
  schoolState?: string;
  
  // College/University-specific
  collegeName?: string;
  university?: string;
  degree?: string;
  course?: string;
  branch?: string;
  specialization?: string;
  year?: string;
  semester?: string;
  academicYear?: string;
  mediumOfEducation?: string;
  cgpaOrPercentage?: string;
  
  updatedAt?: any;
}

export interface EducationTimelineItem {
  id: string;
  userId: string;
  eduId?: string;
  institution: string;
  educationType: string;
  courseOrClass: string;
  streamOrBranch?: string;
  startYear: string;
  endYear: string;
  status: "Completed" | "Current" | "Pursuing" | "Paused";
  scoreOrGrade?: string;
  description?: string;
  createdAt?: any;
}

export interface SkillItem {
  id: string;
  userId: string;
  name: string;
  category: SkillCategory;
  level: SkillProficiency;
  percentage?: number;
  yearsOfExperience?: number;
  verifiedStatus?: boolean;
  createdAt?: any;
}

export interface PortfolioItem {
  id: string;
  userId: string;
  type: PortfolioItemType;
  title: string;
  description: string;
  category?: string;
  technologies?: string[];
  githubUrl?: string;
  liveDemoUrl?: string;
  documentUrl?: string;
  organization?: string;
  rankOrPosition?: string;
  startDate?: string;
  completionDate?: string;
  skillsUsed?: string[];
  createdAt?: any;
}

export interface AccessibilityProfileSettings {
  userId: string;
  enabled: boolean;
  highContrast: boolean;
  largeText: boolean;
  dyslexiaFont: boolean;
  screenReaderOptimized: boolean;
  textToSpeech: boolean;
  voiceControl: boolean;
  gestureControl: boolean;
  readingGuide: boolean;
  focusIndicators: boolean;
  hapticFeedback: boolean;
  colorFilter: string;
}

export interface ProfileCompletionSummary {
  overallPercentage: number;
  isComplete: boolean;
  sections: {
    title: string;
    completed: boolean;
    weight: number;
    actionTab: string;
  }[];
  recommendations: string[];
}
