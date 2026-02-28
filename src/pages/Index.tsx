import DashboardLayout from "@/components/DashboardLayout";
import SmartRecommendations from "@/components/dashboard/SmartRecommendations";
import SkillGapAnalyzer from "@/components/dashboard/SkillGapAnalyzer";
import RecentAlerts from "@/components/dashboard/RecentAlerts";
import { Heart } from "lucide-react";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <SmartRecommendations />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <SkillGapAnalyzer />
          </div>
          <div className="lg:col-span-2">
            <RecentAlerts />
          </div>
        </div>
      </div>

      {/* Floating emergency button */}
      <button
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-urgent text-urgent-foreground shadow-xl hover:scale-105 transition-transform animate-pulse-soft"
        aria-label="Emergency Support"
        title="Emergency Support"
      >
        <Heart className="h-6 w-6" />
      </button>
    </DashboardLayout>
  );
};

export default Index;
