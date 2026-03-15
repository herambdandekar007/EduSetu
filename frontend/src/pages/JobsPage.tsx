import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Briefcase, MapPin, Bookmark, Share2, Search, Loader2, Sparkles } from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const CHAT_URL = import.meta.env.VITE_AI_ASSISTANT_URL;

interface AIMatch {
  jobId: string;
  score: number;
  reasons: string[];
  missingSkills: string[];
}

const JobsPage = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [aiMatches, setAiMatches] = useState<Record<string, AIMatch>>({});
  const [aiLoading, setAiLoading] = useState(false);
  const { profile } = useAuth();

  useEffect(() => {
    const fetchJobs = async () => {
      const q = query(collection(db, "jobs"), where("isActive", "==", true));
      const snap = await getDocs(q);
      setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    if (jobs.length && profile?.skills?.length && !Object.keys(aiMatches).length) {
      runAIMatching();
    }
  }, [jobs, profile]);

  const runAIMatching = async () => {
    if (!profile || !jobs.length) return;
    setAiLoading(true);
    try {
      const jobSummaries = jobs.map(j => ({ id: j.id, title: j.title, company: j.company, skillsRequired: j.skillsRequired, accessibilityTags: j.accessibilityTags, location: j.location }));

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "job-match",
          messages: [{ role: "user", content: `Score these jobs for me:\n${JSON.stringify(jobSummaries)}` }],
          userProfile: profile,
        }),
      });

      if (resp.status === 429) { toast.error("Rate limited."); setAiLoading(false); return; }
      if (resp.status === 402) { toast.error("AI credits exhausted."); setAiLoading(false); return; }
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
          try { const p = JSON.parse(json); const c = p.choices?.[0]?.delta?.content; if (c) full += c; } catch { textBuffer = line + "\n" + textBuffer; break; }
        }
      }

      const parsed = JSON.parse(full);
      const matchMap: Record<string, AIMatch> = {};
      (parsed.matches || []).forEach((m: AIMatch) => { matchMap[m.jobId] = m; });
      setAiMatches(matchMap);
      toast.success("AI job matching complete!");
    } catch (e) {
      console.error(e);
      // Fallback to basic matching
    }
    setAiLoading(false);
  };

  const getMatchScore = (job: any) => {
    if (aiMatches[job.id]) return aiMatches[job.id].score;
    // Fallback basic matching
    if (!profile?.skills?.length || !job.skills_required?.length) return 0;
    const userSkills = (profile.skills as string[]).map((s: string) => s.toLowerCase());
    const required = (job.skillsRequired as string[]).map((s: string) => s.toLowerCase());
    const matched = required.filter((s: string) => userSkills.some((us: string) => us.includes(s) || s.includes(us)));
    return Math.round((matched.length / required.length) * 100);
  };

  const filtered = jobs
    .filter(j => j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => getMatchScore(b) - getMatchScore(a));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          icon={<Briefcase className="h-5 w-5 text-white" />}
          title="Job Matches"
          subtitle="AI-powered job recommendations tailored to your profile and skills"
        >
          {aiLoading && <Loader2 className="h-4 w-4 animate-spin text-white/70" />}
          {Object.keys(aiMatches).length > 0 && (
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-2"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              <Sparkles className="h-4 w-4 text-white/80" />
              <span className="text-sm font-medium text-white">AI Scored</span>
            </div>
          )}
        </PageHeader>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search jobs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Button onClick={runAIMatching} disabled={aiLoading} variant="outline" size="sm" className="gap-1">
              <Sparkles className="h-4 w-4" /> Re-score
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading jobs...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((job, i) => {
              const match = getMatchScore(job);
              const aiMatch = aiMatches[job.id];
              return (
                <motion.div key={job.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="border border-border hover:shadow-lg transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        {match > 0 && (
                          <Badge className={`${match >= 80 ? "bg-success/10 text-success border-success/20" : match >= 50 ? "bg-match/10 text-match border-match/20" : "bg-muted text-muted-foreground"}`}>
                            {aiMatch && <Sparkles className="h-3 w-3 mr-1 inline" />}
                            {match}% MATCH
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-foreground">{job.title}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        {job.company} • <MapPin className="h-3 w-3" /> {job.location}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{job.jobType} • {job.salaryRange}</p>

                      {aiMatch?.reasons?.length > 0 && (
                        <p className="text-xs text-accent mt-2 italic">AI: {aiMatch.reasons[0]}</p>
                      )}
                      {aiMatch?.missingSkills?.length > 0 && (
                        <p className="text-xs text-warning mt-1">Missing: {aiMatch.missingSkills.join(", ")}</p>
                      )}

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {job.skillsRequired?.map((s: string) => (
                          <span key={s} className="text-xs bg-accent/5 text-accent px-2 py-0.5 rounded font-medium">{s}</span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {job.accessibilityTags?.map((t: string) => (
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
