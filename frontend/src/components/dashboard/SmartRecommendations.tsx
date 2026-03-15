import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Code2, Landmark, BookOpen, Sparkles, Loader2, RefreshCw, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const CHAT_URL = import.meta.env.VITE_AI_ASSISTANT_URL;

const iconMap: Record<string, any> = { job: Code2, scheme: Landmark, course: BookOpen };
const cardStyle: Record<string, { iconGrad: string; badgeCls: string; badgeLabel: string; accentColor: string }> = {
  job: {
    iconGrad: "linear-gradient(135deg, hsl(250,84%,54%), hsl(278,80%,60%))",
    badgeCls: "bg-primary/10 text-primary border-primary/20",
    badgeLabel: "JOB MATCH",
    accentColor: "hsl(var(--primary))",
  },
  scheme: {
    iconGrad: "linear-gradient(135deg, hsl(38,92%,50%), hsl(30,95%,55%))",
    badgeCls: "bg-warning/10 text-warning border-warning/20",
    badgeLabel: "GOVT SCHEME",
    accentColor: "hsl(var(--warning))",
  },
  course: {
    iconGrad: "linear-gradient(135deg, hsl(200,85%,52%), hsl(220,80%,58%))",
    badgeCls: "bg-info/10 text-info border-info/20",
    badgeLabel: "SKILL UP",
    accentColor: "hsl(var(--info))",
  },
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
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Smart Recommendations
          {aiLoaded && (
            <Badge variant="outline" className="ml-1 border-primary/25 bg-primary/8 text-xs text-primary">
              Personalised
            </Badge>
          )}
        </h2>
        <button
          onClick={fetchRecs}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Refresh
        </button>
      </div>

      {loading && !recs.length ? (
        <div className="flex items-center justify-center gap-3 py-14">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">AI is generating your recommendations…</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {recs.map((rec, i) => {
            const Icon = iconMap[rec.type] || Code2;
            const style = cardStyle[rec.type] || cardStyle.job;
            return (
              <motion.div
                key={rec.title + i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="hover-gradient-border group"
              >
                <Card className="h-full overflow-hidden border border-border transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
                  {/* Coloured top accent bar */}
                  <div className="h-1 w-full" style={{ background: style.iconGrad }} />
                  <CardContent className="flex h-full flex-col p-5">
                    <div className="mb-3 flex items-start justify-between">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl shadow-md"
                        style={{ background: style.iconGrad }}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <Badge variant="outline" className={`text-xs font-bold ${style.badgeCls}`}>
                        {rec.match}% MATCH
                      </Badge>
                    </div>

                    <h3 className="mb-1 text-base font-bold text-foreground">{rec.title}</h3>
                    <p className="mb-2 text-sm text-muted-foreground">{rec.subtitle}</p>
                    <p className="mb-3 text-xs font-medium" style={{ color: style.accentColor }}>
                      {rec.reason}
                    </p>

                    {rec.tags.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {rec.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-md px-2 py-0.5 text-xs font-semibold"
                            style={{ background: "hsl(var(--primary)/0.10)", color: "hsl(var(--primary))" }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto">
                      <Button
                        className="w-full gap-1.5 rounded-xl font-semibold text-white transition-all hover:opacity-90"
                        style={{ background: style.iconGrad }}
                      >
                        {rec.action}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
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
