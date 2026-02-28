import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Briefcase, MapPin, Bookmark, Share2, ExternalLink, Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const JobsPage = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    const fetchJobs = async () => {
      const { data } = await supabase.from("jobs" as any).select("*").eq("is_active", true);
      setJobs((data as any[]) || []);
      setLoading(false);
    };
    fetchJobs();
  }, []);

  const calculateMatch = (job: any) => {
    if (!profile?.skills?.length || !job.skills_required?.length) return 0;
    const userSkills = (profile.skills as string[]).map((s: string) => s.toLowerCase());
    const required = (job.skills_required as string[]).map((s: string) => s.toLowerCase());
    const matched = required.filter((s: string) => userSkills.some((us: string) => us.includes(s) || s.includes(us)));
    return Math.round((matched.length / required.length) * 100);
  };

  const filtered = jobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Job Matches</h1>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search jobs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading jobs...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((job, i) => {
              const match = calculateMatch(job);
              return (
                <motion.div key={job.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="border border-border hover:shadow-lg transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        {match > 0 && (
                          <Badge className="bg-match/10 text-match border-match/20">{match}% MATCH</Badge>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-foreground">{job.title}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        {job.company} • <MapPin className="h-3 w-3" /> {job.location}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{job.job_type} • {job.salary_range}</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {job.skills_required?.map((s: string) => (
                          <span key={s} className="text-xs bg-accent/5 text-accent px-2 py-0.5 rounded font-medium">{s}</span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {job.accessibility_tags?.map((t: string) => (
                          <Badge key={t} variant="outline" className="text-xs text-success border-success/20">{t}</Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{job.description}</p>
                      <div className="flex gap-2 mt-4">
                        <Button className="flex-1 bg-primary text-primary-foreground">Apply Now</Button>
                        <Button variant="outline" size="icon" onClick={() => toast.success("Job saved!")}>
                          <Bookmark className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}>
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default JobsPage;
