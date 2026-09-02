// frontend/src/features/education/services/educationAIService.ts
// AI Academic & Career Advisor for SMART EDUCATION AI — Education System

import type { EducationProfile, AIEducationSuggestion } from "../types/education.types";

/**
 * Generate context-aware AI recommendations based on education level, branch, year, and skills
 */
export const generateEducationSuggestions = (
  profile: EducationProfile | null
): AIEducationSuggestion => {
  if (!profile) {
    return {
      focusAreas: [
        "Complete your educational profile",
        "Select your board or university",
        "Add currently enrolled subjects",
      ],
      recommendedSubjects: ["Core Science / Mathematics", "Computer Literacy", "Communication"],
      suggestedSkills: ["Critical Thinking", "Problem Solving", "Time Management"],
      futureEducationPaths: ["Undergraduate Degree", "Specialized Diploma", "Certification Tracks"],
      adviceSummary: "Please complete your Education Profile to unlock tailored AI curriculum mapping.",
    };
  }

  const level = profile.educationLevel;
  const branch = (profile.branch || profile.stream || profile.course || "").toLowerCase();
  const year = profile.year || "1";

  // 1. School Students
  if (level === "school") {
    const classNum = parseInt(profile.classOrGrade || "10", 10);
    if (classNum >= 11) {
      if (branch.includes("commerce")) {
        return {
          focusAreas: [
            "Financial Accounting & Double Entry System",
            "Business Studies & Market Mechanics",
            "Macroeconomics & National Income",
          ],
          recommendedSubjects: ["Accountancy", "Economics", "Applied Mathematics", "Business Studies"],
          suggestedSkills: ["Spreadsheets (Excel)", "Financial Literacy", "Data Interpretation"],
          futureEducationPaths: ["B.Com (Honours)", "BBA / BMS", "Chartered Accountancy (CA)", "Economics Honours"],
          adviceSummary: `As a Class ${profile.classOrGrade} Commerce student, prioritize building strong balance sheet logic and numerical fluency for entrance exams like CUET.`,
        };
      } else if (branch.includes("arts") || branch.includes("humanities")) {
        return {
          focusAreas: [
            "Analytical Essay Writing & Rhetoric",
            "Contemporary Indian History & Constitution",
            "Sociological Research Methodologies",
          ],
          recommendedSubjects: ["Political Science", "Sociology", "Psychology", "History"],
          suggestedSkills: ["Academic Writing", "Critical Reading", "Public Speaking"],
          futureEducationPaths: ["B.A. Political Science", "Law (BA LLB)", "Journalism & Media", "Civil Services (UPSC)"],
          adviceSummary: `As a Class ${profile.classOrGrade} Humanities student, cultivate comprehensive synthesis skills and daily editorial analysis.`,
        };
      } else {
        // Science
        return {
          focusAreas: [
            "Calculus & Vector Algebra",
            "Mechanics & Electromagnetism",
            "Organic Chemistry Reaction Mechanisms",
          ],
          recommendedSubjects: ["Physics", "Chemistry", "Mathematics", "Computer Science"],
          suggestedSkills: ["Python Basics", "Numerical Problem Solving", "Laboratory Methodologies"],
          futureEducationPaths: ["B.Tech / B.E. Engineering", "B.Sc Physics / Mathematics", "Data Science", "Architecture (B.Arch)"],
          adviceSummary: `For Class ${profile.classOrGrade} Science, focus on daily problem-solving numericals and clear conceptual derivations for JEE/NEET/State CETs.`,
        };
      }
    } else {
      return {
        focusAreas: [
          "Mathematical Foundation (Algebra & Geometry)",
          "Science Fundamentals & Physics Laws",
          "English Reading Comprehension & Spoken Grammar",
        ],
        recommendedSubjects: ["Mathematics", "Science", "Social Sciences", "English"],
        suggestedSkills: ["Logical Reasoning", "Creative Writing", "Scientific Observation"],
        futureEducationPaths: ["Senior Secondary (Class 11-12)", "Polytechnic Diploma", "Foundation Olympiads"],
        adviceSummary: `Strengthen your core foundation in Mathematics and Science to open diverse stream options in Senior Secondary.`,
      };
    }
  }

  // 2. Engineering / Computer Science College Students
  if (branch.includes("comp") || branch.includes("it") || branch.includes("software") || branch.includes("ai")) {
    if (year === "1" || year === "2") {
      return {
        focusAreas: [
          "Data Structures & Algorithms (Arrays, Linked Lists, Trees)",
          "Object-Oriented Programming in C++ / Java / Python",
          "Discrete Mathematics & Boolean Logic",
        ],
        recommendedSubjects: ["Data Structures", "Computer Organization", "Discrete Math", "OOPs"],
        suggestedSkills: ["Git / GitHub", "Linux CLI", "LeetCode Problem Solving", "C++ / Python"],
        futureEducationPaths: ["Full-Stack Development Track", "AI/ML Specialization", "Cloud Engineering", "M.Tech / MS in CS"],
        adviceSummary: `In Year ${year}, master data structures and algorithmic complexity. Aim for 30 minutes of daily coding drills on LeetCode / HackerRank.`,
      };
    } else {
      return {
        focusAreas: [
          "Database Normalization & Indexing (3NF, B+ Trees)",
          "Operating Systems & Process Synchronization",
          "Distributed Systems & Cloud Architecture (Docker, Microservices)",
          "Machine Learning & Deep Learning Pipelines",
        ],
        recommendedSubjects: ["Database Systems", "Operating Systems", "Cloud Computing", "Computer Networks"],
        suggestedSkills: ["React / Node.js", "Docker & Kubernetes", "PostgreSQL / MongoDB", "System Design"],
        futureEducationPaths: ["Software Development Engineer (SDE-1)", "DevOps / SRE Engineer", "AI/ML Solutions Architect", "MS in AI/Data Science"],
        adviceSummary: `In Year ${year}, build end-to-end full-stack capstone projects, practice mock system design rounds, and prepare for campus placement coding tests.`,
      };
    }
  }

  // 3. Default College / University fallback
  return {
    focusAreas: [
      `Core Syllabus Mastery for ${profile.course || "Degree"}`,
      "Practical Laboratory Experiments & Project Submissions",
      "Industry Relevant Technical Certification",
    ],
    recommendedSubjects: [profile.branch || "Core Subject", "Applied Statistics", "Professional Communication"],
    suggestedSkills: ["Data Analysis", "Technical Presentation", "Problem Solving"],
    futureEducationPaths: ["Postgraduate Degree (Master's)", "Industry Specialization", "Research & PhD"],
    adviceSummary: `Maintain consistent academic scores (>8.0 CGPA / 75%) and build industry-ready portfolio projects.`,
  };
};

/**
 * Speech Synthesizer for EduAccess accessibility features
 */
export const speakText = (text: string): Promise<void> => {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) {
      console.warn("Speech Synthesis not supported in this browser.");
      resolve();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = "en-IN";

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
};

export const stopSpeech = () => {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
};
