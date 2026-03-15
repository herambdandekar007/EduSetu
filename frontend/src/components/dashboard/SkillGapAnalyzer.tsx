import { useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Sparkles, Lightbulb, Loader2, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const CHAT_URL = import.meta.env.VITE_AI_ASSISTANT_URL;

interface SkillData {
  name: string;
  current: number;
  target: number;
  gap: string;
  status: "gap" | "on-track" | "complete";
}

interface AnalysisResult {
  skills: SkillData[];
  insight: string;
  overallReadiness: number;
}

const defaultSkills: SkillData[] = [
  { name: "JavaScript / ES6", current: 80, target: 95, gap: "Focus on async/await patterns", status: "on-track" },
  { name: "React & Redux", current: 65, target: 90, gap: "Learn Redux Toolkit", status: "gap" },
  { name: "Web Accessibility (a11y)", current: 100, target: 90, gap: "Target met: Industry leader", status: "complete" },
];

const SkillGapAnalyzer = () => {
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { profile } = useAuth();

  const skills = result?.skills || defaultSkills;

  const analyzeGap = async () => {
    if (!targetRole.trim()) { toast.error("Enter a target role"); return; }
    setLoading(true);
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "skill-gap",
          messages: [{ role: "user", content: `Analyze skill gap for target role: ${targetRole}. My current skills: ${profile?.skills?.join(", ") || "Not specified"}. Education: ${profile?.education_level || "Not specified"}.` }],
          userProfile: profile,
        }),
      });

      if (resp.status === 429) { toast.error("Rate limit exceeded. Try again shortly."); setLoading(false); return; }
      if (resp.status === 402) { toast.error("AI credits exhausted."); setLoading(false); return; }
      if (!resp.ok) throw new Error("AI error");

      const reader = resp.body!.getReader();
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
            const p = JSON.parse(json);
            const c = p.choices?.[0]?.delta?.content;
            if (c) full += c;
          } catch { textBuffer = line + "\n" + textBuffer; break; }
        }
      }

      const parsed = JSON.parse(full) as AnalysisResult;
      setResult(parsed);
      toast.success("Skill gap analysis complete!");
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to analyze. Try again.");
    }
    setLoading(false);
  };

  return (
    <Card className="border border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-foreground">AI Skill Gap Analyzer</CardTitle>
            <p className="text-sm text-muted-foreground">
              {result ? `Analysis for: ${targetRole}` : "Enter your target role for AI analysis"}
            </p>
          </div>
          <button onClick={() => { setResult(null); setTargetRole(""); }} className="text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="e.g. Full Stack Developer, Data Analyst..."
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyzeGap()}
            className="flex-1"
          />
          <Button onClick={analyzeGap} disabled={loading} size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <p className="text-sm text-muted-foreground">AI is analyzing your skills...</p>
          </div>
        ) : (
          <>
            {result && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 mb-2">
                <div className="text-2xl font-bold text-foreground">{result.overallReadiness}%</div>
                <div className="text-sm text-muted-foreground">Overall Readiness</div>
                <Progress value={result.overallReadiness} className="flex-1 h-2.5 [&>div]:bg-accent" />
              </motion.div>
            )}
            {skills.map((skill, i) => (
              <motion.div key={skill.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.1 }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-foreground">{skill.name}</span>
                  <span className={`text-sm font-bold ${skill.status === "complete" ? "text-success" : "text-foreground"}`}>
                    {skill.current}%
                    {skill.status === "complete" && <Sparkles className="inline h-3.5 w-3.5 ml-1 text-success" />}
                  </span>
                </div>
                <Progress value={skill.current} className={`h-2.5 ${skill.status === "complete" ? "[&>div]:bg-success" : skill.status === "on-track" ? "[&>div]:bg-accent" : "[&>div]:bg-warning"}`} />
                <p className={`text-xs mt-1 font-medium uppercase tracking-wide ${skill.status === "complete" ? "text-success" : "text-muted-foreground"}`}>
                  {skill.status === "complete" ? "TARGET MET" : `GAP: ${skill.current}% → ${skill.target}%`} — {skill.gap}
                </p>
              </motion.div>
            ))}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-4 rounded-lg bg-muted p-4 flex gap-3">
              <Lightbulb className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">
                <span className="font-bold">AI Insight:</span> {result?.insight || "Enter a target role above and click analyze to get personalized AI-powered skill gap analysis."}
              </p>
            </motion.div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SkillGapAnalyzer;
