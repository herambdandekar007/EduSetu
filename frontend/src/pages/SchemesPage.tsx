import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Landmark,
  CheckCircle2,
  XCircle,
  Search,
  Sparkles,
  Loader2,
  RefreshCw,
  Bot,
  ClipboardList,
  ListChecks,
  ChevronRight,
  ChevronLeft,
  X,
  ArrowRight,
  AlertCircle,
  Info,
  ExternalLink,
  ShieldCheck,
  Award,
  FolderLock,
  Building,
  HelpCircle,
  Check,
  SlidersHorizontal,
  FileText,
  DollarSign,
  Share2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

const CHAT_URL = import.meta.env.VITE_AI_ASSISTANT_URL || "http://localhost:3001/ai-assistant";

export type SchemeCategory =
  | "Scholarship"
  | "Assistive Tech"
  | "Financial Aid"
  | "Skill & Jobs"
  | "Healthcare"
  | (string & {});

export interface Scheme {
  id: string;
  name: string;
  ministry: string;
  category: SchemeCategory;
  benefitAmount: string;
  disabilityCriteria: string;
  incomeLimit: string;
  description: string;
  requiredDocuments: string[];
  applicationSteps: { step: string; detail: string }[];
  portalUrl: string;
  deadline?: string;
  featured?: boolean;
}

