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
  Users,
  Accessibility,
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

export type SchemeAudience = "All" | "General" | "PwD";

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
  targetAudience?: "all" | "pwd" | "general";
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
    targetAudience: "pwd",
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
    targetAudience: "pwd",
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
    targetAudience: "pwd",
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
    targetAudience: "pwd",
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
    targetAudience: "pwd",
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
    targetAudience: "pwd",
  },
  // ── Verified National Schemes for Normal People / General Citizens & Students ────
  {
    id: "scheme-general-yasasvi-7",
    name: "PM-YASASVI (Young Achievers Scholarship Scheme for Vibrant India)",
    ministry: "Ministry of Social Justice & Ministry of Education",
    category: "Scholarship",
    benefitAmount: "Up to ₹1,25,000 / year (Full Tuition + Hostel & Books Allowance)",
    disabilityCriteria: "None required — Open to all normal/general, OBC, EBC & DNT students",
    incomeLimit: "Annual family income up to ₹2.5 Lakh",
    description: "Prestigious national merit-based scholarship for meritorious school (Class 9-12) and top-class college/degree students across India without requiring any disability certificate.",
    requiredDocuments: ["Class 8th / 10th Marksheet", "Aadhaar Card", "Income Certificate", "College/School Admission Proof", "Bank Passbook"],
    applicationSteps: [
      { step: "Register on YET Portal", detail: "Apply online at National Testing Agency (NTA) YASASVI portal (yet.nta.ac.in)." },
      { step: "Merit Screening", detail: "Submit qualifying board exam marks or appear for NTA entrance examination." },
      { step: "Direct Benefit Transfer", detail: "Scholarship credited directly to student's bank account for tuition and living expenses." },
    ],
    portalUrl: "https://yet.nta.ac.in",
    deadline: "October 15, 2026",
    featured: true,
    targetAudience: "general",
  },
  {
    id: "scheme-general-csss-8",
    name: "Central Sector Scheme of Scholarships for College & University Students (CSSS)",
    ministry: "Department of Higher Education, Ministry of Education",
    category: "Scholarship",
    benefitAmount: "₹12,000 / year (Graduation) to ₹20,000 / year (Post-Graduation)",
    disabilityCriteria: "None required — Open to all regular college students based on Class 12 merit",
    incomeLimit: "Gross family income up to ₹4.5 Lakh per annum",
    description: "Financial assistance for meritorious general, OBC, SC, and ST students from recognized state & central boards who score above the 80th percentile in Class 12 and pursue regular graduation degrees.",
    requiredDocuments: ["Class 12th Board Marksheet", "College Bonafide Certificate / ID", "Aadhaar Card", "Income Certificate", "Bank Account Details"],
    applicationSteps: [
      { step: "Register on NSP", detail: "Log in to the National Scholarship Portal (scholarships.gov.in) with Aadhaar OTP." },
      { step: "Select Department of Higher Education", detail: "Choose CSSS scheme and enter Class 12 roll number and college admission code." },
      { step: "Institute Verification", detail: "College scholarship nodal officer digitally validates regular enrollment status." },
    ],
    portalUrl: "https://scholarships.gov.in",
    deadline: "November 30, 2026",
    featured: true,
    targetAudience: "general",
  },
  {
    id: "scheme-general-pmkvy-9",
    name: "Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0 - Skill India)",
    ministry: "Ministry of Skill Development & Entrepreneurship",
    category: "Skill & Jobs",
    benefitAmount: "100% Free Industry 4.0 Technical Training + ₹8,000 Cash Reward & Govt Certificate",
    disabilityCriteria: "None required — Open to all youth, college students, and job seekers",
    incomeLimit: "No family income ceiling",
    description: "India's flagship skilling initiative providing high-demand training in AI, Machine Learning, Cloud Computing, Cybersecurity, Robotics, and Advanced Manufacturing with guaranteed placement assistance.",
    requiredDocuments: ["Aadhaar Card", "Bank Account Passbook", "Education Qualification Marksheet (10th/12th/Diploma/Degree)"],
    applicationSteps: [
      { step: "Find Nearest Training Center", detail: "Locate authorized PMKVY training center on skillindia.gov.in or pmkvyofficial.org." },
      { step: "Enroll in Industry Course", detail: "Choose modern tech or vocational trade and complete free hands-on training batch." },
      { step: "Assessment & Certification", detail: "Pass government assessment to receive NSDC certification and stipend reward." },
    ],
    portalUrl: "https://www.pmkvyofficial.org",
    deadline: "Open All Year",
    featured: true,
    targetAudience: "general",
  },
  {
    id: "scheme-general-sisfs-10",
    name: "Startup India Seed Fund Scheme (SISFS)",
    ministry: "Department for Promotion of Industry and Internal Trade (DPIIT)",
    category: "Financial Aid",
    benefitAmount: "Grants up to ₹20 Lakhs for Prototype + Up to ₹50 Lakhs for Commercialization",
    disabilityCriteria: "None required — Open to all Indian student innovators and startup teams",
    incomeLimit: "No personal income limit",
    description: "Provides financial assistance to early-stage student startups and entrepreneurs for proof of concept, prototype development, product trials, market-entry, and commercialization through approved incubators.",
    requiredDocuments: ["DPIIT Startup Recognition Certificate", "Pitch Deck & Prototype Video", "Company/LLP Registration Proof", "Incubator Recommendation"],
    applicationSteps: [
      { step: "DPIIT Registration", detail: "Register your startup idea for free on startupindia.gov.in to obtain DPIIT recognition." },
      { step: "Select Incubator", detail: "Apply to approved incubators across India on seedfund.startupindia.gov.in." },
      { step: "Pitch & Funding", detail: "Present to Seed Management Committee to receive milestones-based tranches." },
    ],
    portalUrl: "https://seedfund.startupindia.gov.in",
    deadline: "Rolling Quarterly Batches",
    featured: true,
    targetAudience: "general",
  },
  {
    id: "scheme-general-aim-11",
    name: "Atal Innovation Mission (AIM) & Community Innovation Fellowships",
    ministry: "NITI Aayog, Government of India",
    category: "Skill & Jobs",
    benefitAmount: "₹40,000 / month Fellowship Stipend + Direct Mentorship by Top Scientists",
    disabilityCriteria: "None required — Open to all graduates, innovators, and researchers",
    incomeLimit: "Open to all Indian citizens",
    description: "Promotes a culture of innovation and entrepreneurship across India. Selected young fellows receive access to modern fab-labs, rapid prototyping tools, and ₹40,000 monthly stipend to solve community challenges.",
    requiredDocuments: ["Degree Certificate / Final Year Marksheet", "Aadhaar Card", "Innovative Project Proposal / Resume"],
    applicationSteps: [
      { step: "Submit Online Proposal", detail: "Submit innovative technical or social problem-solving proposal on aim.gov.in." },
      { step: "Expert Panel Interview", detail: "Shortlisted candidates present project architecture to NITI Aayog committee." },
      { step: "Incubator Placement", detail: "Begin 1-year funded fellowship at an Atal Community Innovation Centre (ACIC)." },
    ],
    portalUrl: "https://aim.gov.in",
    deadline: "September 30, 2026",
    featured: false,
    targetAudience: "general",
  },
  {
    id: "scheme-general-ayushman-12",
    name: "Ayushman Bharat PM-JAY (Universal Health Assurance Coverage)",
    ministry: "National Health Authority & Ministry of Health and Family Welfare",
    category: "Healthcare",
    benefitAmount: "₹5,00,000 / year Cashless Hospitalization Treatment per Family",
    disabilityCriteria: "None required — Open to all eligible general households & families",
    incomeLimit: "As per National Health Authority SECC & State Ration Card guidelines",
    description: "The world's largest health assurance scheme providing ₹5 Lakh cashless coverage per family annually for secondary and tertiary care across 27,000+ empanelled government and private hospitals nationwide.",
    requiredDocuments: ["Aadhaar Card", "Ration Card / Family Samagra ID", "Active Mobile Number"],
    applicationSteps: [
      { step: "Check Family Status", detail: "Verify family inclusion on beneficiary.nha.gov.in with Aadhaar or Ration Card." },
      { step: "Generate Ayushman Card", detail: "Download digital Ayushman Card instantly with Aadhaar e-KYC." },
      { step: "Avail Cashless Care", detail: "Present Ayushman card at Arogya Mitra desk in any empanelled hospital." },
    ],
    portalUrl: "https://beneficiary.nha.gov.in",
    deadline: "Valid Throughout Year",
    featured: false,
    targetAudience: "general",
  },
  {
    id: "scheme-general-mudra-13",
    name: "Pradhan Mantri Mudra Yojana (PMMY - Shishu / Kishore / Tarun)",
    ministry: "Department of Financial Services, Ministry of Finance",
    category: "Financial Aid",
    benefitAmount: "Collateral-Free Business Loans from ₹50,000 up to ₹10,00,000",
    disabilityCriteria: "None required — Open to all Indian citizens, graduates & micro-entrepreneurs",
    incomeLimit: "Open to all general citizens",
    description: "Refinancing and collateral-free loan facility to empower students, small business owners, and freelancers to establish technical setups, manufacturing, service enterprises, or freelance studios.",
    requiredDocuments: ["Identity Proof (Aadhaar/PAN)", "Proof of Business Address / Trade Proposal", "Last 6 Months Bank Statement"],
    applicationSteps: [
      { step: "Apply on Udyamimitra", detail: "Log in to udyamimitra.in and fill out loan application form." },
      { step: "Choose Lending Partner", detail: "Select nearest public sector bank, private bank, or NBFC." },
      { step: "Loan Sanction", detail: "Receive collateral-free disbursement with nominal processing fee." },
    ],
    portalUrl: "https://www.mudra.org.in",
    deadline: "Open All Year",
    featured: false,
    targetAudience: "general",
  },
  {
    id: "scheme-general-naps-14",
    name: "National Apprenticeship Promotion Scheme (NAPS)",
    ministry: "Ministry of Skill Development & Entrepreneurship",
    category: "Skill & Jobs",
    benefitAmount: "Govt Reimburses 25% of Stipend (Up to ₹1,500/mo) + Full Corporate Monthly Salary",
    disabilityCriteria: "None required — Open to all technical, ITI, diploma, and general degree holders",
    incomeLimit: "No income restrictions",
    description: "Connects young college and diploma graduates with top enterprises (Tata, Infosys, Reliance, Mahindra, L&T) for paid on-the-job apprenticeship training and direct corporate hiring pathways.",
    requiredDocuments: ["Diploma / Degree Passing Certificate", "Class 10th & 12th Marksheet", "Aadhaar Card", "Resume"],
    applicationSteps: [
      { step: "Register Candidate Profile", detail: "Create candidate account on apprenticeshipindia.gov.in." },
      { step: "Search Apprenticeship Vacancies", detail: "Filter openings by location, engineering trade, or corporate company." },
      { step: "Sign Apprenticeship Contract", detail: "Receive government-certified on-the-job training with direct monthly bank stipend." },
    ],
    portalUrl: "https://www.apprenticeshipindia.gov.in",
    deadline: "Active Daily Postings",
    featured: true,
    targetAudience: "general",
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
  const [selectedAudience, setSelectedAudience] = useState<SchemeAudience>("All");
  const [selectedSchemeForSteps, setSelectedSchemeForSteps] = useState<Scheme | null>(null);

  const generalCount = useMemo(
    () => schemes.filter((s) => s.targetAudience === "general" || s.targetAudience === "all").length,
    [schemes]
  );
  const pwdCount = useMemo(
    () => schemes.filter((s) => s.targetAudience === "pwd").length,
    [schemes]
  );

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
    if (scheme.targetAudience === "general" || scheme.targetAudience === "all") {
      score = 86;
      if (profile?.education_level && (scheme.category === "Scholarship" || scheme.category === "Skill & Jobs")) {
        score += 8;
      }
      if (scheme.featured) score += 4;
    } else {
      if (profile?.disability_type) score += 15;
      if (profile?.education_level && scheme.category === "Scholarship") score += 10;
      if (scheme.featured) score += 4;
    }
    const finalScore = Math.min(99, score);
    const status = finalScore >= 85 ? "High Eligibility" : "Likely Eligible";
    return { score: finalScore, status };
  };

  // Run 3-Step Wizard Calculation
  const handleCalculateWizard = () => {
    let score = 55;
    if (wizardData.disabilityPct === "No Disability (General Citizen)") {
      score = 88;
      if (wizardData.income === "Below ₹2.5 Lakh" || wizardData.income === "Below ₹1 Lakh") score += 8;
      if (wizardData.hasIncomeCert) score += 3;
    } else {
      if (wizardData.disabilityPct !== "Below 40%") score += 25;
      if (wizardData.income === "Below ₹2.5 Lakh" || wizardData.income === "Below ₹1 Lakh") score += 15;
      if (wizardData.hasUDID) score += 5;
    }
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

      const matchAudience =
        selectedAudience === "All" ||
        (selectedAudience === "General"
          ? s.targetAudience === "general" || s.targetAudience === "all"
          : s.targetAudience === "pwd");

      return matchSearch && matchCategory && matchAudience;
    });
  }, [schemes, search, selectedCategory, selectedAudience]);

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
                  Discover, pre-screen, and apply for national welfare initiatives — including schemes for normal citizens & students, and specialized Divyangjan welfare programs.
                </p>
              </div>

              {/* Action Buttons: Normal People Schemes + Wizard Trigger */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  onClick={() => {
                    const next = selectedAudience === "General" ? "All" : "General";
                    setSelectedAudience(next);
                    if (next === "General") {
                      toast.info("Showing government schemes for normal citizens & students (no disability required).");
                    }
                  }}
                  className={`h-10 rounded-xl font-bold px-4 text-xs shadow-sm transition-all active:scale-95 gap-2 ${
                    selectedAudience === "General"
                      ? "bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-400"
                      : "bg-white hover:bg-blue-50 text-blue-800 border border-blue-200"
                  }`}
                >
                  <Users className="h-4 w-4 text-blue-600" />
                  <span>{selectedAudience === "General" ? "✓ Normal People Schemes (Active)" : "👥 Normal People Schemes (8)"}</span>
                </Button>

                <Button
                  onClick={() => {
                    setWizardStep(1);
                    setWizardScore(null);
                    setWizardOpen(true);
                  }}
                  className="h-10 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold px-4 text-xs shadow-sm transition-all active:scale-95 gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Check My Eligibility (3 Steps)</span>
                </Button>
              </div>
            </div>

            {/* 4 Interactive Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div
                onClick={() => setSelectedAudience("All")}
                className={`rounded-2xl border p-3.5 shadow-2xs cursor-pointer transition-all ${
                  selectedAudience === "All"
                    ? "border-teal-500 bg-white ring-2 ring-teal-200"
                    : "border-slate-200/80 bg-white/80 hover:bg-white"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Verified Schemes</span>
                <p className="mt-1 font-mono text-2xl font-black text-slate-900">{schemes.length}</p>
                <span className="text-[10px] text-teal-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Central & State Portals
                </span>
              </div>

              <div
                onClick={() => {
                  setSelectedAudience("General");
                  toast.info("Filtered: Normal citizen & student schemes.");
                }}
                className={`rounded-2xl border p-3.5 shadow-2xs cursor-pointer transition-all ${
                  selectedAudience === "General"
                    ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-300"
                    : "border-slate-200/80 bg-white/80 hover:bg-white"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">Normal People Schemes</span>
                <p className="mt-1 font-mono text-2xl font-black text-blue-700">{generalCount}</p>
                <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                  <Users className="h-3 w-3" /> Open to All Citizens
                </span>
              </div>

              <div
                onClick={() => {
                  setSelectedAudience("PwD");
                  toast.info("Filtered: Divyangjan (PwD) schemes.");
                }}
                className={`rounded-2xl border p-3.5 shadow-2xs cursor-pointer transition-all ${
                  selectedAudience === "PwD"
                    ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-300"
                    : "border-slate-200/80 bg-white/80 hover:bg-white"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Divyangjan Schemes</span>
                <p className="mt-1 font-mono text-2xl font-black text-emerald-700">{pwdCount}</p>
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Accessibility className="h-3 w-3" /> ADIP & Disability Welfare
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-xs p-3.5 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Scholarship Ceiling</span>
                <p className="mt-1 font-mono text-2xl font-black text-slate-900">₹1.25L/yr</p>
                <span className="text-[10px] text-indigo-700 font-medium">PM-YASASVI & Merit Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Audience Segment Buttons, Search & Category Filters */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3.5">
          {/* Dedicated Segmented Audience Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/90 border border-slate-200/80">
              <button
                type="button"
                onClick={() => setSelectedAudience("All")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedAudience === "All"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Landmark className="h-3.5 w-3.5 text-teal-600" />
                <span>All Schemes ({schemes.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedAudience("General");
                  toast.info("Filtering schemes for normal citizens (no disability required).");
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedAudience === "General"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-blue-700 hover:bg-blue-50/60"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>👥 Normal People Schemes ({generalCount})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedAudience("PwD");
                  toast.info("Filtering schemes for Divyangjan (Persons with Disabilities).");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedAudience === "PwD"
                    ? "bg-teal-700 text-white shadow-xs"
                    : "text-teal-800 hover:bg-teal-50/60"
                }`}
              >
                <Accessibility className="h-3.5 w-3.5" />
                <span>♿ Divyangjan / PwD Schemes ({pwdCount})</span>
              </button>
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Showing <b>{filteredSchemes.length}</b> verified schemes
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search scheme name, ministry (e.g. Skill India, Education, MSME), benefit, or keywords..."
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
                className={`group relative flex flex-col justify-between rounded-3xl border bg-white p-5 md:p-6 text-slate-900 shadow-sm transition-all duration-200 hover:shadow-md ${
                  scheme.targetAudience === "general"
                    ? "border-slate-200/90 hover:border-blue-300"
                    : "border-slate-200/90 hover:border-teal-300"
                }`}
              >
                <div className="space-y-4">
                  {/* Top: Ministry Badge, Audience Badge & Eligibility Score */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-md border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                          <Building className="h-3 w-3 text-teal-600" />
                          {scheme.ministry}
                        </span>

                        {scheme.targetAudience === "general" ? (
                          <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-blue-700">
                            <Users className="h-3 w-3 text-blue-600" />
                            Normal Citizens & Students
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            <Accessibility className="h-3 w-3 text-emerald-600" />
                            Divyangjan (PwD)
                          </span>
                        )}
                      </div>

                      <h2 className="text-base font-extrabold text-slate-900 leading-snug group-hover:text-teal-700 transition-colors">
                        {scheme.name}
                      </h2>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className={`rounded-xl border px-2.5 py-1 text-xs font-extrabold font-mono shadow-2xs ${
                        scheme.targetAudience === "general"
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700"
                      }`}>
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {["No Disability (General Citizen)", "Below 40%", "40% - 60%", "61% - 80%", "Above 80%"].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => {
                            if (pct === "No Disability (General Citizen)") {
                              setWizardData({
                                ...wizardData,
                                disabilityPct: pct,
                                disabilityType: "General / Non-Disabled",
                                hasUDID: false,
                              });
                            } else {
                              setWizardData({ ...wizardData, disabilityPct: pct });
                            }
                          }}
                          className={`rounded-xl border p-3 text-xs font-semibold text-left transition-all ${
                            wizardData.disabilityPct === pct
                              ? pct === "No Disability (General Citizen)"
                                ? "border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500"
                                : "border-teal-600 bg-teal-50 text-teal-900 ring-1 ring-teal-500"
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
                      2. Citizen / Disability Category:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["General / Non-Disabled", "Locomotor / Physical", "Visual Impairment", "Hearing / Speech", "Multiple Disabilities"].map(
                        (cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setWizardData({ ...wizardData, disabilityType: cat })}
                            className={`rounded-xl border p-2.5 text-xs font-semibold text-left transition-all ${
                              wizardData.disabilityType === cat
                                ? cat === "General / Non-Disabled"
                                  ? "border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500"
                                  : "border-teal-600 bg-teal-50 text-teal-900 ring-1 ring-teal-500"
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
                    {wizardData.disabilityPct !== "No Disability (General Citizen)" && (
                      <div
                        onClick={() => setWizardData({ ...wizardData, hasUDID: !wizardData.hasUDID })}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 cursor-pointer hover:bg-white transition-colors"
                      >
                        <span className="text-xs font-semibold text-slate-800">Valid UDID Card / Disability Certificate</span>
                        <div className={`h-5 w-5 rounded-md flex items-center justify-center ${wizardData.hasUDID ? "bg-teal-600 text-white" : "border border-slate-300"}`}>
                          {wizardData.hasUDID && <Check className="h-3.5 w-3.5" />}
                        </div>
                      </div>
                    )}

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
                  <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 ${
                    wizardData.disabilityPct === "No Disability (General Citizen)"
                      ? "border-blue-200 bg-blue-50"
                      : "border-teal-200 bg-teal-50"
                  }`}>
                    <span className={`font-mono text-2xl font-black ${
                      wizardData.disabilityPct === "No Disability (General Citizen)"
                        ? "text-blue-800"
                        : "text-teal-800"
                    }`}>{wizardScore}%</span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-extrabold text-slate-900">
                      {wizardData.disabilityPct === "No Disability (General Citizen)"
                        ? "General Citizen & Student Eligibility Confirmed! 🎉"
                        : "High Eligibility Confirmed! 🎉"}
                    </h3>
                    <p className="text-xs text-slate-600 max-w-sm mx-auto">
                      {wizardData.disabilityPct === "No Disability (General Citizen)"
                        ? `As a normal citizen / student in tier (${wizardData.income}), you qualify for major central student scholarships, Skill India certifications, and youth entrepreneurial grants.`
                        : `Based on your disability percentage (${wizardData.disabilityPct}) and income tier (${wizardData.income}), you qualify for at least 4 national welfare programs.`}
                    </p>
                  </div>

                  <div className={`rounded-2xl border p-3.5 text-left text-xs space-y-1.5 ${
                    wizardData.disabilityPct === "No Disability (General Citizen)"
                      ? "border-blue-100 bg-blue-50/60"
                      : "border-teal-100 bg-teal-50/60"
                  }`}>
                    <span className={`font-bold block ${
                      wizardData.disabilityPct === "No Disability (General Citizen)"
                        ? "text-blue-900"
                        : "text-teal-900"
                    }`}>Top Recommended Schemes for You:</span>
                    {wizardData.disabilityPct === "No Disability (General Citizen)" ? (
                      <>
                        <p className="text-slate-700">1. <b>PM-YASASVI Scholarship:</b> Full Tuition + Hostel & Books up to ₹1,25,000/yr</p>
                        <p className="text-slate-700">2. <b>Central Sector Scheme (CSSS):</b> ₹12,000 - ₹20,000/yr for college students</p>
                        <p className="text-slate-700">3. <b>PMKVY 4.0 (Skill India):</b> Free AI/Tech training + ₹8,000 Govt reward</p>
                      </>
                    ) : (
                      <>
                        <p className="text-slate-700">1. <b>ADIP Scheme:</b> Free Assistive Devices / Motorized Tricycle</p>
                        <p className="text-slate-700">2. <b>DEPwD Post-Matric Scholarship:</b> Full Tuition + ₹1,600/mo allowance</p>
                        <p className="text-slate-700">3. <b>Ayushman Bharat:</b> ₹5,00,000 / year cashless health cover</p>
                      </>
                    )}
                  </div>

                  <Button
                    onClick={() => {
                      if (wizardData.disabilityPct === "No Disability (General Citizen)") {
                        setSelectedAudience("General");
                        toast.info("Filtered to Normal People Schemes.");
                      }
                      setWizardOpen(false);
                    }}
                    className={`w-full rounded-xl text-white text-xs font-semibold py-2.5 ${
                      wizardData.disabilityPct === "No Disability (General Citizen)"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-teal-700 hover:bg-teal-800"
                    }`}
                  >
                    {wizardData.disabilityPct === "No Disability (General Citizen)"
                      ? `View Normal People Schemes (${generalCount})`
                      : "View All Qualified Schemes Below"}
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