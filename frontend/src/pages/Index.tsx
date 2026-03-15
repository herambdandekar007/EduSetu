import DashboardLayout from "@/components/DashboardLayout";
import SmartRecommendations from "@/components/dashboard/SmartRecommendations";
import SkillGapAnalyzer from "@/components/dashboard/SkillGapAnalyzer";
import RecentAlerts from "@/components/dashboard/RecentAlerts";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, TrendingUp } from "lucide-react";

/** Returns a 0–100 profile completion score based on filled fields. */
const calcCompletion = (profile: Record<string, any> | null): number => {
  if (!profile) return 0;
  const fields = ["full_name", "disability_type", "education_level", "skills", "city"];
  const filled = fields.filter(
    (f) => profile[f] && (Array.isArray(profile[f]) ? profile[f].length > 0 : true)
  ).length;
  return Math.round((filled / fields.length) * 100);
};

const Index = () => {
  const { profile } = useAuth();
  const firstName = profile?.full_name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const completion = calcCompletion(profile);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome hero banner */}
        <div
          className="relative overflow-hidden rounded-2xl p-6 text-white"
          style={{
            background:
              "linear-gradient(135deg, hsl(248,62%,16%) 0%, hsl(258,58%,22%) 45%, hsl(276,54%,26%) 100%)",
          }}
        >
          {/* Ambient blobs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="absolute -top-12 -right-12 h-48 w-48 rounded-full opacity-25"
              style={{ background: "radial-gradient(circle, hsl(265,80%,62%), transparent 70%)" }}
            />
            <div
              className="absolute -bottom-8 left-1/3 h-32 w-32 rounded-full opacity-15"
              style={{ background: "radial-gradient(circle, hsl(250,84%,54%), transparent 70%)" }}
            />
          </div>

          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mb-1 text-sm font-medium" style={{ color: "hsl(265,55%,72%)" }}>
                {greeting} 👋
              </p>
              <h1 className="mb-1 text-2xl font-extrabold text-white">
                Welcome back, {firstName}!
              </h1>
              <p className="text-sm" style={{ color: "hsl(250,28%,68%)" }}>
                Your AI assistant is ready — let's find your next opportunity.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-2 rounded-xl px-4 py-2.5"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                <Sparkles className="h-4 w-4" style={{ color: "hsl(265,80%,75%)" }} />
                <span className="text-sm font-medium">AI Active</span>
              </div>
              <div
                className="hidden items-center gap-2 rounded-xl px-4 py-2.5 sm:flex"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <TrendingUp className="h-4 w-4" style={{ color: "hsl(152,60%,55%)" }} />
                <span className="text-sm font-medium">Profile {completion}%</span>
              </div>
            </div>
          </div>
        </div>

        <SmartRecommendations />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <SkillGapAnalyzer />
          </div>
          <div className="lg:col-span-2">
            <RecentAlerts />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
