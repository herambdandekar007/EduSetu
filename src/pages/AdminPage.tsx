import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Briefcase, FileCheck, GraduationCap, Users, TrendingUp, Plus, Pencil, Trash2,
  BarChart3, Activity, Shield
} from "lucide-react";

type Job = { id: string; title: string; company: string; location: string; job_type: string; salary_range: string; is_active: boolean };
type Scheme = { id: string; name: string; ministry: string; category: string; is_active: boolean };
type Course = { id: string; title: string; provider: string; category: string; is_active: boolean };

const AdminPage = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState({ users: 0, jobs: 0, schemes: 0, courses: 0 });
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Add Job Dialog state
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [newJob, setNewJob] = useState({ title: "", company: "", location: "", job_type: "Full-time", salary_range: "", description: "", skills_required: "" });

  useEffect(() => {
    checkAdmin();
  }, [user]);

  const checkAdmin = async () => {
    if (!user) return;
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
    const admin = data && data.length > 0;
    setIsAdmin(admin);
    if (admin) fetchAll();
    setLoading(false);
  };

  const fetchAll = async () => {
    const [jobsRes, schemesRes, coursesRes, profilesRes] = await Promise.all([
      supabase.from("jobs").select("id, title, company, location, job_type, salary_range, is_active"),
      supabase.from("schemes").select("id, name, ministry, category, is_active"),
      supabase.from("courses").select("id, title, provider, category, is_active"),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]);
    setJobs(jobsRes.data || []);
    setSchemes(schemesRes.data || []);
    setCourses(coursesRes.data || []);
    setStats({
      users: profilesRes.count || 0,
      jobs: (jobsRes.data || []).length,
      schemes: (schemesRes.data || []).length,
      courses: (coursesRes.data || []).length,
    });
  };

  const addJob = async () => {
    const skills = newJob.skills_required.split(",").map(s => s.trim()).filter(Boolean);
    const { error } = await supabase.from("jobs").insert({
      title: newJob.title, company: newJob.company, location: newJob.location,
      job_type: newJob.job_type, salary_range: newJob.salary_range,
      description: newJob.description, skills_required: skills,
    });
    if (error) { toast.error("Failed to add job"); return; }
    toast.success("Job added!");
    setJobDialogOpen(false);
    setNewJob({ title: "", company: "", location: "", job_type: "Full-time", salary_range: "", description: "", skills_required: "" });
    fetchAll();
  };

  const toggleActive = async (table: string, id: string, current: boolean) => {
    const { error } = await supabase.from(table as any).update({ is_active: !current }).eq("id", id);
    if (error) { toast.error("Update failed"); return; }
    toast.success(`${current ? "Deactivated" : "Activated"} successfully`);
    fetchAll();
  };

  const deleteItem = async (table: string, id: string) => {
    const { error } = await supabase.from(table as any).delete().eq("id", id);
    if (error) { toast.error("Delete failed"); return; }
    toast.success("Deleted successfully");
    fetchAll();
  };

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="animate-pulse-soft text-muted-foreground">Checking permissions...</div></div></DashboardLayout>;

  if (!isAdmin) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Shield className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-bold text-foreground">Admin Access Required</h2>
        <p className="text-muted-foreground">You need admin privileges to access this page.</p>
      </div>
    </DashboardLayout>
  );

  const statCards = [
    { icon: Users, label: "Total Users", value: stats.users, color: "text-accent" },
    { icon: Briefcase, label: "Active Jobs", value: stats.jobs, color: "text-success" },
    { icon: FileCheck, label: "Schemes", value: stats.schemes, color: "text-warning" },
    { icon: GraduationCap, label: "Courses", value: stats.courses, color: "text-info" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-accent" /> Admin Dashboard
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="border border-border">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-muted ${s.color}`}>
                    <s.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{s.value}</p>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="jobs">
          <TabsList className="bg-muted">
            <TabsTrigger value="jobs">Jobs ({stats.jobs})</TabsTrigger>
            <TabsTrigger value="schemes">Schemes ({stats.schemes})</TabsTrigger>
            <TabsTrigger value="courses">Courses ({stats.courses})</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="mt-4 space-y-4">
            <div className="flex justify-end">
              <Dialog open={jobDialogOpen} onOpenChange={setJobDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Plus className="h-4 w-4 mr-2" /> Add Job
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add New Job</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div><Label>Title</Label><Input value={newJob.title} onChange={e => setNewJob(p => ({ ...p, title: e.target.value }))} /></div>
                    <div><Label>Company</Label><Input value={newJob.company} onChange={e => setNewJob(p => ({ ...p, company: e.target.value }))} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Location</Label><Input value={newJob.location} onChange={e => setNewJob(p => ({ ...p, location: e.target.value }))} /></div>
                      <div><Label>Salary</Label><Input value={newJob.salary_range} onChange={e => setNewJob(p => ({ ...p, salary_range: e.target.value }))} /></div>
                    </div>
                    <div><Label>Skills (comma-separated)</Label><Input value={newJob.skills_required} onChange={e => setNewJob(p => ({ ...p, skills_required: e.target.value }))} /></div>
                    <div><Label>Description</Label><Textarea value={newJob.description} onChange={e => setNewJob(p => ({ ...p, description: e.target.value }))} /></div>
                    <Button onClick={addJob} className="w-full bg-accent text-accent-foreground">Add Job</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {jobs.map(job => (
              <Card key={job.id} className="border border-border">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{job.title}</h3>
                    <p className="text-sm text-muted-foreground">{job.company} • {job.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={job.is_active ? "default" : "secondary"}>{job.is_active ? "Active" : "Inactive"}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => toggleActive("jobs", job.id, job.is_active)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteItem("jobs", job.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="schemes" className="mt-4 space-y-4">
            {schemes.map(s => (
              <Card key={s.id} className="border border-border">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{s.name}</h3>
                    <p className="text-sm text-muted-foreground">{s.ministry} • {s.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={s.is_active ? "default" : "secondary"}>{s.is_active ? "Active" : "Inactive"}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => toggleActive("schemes", s.id, s.is_active)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteItem("schemes", s.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="courses" className="mt-4 space-y-4">
            {courses.map(c => (
              <Card key={c.id} className="border border-border">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{c.title}</h3>
                    <p className="text-sm text-muted-foreground">{c.provider} • {c.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={c.is_active ? "default" : "secondary"}>{c.is_active ? "Active" : "Inactive"}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => toggleActive("courses", c.id, c.is_active)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteItem("courses", c.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminPage;
