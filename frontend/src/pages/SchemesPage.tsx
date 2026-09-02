import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Landmark, CheckCircle2, XCircle, Search, Sparkles, Loader2,
  RefreshCw, Bot, ClipboardList, ListChecks, ChevronRight,
  ChevronLeft, X, ArrowRight, AlertCircle, Info,
} from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const CHAT_URL = import.meta.env.VITE_AI_ASSISTANT_URL;

// ── Types ──────────────────────────────────────────────────────────────────
interface AISchemeResult {
  schemes: { name: string; ministry: string; eligible: boolean; confidence: number; reason: string; action: string }[];
  summary: string;
  totalEligible: number;
}

interface Question {
  id: string;
  question: string;
  type: "yes_no" | "select" | "number";
  options?: string[];
  placeholder?: string;
}

// ── Eligibility Questions per scheme type ──────────────────────────────────
const ELIGIBILITY_QUESTIONS: Record<string, Question[]> = {
  default: [
    { id: "disability_pct", question: "What is your disability percentage?", type: "select", options: ["Below 40%", "40% - 60%", "61% - 80%", "Above 80%"] },
    { id: "has_certificate", question: "Do you have a valid disability certificate?", type: "yes_no" },
    { id: "bpl_card", question: "Do you have a BPL (Below Poverty Line) card?", type: "yes_no" },
    { id: "age", question: "What is your age?", type: "number", placeholder: "Enter your age" },
    { id: "income", question: "What is your annual family income?", type: "select", options: ["Below ₹1 Lakh", "₹1-2.5 Lakh", "₹2.5-5 Lakh", "Above ₹5 Lakh"] },
    { id: "state", question: "Which state are you from?", type: "select", options: ["Maharashtra", "Delhi", "Tamil Nadu", "Karnataka", "Gujarat", "Uttar Pradesh", "West Bengal", "Other"] },
  ],
  scholarship: [
    { id: "disability_pct", question: "What is your disability percentage?", type: "select", options: ["Below 40%", "40% - 60%", "61% - 80%", "Above 80%"] },
    { id: "has_certificate", question: "Do you have a valid disability certificate?", type: "yes_no" },
    { id: "education", question: "What is your current education level?", type: "select", options: ["Class 9-10", "Class 11-12", "Undergraduate", "Postgraduate", "PhD"] },
    { id: "institution", question: "Are you studying in a recognized institution?", type: "yes_no" },
    { id: "income", question: "What is your annual family income?", type: "select", options: ["Below ₹1 Lakh", "₹1-2.5 Lakh", "₹2.5-5 Lakh", "Above ₹5 Lakh"] },
    { id: "marks", question: "What is your last exam percentage?", type: "select", options: ["Below 50%", "50% - 60%", "61% - 75%", "Above 75%"] },
  ],
  employment: [
    { id: "disability_pct", question: "What is your disability percentage?", type: "select", options: ["Below 40%", "40% - 60%", "61% - 80%", "Above 80%"] },
    { id: "has_certificate", question: "Do you have a valid disability certificate?", type: "yes_no" },
    { id: "age", question: "What is your age?", type: "number", placeholder: "Enter your age" },
    { id: "education", question: "What is your highest education?", type: "select", options: ["Below 10th", "10th Pass", "12th Pass", "Graduate", "Postgraduate"] },
    { id: "currently_employed", question: "Are you currently employed?", type: "yes_no" },
  ],
  health: [
    { id: "disability_pct", question: "What is your disability percentage?", type: "select", options: ["Below 40%", "40% - 60%", "61% - 80%", "Above 80%"] },
    { id: "has_certificate", question: "Do you have a valid disability certificate?", type: "yes_no" },
    { id: "has_aadhar", question: "Do you have an Aadhaar card?", type: "yes_no" },
    { id: "income", question: "What is your annual family income?", type: "select", options: ["Below ₹1 Lakh", "₹1-2.5 Lakh", "₹2.5-5 Lakh", "Above ₹5 Lakh"] },
    { id: "age", question: "What is your age?", type: "number", placeholder: "Enter your age" },
  ],
};

