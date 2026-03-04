import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Code2, Landmark, BookOpen, Star, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;

const iconMap: Record<string, any> = { job: Code2, scheme: Landmark, course: BookOpen };
const iconBgMap: Record<string, string> = {
  job: "bg-accent/10 text-accent",
  scheme: "bg-warning/10 text-warning",
  course: "bg-info/10 text-info",
};
const badgeMap: Record<string, { text: string; cls: string }> = {
  job: { text: "JOB MATCH", cls: "bg-match/10 text-match border-match/20" },
  scheme: { text: "GOVT SCHEME", cls: "bg-muted text-muted-foreground" },
  course: { text: "SKILL UP", cls: "bg-accent/10 text-accent border-accent/20" },
};

interface Rec {
  type: string;
  title: string;
  subtitle: string;
  match: number;
  reason: string;
  tags: string[];
  action: string;
}

const defaultRecs: Rec[] = [
  { type: "job", title: "Junior Frontend Developer", subtitle: "TechSolutions Inc • Remote", match: 95, reason: "Strong React skills match", tags: ["React", "Tailwind"], action: "Apply Now" },
  { type: "scheme", title: "Assistive Tech Grant 2024", subtitle: "Ministry of Empowerment", match: 85, reason: "Eligible based on disability type", tags: [], action: "Check Eligibility" },
  { type: "course", title: "Advanced Web Accessibility", subtitle: "Free Course • 12 Lessons", match: 90, reason: "Fills your a11y skill gap", tags: [], action: "Start Learning" },
];

const SmartRecommendations = () => {
  const [recs, setRecs] = useState<Rec[]>(defaultRecs);
  const [loading, setLoading] = useState(false);
  const [aiLoaded, setAiLoaded] = useState(false);
  const { profile } = useAuth();

  const fetchRecs = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: "smart-recommendations",
          messages: [{ role: "user", content: `Generate personalized recommendations for me. Skills: ${profile.skills?.join(", ") || "Not set"}. Disability: ${profile.disability_type || "Not set"}. Education: ${profile.education_level || "Not set"}. Location: ${profile.city || ""}, ${profile.state || ""}.` }],
          userProfile: profile,
        }),
      });

      if (resp.status === 429) { toast.error("Rate limited. Try again shortly."); setLoading(false); return; }
      if (resp.status === 402) { toast.error("AI credits exhausted."); setLoading(false); return; }
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
      setRecs(parsed.recommendations || []);
      setAiLoaded(true);
      toast.success("AI recommendations updated!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to get recommendations.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (profile && !aiLoaded) fetchRecs();
  }, [profile]);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Sparkles className="h-5 w-5 text-accent" />
          AI Smart Recommendations
        </h2>
        <button onClick={fetchRecs} disabled={loading} className="text-sm font-medium text-accent hover:underline flex items-center gap-1">
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          Refresh
        </button>
      </div>
      {loading && !recs.length ? (
        <div className="flex items-center justify-center py-12 gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
          <span className="text-muted-foreground">AI is generating recommendations...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recs.map((rec, i) => {
            const Icon = iconMap[rec.type] || Code2;
            const bg = iconBgMap[rec.type] || "bg-accent/10 text-accent";
            const badge = badgeMap[rec.type] || badgeMap.job;
            return (
              <motion.div key={rec.title + i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.4 }}>
                <Card className="h-full border border-border hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className={`text-xs font-semibold ${badge.cls}`}>
                        {rec.match}% MATCH
                      </Badge>
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-1">{rec.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{rec.subtitle}</p>
                    <p className="text-xs text-accent mb-3">{rec.reason}</p>
                    {rec.tags.length > 0 && (
                      <div className="flex gap-2 mb-3">
                        {rec.tags.map((t) => (
                          <span key={t} className="text-xs text-accent font-medium bg-accent/5 px-2 py-0.5 rounded">{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="mt-auto">
                      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">{rec.action}</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default SmartRecommendations;
