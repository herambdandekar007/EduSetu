import { useState, useEffect } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User, Save, Loader2, Briefcase, Heart, Shield, Globe, Phone, Sparkles, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";

const CHAT_URL = import.meta.env.VITE_AI_ASSISTANT_URL;

const disabilityTypes = ["Visual", "Hearing", "Physical", "Intellectual", "Speech", "Multiple", "Other"];
const educationLevels = ["Below 10th", "10th Pass", "12th Pass", "Diploma", "Graduate", "Post Graduate", "PhD"];
const genderOptions = ["Male", "Female", "Non-Binary", "Prefer not to say"];
const maritalOptions = ["Single", "Married", "Divorced", "Widowed", "Prefer not to say"];
const jobTypes = ["Full-time", "Part-time", "Remote", "Hybrid", "Freelance", "Internship"];
const languageOptions = ["Hindi", "English", "Tamil", "Telugu", "Kannada", "Malayalam", "Bengali", "Marathi", "Gujarati", "Punjabi", "Odia", "Urdu", "Other"];

const ProfilePage = () => {
  const { profile, refreshProfile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<{
    score: number;
    strengths: string[];
    improvements: { area: string; issue: string; suggestion: string }[];
    profileSummary: string;
    keyRecommendations: string[];
    pwdTips: string[];
  } | null>(null);
  const [form, setForm] = useState({
    fullName: "", phone: "", gender: "", date_of_birth: "", bio: "",
    disability_type: "", disability_percentage: 0, udid_number: "", assistive_tech: "",
    education_level: "", skills: "", work_experience_years: 0, preferred_job_type: "",
    preferred_locations: "", linkedin_url: "",
    languages: [] as string[],
    city: "", state: "", pincode: "", age: 0, income: 0,
    guardian_name: "", guardian_phone: "",
    emergency_contact_name: "", emergency_contact_phone: "",
    marital_status: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.full_name || "",
        phone: profile.phone || "",
        gender: profile.gender || "",
        date_of_birth: profile.date_of_birth || "",
        bio: profile.bio || "",
        disability_type: profile.disability_type || "",
        disability_percentage: profile.disability_percentage || 0,
        udid_number: profile.udid_number || "",
        assistive_tech: profile.assistive_tech || "",
        education_level: profile.education_level || "",
        skills: (profile.skills || []).join(", "),
        work_experience_years: profile.work_experience_years || 0,
        preferred_job_type: profile.preferred_job_type || "",
        preferred_locations: (profile.preferred_locations || []).join(", "),
        linkedin_url: profile.linkedin_url || "",
        languages: profile.languages || [],
        city: profile.city || "",
        state: profile.state || "",
        pincode: profile.pincode || "",
        age: profile.age || 0,
        income: profile.income || 0,
        guardian_name: profile.guardian_name || "",
        guardian_phone: profile.guardian_phone || "",
        emergency_contact_name: profile.emergency_contact_name || "",
        emergency_contact_phone: profile.emergency_contact_phone || "",
        marital_status: profile.marital_status || "",
      });
    }
  }, [profile]);

  const completionFields = [
    "full_name", "phone", "gender", "disability_type", "education_level",
    "skills", "city", "state", "bio", "preferred_job_type", "languages"
  ];
  const completion = (() => {
    let filled = 0;
    completionFields.forEach(f => {
      const val = (form as any)[f];
      if (Array.isArray(val) ? val.length > 0 : !!val) filled++;
    });
    return Math.round((filled / completionFields.length) * 100);
  })();

  const toggleLanguage = (lang: string) => {
    setForm(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const analyzeWithAI = async () => {
    if (!profile) { toast.error("Save your profile first"); return; }
    setAiAnalyzing(true);
    setAiResult(null);
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "resume",
          messages: [{ role: "user", content: "Analyze my profile for PWD job applications." }],
          userProfile: profile,
        }),
      });
      if (resp.status === 429) { toast.error("Rate limited. Try again shortly."); setAiAnalyzing(false); return; }
      if (resp.status === 402) { toast.error("AI credits exhausted."); setAiAnalyzing(false); return; }
      if (!resp.ok) throw new Error("AI error");

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let full = "", textBuffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, idx);
          textBuffer = textBuffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const p = JSON.parse(json);
            const c = p.choices?.[0]?.delta?.content;
            if (c) full += c;
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
      setAiResult(JSON.parse(full));
      toast.success("AI profile analysis complete!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to analyze profile. Try again.");
    }
    setAiAnalyzing(false);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!form.fullName.trim()) { toast.error("Full name is required"); return; }
    setLoading(true);
    try {
      await setDoc(doc(db, "profiles", user.uid), {
        full_name: form.fullName.trim(),
        phone: form.phone.trim(),
        gender: form.gender,
        date_of_birth: form.date_of_birth || null,
        bio: form.bio.trim(),
        disability_type: form.disability_type,
        disability_percentage: form.disability_percentage,
        udid_number: form.udid_number.trim(),
        assistive_tech: form.assistive_tech.trim(),
        education_level: form.education_level,
        skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
        work_experience_years: form.work_experience_years || 0,
        preferred_job_type: form.preferred_job_type,
        preferred_locations: form.preferred_locations.split(",").map(s => s.trim()).filter(Boolean),
        linkedin_url: form.linkedin_url.trim(),
        languages: form.languages,
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        age: form.age || null,
        income: form.income || null,
        guardian_name: form.guardian_name.trim(),
        guardian_phone: form.guardian_phone.trim(),
        emergency_contact_name: form.emergency_contact_name.trim(),
        emergency_contact_phone: form.emergency_contact_phone.trim(),
        marital_status: form.marital_status,
      });
      toast.success("Profile saved successfully!");
      await refreshProfile();
    } catch {
      toast.error("Failed to save profile");
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader
          icon={<User className="h-5 w-5 text-white" />}
          title="My Profile"
          subtitle="Keep your profile complete to get better job matches and scheme eligibility"
        >
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-2"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <TrendingUp className="h-4 w-4 text-white/80" />
            <div>
              <div className="text-xs font-medium text-white/70">Profile Strength</div>
              <div className="text-sm font-bold text-white">{completion}%</div>
            </div>
          </div>
        </PageHeader>

        {/* Personal Info */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <User className="h-5 w-5 text-accent" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={profile?.email || ""} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 9876543210" />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={v => setForm({ ...form, gender: v })}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    {genderOptions.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input type="date" value={form.date_of_birth} onChange={e => setForm({ ...form, date_of_birth: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input type="number" min={0} max={120} value={form.age} onChange={e => setForm({ ...form, age: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Marital Status</Label>
                <Select value={form.marital_status} onValueChange={v => setForm({ ...form, marital_status: v })}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    {maritalOptions.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Annual Income (₹)</Label>
                <Input type="number" min={0} value={form.income} onChange={e => setForm({ ...form, income: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Bio / About Me</Label>
              <Textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell us about yourself, your goals, and aspirations..." rows={3} />
            </div>
          </CardContent>
        </Card>

        {/* Disability Information */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Heart className="h-5 w-5 text-accent" /> Disability Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Disability Type</Label>
                <Select value={form.disability_type} onValueChange={v => setForm({ ...form, disability_type: v })}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {disabilityTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Disability Percentage (%)</Label>
                <Input type="number" min={0} max={100} value={form.disability_percentage} onChange={e => setForm({ ...form, disability_percentage: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>UDID Number</Label>
                <Input value={form.udid_number} onChange={e => setForm({ ...form, udid_number: e.target.value })} placeholder="Unique Disability ID" />
              </div>
              <div className="space-y-2">
                <Label>Assistive Technology Used</Label>
                <Input value={form.assistive_tech} onChange={e => setForm({ ...form, assistive_tech: e.target.value })} placeholder="e.g. Screen reader, Hearing aid..." />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Education & Career */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Briefcase className="h-5 w-5 text-accent" /> Education & Career
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Education Level</Label>
                <Select value={form.education_level} onValueChange={v => setForm({ ...form, education_level: v })}>
                  <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    {educationLevels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Work Experience (years)</Label>
                <Input type="number" min={0} max={50} value={form.work_experience_years} onChange={e => setForm({ ...form, work_experience_years: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Preferred Job Type</Label>
                <Select value={form.preferred_job_type} onValueChange={v => setForm({ ...form, preferred_job_type: v })}>
                  <SelectTrigger><SelectValue placeholder="Select job type" /></SelectTrigger>
                  <SelectContent>
                    {jobTypes.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>LinkedIn Profile URL</Label>
                <Input value={form.linkedin_url} onChange={e => setForm({ ...form, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/yourprofile" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Skills (comma separated)</Label>
                <Input value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="React, JavaScript, Python, Data Entry, etc." />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Preferred Work Locations (comma separated)</Label>
                <Input value={form.preferred_locations} onChange={e => setForm({ ...form, preferred_locations: e.target.value })} placeholder="Mumbai, Remote, Bangalore, etc." />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Languages */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Globe className="h-5 w-5 text-accent" /> Languages Known
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {languageOptions.map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    form.languages.includes(lang)
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-card text-muted-foreground border-border hover:border-accent/50"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Phone className="h-5 w-5 text-accent" /> Address & Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Pincode</Label>
                <Input value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} placeholder="400001" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label>Guardian / Parent Name</Label>
                <Input value={form.guardian_name} onChange={e => setForm({ ...form, guardian_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Guardian Phone</Label>
                <Input value={form.guardian_phone} onChange={e => setForm({ ...form, guardian_phone: e.target.value })} placeholder="+91 9876543210" />
              </div>
              <div className="space-y-2">
                <Label>Emergency Contact Name</Label>
                <Input value={form.emergency_contact_name} onChange={e => setForm({ ...form, emergency_contact_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Emergency Contact Phone</Label>
                <Input value={form.emergency_contact_phone} onChange={e => setForm({ ...form, emergency_contact_phone: e.target.value })} placeholder="+91 9876543210" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end pb-4">
          <Button onClick={handleSave} disabled={loading} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Profile
          </Button>
        </div>

        {/* AI Profile Analyzer */}
        <Card className="border border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Sparkles className="h-5 w-5 text-accent" /> AI Profile Analyzer
              </CardTitle>
              <Button
                onClick={analyzeWithAI}
                disabled={aiAnalyzing || !profile}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {aiAnalyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Sparkles className="mr-2 h-4 w-4" />Analyze My Profile</>}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Get AI-powered feedback on your profile for PWD-friendly job applications.
            </p>
          </CardHeader>
          {aiResult && (
            <CardContent className="space-y-5">
              {/* Score */}
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-foreground">{aiResult.score}%</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground mb-1">Profile Strength</p>
                  <Progress
                    value={aiResult.score}
                    className={`h-3 ${aiResult.score >= 75 ? "[&>div]:bg-success" : aiResult.score >= 50 ? "[&>div]:bg-accent" : "[&>div]:bg-warning"}`}
                  />
                </div>
              </div>

              {/* Professional Summary */}
              {aiResult.profileSummary && (
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">AI-Generated Professional Summary</p>
                  <p className="text-sm text-foreground italic">"{aiResult.profileSummary}"</p>
                </div>
              )}

              {/* Strengths */}
              {aiResult.strengths?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-success" /> Strengths
                  </p>
                  <ul className="space-y-1">
                    {aiResult.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-success mt-0.5">•</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {aiResult.improvements?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4 text-warning" /> Areas to Improve
                  </p>
                  <div className="space-y-2">
                    {aiResult.improvements.map((imp, i) => (
                      <div key={i} className="rounded-lg border border-border p-3">
                        <p className="text-sm font-medium text-foreground">{imp.area}</p>
                        <p className="text-xs text-warning mt-0.5">{imp.issue}</p>
                        <p className="text-xs text-muted-foreground mt-1">→ {imp.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Recommendations */}
              {aiResult.keyRecommendations?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-accent" /> Key Recommendations
                  </p>
                  <ul className="space-y-1">
                    {aiResult.keyRecommendations.map((r, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <Badge variant="outline" className="text-xs shrink-0 mt-0.5">{i + 1}</Badge>{r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* PWD-Specific Tips */}
              {aiResult.pwdTips?.length > 0 && (
                <div className="rounded-lg bg-accent/5 border border-accent/20 p-4">
                  <p className="text-sm font-semibold text-accent mb-2 flex items-center gap-1">
                    <Shield className="h-4 w-4" /> PWD-Specific Tips
                  </p>
                  <ul className="space-y-1">
                    {aiResult.pwdTips.map((tip, i) => (
                      <li key={i} className="text-sm text-foreground flex items-start gap-2">
                        <span className="text-accent mt-0.5">✦</span>{tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          )}
        </Card>
        <div className="pb-8" />
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
