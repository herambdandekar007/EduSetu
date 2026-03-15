import { useState, useEffect } from "react";
import {
  doc, getDoc, collection, getDocs, query, where, orderBy, limit
} from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Trophy, Zap, Target, Star, Award, BookOpen, Briefcase, Users,
  Flame, TrendingUp, Crown, Medal
} from "lucide-react";

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2500, 4000, 6000, 10000];
const LEVEL_NAMES = ["Beginner", "Explorer", "Learner", "Achiever", "Pro", "Expert", "Master", "Legend", "Champion", "Icon"];

const BADGE_DEFINITIONS = [
  { type: "profile_complete", name: "Profile Pro", desc: "Complete your profile 100%", icon: "user", points: 50, color: "text-accent" },
  { type: "first_job_apply", name: "Job Seeker", desc: "Apply to your first job", icon: "briefcase", points: 30, color: "text-success" },
  { type: "scheme_check", name: "Scheme Scout", desc: "Check eligibility for 5 schemes", icon: "file", points: 40, color: "text-warning" },
  { type: "course_start", name: "Lifelong Learner", desc: "Start your first course", icon: "book", points: 25, color: "text-info" },
  { type: "ai_chat", name: "AI Explorer", desc: "Have 10 conversations with AI", icon: "sparkles", points: 35, color: "text-accent" },
  { type: "community_post", name: "Community Voice", desc: "Create your first forum post", icon: "message", points: 20, color: "text-match" },
  { type: "mentor_connect", name: "Mentee Star", desc: "Connect with a mentor", icon: "users", points: 45, color: "text-success" },
  { type: "streak_7", name: "Weekly Warrior", desc: "7-day activity streak", icon: "flame", points: 70, color: "text-destructive" },
  { type: "streak_30", name: "Monthly Master", desc: "30-day activity streak", icon: "crown", points: 200, color: "text-warning" },
];

const iconMap: Record<string, any> = {
  user: Target, briefcase: Briefcase, file: Award, book: BookOpen,
  sparkles: Star, message: Users, users: Users, flame: Flame, crown: Crown,
};

const GamificationPage = () => {
  const { user } = useAuth();
  const [points, setPoints] = useState({ total_points: 0, level: 1, streak_days: 0 });
  const [achievements, setAchievements] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    // User points and achievements are stored with the user UID as the document ID
    const [pointsSnap, achSnap, leaderSnap] = await Promise.all([
      getDoc(doc(db, "user_points", user!.uid)),
      getDocs(query(collection(db, "user_achievements"), where("user_id", "==", user!.uid))),
      getDocs(query(collection(db, "user_points"), orderBy("total_points", "desc"), limit(10))),
    ]);
    if (pointsSnap.exists()) setPoints(pointsSnap.data() as any);
    setAchievements(achSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLeaderboard(leaderSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const currentLevel = Math.min(
    LEVEL_THRESHOLDS.findIndex((t, i) => i === LEVEL_THRESHOLDS.length - 1 || points.total_points < LEVEL_THRESHOLDS[i + 1]),
    LEVEL_NAMES.length - 1
  );
  const nextThreshold = LEVEL_THRESHOLDS[Math.min(currentLevel + 1, LEVEL_THRESHOLDS.length - 1)];
  const prevThreshold = LEVEL_THRESHOLDS[currentLevel];
  const levelProgress = nextThreshold > prevThreshold
    ? Math.round(((points.total_points - prevThreshold) / (nextThreshold - prevThreshold)) * 100)
    : 100;

  const earnedTypes = new Set(achievements.map(a => a.achievement_type));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          icon={<Trophy className="h-5 w-5 text-white" />}
          title="Achievements & Progress"
          subtitle="Track your journey, earn badges, and compete on the leaderboard"
        >
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-2"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <Flame className="h-4 w-4 text-white/80" />
            <span className="text-sm font-medium text-white">{points.streak_days}-Day Streak</span>
          </div>
        </PageHeader>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="border border-border bg-gradient-to-br from-accent/5 to-transparent">
              <CardContent className="p-5 text-center">
                <Zap className="h-8 w-8 text-accent mx-auto mb-2" />
                <p className="text-3xl font-bold text-foreground">{points.total_points}</p>
                <p className="text-sm text-muted-foreground">Total Points</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <Card className="border border-border bg-gradient-to-br from-warning/5 to-transparent">
              <CardContent className="p-5 text-center">
                <Crown className="h-8 w-8 text-warning mx-auto mb-2" />
                <p className="text-3xl font-bold text-foreground">Lv.{currentLevel + 1}</p>
                <p className="text-sm text-muted-foreground">{LEVEL_NAMES[currentLevel]}</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <Card className="border border-border bg-gradient-to-br from-destructive/5 to-transparent">
              <CardContent className="p-5 text-center">
                <Flame className="h-8 w-8 text-destructive mx-auto mb-2" />
                <p className="text-3xl font-bold text-foreground">{points.streak_days}</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Level Progress */}
        <Card className="border border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Level {currentLevel + 1}: {LEVEL_NAMES[currentLevel]}</span>
              <span className="text-sm text-muted-foreground">{points.total_points}/{nextThreshold} XP</span>
            </div>
            <Progress value={levelProgress} className="h-3 [&>div]:bg-accent" />
            <p className="text-xs text-muted-foreground mt-1">
              {nextThreshold - points.total_points} XP to next level: {LEVEL_NAMES[Math.min(currentLevel + 1, LEVEL_NAMES.length - 1)]}
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Badges */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Medal className="h-5 w-5 text-accent" /> Badges ({earnedTypes.size}/{BADGE_DEFINITIONS.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {BADGE_DEFINITIONS.map((badge, i) => {
                const earned = earnedTypes.has(badge.type);
                const Icon = iconMap[badge.icon] || Trophy;
                return (
                  <motion.div key={badge.type} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className={`border ${earned ? "border-accent shadow-md" : "border-border opacity-60"}`}>
                      <CardContent className="p-4 text-center">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full mx-auto mb-2 ${earned ? "bg-accent/10" : "bg-muted"}`}>
                          <Icon className={`h-6 w-6 ${earned ? badge.color : "text-muted-foreground"}`} />
                        </div>
                        <h4 className="font-semibold text-foreground text-sm">{badge.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{badge.desc}</p>
                        <Badge variant="outline" className="mt-2 text-xs">{badge.points} XP</Badge>
                        {earned && <p className="text-xs text-success mt-1 font-medium">✓ Earned</p>}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Leaderboard */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" /> Leaderboard
            </h2>
            <Card className="border border-border">
              <CardContent className="p-4 space-y-3">
                {leaderboard.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No activity yet. Start earning points!</p>
                ) : (
                  leaderboard.map((entry, i) => (
                    <div key={entry.id} className={`flex items-center gap-3 p-2 rounded-lg ${entry.user_id === user?.id ? "bg-accent/5" : ""}`}>
                      <span className={`text-lg font-bold w-6 text-center ${i < 3 ? "text-warning" : "text-muted-foreground"}`}>
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {entry.user_id === user?.id ? "You" : `User ${i + 1}`}
                        </p>
                        <p className="text-xs text-muted-foreground">Level {entry.level}</p>
                      </div>
                      <span className="text-sm font-bold text-accent">{entry.total_points} XP</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GamificationPage;