// ── Application Process Steps per scheme type ──────────────────────────────
const APPLICATION_PROCESS: Record<string, { step: string; desc: string; icon: string; time: string }[]> = {
  default: [
    { step: "Get Disability Certificate", desc: "Visit your nearest government hospital. Get examined by the medical board. Collect your disability certificate mentioning type and percentage.", icon: "📋", time: "1-2 weeks" },
    { step: "Collect Required Documents", desc: "Gather: Aadhaar card, disability certificate, BPL card (if applicable), income certificate, passport size photos, bank account passbook.", icon: "📁", time: "1-2 days" },
    { step: "Fill Application Form", desc: "Download the form from the official website or collect from the district social welfare office. Fill all details carefully in BLOCK LETTERS.", icon: "✍️", time: "1 day" },
    { step: "Submit Application", desc: "Submit the filled form with all documents at your district social welfare office or upload on the official portal. Collect acknowledgment receipt.", icon: "📤", time: "1 day" },
    { step: "Verification Process", desc: "Officials will verify your documents and may conduct a home visit. Your disability may be re-evaluated by a government doctor.", icon: "🔍", time: "2-4 weeks" },
    { step: "Approval & Benefit Transfer", desc: "After approval, benefits are directly transferred to your bank account. Check your registered mobile for SMS updates.", icon: "✅", time: "1-2 months" },
  ],
  scholarship: [
    { step: "Check Eligibility", desc: "Verify your disability percentage (min 40%), confirm you are studying in a recognized institution, and check income limit requirements.", icon: "✅", time: "1 day" },
    { step: "Register on NSP Portal", desc: "Go to scholarships.gov.in — National Scholarship Portal. Register with your Aadhaar number and mobile number.", icon: "💻", time: "1 day" },
    { step: "Fill Scholarship Application", desc: "Log in to NSP. Select the appropriate scholarship scheme. Fill your personal, academic, and bank details accurately.", icon: "✍️", time: "1-2 days" },
    { step: "Upload Documents", desc: "Upload scanned copies of: disability certificate, mark sheets, income certificate, Aadhaar, bank passbook.", icon: "📤", time: "1 day" },
    { step: "Institute Verification", desc: "Your institution principal must verify and forward your application on the NSP portal. Follow up with your institution.", icon: "🏫", time: "1-2 weeks" },
    { step: "Scholarship Disbursement", desc: "Selected students receive scholarship directly in their bank account via DBT. Check NSP portal for status.", icon: "💰", time: "2-4 weeks" },
  ],
  employment: [
    { step: "Register on NCS Portal", desc: "Visit National Career Service Portal (ncs.gov.in). Register as a PWD job seeker with your disability certificate.", icon: "💻", time: "1 day" },
    { step: "Complete Your Profile", desc: "Add disability type, education, skills, and work experience. Upload resume and disability certificate.", icon: "👤", time: "1-2 days" },
    { step: "Search PWD-Reserved Jobs", desc: "Government jobs have 4% reservation for PWDs. Filter jobs by disability category (VH, HH, OH, MD).", icon: "🔍", time: "Ongoing" },
    { step: "Apply for Jobs", desc: "Fill the application form. In the disability section, select your category. Attach all required documents.", icon: "📤", time: "Per job" },
    { step: "Selection Process", desc: "You may get additional time or scribe assistance during exams. Request accommodations at time of application.", icon: "📝", time: "Varies" },
    { step: "Joining & Accommodation", desc: "After selection, request workplace accommodations under Rights of PWD Act 2016.", icon: "✅", time: "Varies" },
  ],
  health: [
    { step: "Identify the Right Scheme", desc: "Check if you are eligible for PMJAY (Ayushman Bharat), state health scheme, or ADIP based on your condition.", icon: "🔍", time: "1 day" },
    { step: "Get Disability Certificate", desc: "Visit government hospital, get medical board examination, collect disability certificate.", icon: "📋", time: "1-2 weeks" },
    { step: "Register for Ayushman Bharat", desc: "Check eligibility at pmjay.gov.in. Get your Ayushman card from Common Service Center or government hospital.", icon: "💻", time: "1-2 days" },
    { step: "Empanelled Hospital Treatment", desc: "Get treatment only at PMJAY empanelled hospitals. Show your Ayushman card at the help desk. Treatment is cashless.", icon: "🏥", time: "As needed" },
    { step: "Claim Process", desc: "Hospital submits claim on your behalf. Treatment up to ₹5 lakh per year is covered automatically.", icon: "💰", time: "Auto" },
  ],
};

