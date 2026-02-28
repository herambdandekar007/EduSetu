import DashboardLayout from "@/components/DashboardLayout";
import SmartRecommendations from "@/components/dashboard/SmartRecommendations";
import SkillGapAnalyzer from "@/components/dashboard/SkillGapAnalyzer";
import RecentAlerts from "@/components/dashboard/RecentAlerts";

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
    </DashboardLayout>
  );
};

export default Index;
