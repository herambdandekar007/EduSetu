export interface CategoryDefinition {
  id: string;
  name: string;
  icon: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  subcategories: {
    name: string;
    types: string[];
  }[];
}

export const DOCUMENT_CATEGORIES: CategoryDefinition[] = [
  {
    id: "academic",
    name: "Academic Documents",
    icon: "GraduationCap",
    color: "blue",
    badgeBg: "bg-blue-500/10",
    badgeText: "text-blue-600 dark:text-blue-400",
    subcategories: [
      {
        name: "School",
        types: [
          "Admission Documents",
          "Bonafide Certificate",
          "Leaving Certificate",
          "Transfer Certificate",
          "Character Certificate",
          "School Records",
        ],
      },
      {
        name: "College",
        types: [
          "College ID",
          "Bonafide",
          "Transfer Certificate",
          "Migration Certificate",
          "Enrollment Documents",
        ],
      },
      {
        name: "University",
        types: [
          "Enrollment Records",
          "Degree Documents",
          "Academic Records",
          "University Certificates",
        ],
      },
    ],
  },
  {
    id: "marks_results",
    name: "Marks & Results",
    icon: "BarChart3",
    color: "indigo",
    badgeBg: "bg-indigo-500/10",
    badgeText: "text-indigo-600 dark:text-indigo-400",
    subcategories: [
      {
        name: "Examinations & Scores",
        types: [
          "School Mark Sheets",
          "Board Examination Results",
          "Semester Mark Sheets",
          "Year-wise Results",
          "Entrance Examination Results",
          "Competitive Examination Results",
          "Academic Transcript",
          "Grade / Result Documents",
        ],
      },
    ],
  },
  {
    id: "certificates",
    name: "Certificates & Achievements",
    icon: "Award",
    color: "amber",
    badgeBg: "bg-amber-500/10",
    badgeText: "text-amber-600 dark:text-amber-400",
    subcategories: [
      {
        name: "Achievements & Co-curricular",
        types: [
          "Course Certificates",
          "Internship Certificates",
          "Hackathon Certificates",
          "Competition Certificates",
          "Sports Certificates",
          "Cultural Certificates",
          "Workshop Certificates",
          "Achievement Certificates",
          "Participation Certificates",
        ],
      },
    ],
  },
  {
    id: "career",
    name: "Career Documents",
    icon: "Briefcase",
    color: "emerald",
    badgeBg: "bg-emerald-500/10",
    badgeText: "text-emerald-600 dark:text-emerald-400",
    subcategories: [
      {
        name: "Professional Portfolio",
        types: [
          "Resume",
          "CV",
          "Cover Letter",
          "Internship Documents",
          "Offer Letters",
          "Experience Letters",
          "Recommendation Letters",
          "Career Portfolio Documents",
        ],
      },
    ],
  },
  {
    id: "learning_projects",
    name: "Learning & Project Documents",
    icon: "BookOpen",
    color: "violet",
    badgeBg: "bg-violet-500/10",
    badgeText: "text-violet-600 dark:text-violet-400",
    subcategories: [
      {
        name: "Study & Research",
        types: [
          "Notes",
          "Assignments",
          "Project Reports",
          "Project Files",
          "Research Papers",
          "Presentations",
          "Study Material",
        ],
      },
    ],
  },
];

export const ALL_DOCUMENT_TYPES = DOCUMENT_CATEGORIES.flatMap((c) =>
  c.subcategories.flatMap((sub) => sub.types)
);

export const DEFAULT_STORAGE_QUOTA_BYTES = 500 * 1024 * 1024; // 500 MB for demo / free tier

export const VERIFICATION_STATUS_CONFIG = {
  unverified: {
    label: "Unverified",
    badgeClass: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
    icon: "ShieldAlert",
  },
  pending: {
    label: "Pending Verification",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: "Clock",
  },
  verified: {
    label: "Verified Credential",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: "ShieldCheck",
  },
  rejected: {
    label: "Verification Rejected",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    icon: "XCircle",
  },
};
