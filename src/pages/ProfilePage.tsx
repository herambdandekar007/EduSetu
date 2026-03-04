import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { User, Save, Loader2, Briefcase, Heart, Shield, Globe, Phone } from "lucide-react";

const disabilityTypes = ["Visual", "Hearing", "Physical", "Intellectual", "Speech", "Multiple", "Other"];
const educationLevels = ["Below 10th", "10th Pass", "12th Pass", "Diploma", "Graduate", "Post Graduate", "PhD"];
const genderOptions = ["Male", "Female", "Non-Binary", "Prefer not to say"];
const maritalOptions = ["Single", "Married", "Divorced", "Widowed", "Prefer not to say"];
const jobTypes = ["Full-time", "Part-time", "Remote", "Hybrid", "Freelance", "Internship"];
const languageOptions = ["Hindi", "English", "Tamil", "Telugu", "Kannada", "Malayalam", "Bengali", "Marathi", "Gujarati", "Punjabi", "Odia", "Urdu", "Other"];

const ProfilePage = () => {
  const { profile, refreshProfile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "", phone: "", gender: "", date_of_birth: "", bio: "",
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
        full_name: profile.full_name || "",
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

  const handleSave = async () => {
    if (!user) return;
    if (!form.full_name.trim()) { toast.error("Full name is required"); return; }
    setLoading(true);
    const { error } = await supabase.from("profiles" as any).update({
      full_name: form.full_name.trim(),
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
    } as any).eq("user_id", user.id);

    if (error) {
      toast.error("Failed to save profile");
    } else {
      toast.success("Profile saved successfully!");
      await refreshProfile();
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{completion}% complete</span>
            <Progress value={completion} className="w-32 h-2" />
          </div>
        </div>

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
                <Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
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
        <div className="flex justify-end pb-8">
          <Button onClick={handleSave} disabled={loading} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Profile
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
