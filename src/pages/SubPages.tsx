import DashboardLayout from "@/components/DashboardLayout";

const PlaceholderPage = ({ title, description }: { title: string; description: string }) => (
  <DashboardLayout>
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
      <p className="text-muted-foreground max-w-md">{description}</p>
    </div>
  </DashboardLayout>
);

export const ProfilePage = () => <PlaceholderPage title="My Profile" description="Manage your disability details, skills, education, and preferences." />;
export const JobsPage = () => <PlaceholderPage title="Job Matches" description="AI-powered job recommendations matched to your skills and accessibility needs." />;
export const SchemesPage = () => <PlaceholderPage title="Scheme Eligibility" description="Check your eligibility for government schemes and financial aid programs." />;
export const EducationPage = () => <PlaceholderPage title="Education Finder" description="Discover accessible courses, institutions, and skill-building opportunities." />;
export const NearbyPage = () => <PlaceholderPage title="Nearby Services" description="Find hospitals, NGOs, coaching centers, and support services near you." />;
export const SettingsPage = () => <PlaceholderPage title="Settings" description="Configure accessibility preferences, notifications, and account settings." />;