// ── Detect scheme type from name/category ──────────────────────────────────
function getSchemeType(scheme: any): string {
  const name = (scheme?.name || "").toLowerCase();
  const cat  = (scheme?.category || "").toLowerCase();
  if (name.includes("scholarship") || name.includes("education") || cat.includes("education")) return "scholarship";
  if (name.includes("employ") || name.includes("job") || name.includes("skill") || cat.includes("employ")) return "employment";
  if (name.includes("health") || name.includes("medical") || name.includes("insurance") || cat.includes("health")) return "health";
  return "default";
}

// ── Evaluate questionnaire answers ─────────────────────────────────────────
function evaluateEligibility(answers: Record<string, string>) {
  const results: { criterion: string; passed: boolean; note: string }[] = [];
  let passCount = 0;

  if (answers.disability_pct) {
    const pass = answers.disability_pct !== "Below 40%";
    results.push({ criterion: "Disability Percentage", passed: pass, note: pass ? `${answers.disability_pct} — meets minimum 40% requirement` : "Below 40% — most schemes require minimum 40%" });
    if (pass) passCount++;
  }
  if (answers.has_certificate) {
    const pass = answers.has_certificate === "Yes";
    results.push({ criterion: "Disability Certificate", passed: pass, note: pass ? "Valid certificate — required for all government schemes" : "No certificate — visit government hospital to get one first" });
    if (pass) passCount++;
  }
  if (answers.bpl_card) {
    const pass = answers.bpl_card === "Yes";
    results.push({ criterion: "BPL Card", passed: pass, note: pass ? "BPL card present — financial schemes prefer BPL beneficiaries" : "No BPL card — some schemes still available based on income" });
    if (pass) passCount++;
  }
  if (answers.income) {
    const low = ["Below ₹1 Lakh", "₹1-2.5 Lakh"].includes(answers.income);
    results.push({ criterion: "Income Criteria", passed: low, note: low ? `${answers.income} — meets income eligibility` : `${answers.income} — may limit eligibility for some schemes` });
    if (low) passCount++;
  }
  if (answers.age) {
    const age = parseInt(answers.age);
    const pass = age >= 18 && age <= 65;
    results.push({ criterion: "Age Criteria", passed: pass, note: pass ? `Age ${age} — within eligible range (18-65)` : `Age ${age} — outside the typical 18-65 range` });
    if (pass) passCount++;
  }
  if (answers.has_aadhar) {
    const pass = answers.has_aadhar === "Yes";
    results.push({ criterion: "Aadhaar Card", passed: pass, note: pass ? "Aadhaar present — required for DBT" : "No Aadhaar — get Aadhaar card first, it is mandatory" });
    if (pass) passCount++;
  }
  if (answers.education) {
    results.push({ criterion: "Education Level", passed: true, note: `${answers.education} — recorded for scheme matching` });
    passCount++;
  }
  if (answers.institution) {
    const pass = answers.institution === "Yes";
    results.push({ criterion: "Institution", passed: pass, note: pass ? "Recognized institution — scholarships require this" : "Not in recognized institution — scholarship may not apply" });
    if (pass) passCount++;
  }

  const total = results.length;
  const percentage = total > 0 ? Math.round((passCount / total) * 100) : 0;
  return { results, eligible: percentage >= 60, percentage, passCount, total };
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════
const SchemesPage = () => {
  const [schemes, setSchemes]     = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult]   = useState<AISchemeResult | null>(null);
  const { profile }               = useAuth();

  // ── Eligibility checker state ──
  const [eligScheme, setEligScheme]   = useState<any | null>(null);
  const [qIndex, setQIndex]           = useState(0);
  const [answers, setAnswers]         = useState<Record<string, string>>({});
  const [eligResult, setEligResult]   = useState<ReturnType<typeof evaluateEligibility> | null>(null);

  // ── Application process state ──
  const [processScheme, setProcessScheme] = useState<any | null>(null);

  useEffect(() => {
    const fetchSchemes = async () => {
      const q = query(collection(db, "schemes"), where("isActive", "==", true));
      const snap = await getDocs(q);
      setSchemes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    fetchSchemes();
  }, []);

  // ── AI scheme check ────────────────────────────────────────────────────
  const runAISchemeCheck = async () => {
    if (!profile) { toast.error("Please complete your profile first."); return; }
    setAiLoading(true); setAiResult(null);
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      let full = "", buf = "";
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx); buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim(); if (json === "[DONE]") break;
          try { const p = JSON.parse(json); const c = p.choices?.[0]?.delta?.content; if (c) full += c; }
          catch { buf = line + "\n" + buf; break; }
        }
      }
      let cleaned = full.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      if (start !== -1 && end !== -1 && end > start) {
        cleaned = cleaned.slice(start, end + 1);
      }
      setAiResult(JSON.parse(cleaned) as AISchemeResult);
      toast.success("AI scheme analysis complete!");
    } catch { toast.error("Failed to analyze schemes. Try again."); }
    setAiLoading(false);
  };

  // ── Basic profile eligibility check ───────────────────────────────────
  const checkEligibility = (scheme: any) => {
    if (!profile) return { eligible: false, score: 0 };
    let score = 0, checks = 0;
    if (scheme.disability_types?.length) { checks++; if (scheme.disability_types.includes(profile.disability_type) || scheme.disability_types.includes("Any")) score++; }
    if (scheme.max_income && scheme.max_income > 0) { checks++; if (!profile.income || profile.income <= scheme.max_income) score++; }
    if (scheme.education_required && scheme.education_required !== "Any") { checks++; if (profile.education_level) score++; }
    checks = Math.max(checks, 1);
    return { eligible: score === checks, score: Math.round((score / checks) * 100) };
  };

  // ── Eligibility checker helpers ────────────────────────────────────────
  const openEligChecker = (scheme: any) => { setEligScheme(scheme); setQIndex(0); setAnswers({}); setEligResult(null); };
  const closeEligChecker = () => { setEligScheme(null); setEligResult(null); };

  const currentQuestions = eligScheme
    ? (ELIGIBILITY_QUESTIONS[getSchemeType(eligScheme)] ?? ELIGIBILITY_QUESTIONS.default)
    : [];
  const currentQ = currentQuestions[qIndex];

  const handleAnswer = (value: string) => {
    const updated = { ...answers, [currentQ.id]: value };
    setAnswers(updated);
    if (qIndex < currentQuestions.length - 1) {
      setTimeout(() => setQIndex(qIndex + 1), 300);
    } else {
      setEligResult(evaluateEligibility(updated));
    }
  };

  // ── Process dialog helpers ─────────────────────────────────────────────
  const openProcess  = (scheme: any) => setProcessScheme(scheme);
  const closeProcess = () => setProcessScheme(null);
  const processSteps = processScheme
    ? (APPLICATION_PROCESS[getSchemeType(processScheme)] ?? APPLICATION_PROCESS.default)
    : [];

  const filtered = schemes.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()));

  // ══════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          icon={<Landmark className="h-5 w-5 text-white" />}
          title="Scheme Eligibility"
          subtitle="Check your eligibility for 80+ government schemes for persons with disabilities"
        >
          {aiResult && (
            <div className="flex items-center gap-2 rounded-xl px-4 py-2"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
              <Sparkles className="h-4 w-4 text-white/80" />
              <span className="text-sm font-medium text-white">AI Analyzed</span>
            </div>
          )}
        </PageHeader>

        {/* Search + AI button */}
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
                          {s.eligible ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                            <Badge variant="outline" className={`text-xs shrink-0 ${s.eligible ? "text-success border-success/30" : "text-muted-foreground"}`}>{s.confidence}%</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{s.ministry}</p>
                          <p className="text-xs text-foreground mt-1">{s.reason}</p>
                          {s.eligible && s.action && <p className="text-xs text-accent mt-1 font-medium">→ {s.action}</p>}
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

        {/* Scheme Cards */}
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

                      {/* ── TWO BUTTONS ── */}
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <Button
                          className="w-full bg-primary text-primary-foreground gap-1.5"
                          onClick={() => openEligChecker(scheme)}
                        >
                          <ClipboardList className="h-4 w-4" />
                          Check Eligibility
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full gap-1.5 border-primary/40 text-primary hover:bg-primary/5"
                          onClick={() => openProcess(scheme)}
                        >
                          <ListChecks className="h-4 w-4" />
                          How to Apply
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

      {/* ── ELIGIBILITY CHECKER DIALOG ───────────────────────────────────── */}
      <AnimatePresence>
        {eligScheme && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={closeEligChecker}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border"
                style={{ background: "linear-gradient(135deg,hsl(248,62%,16%),hsl(265,78%,28%))" }}>
                <div>
                  <h2 className="text-white font-bold text-base">Eligibility Checker</h2>
                  <p className="text-white/60 text-xs mt-0.5 line-clamp-1">{eligScheme.name}</p>
                </div>
                <button onClick={closeEligChecker} className="text-white/60 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6">
                {eligResult ? (
                  /* RESULT VIEW */
                  <div className="space-y-4">
                    <div className={`rounded-xl p-4 flex items-center gap-4 ${eligResult.eligible ? "bg-success/10 border border-success/30" : "bg-destructive/10 border border-destructive/30"}`}>
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ${eligResult.eligible ? "bg-success/20" : "bg-destructive/20"}`}>
                        {eligResult.eligible ? "✅" : "❌"}
                      </div>
                      <div>
                        <p className={`text-lg font-bold ${eligResult.eligible ? "text-success" : "text-destructive"}`}>
                          {eligResult.eligible ? "Likely Eligible!" : "May Not Be Eligible"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {eligResult.passCount} of {eligResult.total} criteria met ({eligResult.percentage}% match)
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Eligibility Score</span>
                        <span className="font-bold">{eligResult.percentage}%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${eligResult.percentage}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className={`h-full rounded-full ${eligResult.eligible ? "bg-success" : "bg-destructive"}`}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {eligResult.results.map((r, i) => (
                        <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${r.passed ? "border-success/20 bg-success/5" : "border-destructive/20 bg-destructive/5"}`}>
                          {r.passed
                            ? <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                            : <AlertCircle  className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />}
                          <div>
                            <p className="font-medium text-foreground">{r.criterion}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{r.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1 gap-1"
                        onClick={() => { setQIndex(0); setAnswers({}); setEligResult(null); }}>
                        <RefreshCw className="h-3.5 w-3.5" /> Retake
                      </Button>
                      {eligResult.eligible && (
                        <Button size="sm" className="flex-1 gap-1 bg-success text-white hover:bg-success/90"
                          onClick={() => { closeEligChecker(); openProcess(eligScheme); }}>
                          How to Apply <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* QUESTION VIEW */
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Question {qIndex + 1} of {currentQuestions.length}</span>
                        <span>{Math.round((qIndex / currentQuestions.length) * 100)}% complete</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          animate={{ width: `${(qIndex / currentQuestions.length) * 100}%` }}
                          className="h-full rounded-full bg-primary"
                        />
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div key={qIndex}
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                        className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-primary">{qIndex + 1}</span>
                          </div>
                          <h3 className="text-base font-semibold text-foreground leading-snug">{currentQ?.question}</h3>
                        </div>

                        {currentQ?.type === "yes_no" && (
                          <div className="grid grid-cols-2 gap-3">
                            {["Yes", "No"].map(opt => (
                              <button key={opt} onClick={() => handleAnswer(opt)}
                                className={`py-3 rounded-xl border-2 font-semibold text-sm transition-all hover:scale-105 active:scale-95 ${opt === "Yes" ? "border-success/40 bg-success/10 text-success hover:bg-success/20" : "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20"}`}>
                                {opt === "Yes" ? "✅ Yes" : "❌ No"}
                              </button>
                            ))}
                          </div>
                        )}

                        {currentQ?.type === "select" && (
                          <div className="space-y-2">
                            {currentQ.options?.map(opt => (
                              <button key={opt} onClick={() => handleAnswer(opt)}
                                className="w-full text-left px-4 py-3 rounded-xl border border-border bg-background hover:border-primary hover:bg-primary/5 transition-all text-sm font-medium text-foreground flex items-center justify-between group">
                                {opt}
                                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                              </button>
                            ))}
                          </div>
                        )}

                        {currentQ?.type === "number" && (
                          <div className="space-y-3">
                            <input id="qInput" type="number" placeholder={currentQ.placeholder}
                              className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary"
                              onKeyDown={(e) => { if (e.key === "Enter") { const v = (e.target as HTMLInputElement).value; if (v) handleAnswer(v); } }}
                            />
                            <Button className="w-full gap-1.5"
                              onClick={() => { const el = document.getElementById("qInput") as HTMLInputElement; if (el?.value) handleAnswer(el.value); }}>
                              Next <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>

                    {qIndex > 0 && (
                      <button onClick={() => setQIndex(qIndex - 1)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <ChevronLeft className="h-3.5 w-3.5" /> Previous question
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── APPLICATION PROCESS DIALOG ────────────────────────────────────── */}
      <AnimatePresence>
        {processScheme && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={closeProcess}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0"
                style={{ background: "linear-gradient(135deg,hsl(142,76%,18%),hsl(142,76%,28%))" }}>
                <div>
                  <h2 className="text-white font-bold text-base flex items-center gap-2">
                    <ListChecks className="h-4 w-4" /> How to Apply
                  </h2>
                  <p className="text-white/60 text-xs mt-0.5 line-clamp-1">{processScheme.name}</p>
                </div>
                <button onClick={closeProcess} className="text-white/60 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Info bar */}
              <div className="px-6 py-3 bg-blue-50 dark:bg-blue-950/30 border-b border-border flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Complete all steps in order. Keep all original documents ready at each step.
                  </p>
                </div>
              </div>

              {/* Steps */}
              <div className="overflow-y-auto flex-1 px-6 py-4">
                {processSteps.map((step, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 border-2 border-border bg-card">
                        {step.icon}
                      </div>
                      {i < processSteps.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1 mb-1 min-h-[24px]" />}
                    </div>
                    <div className="flex-1 pb-5">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-bold text-foreground">Step {i + 1}: {step.step}</h4>
                        <Badge variant="outline" className="text-[10px] shrink-0 bg-muted">⏱ {step.time}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}

                {/* Documents needed */}
                <div className="mt-2 p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-2">📋 Documents Always Required</p>
                  <div className="grid grid-cols-2 gap-1">
                    {["Disability Certificate", "Aadhaar Card", "Passport Photos", "Bank Passbook", "Income Certificate", "BPL Card (if any)"].map(doc => (
                      <div key={doc} className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                        {doc}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Helpline */}
                <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/20 text-center">
                  <p className="text-xs text-muted-foreground">Need help? Call the Disability Helpline</p>
                  <p className="text-sm font-bold text-primary mt-0.5">📞 1800-11-4515 (Toll Free)</p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-border flex-shrink-0">
                <Button className="w-full gap-2 bg-success text-white hover:bg-success/90" onClick={closeProcess}>
                  <CheckCircle2 className="h-4 w-4" /> Got It — Start My Application
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default SchemesPage;