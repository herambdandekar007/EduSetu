import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Landmark, CheckCircle2, XCircle, Search, Sparkles, Loader2, RefreshCw, Bot } from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const CHAT_URL = import.meta.env.VITE_AI_ASSISTANT_URL;

interface AISchemeResult {
  schemes: { name: string; ministry: string; eligible: boolean; confidence: number; reason: string; action: string }[];
  summary: string;
  totalEligible: number;
}

const SchemesPage = () => {
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AISchemeResult | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    const fetchSchemes = async () => {
      const q = query(collection(db, "schemes"), where("isActive", "==", true));
      const snap = await getDocs(q);
      setSchemes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    fetchSchemes();
  }, []);

  const runAISchemeCheck = async () => {
    if (!profile) { toast.error("Please complete your profile first."); return; }
    setAiLoading(true);
    setAiResult(null);
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "scheme-check",
          messages: [{ role: "user", content: `Check my eligibility for government PWD schemes. Disability: ${profile.disability_type || "Not set"}. Income: ₹${profile.income || "Not set"}. Age: ${profile.age || "Not set"}. Education: ${profile.education_level || "Not set"}. State: ${profile.state || "Not set"}.` }],
          userProfile: profile,
        }),
      });
      if (resp.status === 429) { toast.error("Rate limited. Try again shortly."); setAiLoading(false); return; }
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
      setAiResult(JSON.parse(full) as AISchemeResult);
      toast.success("AI scheme analysis complete!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to analyze schemes. Try again.");
    }
    setAiLoading(false);
  };

  const checkEligibility = (scheme: any) => {
    if (!profile) return { eligible: false, score: 0 };
    let score = 0;
    let checks = 0;

    if (scheme.disability_types?.length) {
      checks++;
      if (scheme.disability_types.includes(profile.disability_type) || scheme.disability_types.includes("Any")) score++;
    }
    if (scheme.max_income && scheme.max_income > 0) {
      checks++;
      if (!profile.income || profile.income <= scheme.max_income) score++;
    }
    if (scheme.education_required && scheme.education_required !== "Any") {
      checks++;
      if (profile.education_level) score++;
    }
    checks = Math.max(checks, 1);
    return { eligible: score === checks, score: Math.round((score / checks) * 100) };
  };

  const filtered = schemes.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          icon={<Landmark className="h-5 w-5 text-white" />}
          title="Scheme Eligibility"
          subtitle="Check your eligibility for 80+ government schemes for persons with disabilities"
        >
          {aiResult && (
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-2"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              <Sparkles className="h-4 w-4 text-white/80" />
              <span className="text-sm font-medium text-white">AI Analyzed</span>
            </div>
          )}
        </PageHeader>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search schemes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Button onClick={runAISchemeCheck} disabled={aiLoading || !profile} variant="outline" size="sm" className="gap-1">
              {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              AI Check
            </Button>
          </div>
        </div>

        {/* AI Scheme Advisor Panel */}
        {(aiLoading || aiResult) && (
          <Card className="border border-accent/30 bg-accent/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bot className="h-5 w-5 text-accent" /> AI Scheme Advisor
                {aiLoading && <Loader2 className="h-4 w-4 animate-spin text-accent ml-2" />}
              </CardTitle>
            </CardHeader>
            {aiResult && (
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-foreground">{aiResult.totalEligible}</div>
                  <p className="text-sm text-muted-foreground">Schemes you likely qualify for</p>
                </div>
                {aiResult.summary && (
                  <p className="text-sm text-foreground bg-background rounded-lg p-3 border border-border">{aiResult.summary}</p>
                )}
                {aiResult.schemes?.length > 0 && (
                  <div className="space-y-2">
                    {aiResult.schemes.map((s, i) => (
                      <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${s.eligible ? "border-success/30 bg-success/5" : "border-border bg-background"}`}>
                        <div className="mt-0.5">
                          {s.eligible
                            ? <CheckCircle2 className="h-4 w-4 text-success" />
                            : <XCircle className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                            <Badge variant="outline" className={`text-xs shrink-0 ${s.eligible ? "text-success border-success/30" : "text-muted-foreground"}`}>
                              {s.confidence}%
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{s.ministry}</p>
                          <p className="text-xs text-foreground mt-1">{s.reason}</p>
                          {s.eligible && s.action && (
                            <p className="text-xs text-accent mt-1 font-medium">→ {s.action}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={runAISchemeCheck} className="gap-1">
                  <RefreshCw className="h-3 w-3" /> Re-analyze
                </Button>
              </CardContent>
            )}
          </Card>
        )}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading schemes...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((scheme, i) => {
              const { eligible, score } = checkEligibility(scheme);
              return (
                <motion.div key={scheme.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="border border-border hover:shadow-lg transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
                          <Landmark className="h-5 w-5" />
                        </div>
                        <Badge className={eligible ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"}>
                          {eligible ? <><CheckCircle2 className="h-3 w-3 mr-1" />ELIGIBLE</> : <><XCircle className="h-3 w-3 mr-1" />CHECK REQUIRED</>}
                        </Badge>
                      </div>
                      <h3 className="text-base font-bold text-foreground">{scheme.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{scheme.ministry} • {scheme.category}</p>
                      <p className="text-sm text-foreground mt-2">{scheme.description}</p>
                      <p className="text-sm text-success font-medium mt-2">{scheme.benefits}</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {scheme.disability_types?.map((t: string) => (
                          <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                        ))}
                      </div>
                      {score > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-success transition-all" style={{ width: `${score}%` }} />
                          </div>
                          <span className="text-xs font-bold text-success">{score}%</span>
                        </div>
                      )}
                      <Button className="w-full mt-4 bg-primary text-primary-foreground">Check Eligibility</Button>
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

export default SchemesPage;