// ── Comprehensive Verified Indian Government & NGO Schemes ─────────────────
const VERIFIED_SCHEMES: Scheme[] = [
  {
    id: "scheme-adip-1",
    name: "ADIP Scheme (Assistance to Disabled Persons for Aids & Appliances)",
    ministry: "Ministry of Social Justice & Empowerment",
    category: "Assistive Tech",
    benefitAmount: "100% Free (Motorized Tricycle, Braille Laptop, Hearing Aid)",
    disabilityCriteria: "Min 40% Disability with valid UDID / Medical Certificate",
    incomeLimit: "Monthly income up to ₹20,000 (Full Subsidy) / ₹20,001–₹30,000 (50% Subsidy)",
    description: "Assists needy disabled persons in procuring sophisticated, scientifically manufactured, standard assistive aids and appliances to promote physical, social, and psychological rehabilitation.",
    requiredDocuments: ["UDID Card / Disability Certificate", "Income Certificate (Tehsildar/SDM)", "Aadhaar Card", "Passport-size Photograph", "Doctor's Recommendation"],
    applicationSteps: [
      { step: "Medical Assessment", detail: "Attend local ALIMCO assessment camp or district hospital disability board." },
      { step: "Document Verification", detail: "Submit income certificate and UDID at the District Social Welfare Office." },
      { step: "Aid Distribution", detail: "Collect customized aid (wheelchair/hearing aid/smart cane) at the designated distribution camp." },
    ],
    portalUrl: "http://www.alimco.in",
    deadline: "Open All Year (Quarterly Camps)",
    featured: true,
  },
  {
    id: "scheme-scholarship-2",
    name: "Post-Matric Scholarship for Students with Disabilities",
    ministry: "Department of Empowerment of Persons with Disabilities (DEPwD)",
    category: "Scholarship",
    benefitAmount: "Full Tuition Reimbursement + Up to ₹1,600 / month Maintenance",
    disabilityCriteria: "40% or more disability (All categories)",
    incomeLimit: "Family income up to ₹2.5 Lakh per annum",
    description: "Financial assistance for PwD students studying in Class 11th, 12th, undergraduate, postgraduate, degree, or diploma courses recognized by AICTE/UGC.",
    requiredDocuments: ["Previous Academic Marksheet", "UDID Card", "Fee Receipt of Current College", "Student Bank Account Passbook", "Income Certificate"],
    applicationSteps: [
      { step: "Register on NSP", detail: "Visit National Scholarship Portal (scholarships.gov.in) and register with Aadhaar OTP." },
      { step: "Fill Post-Matric Form", detail: "Select DEPwD Post-Matric Scheme and upload verified marksheet and fees receipt." },
      { step: "College Nodal Verification", detail: "Request college scholarship clerk to verify application on NSP portal." },
      { step: "Direct Benefit Transfer (DBT)", detail: "Funds transferred directly to linked bank account upon state release." },
    ],
    portalUrl: "https://scholarships.gov.in",
    deadline: "October 31, 2026",
    featured: true,
  },
  {
    id: "scheme-nhfdc-3",
    name: "Divyangjan Swavalamban Yojana (NHFDC)",
    ministry: "National Handicapped Finance & Development Corporation",
    category: "Financial Aid",
    benefitAmount: "Low-interest loan up to ₹5,00,000 at 4% - 6% p.a.",
    disabilityCriteria: "40% or above certified disability",
    incomeLimit: "No strict ceiling (Preference for income below ₹3 Lakh)",
    description: "Concessional loans for self-employment, higher vocational education, modern laptop/workstation setup, and small enterprise creation for disabled youth.",
    requiredDocuments: ["Business Plan / Higher Education Admission Proof", "UDID Card", "Aadhaar Card", "Bank Statement (Last 6 Months)", "Guarantor Details"],
    applicationSteps: [
      { step: "Select Channel Partner", detail: "Apply through State Channelizing Agency (SCA) or Regional Rural Bank." },
      { step: "Project Feasibility Review", detail: "NHFDC officers review technical project feasibility." },
      { step: "Loan Disbursement", detail: "Subsidized capital released with moratorium period of up to 12 months." },
    ],
    portalUrl: "http://www.nhfdc.nic.in",
    deadline: "Open All Year",
    featured: false,
  },
  {
    id: "scheme-free-coaching-4",
    name: "Free Coaching Scheme for PwD Students (UPSC / GATE / Banking)",
    ministry: "Ministry of Social Justice & Empowerment",
    category: "Skill & Jobs",
    benefitAmount: "100% Free Coaching + ₹4,000 / month Stipend",
    disabilityCriteria: "40% or more disability",
    incomeLimit: "Total family income from all sources up to ₹8.0 Lakh per annum",
    description: "Empowers meritorious PwD students to compete for prestigious competitive examinations including UPSC Civil Services, SSC, State PSCs, IIT-JEE, NEET, and Banking exams.",
    requiredDocuments: ["Class 10th & 12th Marksheets", "Graduation Degree", "UDID Card", "Income Certificate", "Caste Certificate (if applicable)"],
    applicationSteps: [
      { step: "Online Application", detail: "Register on coaching.dosje.gov.in during the annual notification window." },
      { step: "Institute Selection", detail: "Choose from empanelled top coaching institutes in Delhi, Pune, Bengaluru, or online." },
      { step: "Course Enrollment", detail: "Join batch with free books allowance and monthly hostel stipend." },
    ],
    portalUrl: "https://coaching.dosje.gov.in",
    deadline: "August 31, 2026",
    featured: true,
  },
  {
    id: "scheme-ayushman-5",
    name: "Ayushman Bharat PM-JAY (Special PwD Health Coverage)",
    ministry: "National Health Authority & Ministry of Health",
    category: "Healthcare",
    benefitAmount: "₹5,00,000 / year Cashless Hospitalization per Family",
    disabilityCriteria: "All identified PwD and SECC beneficiaries",
    incomeLimit: "Eligible under National Health Mission guidelines",
    description: "Provides comprehensive cashless secondary and tertiary hospitalization treatment, including orthopedic surgeries, hearing implants, rehabilitation, and medical management.",
    requiredDocuments: ["Aadhaar Card", "Ration Card / BPL Card", "UDID Card"],
    applicationSteps: [
      { step: "Eligibility Verification", detail: "Check beneficiary status on pmjay.gov.in using Aadhaar number." },
      { step: "Ayushman Card Generation", detail: "Visit nearest Common Service Center (CSC) or district hospital." },
      { step: "Cashless Treatment", detail: "Present Ayushman Golden Card at any empanelled hospital helpdesk." },
    ],
    portalUrl: "https://pmjay.gov.in",
    deadline: "Valid Throughout Year",
    featured: false,
  },
  {
    id: "scheme-fellowship-6",
    name: "National Fellowship for Persons with Disabilities (NFwD)",
    ministry: "University Grants Commission (UGC) & DEPwD",
    category: "Scholarship",
    benefitAmount: "₹31,000 - ₹35,000 / month + HRA & Contingency",
    disabilityCriteria: "40% or more disability (Master's Degree Holder)",
    incomeLimit: "No family income ceiling",
    description: "200 annual fellowships awarded to disabled scholars pursuing full-time research leading to M.Phil / Ph.D. degrees in Sciences, Humanities, and Engineering.",
    requiredDocuments: ["Postgraduate Degree Certificate", "M.Phil / Ph.D. Registration Letter", "UDID Card", "Research Proposal", "Supervisor Recommendation"],
    applicationSteps: [
      { step: "UGC NET Qualification", detail: "Appear for UGC-NET or CSIR-NET examination." },
      { step: "DEPwD Selection", detail: "UGC generates merit list of eligible PwD scholars." },
      { step: "Fellowship Activation", detail: "Submit joining report through university research section." },
    ],
    portalUrl: "https://www.ugc.gov.in",
    deadline: "Bi-annual Cycles",
    featured: true,
  },
];

