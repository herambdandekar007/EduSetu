import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { User, Save, Loader2 } from "lucide-react";

const disabilityTypes = ["Visual", "Hearing", "Physical", "Intellectual", "Multiple", "Other"];
const educationLevels = ["Below 10th", "10th Pass", "12th Pass", "Graduate", "Post Graduate", "PhD"];

const ProfilePage = () => {
  const { profile, refreshProfile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "", disability_type: "", disability_percentage: 0,
    education_level: "", skills: "", city: "", state: "", age: 0, income: 0,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        disability_type: profile.disability_type || "",
        disability_percentage: profile.disability_percentage || 0,
        education_level: profile.education_level || "",
        skills: (profile.skills || []).join(", "),
        city: profile.city || "",
        state: profile.state || "",
        age: profile.age || 0,
        income: profile.income || 0,
      });
    }
  }, [profile]);

  const completion = (() => {
    let filled = 0;
    const fields = ["full_name", "disability_type", "education_level", "skills", "city"];
    fields.forEach(f => { if ((form as any)[f]) filled++; });
    return Math.round((filled / fields.length) * 100);
  })();

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("profiles" as any).update({
      full_name: form.full_name,
      disability_type: form.disability_type,
      disability_percentage: form.disability_percentage,
      education_level: form.education_level,
      skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
      city: form.city,
      state: form.state,
      age: form.age || null,
      income: form.income || null,
    } as any).eq("user_id", user.id);

    if (error) {
      toast.error("Failed to save profile");
    } else {
      toast.success("Profile saved!");
      await refreshProfile();
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{completion}% complete</span>
            <Progress value={completion} className="w-32 h-2" />
          </div>
        </div>

        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <User className="h-5 w-5 text-accent" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={profile?.email || ""} disabled className="bg-muted" />
              </div>
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
                <Label>Disability Percentage</Label>
                <Input type="number" min={0} max={100} value={form.disability_percentage} onChange={e => setForm({ ...form, disability_percentage: parseInt(e.target.value) || 0 })} />
              </div>
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
                <Label>Age</Label>
                <Input type="number" min={0} value={form.age} onChange={e => setForm({ ...form, age: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Annual Income (₹)</Label>
                <Input type="number" min={0} value={form.income} onChange={e => setForm({ ...form, income: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Skills (comma separated)</Label>
                <Input value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="React, JavaScript, Python, etc." />
              </div>
            </div>
            <Button onClick={handleSave} disabled={loading} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
