// frontend/src/features/profile/pages/ProfilePage.tsx
// Pure Minimalist White & Grayscale Profile Page for SMART EDUCATION AI

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  FileText,
  GraduationCap,
  Code,
  Globe,
  Briefcase,
  Accessibility,
  Shield,
} from "lucide-react";
import { useProfile } from "../hooks/useProfile";
import { ProfileHeader } from "../components/ProfileHeader";
import { PersonalProfile } from "../components/PersonalProfile";
import { EduIDCard } from "../components/EduIDCard";
import { EducationProfile } from "../components/EducationProfile";
import { SkillsManager } from "../components/SkillsManager";
import { LanguagesSection } from "../components/LanguagesSection";
import { EduPortfolio } from "../components/EduPortfolio";
import { AccessibilityProfile } from "../components/AccessibilityProfile";
import { AccountInfoSection } from "../components/AccountInfoSection";
import { ProfileCompletion } from "../components/ProfileCompletion";
import { ProfileSkeleton } from "../components/ProfileSkeleton";

export const ProfilePage: React.FC = () => {
  const {
    loading,
    saving,
    personalProfile,
    educationProfile,
    timeline,
    skills,
    languages,
    portfolio,
    accessibility,
    completionSummary,
    updatePersonalProfile,
    updateEducation,
    addTimelineEntry,
    removeTimelineEntry,
    addOrUpdateSkill,
    removeSkill,
    addOrUpdateLanguage,
    removeLanguage,
    addOrUpdatePortfolio,
    removePortfolio,
    updateAccessibility,
  } = useProfile();

  const [activeTab, setActiveTab] = useState<string>("personal");

  if (loading || !personalProfile) {
    return <ProfileSkeleton />;
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-24 bg-white text-black min-h-screen">
        
        {/* 1. Profile Overview Header */}
        <ProfileHeader
          profile={personalProfile}
          education={educationProfile}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onUpdateAvatar={async (url) => {
            await updatePersonalProfile({ avatarUrl: url, photoURL: url });
          }}
        />

        {/* 2. Profile Completion Meter */}
        <ProfileCompletion
          summary={completionSummary}
          onNavigateToTab={setActiveTab}
        />

        {/* 3. Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="sticky top-16 z-30 overflow-x-auto rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
            <TabsList className="bg-transparent p-0 h-auto flex flex-nowrap w-full justify-start gap-1">
              
              {/* Tab 1: Personal Information */}
              <TabsTrigger
                value="personal"
                className="rounded-md px-3.5 py-2 text-xs font-semibold transition-colors data-[state=active]:bg-black data-[state=active]:text-white text-gray-700 hover:text-black gap-1.5"
              >
                <User className="h-3.5 w-3.5" />
                <span>Personal Information</span>
              </TabsTrigger>

              {/* Tab 2: Edu Identity */}
              <TabsTrigger
                value="eduid"
                className="rounded-md px-3.5 py-2 text-xs font-semibold transition-colors data-[state=active]:bg-black data-[state=active]:text-white text-gray-700 hover:text-black gap-1.5"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Edu Identity</span>
              </TabsTrigger>

              {/* Tab 3: Education Profile */}
              <TabsTrigger
                value="education"
                className="rounded-md px-3.5 py-2 text-xs font-semibold transition-colors data-[state=active]:bg-black data-[state=active]:text-white text-gray-700 hover:text-black gap-1.5"
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Education Profile</span>
              </TabsTrigger>

              {/* Tab 4: Skills */}
              <TabsTrigger
                value="skills"
                className="rounded-md px-3.5 py-2 text-xs font-semibold transition-colors data-[state=active]:bg-black data-[state=active]:text-white text-gray-700 hover:text-black gap-1.5"
              >
                <Code className="h-3.5 w-3.5" />
                <span>Skills</span>
                {skills.length > 0 && (
                  <span className="ml-1 rounded bg-gray-100 data-[state=active]:bg-gray-800 px-1.5 py-0.2 text-[10px] font-mono">
                    {skills.length}
                  </span>
                )}
              </TabsTrigger>

              {/* Tab 5: Languages */}
              <TabsTrigger
                value="languages"
                className="rounded-md px-3.5 py-2 text-xs font-semibold transition-colors data-[state=active]:bg-black data-[state=active]:text-white text-gray-700 hover:text-black gap-1.5"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Languages</span>
                {languages.length > 0 && (
                  <span className="ml-1 rounded bg-gray-100 data-[state=active]:bg-gray-800 px-1.5 py-0.2 text-[10px] font-mono">
                    {languages.length}
                  </span>
                )}
              </TabsTrigger>

              {/* Tab 6: EduPortfolio */}
              <TabsTrigger
                value="portfolio"
                className="rounded-md px-3.5 py-2 text-xs font-semibold transition-colors data-[state=active]:bg-black data-[state=active]:text-white text-gray-700 hover:text-black gap-1.5"
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span>EduPortfolio</span>
                {portfolio.length > 0 && (
                  <span className="ml-1 rounded bg-gray-100 data-[state=active]:bg-gray-800 px-1.5 py-0.2 text-[10px] font-mono">
                    {portfolio.length}
                  </span>
                )}
              </TabsTrigger>

              {/* Tab 7: Accessibility */}
              <TabsTrigger
                value="accessibility"
                className="rounded-md px-3.5 py-2 text-xs font-semibold transition-colors data-[state=active]:bg-black data-[state=active]:text-white text-gray-700 hover:text-black gap-1.5"
              >
                <Accessibility className="h-3.5 w-3.5" />
                <span>Accessibility</span>
              </TabsTrigger>

              {/* Tab 8: Account Information */}
              <TabsTrigger
                value="account"
                className="rounded-md px-3.5 py-2 text-xs font-semibold transition-colors data-[state=active]:bg-black data-[state=active]:text-white text-gray-700 hover:text-black gap-1.5"
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Account Information</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab 1: Personal Profile */}
          <TabsContent value="personal" className="focus-visible:outline-none">
            <PersonalProfile
              profile={personalProfile}
              saving={saving}
              onSave={updatePersonalProfile}
              onNavigateToTab={setActiveTab}
            />
          </TabsContent>

          {/* Tab 2: Edu Identity */}
          <TabsContent value="eduid" className="focus-visible:outline-none">
            <EduIDCard
              profile={personalProfile}
              education={educationProfile}
            />
          </TabsContent>

          {/* Tab 3: Education Profile */}
          <TabsContent value="education" className="focus-visible:outline-none">
            <EducationProfile
              education={educationProfile}
              timeline={timeline}
              saving={saving}
              onSaveEducation={updateEducation}
              onAddTimeline={addTimelineEntry}
              onRemoveTimeline={removeTimelineEntry}
            />
          </TabsContent>

          {/* Tab 4: Skills */}
          <TabsContent value="skills" className="focus-visible:outline-none">
            <SkillsManager
              skills={skills}
              onAddOrUpdateSkill={addOrUpdateSkill}
              onRemoveSkill={removeSkill}
            />
          </TabsContent>

          {/* Tab 5: Languages */}
          <TabsContent value="languages" className="focus-visible:outline-none">
            <LanguagesSection
              languages={languages}
              onAddOrUpdateLanguage={addOrUpdateLanguage}
              onRemoveLanguage={removeLanguage}
            />
          </TabsContent>

          {/* Tab 6: EduPortfolio */}
          <TabsContent value="portfolio" className="focus-visible:outline-none">
            <EduPortfolio
              portfolio={portfolio}
              saving={saving}
              onAddOrUpdatePortfolio={addOrUpdatePortfolio}
              onRemovePortfolio={removePortfolio}
            />
          </TabsContent>

          {/* Tab 7: Accessibility Information */}
          <TabsContent value="accessibility" className="focus-visible:outline-none">
            {accessibility && (
              <AccessibilityProfile
                settings={accessibility}
                personalProfile={personalProfile}
                saving={saving}
                onSave={updateAccessibility}
                onSavePersonal={updatePersonalProfile}
              />
            )}
          </TabsContent>

          {/* Tab 8: Account Information */}
          <TabsContent value="account" className="focus-visible:outline-none">
            <AccountInfoSection profile={personalProfile} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
