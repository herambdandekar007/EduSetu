import { db } from "../firebase.config.ts";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

// Firestore Collection: "jobs"
// Document ID: auto-generated

export interface JobDocument {
  title: string;                         // required
  company: string;                       // required
  location: string;                      // default: ''
  jobType: string;                       // default: 'Full-time'
  skillsRequired: string[];              // default: []
  accessibilityTags: string[];           // default: []
  description: string;                   // default: ''
  salaryRange: string;                   // default: ''
  isActive: boolean;                     // default: true
  createdAt: any;                        // serverTimestamp()
}

// Add a job (Admin only — enforce via Firebase Security Rules)
export const addJob = async (jobData: Omit<JobDocument, "createdAt">) => {
  const jobsRef = collection(db, "jobs");
  await addDoc(jobsRef, { ...jobData, createdAt: serverTimestamp() });
};

// Get all active jobs (public read)
export const getActiveJobs = async () => {
  const jobsRef = collection(db, "jobs");
  const q = query(jobsRef, where("isActive", "==", true));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobDocument & { id: string }));
};

// ── PwD Seed Data ─────────────────────────────────────────────────────────────
// Pre-defined PwD-friendly job listings (seed into Firestore via seedPwdJobs())
export const pwdJobs: Omit<JobDocument, "createdAt">[] = [
  {
    title: "Software Developer",
    company: "Tata Consultancy Services",
    location: "India",
    jobType: "Full-time",
    skillsRequired: ["Java", "Python", "Software Development"],
    accessibilityTags: ["PwD Friendly", "Accessible Workplace"],
    description: "TCS inclusive hiring program for persons with disabilities.",
    salaryRange: "4-10 LPA",
    isActive: true,
  },
  {
    title: "Software Engineer",
    company: "Infosys",
    location: "India",
    jobType: "Full-time",
    skillsRequired: ["Java", "Cloud", "Programming"],
    accessibilityTags: ["PwD Hiring Program"],
    description: "Infosys inclusive workforce initiative for PwD.",
    salaryRange: "4-9 LPA",
    isActive: true,
  },
  {
    title: "IT Support Engineer",
    company: "Wipro",
    location: "India",
    jobType: "Full-time",
    skillsRequired: ["Networking", "Technical Support"],
    accessibilityTags: ["Accessible Office"],
    description: "Wipro disability inclusion hiring program.",
    salaryRange: "3-8 LPA",
    isActive: true,
  },
  {
    title: "Software Developer",
    company: "HCLTech",
    location: "India",
    jobType: "Full-time",
    skillsRequired: ["Java", "C++", "Backend Development"],
    accessibilityTags: ["PwD Friendly"],
    description: "Inclusive hiring initiative for PwD candidates.",
    salaryRange: "4-9 LPA",
    isActive: true,
  },
  {
    title: "Technical Analyst",
    company: "Tech Mahindra",
    location: "India",
    jobType: "Full-time",
    skillsRequired: ["Technical Support", "Networking"],
    accessibilityTags: ["PwD Hiring"],
    description: "Tech Mahindra accessibility and inclusion program.",
    salaryRange: "3-7 LPA",
    isActive: true,
  },
  {
    title: "Software Engineer",
    company: "Cognizant",
    location: "India",
    jobType: "Full-time",
    skillsRequired: ["Java", "SQL", "Programming"],
    accessibilityTags: ["Inclusive Hiring"],
    description: "Cognizant diversity hiring program.",
    salaryRange: "4-10 LPA",
    isActive: true,
  },
  {
    title: "Cloud Engineer",
    company: "Accenture",
    location: "India",
    jobType: "Full-time",
    skillsRequired: ["Cloud", "AWS", "DevOps"],
    accessibilityTags: ["PwD Friendly"],
    description: "Accenture disability inclusion hiring program.",
    salaryRange: "6-12 LPA",
    isActive: true,
  },
  {
    title: "Data Analyst",
    company: "Capgemini",
    location: "India",
    jobType: "Full-time",
    skillsRequired: ["SQL", "Excel", "Data Analysis"],
    accessibilityTags: ["Accessible Workplace"],
    description: "Capgemini inclusive hiring program.",
    salaryRange: "4-8 LPA",
    isActive: true,
  },
  {
    title: "Software Tester",
    company: "IBM India",
    location: "India",
    jobType: "Full-time",
    skillsRequired: ["Testing", "Automation", "QA"],
    accessibilityTags: ["PwD Friendly"],
    description: "IBM inclusive workforce program.",
    salaryRange: "5-12 LPA",
    isActive: true,
  },
  {
    title: "AI Engineer",
    company: "Microsoft India",
    location: "India",
    jobType: "Full-time",
    skillsRequired: ["AI", "Machine Learning", "Python"],
    accessibilityTags: ["Accessible Workplace"],
    description: "Microsoft disability hiring program.",
    salaryRange: "10-20 LPA",
    isActive: true,
  },
  {
    title: "Software Developer",
    company: "Google India",
    location: "India",
    jobType: "Full-time",
    skillsRequired: ["Algorithms", "Programming"],
    accessibilityTags: ["PwD Friendly"],
    description: "Google inclusive hiring initiative.",
    salaryRange: "15-35 LPA",
    isActive: true,
  },
  {
    title: "Cloud Support Associate",
    company: "Amazon",
    location: "India",
    jobType: "Full-time",
    skillsRequired: ["Cloud", "Linux", "Networking"],
    accessibilityTags: ["Accessible Workplace"],
    description: "Amazon inclusive hiring program.",
    salaryRange: "5-12 LPA",
    isActive: true,
  },
  {
    title: "Software Engineer",
    company: "Oracle",
    location: "India",
    jobType: "Full-time",
    skillsRequired: ["Java", "Database"],
    accessibilityTags: ["PwD Friendly"],
    description: "Oracle diversity hiring initiative.",
    salaryRange: "6-14 LPA",
    isActive: true,
  },
  {
    title: "Software Engineer",
    company: "SAP",
    location: "India",
    jobType: "Full-time",
    skillsRequired: ["SAP", "Programming"],
    accessibilityTags: ["Autism at Work Program"],
    description: "SAP Autism at Work hiring initiative.",
    salaryRange: "8-15 LPA",
    isActive: true,
  },
  {
    title: "Software Developer",
    company: "Dell Technologies",
    location: "India",
    jobType: "Full-time",
    skillsRequired: ["Programming", "Cloud"],
    accessibilityTags: ["PwD Friendly"],
    description: "Dell inclusive hiring program.",
    salaryRange: "6-12 LPA",
    isActive: true,
  },
  {
    title: "IT Analyst",
    company: "HP",
    location: "India",
    jobType: "Full-time",
    skillsRequired: ["IT Support", "Networking"],
    accessibilityTags: ["Accessible Workplace"],
    description: "HP disability inclusion hiring.",
    salaryRange: "5-10 LPA",
    isActive: true,
  },
  {
    title: "Customer Support Executive",
    company: "Concentrix",
    location: "India",
    jobType: "Full-time",
    skillsRequired: ["Communication", "Customer Support"],
    accessibilityTags: ["PwD Friendly"],
    description: "BPO inclusive hiring initiative.",
    salaryRange: "2-5 LPA",
    isActive: true,
  },
  {
    title: "Customer Support Associate",
    company: "Teleperformance",
    location: "India",
    jobType: "Full-time",
    skillsRequired: ["Customer Service", "Communication"],
    accessibilityTags: ["Accessible Workplace"],
    description: "Inclusive hiring program.",
    salaryRange: "2-5 LPA",
    isActive: true,
  },
  {
    title: "Technical Support",
    company: "Genpact",
    location: "India",
    jobType: "Full-time",
    skillsRequired: ["Technical Support"],
    accessibilityTags: ["PwD Hiring"],
    description: "Genpact inclusive hiring initiative.",
    salaryRange: "3-6 LPA",
    isActive: true,
  },
  {
    title: "Business Analyst",
    company: "Deloitte",
    location: "India",
    jobType: "Full-time",
    skillsRequired: ["Analytics", "Consulting"],
    accessibilityTags: ["PwD Friendly"],
    description: "Deloitte diversity and inclusion hiring.",
    salaryRange: "6-15 LPA",
    isActive: true,
  },
];

// ── Seed Function ─────────────────────────────────────────────────────────────
// Run this ONCE to populate Firestore with PwD job listings
// e.g., call seedPwdJobs() from an admin page or a one-time script
export const seedPwdJobs = async () => {
  const jobsRef = collection(db, "jobs");
  const results = await Promise.allSettled(
    pwdJobs.map((job) =>
      addDoc(jobsRef, { ...job, createdAt: serverTimestamp() })
    )
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  console.log(`✅ Seeded ${succeeded} PwD jobs successfully.`);
  if (failed > 0) console.warn(`⚠️ ${failed} jobs failed to seed.`);
};