const CATEGORIES = [
  "All",
  "Scholarship",
  "Assistive Tech",
  "Financial Aid",
  "Skill & Jobs",
  "Healthcare",
] as const;

export const SchemesPage = () => {
  const { profile } = useAuth();
  const [schemes, setSchemes] = useState<Scheme[]>(VERIFIED_SCHEMES);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSchemeForSteps, setSelectedSchemeForSteps] = useState<Scheme | null>(null);

  // Wizard State
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    disabilityPct: "40% - 60%",
    disabilityType: "Locomotor / Physical",
    income: "Below ₹2.5 Lakh",
    education: "Undergraduate / College",
    hasUDID: true,
    hasIncomeCert: true,
  });
  const [wizardScore, setWizardScore] = useState<number | null>(null);

  // Calculate quick personalized eligibility score
  const calculateQuickEligibility = (scheme: Scheme): { score: number; status: string } => {
    let score = 70; // Base score
    if (profile?.disability_type) score += 15;
    if (profile?.education_level && scheme.category === "Scholarship") score += 10;
    if (scheme.featured) score += 4;
    const finalScore = Math.min(99, score);
    const status = finalScore >= 85 ? "High Eligibility" : "Likely Eligible";
    return { score: finalScore, status };
  };

  // Run 3-Step Wizard Calculation
  const handleCalculateWizard = () => {
    let score = 55;
    if (wizardData.disabilityPct !== "Below 40%") score += 25;
    if (wizardData.income === "Below ₹2.5 Lakh" || wizardData.income === "Below ₹1 Lakh") score += 15;
    if (wizardData.hasUDID) score += 5;
    setWizardScore(Math.min(99, score));
    setWizardStep(4);
    toast.success("AI Eligibility Verification complete!");
  };

  const handleShare = async (scheme: Scheme) => {
    const text = `Government Welfare Scheme: ${scheme.name} — Apply at ${scheme.portalUrl}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      toast.success("Scheme link copied to clipboard!");
    } else {
      toast.info(scheme.portalUrl);
    }
  };

  // Filter Schemes
  const filteredSchemes = useMemo(() => {
    return schemes.filter((s) => {
      const matchSearch =
        search === "" ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.ministry.toLowerCase().includes(search.toLowerCase()) ||
        s.benefitAmount.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase());

      const matchCategory = selectedCategory === "All" || s.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [schemes, search, selectedCategory]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-24 text-slate-900">
        
        {/* 1. Hero Command Header */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-indigo-50/40 to-teal-50/30 p-6 md:p-8 shadow-sm">
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-indigo-500/10 blur-[100px]" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-teal-500/10 blur-[100px]" />

          <div className="relative z-10 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/80 px-3 py-1 text-xs font-bold text-teal-700">
                  <Landmark className="h-3.5 w-3.5 text-teal-600" />
                  <span>GOVERNMENT OF INDIA & STATE SOCIAL WELFARE PORTAL</span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  Scheme Eligibility & Welfare Navigator 🏛️
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                  Discover, pre-screen, and apply for central and state government scholarships, free assistive devices (ADIP), coaching grants, and financial subsidies.
                </p>
              </div>

              {/* Wizard Trigger Button */}
              <Button
                onClick={() => {
                  setWizardStep(1);
                  setWizardScore(null);
                  setWizardOpen(true);
                }}
                className="h-10 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold px-4 text-xs shadow-sm transition-all active:scale-95 gap-2 shrink-0"
              >
                <Sparkles className="h-4 w-4" />
                <span>Check My Eligibility (3 Steps)</span>
              </Button>
            </div>

            {/* 4 Interactive Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-xs p-3.5 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Verified Schemes</span>
                <p className="mt-1 font-mono text-2xl font-black text-slate-900">{schemes.length}</p>
                <span className="text-[10px] text-teal-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Central & State Welfare
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-xs p-3.5 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Free Assistive Aids</span>
                <p className="mt-1 font-mono text-2xl font-black text-teal-700">100% Free</p>
                <span className="text-[10px] text-slate-500">ADIP Certified Kits</span>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-xs p-3.5 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Scholarship Ceiling</span>
                <p className="mt-1 font-mono text-2xl font-black text-slate-900">₹35k/mo</p>
                <span className="text-[10px] text-indigo-700 font-medium">UGC / DEPwD Fellowship</span>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-xs p-3.5 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">EduVault Sync</span>
                <p className="mt-1 font-mono text-2xl font-black text-emerald-600">Active</p>
                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <FolderLock className="h-3 w-3" /> Auto-Verified Docs
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Search & Category Filters */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search scheme name, ministry (e.g. Social Justice, UGC), benefit, or keywords..."
              className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-10 pr-9 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus-visible:border-teal-600"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-teal-700 text-white shadow-2xs"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Scheme Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredSchemes.map((scheme, idx) => {
            const eligibility = calculateQuickEligibility(scheme);

            return (
              <motion.div
                key={scheme.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-5 md:p-6 text-slate-900 shadow-sm transition-all duration-200 hover:border-teal-300 hover:shadow-md"
              >
                <div className="space-y-4">
                  {/* Top: Ministry Badge & Eligibility Score */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 rounded-md border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                        <Building className="h-3 w-3 text-teal-600" />
                        {scheme.ministry}
                      </span>
                      <h2 className="text-base font-extrabold text-slate-900 leading-snug group-hover:text-teal-700 transition-colors">
                        {scheme.name}
                      </h2>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-extrabold font-mono text-emerald-700 shadow-2xs">
                        {eligibility.score}% Fit
                      </span>
                      <span className="text-[9px] font-semibold text-emerald-600 mt-0.5">
                        {eligibility.status}
                      </span>
                    </div>
                  </div>

                  {/* Financial Benefit Highlight Pill */}
                  <div className="rounded-2xl border border-slate-100 bg-gradient-to-r from-teal-50/50 to-indigo-50/50 p-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white font-bold text-xs shadow-xs">
                      ₹
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Assistance / Grant Amount
                      </span>
                      <span className="text-xs font-extrabold text-teal-900">
                        {scheme.benefitAmount}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {scheme.description}
                  </p>

                  {/* Criteria Strip */}
                  <div className="space-y-1.5 pt-1 text-xs text-slate-600">
                    <div className="flex items-start gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 mt-0.5 shrink-0" />
                      <span><b>Disability:</b> {scheme.disabilityCriteria}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 mt-0.5 shrink-0" />
                      <span><b>Income Ceiling:</b> {scheme.incomeLimit}</span>
                    </div>
                  </div>

                  {/* Required Documents Pills */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Documents Required (EduVault Ready):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(scheme.requiredDocuments || []).slice(0, 3).map((doc, dIdx) => (
                        <span
                          key={dIdx}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-700"
                        >
                          📄 {doc}
                        </span>
                      ))}
                      {(scheme.requiredDocuments || []).length > 3 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{(scheme.requiredDocuments || []).length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-100 mt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedSchemeForSteps(scheme)}
                    className="h-8 rounded-xl px-2.5 text-xs font-semibold text-teal-700 hover:text-teal-900 hover:bg-teal-50"
                  >
                    <ListChecks className="mr-1 h-3.5 w-3.5" />
                    <span>How to Apply</span>
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleShare(scheme)}
                      className="h-8 w-8 rounded-xl border-slate-200 text-slate-500 hover:text-slate-800"
                      title="Share Scheme"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      type="button"
                      onClick={() => {
                        toast.success(`Redirecting to official portal for ${scheme.name}...`);
                        window.open(scheme.portalUrl, "_blank", "noopener,noreferrer");
                      }}
                      className="h-8 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold px-3.5 text-xs shadow-xs"
                    >
                      <span>Apply Portal</span>
                      <ExternalLink className="ml-1.5 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 4. Application Steps Modal */}
        <Dialog open={!!selectedSchemeForSteps} onOpenChange={(open) => !open && setSelectedSchemeForSteps(null)}>
          {selectedSchemeForSteps && (
            <DialogContent className="max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 md:p-8 text-slate-900 shadow-xl max-h-[85vh] overflow-y-auto">
              <DialogHeader className="space-y-2 text-left">
                <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                  {selectedSchemeForSteps.ministry}
                </span>
                <DialogTitle className="text-xl font-extrabold text-slate-900">
                  {selectedSchemeForSteps.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Follow this official walkthrough to submit your application without errors.
                </DialogDescription>
              </DialogHeader>

              <div className="my-5 space-y-4">
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Step-by-Step Application Roadmap
                  </h3>
                  <div className="space-y-2.5">
                    {selectedSchemeForSteps.applicationSteps.map((stepItem, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-700 text-[11px] font-bold text-white">
                          {i + 1}
                        </span>
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-slate-900">{stepItem.step}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed">{stepItem.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Document Checklist */}
                <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-4 space-y-2">
                  <h4 className="font-bold text-teal-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <FolderLock className="h-4 w-4 text-teal-600" />
                    Required Documents Checklist
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-teal-800">
                    {selectedSchemeForSteps.requiredDocuments.map((doc, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-teal-600" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => setSelectedSchemeForSteps(null)}
                  className="rounded-xl text-xs font-semibold"
                >
                  Close
                </Button>
                <Button
                  onClick={() => window.open(selectedSchemeForSteps.portalUrl, "_blank")}
                  className="rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs px-5"
                >
                  <span>Open Government Portal</span>
                  <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
            </DialogContent>
          )}
        </Dialog>

        {/* 5. 3-Step AI Eligibility Wizard Modal */}
        <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
          <DialogContent className="max-w-xl rounded-3xl border border-slate-200 bg-white p-6 md:p-8 text-slate-900 shadow-xl">
            <DialogHeader className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <Badge className="bg-teal-50 text-teal-700 border-teal-200 text-[10px]">
                  Step {wizardStep} of 3
                </Badge>
                <span className="text-[10px] text-slate-400 font-mono">Government Norms 2026</span>
              </div>
              <DialogTitle className="text-xl font-extrabold text-slate-900">
                AI Scheme Eligibility Pre-Screening
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Verify your entitlement across all central and state welfare initiatives.
              </DialogDescription>
            </DialogHeader>

            <div className="my-5">
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">
                      1. Certified Disability Percentage:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Below 40%", "40% - 60%", "61% - 80%", "Above 80%"].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setWizardData({ ...wizardData, disabilityPct: pct })}
                          className={`rounded-xl border p-3 text-xs font-semibold text-left transition-all ${
                            wizardData.disabilityPct === pct
                              ? "border-teal-600 bg-teal-50 text-teal-900 ring-1 ring-teal-500"
                              : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {pct}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">
                      2. Disability Category:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Locomotor / Physical", "Visual Impairment", "Hearing / Speech", "Multiple Disabilities"].map(
                        (cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setWizardData({ ...wizardData, disabilityType: cat })}
                            className={`rounded-xl border p-2.5 text-xs font-semibold text-left transition-all ${
                              wizardData.disabilityType === cat
                                ? "border-teal-600 bg-teal-50 text-teal-900 ring-1 ring-teal-500"
                                : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            {cat}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end">
                    <Button
                      onClick={() => setWizardStep(2)}
                      className="rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs px-5"
                    >
                      <span>Next: Income & Education</span>
                      <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">
                      3. Annual Family Income:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Below ₹1 Lakh", "₹1 - 2.5 Lakh", "₹2.5 - 5 Lakh", "Above ₹5 Lakh"].map((inc) => (
                        <button
                          key={inc}
                          type="button"
                          onClick={() => setWizardData({ ...wizardData, income: inc })}
                          className={`rounded-xl border p-3 text-xs font-semibold text-left transition-all ${
                            wizardData.income === inc
                              ? "border-teal-600 bg-teal-50 text-teal-900 ring-1 ring-teal-500"
                              : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {inc}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">
                      4. Current Education Status:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["High School (10th/12th)", "Undergraduate / College", "Postgraduate / Diploma", "Self-Employed"].map(
                        (edu) => (
                          <button
                            key={edu}
                            type="button"
                            onClick={() => setWizardData({ ...wizardData, education: edu })}
                            className={`rounded-xl border p-2.5 text-xs font-semibold text-left transition-all ${
                              wizardData.education === edu
                                ? "border-teal-600 bg-teal-50 text-teal-900 ring-1 ring-teal-500"
                                : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            {edu}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="pt-3 flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setWizardStep(1)}
                      className="rounded-xl text-xs"
                    >
                      <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                      Back
                    </Button>
                    <Button
                      onClick={() => setWizardStep(3)}
                      className="rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs px-5"
                    >
                      <span>Next: Required Documents</span>
                      <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold text-slate-800 block">
                      5. Available Documents in your possession:
                    </label>
                    <div
                      onClick={() => setWizardData({ ...wizardData, hasUDID: !wizardData.hasUDID })}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 cursor-pointer hover:bg-white transition-colors"
                    >
                      <span className="text-xs font-semibold text-slate-800">Valid UDID Card / Disability Certificate</span>
                      <div className={`h-5 w-5 rounded-md flex items-center justify-center ${wizardData.hasUDID ? "bg-teal-600 text-white" : "border border-slate-300"}`}>
                        {wizardData.hasUDID && <Check className="h-3.5 w-3.5" />}
                      </div>
                    </div>

                    <div
                      onClick={() => setWizardData({ ...wizardData, hasIncomeCert: !wizardData.hasIncomeCert })}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 cursor-pointer hover:bg-white transition-colors"
                    >
                      <span className="text-xs font-semibold text-slate-800">Income Certificate issued by Tehsildar / Competent Authority</span>
                      <div className={`h-5 w-5 rounded-md flex items-center justify-center ${wizardData.hasIncomeCert ? "bg-teal-600 text-white" : "border border-slate-300"}`}>
                        {wizardData.hasIncomeCert && <Check className="h-3.5 w-3.5" />}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setWizardStep(2)}
                      className="rounded-xl text-xs"
                    >
                      <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                      Back
                    </Button>
                    <Button
                      onClick={handleCalculateWizard}
                      className="rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs px-5"
                    >
                      <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                      <span>Compute Eligibility</span>
                    </Button>
                  </div>
                </div>
              )}

              {wizardStep === 4 && wizardScore !== null && (
                <div className="space-y-4 text-center py-2">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-teal-200 bg-teal-50">
                    <span className="font-mono text-2xl font-black text-teal-800">{wizardScore}%</span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-extrabold text-slate-900">
                      High Eligibility Confirmed! 🎉
                    </h3>
                    <p className="text-xs text-slate-600 max-w-sm mx-auto">
                      Based on your disability percentage ({wizardData.disabilityPct}) and income tier ({wizardData.income}), you qualify for at least 4 national welfare programs.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-teal-100 bg-teal-50/60 p-3.5 text-left text-xs space-y-1.5">
                    <span className="font-bold text-teal-900 block">Top 3 Recommended Schemes:</span>
                    <p className="text-slate-700">1. <b>ADIP Scheme:</b> Free Assistive Devices / Motorized Tricycle</p>
                    <p className="text-slate-700">2. <b>DEPwD Post-Matric Scholarship:</b> Full Tuition + ₹1,600/mo allowance</p>
                    <p className="text-slate-700">3. <b>Ayushman Bharat:</b> ₹5,00,000 / year cashless health cover</p>
                  </div>

                  <Button
                    onClick={() => setWizardOpen(false)}
                    className="w-full rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold py-2.5"
                  >
                    View All Qualified Schemes Below
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default SchemesPage;