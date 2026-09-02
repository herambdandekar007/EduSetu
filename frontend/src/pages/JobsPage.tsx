import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  MapPin,
  Bookmark,
  Share2,
  Search,
  Loader2,
  Sparkles,
} from "lucide-react";
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

interface Job {
  id: string;
  title: string;
  company: string;
  location?: string;
  jobType?: string;
  salaryRange?: string;
  description?: string;
  skillsRequired?: string[];
  accessibilityTags?: string[];
  applyLink?: string;
  isActive?: boolean;
}

const JobsPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [aiMatches, setAiMatches] = useState<Record<string, AIMatch>>({});
  const [aiLoading, setAiLoading] = useState(false);
  const { profile } = useAuth();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const q = query(collection(db, "jobs"), where("isActive", "==", true));
        const snap = await getDocs(q);

        const jobsData = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Job[];

        setJobs(jobsData);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        toast.error("Failed to load jobs");
      } finally {
        setLoading(false);
      }
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
      const jobSummaries = jobs.map((j) => ({
        id: j.id,
        title: j.title,
        company: j.company,
        skillsRequired: j.skillsRequired || [],
        accessibilityTags: j.accessibilityTags || [],
        location: j.location || "",
      }));

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "job-match",
          messages: [
            {
              role: "user",
              content: `Score these jobs for me:\n${JSON.stringify(jobSummaries)}`,
            },
          ],
          userProfile: profile,
        }),
      });

      if (resp.status === 429) {
        toast.error("Rate limited.");
        setAiLoading(false);
        return;
      }

      if (resp.status === 402) {
        toast.error("AI credits exhausted.");
        setAiLoading(false);
        return;
      }

      if (!resp.ok) {
        throw new Error("AI error");
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let full = "";
      let textBuffer = "";

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
            const parsedChunk = JSON.parse(json);
            const content = parsedChunk.choices?.[0]?.delta?.content;
            if (content) full += content;
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      let cleaned = full.trim();
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      if (start !== -1 && end !== -1 && end > start) {
        cleaned = cleaned.slice(start, end + 1);
      }

      const parsed = JSON.parse(cleaned);
      const matchMap: Record<string, AIMatch> = {};

      (parsed.matches || []).forEach((m: AIMatch) => {
        matchMap[m.jobId] = m;
      });

      setAiMatches(matchMap);
      toast.success("AI job matching complete!");
    } catch (error) {
      console.warn("AI matching notice:", error);
    } finally {
      setAiLoading(false);
    }
  };

  const getMatchScore = (job: Job) => {
    if (aiMatches[job.id]) return aiMatches[job.id].score;

    if (!profile?.skills?.length || !job.skillsRequired?.length) return 0;

    const userSkills = (profile.skills as string[]).map((s: string) =>
      s.toLowerCase()
    );

    const required = (job.skillsRequired || []).map((s: string) =>
      s.toLowerCase()
    );

    if (!required.length) return 0;

    const matched = required.filter((skill: string) =>
      userSkills.some(
        (userSkill: string) =>
          userSkill.includes(skill) || skill.includes(userSkill)
      )
    );

    return Math.round((matched.length / required.length) * 100);
  };

  const handleApply = (job: Job) => {
    if (job.applyLink) {
      window.open(job.applyLink, "_blank", "noopener,noreferrer");
    } else {
      toast.error("Apply link not available");
    }
  };

  const handleShare = async (job: Job) => {
    try {
      const linkToCopy = job.applyLink || window.location.href;
      await navigator.clipboard.writeText(linkToCopy);
      toast.success("Link copied!");
    } catch (error) {
      console.error("Clipboard error:", error);
      toast.error("Failed to copy link");
    }
  };

  const filtered = jobs
    .filter(
      (j) =>
        j.title?.toLowerCase().includes(search.toLowerCase()) ||
        j.company?.toLowerCase().includes(search.toLowerCase())
    )
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
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
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
              <Input
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button
              onClick={runAIMatching}
              disabled={aiLoading}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <Sparkles className="h-4 w-4" />
              Re-score
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading jobs...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No jobs found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((job, i) => {
              const match = getMatchScore(job);
              const aiMatch = aiMatches[job.id];

              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="border border-border hover:shadow-lg transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                          <Briefcase className="h-5 w-5" />
                        </div>

                        {match > 0 && (
                          <Badge
                            className={`${
                              match >= 80
                                ? "bg-success/10 text-success border-success/20"
                                : match >= 50
                                ? "bg-match/10 text-match border-match/20"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {aiMatch && <Sparkles className="h-3 w-3 mr-1 inline" />}
                            {match}% MATCH
                          </Badge>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-foreground">
                        {job.title}
                      </h3>

                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        {job.company} • <MapPin className="h-3 w-3" />{" "}
                        {job.location || "Not specified"}
                      </p>

                      <p className="text-xs text-muted-foreground mt-1">
                        {job.jobType || "Full-time"} •{" "}
                        {job.salaryRange || "Salary not specified"}
                      </p>

                      {aiMatch?.reasons?.length > 0 && (
                        <p className="text-xs text-accent mt-2 italic">
                          AI: {aiMatch.reasons[0]}
                        </p>
                      )}

                      {aiMatch?.missingSkills?.length > 0 && (
                        <p className="text-xs text-warning mt-1">
                          Missing: {aiMatch.missingSkills.join(", ")}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {(job.skillsRequired || []).map((skill: string) => (
                          <span
                            key={skill}
                            className="text-xs bg-accent/5 text-accent px-2 py-0.5 rounded font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(job.accessibilityTags || []).map((tag: string) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs text-success border-success/20"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                        {job.description || "No description available"}
                      </p>

                      <div className="flex gap-2 mt-4">
                        <Button
                          className="flex-1 bg-primary text-primary-foreground"
                          onClick={() => handleApply(job)}
                          disabled={!job.applyLink}
                        >
                          {job.applyLink ? "Apply Now" : "No Link Available"}
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => toast.success("Job saved!")}
                        >
                          <Bookmark className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleShare(job)}
                        >
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