// features/performance/services/badgeRuleEngine.ts
// Pure activity-driven Badge Rule Engine for SMART EDUCATION AI

import type {
  BadgeItem,
  AcademicRecord,
  SkillProgressItem,
  ProjectItem,
  ActivityItem,
  AchievementItem,
} from "../types/performance.types";

export interface StudentStatsInput {
  streakDays: number;
  totalQuizzesTaken: number;
  averageQuizScore: number;
  averageQuizAccuracy: number;
  completedAssignmentsCount: number;
  completedProjectsCount: number;
  verifiedAchievementsCount: number;
  totalAchievementsCount: number;
  certificatesCount: number;
  skillsCount: number;
  overallProgressScore: number;
  academicRecordsCount: number;
  activitiesCount: number;
  achievements: AchievementItem[];
  projects: ProjectItem[];
  activities: ActivityItem[];
}

export function evaluateStudentBadges(stats: StudentStatsInput): BadgeItem[] {
  const {
    streakDays,
    totalQuizzesTaken,
    averageQuizScore,
    completedProjectsCount,
    totalAchievementsCount,
    certificatesCount,
    skillsCount,
    overallProgressScore,
    achievements,
    activities,
  } = stats;

  const hasHackathon =
    achievements.some((a) => a.category.includes("Hackathon") || a.category.includes("Innovation")) ||
    activities.some((act) => act.category === "Hackathon" || act.category === "Competition");

  const hasWonCompetition = achievements.some((a) => {
    const pos = (a.position || "").toLowerCase();
    return pos.includes("1") || pos.includes("win") || pos.includes("first") || pos.includes("gold");
  });

  return [
    {
      id: "first_achievement",
      name: "First Achievement",
      description: "Recorded or verified your first milestone achievement on the platform.",
      icon: "Trophy",
      category: "Achievements",
      unlocked: totalAchievementsCount >= 1,
      progress: Math.min(100, (totalAchievementsCount / 1) * 100),
      criteria: "Add 1 verified achievement",
      points: 100,
    },
    {
      id: "streak_7",
      name: "7-Day Learning Streak",
      description: "Demonstrated consistent study habits for 7 consecutive days.",
      icon: "Flame",
      category: "Streaks",
      unlocked: streakDays >= 7,
      progress: Math.min(100, Math.round((streakDays / 7) * 100)),
      criteria: "Maintain a 7-day study streak",
      points: 150,
    },
    {
      id: "knowledge_explorer",
      name: "Knowledge Explorer",
      description: "Cultivated a broad foundation by registering and advancing across multiple skills.",
      icon: "BookOpen",
      category: "Learning",
      unlocked: skillsCount >= 5,
      progress: Math.min(100, Math.round((skillsCount / 5) * 100)),
      criteria: "Develop at least 5 skills",
      points: 120,
    },
    {
      id: "quiz_master",
      name: "Quiz Master",
      description: "Maintained a high quiz accuracy with an average score of 80% or higher.",
      icon: "Brain",
      category: "Quizzes",
      unlocked: totalQuizzesTaken >= 3 && averageQuizScore >= 80,
      progress: totalQuizzesTaken === 0 ? 0 : Math.min(100, Math.round((averageQuizScore / 80) * 100)),
      criteria: "Attempt >= 3 quizzes with >= 80% avg score",
      points: 200,
    },
    {
      id: "high_performer",
      name: "High Performer",
      description: "Achieved an overall SMART EDUCATION AI progress index above 75%.",
      icon: "Target",
      category: "Learning",
      unlocked: overallProgressScore >= 75,
      progress: Math.min(100, Math.round((overallProgressScore / 75) * 100)),
      criteria: "Reach 75% overall platform progress",
      points: 250,
    },
    {
      id: "project_builder",
      name: "Project Builder",
      description: "Engineered and completed real-world engineering or practical projects.",
      icon: "Code2",
      category: "Projects",
      unlocked: completedProjectsCount >= 2,
      progress: Math.min(100, Math.round((completedProjectsCount / 2) * 100)),
      criteria: "Complete at least 2 projects",
      points: 200,
    },
    {
      id: "innovation_explorer",
      name: "Innovation Explorer",
      description: "Participated in a hackathon, innovation challenge, or technical workshop.",
      icon: "Rocket",
      category: "Achievements",
      unlocked: hasHackathon,
      progress: hasHackathon ? 100 : 0,
      criteria: "Participate in a Hackathon or Innovation Challenge",
      points: 220,
    },
    {
      id: "competition_winner",
      name: "Competition Winner",
      description: "Secured a top podium placement in an institutional or state-level contest.",
      icon: "Medal",
      category: "Achievements",
      unlocked: hasWonCompetition,
      progress: hasWonCompetition ? 100 : 0,
      criteria: "Win or achieve top rank in any competition",
      points: 300,
    },
    {
      id: "certificate_collector",
      name: "Certificate Collector",
      description: "Secured and verified at least 3 formal certificates in EduVault.",
      icon: "ScrollText",
      category: "Achievements",
      unlocked: certificatesCount >= 3,
      progress: Math.min(100, Math.round((certificatesCount / 3) * 100)),
      criteria: "Earn & link at least 3 certificates",
      points: 180,
    },
    {
      id: "consistent_learner",
      name: "Consistent Learner",
      description: "Demonstrated holistic engagement across quizzes, assignments, and activities.",
      icon: "Sparkles",
      category: "Learning",
      unlocked: totalQuizzesTaken >= 2 && stats.completedAssignmentsCount >= 2 && stats.activitiesCount >= 1,
      progress: Math.min(
        100,
        Math.round(
          ((Math.min(totalQuizzesTaken, 2) +
            Math.min(stats.completedAssignmentsCount, 2) +
            Math.min(stats.activitiesCount, 1)) /
            5) *
            100
        )
      ),
      criteria: "Complete 2 quizzes, 2 assignments & 1 activity",
      points: 150,
    },
  ];
}
