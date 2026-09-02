// frontend/src/features/education/components/EducationDashboard.tsx
import React, { useState } from "react";
import type { EducationProfile } from "../types/education.types";
import { useEducationProfile } from "../hooks/useEducationProfile";
import { useEducationHistory } from "../hooks/useEducationHistory";
import { ProfileCompletion } from "./ProfileCompletion";
import { EducationProfileForm } from "./EducationProfileForm";
import { SubjectManager } from "./SubjectManager";
import { EducationTimeline } from "./EducationTimeline";
import { SkillsManager } from "./SkillsManager";
import { LanguageManager } from "./LanguageManager";
import { AIEducationAssistant } from "./AIEducationAssistant";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Building2,
  BookOpen,
  MapPin,
  Clock,
  Target,
  Globe,
  Edit2,
  Sparkles,
  Bot,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Layers,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type EducationTab =
  | "current"
  | "edit"
  | "subjects"
  | "timeline"
  | "skills"
  | "languages"
  | "ai-advisor";

export const EducationDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { profile, loading: profileLoading, saving, completion, updateProfile } = useEducationProfile();
  const {
    history,
    subjects,
    skills,
    languages,
    loading: historyLoading,
    addHistoryItem,
    removeHistoryItem,
    addSubject,
    updateSubject,
    removeSubject,
    addSkill,
    removeSkill,
    addLanguage,
    removeLanguage,
  } = useEducationHistory();

  const [activeTab, setActiveTab] = useState<EducationTab>("current");

  if (profileLoading || historyLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] space-y-3 rounded-3xl border border-border/70 bg-card p-12">
        <GraduationCap className="h-10 w-10 text-primary animate-bounce" />
        <p className="text-sm font-bold text-foreground">Synchronizing Lifelong EduID & Academic Profile...</p>
      </div>
    );
  }

  const eduId = profile?.eduId || "EDU-STU-2026";
  const studentName = profile?.fullName || "Student";
  const isSchool = profile?.educationLevel === "school";

  return (
    <div className="space-y-6">
      {/* 1. Hero Current Education Banner */}
      <div className="p-6 md:p-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase px-3 py-1 rounded-full bg-primary text-primary-foreground tracking-wider flex items-center gap-1.5 shadow-sm">
                <Sparkles className="h-3 w-3" /> SMART EDUCATION AI — ACADEMIC IDENTITY
              </span>
              <Badge variant="outline" className="text-xs bg-background/80 backdrop-blur-sm border-primary/30 font-mono text-primary font-bold">
                🆔 {eduId}
              </Badge>
              <Badge variant="secondary" className="text-xs capitalize">
                🎓 {profile?.educationLevel || "College"}
              </Badge>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                {profile?.institutionName || "Institution Not Set"}
              </h2>
              <p className="text-sm font-semibold text-primary mt-1 flex flex-wrap items-center gap-2">
                <span>
                  {isSchool
                    ? `${profile?.classOrGrade || "Class 12"} • ${profile?.stream || "General Stream"}`
                    : `${profile?.degree || "Degree"} in ${profile?.course || "Course"} (${profile?.branch || "Specialization"})`}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  {profile?.boardOrUniversity || "Affiliated Board/University"}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-primary" /> {profile?.city || "City"}, {profile?.state || "State"}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-primary" /> Year {profile?.year || "1"} • Semester {profile?.semester || "1"}
              </span>
              <span className="flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-primary" /> Medium: {profile?.medium || "English"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              onClick={() => setActiveTab("edit")}
              className="gap-2 rounded-2xl bg-primary text-primary-foreground shadow hover:shadow-md text-xs font-bold"
            >
              <Edit2 className="h-3.5 w-3.5" /> Edit Profile
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/learn")}
              className="gap-2 rounded-2xl bg-card/80 backdrop-blur-sm border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 text-xs font-bold"
            >
              <BookOpen className="h-3.5 w-3.5" /> Learn LMS
            </Button>
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div className="mt-6 pt-4 border-t border-border/40">
          <ProfileCompletion
            percentage={completion.percentage}
            missingFields={completion.missingFields}
            onCompleteClick={() => setActiveTab("edit")}
          />
        </div>
      </div>

      {/* 2. Sub-Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: "current", label: "Overview & Details", icon: "🏫" },
          { id: "subjects", label: `Subjects (${subjects.length})`, icon: "📖" },
          { id: "timeline", label: `Timeline (${history.length})`, icon: "🕒" },
          { id: "skills", label: `Skills (${skills.length})`, icon: "🎯" },
          { id: "languages", label: `Languages (${languages.length})`, icon: "🌐" },
          { id: "ai-advisor", label: "AI Academic Advisor", icon: "🤖" },
          { id: "edit", label: "Edit Profile", icon: "✏️" },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as EducationTab)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-2xl border px-4 py-2.5 text-xs font-bold transition-all shrink-0 shadow-sm ${
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border/70 bg-card/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. Dynamic Sub-Content */}
      {activeTab === "current" && (
        <div className="space-y-6 animate-in fade-in">
          {/* AI Suggestions Card */}
          <AIEducationAssistant profile={profile} />

          {/* Academic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="rounded-3xl border-border/70 bg-card/60 backdrop-blur-sm">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" /> Institution & Board Details
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-2 border-b border-border/40">
                    <span className="text-muted-foreground font-semibold">Institution Name</span>
                    <span className="font-bold text-foreground text-right">{profile?.institutionName || "—"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/40">
                    <span className="text-muted-foreground font-semibold">Institution Type</span>
                    <span className="font-bold text-foreground">{profile?.institutionType || "College"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/40">
                    <span className="text-muted-foreground font-semibold">Board / University</span>
                    <span className="font-bold text-foreground text-right">{profile?.boardOrUniversity || "—"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/40">
                    <span className="text-muted-foreground font-semibold">Location</span>
                    <span className="font-bold text-foreground">{profile?.city}, {profile?.state}</span>
                  </div>
                  {profile?.website && (
                    <div className="flex justify-between py-2 border-b border-border/40">
                      <span className="text-muted-foreground font-semibold">Website</span>
                      <a href={profile.website} target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold truncate max-w-xs">
                        {profile.website}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-border/70 bg-card/60 backdrop-blur-sm">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" /> Academic Curriculum Details
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-2 border-b border-border/40">
                    <span className="text-muted-foreground font-semibold">Education Level</span>
                    <span className="font-bold text-foreground capitalize">{profile?.educationLevel}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/40">
                    <span className="text-muted-foreground font-semibold">Degree / Program</span>
                    <span className="font-bold text-foreground text-right">{profile?.degree || profile?.course || "—"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/40">
                    <span className="text-muted-foreground font-semibold">Branch / Stream</span>
                    <span className="font-bold text-foreground text-right">{profile?.branch || profile?.stream || "—"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/40">
                    <span className="text-muted-foreground font-semibold">Year & Semester</span>
                    <span className="font-bold text-foreground">Year {profile?.year || "1"} • Sem {profile?.semester || "1"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/40">
                    <span className="text-muted-foreground font-semibold">Academic Session</span>
                    <span className="font-bold text-foreground">{profile?.academicYear || "2025-2026"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Subject & Timeline Snapshot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="rounded-3xl border-border/70 bg-card/60">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-indigo-500" /> Active Subjects ({subjects.length})
                  </h4>
                  <Button size="sm" variant="ghost" onClick={() => setActiveTab("subjects")} className="text-xs text-primary">
                    Manage Subjects →
                  </Button>
                </div>
                <div className="space-y-2">
                  {subjects.slice(0, 3).map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 text-xs">
                      <div>
                        <span className="font-bold text-foreground block">{s.name}</span>
                        <span className="text-muted-foreground text-[10px]">{s.subjectCode} • {s.teacher}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary">
                        {s.progress ?? 70}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-border/70 bg-card/60">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-500" /> Timeline Stages ({history.length})
                  </h4>
                  <Button size="sm" variant="ghost" onClick={() => setActiveTab("timeline")} className="text-xs text-primary">
                    View Full Timeline →
                  </Button>
                </div>
                <div className="space-y-2">
                  {history.slice(0, 3).map((h) => (
                    <div key={h.id} className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 text-xs">
                      <div>
                        <span className="font-bold text-foreground block">{h.courseOrClass}</span>
                        <span className="text-muted-foreground text-[10px]">{h.institution} ({h.startDate} – {h.endDate})</span>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {h.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "subjects" && (
        <div className="animate-in fade-in">
          <SubjectManager
            subjects={subjects}
            onAddSubject={addSubject}
            onUpdateSubject={updateSubject}
            onDeleteSubject={removeSubject}
          />
        </div>
      )}

      {activeTab === "timeline" && (
        <div className="animate-in fade-in">
          <EducationTimeline
            history={history}
            onAddHistory={addHistoryItem}
            onDeleteHistory={removeHistoryItem}
          />
        </div>
      )}

      {activeTab === "skills" && (
        <div className="animate-in fade-in">
          <SkillsManager
            skills={skills}
            onAddSkill={addSkill}
            onDeleteSkill={removeSkill}
          />
        </div>
      )}

      {activeTab === "languages" && (
        <div className="animate-in fade-in">
          <LanguageManager
            languages={languages}
            onAddLanguage={addLanguage}
            onDeleteLanguage={removeLanguage}
          />
        </div>
      )}

      {activeTab === "ai-advisor" && (
        <div className="animate-in fade-in">
          <AIEducationAssistant profile={profile} />
        </div>
      )}

      {activeTab === "edit" && (
        <div className="animate-in fade-in">
          <EducationProfileForm
            initialProfile={profile}
            onSave={async (updates) => {
              await updateProfile(updates);
              setActiveTab("current");
            }}
            onCancel={() => setActiveTab("current")}
            saving={saving}
          />
        </div>
      )}
    </div>
  );
};
