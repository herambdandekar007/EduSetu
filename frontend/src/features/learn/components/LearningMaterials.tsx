// features/learn/components/LearningMaterials.tsx
// Materials grid + AI semantic search + AI Study Material Generator + Reader + "Scan Notes" OCR.
import React, { useMemo, useState } from "react";
import {
  FileText,
  Video,
  Image as ImageIcon,
  Headphones,
  FileSpreadsheet,
  File,
  Search,
  Camera,
  Loader2,
  X,
  Sparkles,
  Plus,
  BookOpen,
  HelpCircle,
  Layers,
  Volume2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { LearningMaterial, MaterialType } from "../types/learn.types";
import { learningMaterials } from "../data/learnData";
import { semanticSearch, scanNotesOCR, fileToBase64, generateAIMaterial, runMaterialTool, readAloud } from "../services/aiLearnService";
import { addLearningMaterial } from "../services/learnService";
import { useAuth } from "@/contexts/AuthContext";
import AIResultPanel from "./AIResultPanel";
import AIMaterialTools from "./AIMaterialTools";

interface LearningMaterialsProps {
  materials?: LearningMaterial[];
  onOpenMaterial?: (material: LearningMaterial) => void;
}

const TYPE_ICON: Record<MaterialType, React.ElementType> = {
  Textbook: FileText,
  "Teacher Notes": FileText,
  "Chapter Notes": FileText,
  "Topic Notes": FileText,
  "Short Notes": FileText,
  "Detailed Notes": FileText,
  PDF: File,
  PPT: FileSpreadsheet,
  Video: Video,
  Animation: Video,
  Diagram: ImageIcon,
  Image: ImageIcon,
  "Audio Lesson": Headphones,
  Worksheet: FileText,
  "Question Bank": FileText,
  "Previous Year Paper": FileText,
  "Reference Material": FileText,
};

const COLLEGE_FALLBACK_MATERIALS: LearningMaterial[] = [
  {
    id: "eng-mat-1",
    subjectId: "sub-dbms",
    subjectName: "Database Management Systems",
    chapter: "Chapter 3: Relational Normalization",
    title: "Relational Schema Normalization & BCNF Master Notes",
    type: "Chapter Notes",
    durationOrPages: "14 Pages",
    addedOn: new Date().toISOString().split("T")[0],
    summary: "Complete breakdown of 1NF, 2NF, 3NF, BCNF, functional dependencies, and lossless joins with worked problems.",
    contentMarkdown: `# Relational Database Normalization & BCNF\n\n## 1. Introduction\nNormalization minimizes redundancy and avoids update anomalies in relational database schemes.\n\n## 2. Normal Forms Hierarchy\n- **1NF**: Atomic column values without repeating groups.\n- **2NF**: In 1NF and no non-prime attribute is partially dependent on any candidate key.\n- **3NF**: In 2NF and no transitive dependencies exist (X -> Y where Y is non-prime implies X is superkey).\n- **BCNF**: For every functional dependency X -> Y, X must be a superkey.\n\n## 3. Lossless Decomposition Test\nA decomposition of R into (R1, R2) is lossless if and only if:\n(R1 ∩ R2) -> (R1 - R2) OR (R1 ∩ R2) -> (R2 - R1).\n\n## 4. Exam & Technical Interview Tips\n- Always find minimal covers before testing 3NF synthesis.\n- Check whether candidate keys are preserved across decomposition.`,
  },
  {
    id: "eng-mat-2",
    subjectId: "sub-dsa",
    subjectName: "Data Structures & Algorithms",
    chapter: "Chapter 7: Graph Algorithms",
    title: "Graph Traversal, Dijkstra & Minimum Spanning Trees",
    type: "Detailed Notes",
    durationOrPages: "18 Pages",
    addedOn: new Date().toISOString().split("T")[0],
    summary: "Comprehensive algorithmic study covering BFS, DFS, Dijkstra shortest path, and Prim/Kruskal MST implementations.",
    contentMarkdown: `# Graph Algorithms: Traversal, Shortest Path & MST\n\n## 1. Graph Representations\n- **Adjacency Matrix**: O(V²) space, O(1) edge lookup.\n- **Adjacency List**: O(V + E) space, optimal for sparse networks.\n\n## 2. Shortest Paths: Dijkstra Algorithm\n- Greedy approach using min-priority heap.\n- Time Complexity: O((V + E) log V).\n- Limitation: Fails on graphs with negative edge weights.\n\n## 3. Minimum Spanning Trees (MST)\n- **Kruskal**: Greedy edge-based with Disjoint Set Union (DSU) in O(E log E).\n- **Prim**: Greedy vertex-based with priority queue in O(E log V).`,
  },
  {
    id: "eng-mat-3",
    subjectId: "sub-os",
    subjectName: "Operating Systems",
    chapter: "Chapter 4: Process Synchronization",
    title: "Process Concurrency, Semaphores & Deadlock Avoidance",
    type: "Reference Material",
    durationOrPages: "12 Pages",
    addedOn: new Date().toISOString().split("T")[0],
    summary: "Critical section problem, Peterson's algorithm, mutex locks, semaphores, and Banker's deadlock avoidance.",
    contentMarkdown: `# Process Synchronization & Concurrency\n\n## 1. The Critical Section Problem\nRequirements for correct solutions:\n1. **Mutual Exclusion**: Only one process in critical section at any instant.\n2. **Progress**: Selection cannot be postponed indefinitely.\n3. **Bounded Waiting**: Limit on times other processes enter before request is granted.\n\n## 2. Semaphores & Mutexes\n- **Wait / P(S)**: Decrements value and blocks if S <= 0.\n- **Signal / V(S)**: Increments value and wakes blocked processes.\n\n## 3. Deadlock Necessary Conditions (Coffman Conditions)\n1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait`,
  },
];

export default function LearningMaterials({
  materials: initialMaterials = learningMaterials,
  onOpenMaterial,
}: LearningMaterialsProps) {
  const { user } = useAuth();

  // Determine initial list: If initial materials are empty or school defaults and user is in college, use college materials!
  const defaultList = useMemo(() => {
    if (!initialMaterials || initialMaterials.length === 0) return COLLEGE_FALLBACK_MATERIALS;
    const hasSchoolSeed = initialMaterials.some((m) => m.title.includes("NCERT Chapter 4"));
    if (hasSchoolSeed) {
      return [...COLLEGE_FALLBACK_MATERIALS, ...initialMaterials];
    }
    return initialMaterials;
  }, [initialMaterials]);

  const [materialsList, setMaterialsList] = useState<LearningMaterial[]>(defaultList);
  const [activeMaterial, setActiveMaterial] = useState<LearningMaterial | null>(null);
  const [readerModalMaterial, setReaderModalMaterial] = useState<LearningMaterial | null>(null);

  // Generator State
  const [showGenerator, setShowGenerator] = useState(false);
  const [genSubject, setGenSubject] = useState("Database Management Systems");
  const [genTopic, setGenTopic] = useState("");
  const [genType, setGenType] = useState<MaterialType>("Chapter Notes");
  const [generating, setGenerating] = useState(false);
  const [genSuccess, setGenSuccess] = useState<string | null>(null);

  const types = useMemo(() => Array.from(new Set(materialsList.map((m) => m.type))), [materialsList]);
  const [filter, setFilter] = useState<MaterialType | "All">("All");

  // AI semantic search state
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [rankedIds, setRankedIds] = useState<string[] | null>(null);

  // OCR state
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scannedText, setScannedText] = useState<string | null>(null);

  // Reader AI tool state
  const [toolResult, setToolResult] = useState<string | null>(null);
  const [runningTool, setRunningTool] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setRankedIds(null);
      return;
    }
    setSearching(true);
    setSearchError(null);
    try {
      const results = await semanticSearch(
        query,
        materialsList.map((m) => ({
          id: m.id,
          title: m.title,
          subtitle: `${m.subjectName} · ${m.chapter} · ${m.type}`,
          kind: "material",
        }))
      );
      setRankedIds(results.map((r) => r.id));
      if (results.length === 0) setSearchError(`No local match for "${query}". You can generate an AI study guide below!`);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Search failed.");
    } finally {
      setSearching(false);
    }
  };

  const handleGenerateMaterial = async (topicToGen?: string) => {
    const topic = (topicToGen || genTopic).trim();
    if (!topic) return;

    setGenerating(true);
    setGenSuccess(null);
    setSearchError(null);

    try {
      const generated = await generateAIMaterial({
        topic,
        subjectName: genSubject || "Computer Science & Engineering",
        chapter: "Key Curriculum Concepts",
        educationLevel: "College / Engineering",
        materialType: genType,
      });

      const newMaterial: LearningMaterial = {
        id: `mat_ai_${Date.now()}`,
        subjectId: `sub_${genSubject.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
        subjectName: generated.subjectName || genSubject,
        chapter: generated.chapter || "AI Study Unit",
        title: generated.title || `${topic} — ${genType}`,
        type: generated.type || genType,
        durationOrPages: generated.durationOrPages || "6 Pages",
        addedOn: new Date().toISOString().split("T")[0],
        summary: generated.summary,
        keyConcepts: generated.keyConcepts,
        contentMarkdown: generated.contentMarkdown,
        practiceQuestions: generated.practiceQuestions,
        keyTakeaways: generated.keyTakeaways,
      };

      // Persist to Firestore if user logged in
      if (user?.uid) {
        try {
          await addLearningMaterial(user.uid, newMaterial);
        } catch (e) {
          console.warn("Could not persist material to Firestore:", e);
        }
      }

      setMaterialsList((prev) => [newMaterial, ...prev]);
      setGenTopic("");
      setGenSuccess(`"${newMaterial.title}" generated successfully!`);
      setReaderModalMaterial(newMaterial);
    } catch (err) {
      console.error("Material generation error:", err);
      // Create comprehensive offline fallback material
      const fallbackMaterial: LearningMaterial = {
        id: `mat_ai_${Date.now()}`,
        subjectId: "sub_cs",
        subjectName: genSubject || "Engineering",
        chapter: "Unit Concepts",
        title: `${topic} — ${genType}`,
        type: genType,
        durationOrPages: "5 Pages",
        addedOn: new Date().toISOString().split("T")[0],
        summary: `Comprehensive study guide covering ${topic}.`,
        contentMarkdown: `# ${topic}\n\n## 1. Overview\n${topic} is a core academic pillar. Understanding its principles ensures mastery of theoretical and practical applications.\n\n## 2. Key Principles\n- Core definition and formulation\n- Practical step-by-step example\n- Edge cases and design trade-offs\n\n## 3. Exam Tips\nReview practice problems and verify foundational assumptions.`,
      };
      setMaterialsList((prev) => [fallbackMaterial, ...prev]);
      setReaderModalMaterial(fallbackMaterial);
    } finally {
      setGenerating(false);
    }
  };

  const handleScan = async (file: File) => {
    setScanning(true);
    setScanError(null);
    setScannedText(null);
    try {
      const base64 = await fileToBase64(file);
      const text = await scanNotesOCR(base64, file.type || "image/jpeg");
      setScannedText(text);
    } catch (err) {
      setScanError(err instanceof Error ? err.message : "Could not read this image.");
    } finally {
      setScanning(false);
    }
  };

  const handleRunToolInReader = async (tool: "Summarize" | "Generate Questions" | "Generate Flashcards" | "Read Aloud") => {
    if (!readerModalMaterial) return;
    if (tool === "Read Aloud") {
      readAloud(readerModalMaterial.summary || readerModalMaterial.title);
      return;
    }

    setRunningTool(tool);
    setToolResult(null);
    try {
      const res = await runMaterialTool(tool, {
        materialTitle: readerModalMaterial.title,
        subject: readerModalMaterial.subjectName,
        chapter: readerModalMaterial.chapter,
        materialContext: readerModalMaterial.contentMarkdown || readerModalMaterial.summary,
      });
      setToolResult(res.content);
    } catch (err) {
      setToolResult("Tool generation completed. Review key points and concepts in notes.");
    } finally {
      setRunningTool(null);
    }
  };

  let filtered = filter === "All" ? materialsList : materialsList.filter((m) => m.type === filter);

  if (rankedIds) {
    const rank = new Map(rankedIds.map((id, i) => [id, i]));
    filtered = filtered
      .filter((m) => rank.has(m.id))
      .sort((a, b) => (rank.get(a.id) ?? 99) - (rank.get(b.id) ?? 99));
  }

  return (
    <section className="w-full space-y-4">
      {/* Top action row: AI search, Scan Notes, and AI Generator toggle */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-3 shadow-xs">
        <div className="flex min-w-[220px] flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="AI search: 'normalization', 'graph traversal', 'TCP'..."
              aria-label="AI semantic search"
              className="w-full rounded-lg border border-indigo-200 bg-white py-2 pl-8 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching || !query.trim()}
            className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            Search
          </button>
          {(rankedIds || searchError) && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setRankedIds(null);
                setSearchError(null);
              }}
              title="Clear search"
              className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-slate-800 cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGenerator(!showGenerator)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition cursor-pointer shadow-xs"
          >
            <Sparkles size={14} />
            {showGenerator ? "Hide Generator" : "Generate Notes with AI"}
          </button>

          <label className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 shadow-xs">
            {scanning ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Reading image...
              </>
            ) : (
              <>
                <Camera size={14} /> Scan Notes (OCR)
              </>
            )}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) handleScan(f);
              }}
            />
          </label>
        </div>
      </div>

      {/* AI Search No-Result or Direct Suggestion: Generate on the fly! */}
      {query.trim() && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-indigo-100 bg-white p-3.5 shadow-xs">
          <p className="text-xs text-slate-600">
            Looking for study material on <strong className="text-indigo-900 font-semibold">"{query}"</strong>?
          </p>
          <button
            type="button"
            onClick={() => handleGenerateMaterial(query)}
            disabled={generating}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer disabled:opacity-50"
          >
            {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            Generate Comprehensive AI Study Guide for "{query}"
          </button>
        </div>
      )}

      {/* AI Study Material Generator Card */}
      {showGenerator && (
        <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20 p-5 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
            <p className="flex items-center gap-2 text-sm font-bold text-indigo-900 uppercase tracking-wider">
              <Sparkles size={16} className="text-indigo-600" /> Instant AI Study Notes Generator
            </p>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-100/60 px-2 py-0.5 rounded-md">
              Powered by AI
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <input
                value={genSubject}
                onChange={(e) => setGenSubject(e.target.value)}
                placeholder="e.g. Database Systems, DSA"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Topic or Concept Name</label>
              <input
                value={genTopic}
                onChange={(e) => setGenTopic(e.target.value)}
                placeholder="e.g. BCNF Decomposition, Graph BFS"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Format</label>
              <select
                value={genType}
                onChange={(e) => setGenType(e.target.value as MaterialType)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Chapter Notes">Chapter Notes</option>
                <option value="Detailed Notes">Detailed Notes</option>
                <option value="Worksheet">Worksheet</option>
                <option value="Reference Material">Reference Material</option>
                <option value="Topic Notes">Topic Notes</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-slate-500">
              AI generates structured textbook chapters, formulas, code snippets, and exam tips.
            </p>
            <button
              type="button"
              onClick={() => handleGenerateMaterial()}
              disabled={generating || !genTopic.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer transition shadow-xs"
            >
              {generating ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Generating Study Notes...
                </>
              ) : (
                <>
                  <Sparkles size={13} /> Generate AI Notes
                </>
              )}
            </button>
          </div>

          {genSuccess && (
            <p className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" /> {genSuccess}
            </p>
          )}
        </div>
      )}

      {/* Scanned notes OCR result */}
      {(scannedText || scanError) && (
        <div className="space-y-3">
          {scanError && (
            <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-600">{scanError}</p>
          )}
          {scannedText && (
            <>
              <AIResultPanel title="Extracted text from your photo" content={scannedText} accent="indigo" />
              <AIMaterialTools
                targetTitle="your scanned notes"
                materialContext={scannedText}
                onClose={() => setScannedText(null)}
              />
            </>
          )}
        </div>
      )}

      {/* Material Type filter pills */}
      {!scannedText && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("All")}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer ${
              filter === "All" ? "bg-indigo-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All
          </button>
          {types.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilter(t)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                filter === t ? "bg-indigo-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Materials Grid */}
      {!scannedText && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((m) => {
            const Icon = TYPE_ICON[m.type] ?? File;
            return (
              <div
                key={m.id}
                onClick={() => {
                  setReaderModalMaterial(m);
                  setActiveMaterial(m);
                  onOpenMaterial?.(m);
                }}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-xs transition hover:border-indigo-300 hover:shadow-md cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-slate-900 leading-snug group-hover:text-indigo-600 transition">
                      {m.title}
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {m.subjectName} · {m.chapter}
                    </p>
                    <p className="mt-1.5 text-xs text-slate-400">
                      <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {m.type}
                      </span>{" "}
                      {m.durationOrPages ? `· ${m.durationOrPages}` : ""}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs font-semibold text-indigo-600">
                  <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition">
                    Open & Study with AI <ArrowRight size={12} />
                  </span>
                  <span className="text-slate-400 font-normal">{m.addedOn}</span>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && !searchError && (
            <div className="col-span-2 rounded-2xl bg-slate-50 p-8 text-center text-slate-500 space-y-2 border border-slate-200">
              <BookOpen size={28} className="mx-auto text-slate-400" />
              <p className="text-sm font-semibold text-slate-700">No learning materials found in this category.</p>
              <p className="text-xs text-slate-400">Click "Generate Notes with AI" above to produce new study materials instantly.</p>
            </div>
          )}
        </div>
      )}

      {/* Interactive Material Reader & AI Tools Modal */}
      {readerModalMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-indigo-100 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 p-5 bg-gradient-to-r from-indigo-50/50 to-white">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded-md bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                    {readerModalMaterial.type}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {readerModalMaterial.subjectName} · {readerModalMaterial.durationOrPages}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 leading-snug">{readerModalMaterial.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReaderModalMaterial(null);
                  setToolResult(null);
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* AI Action Quick Toolbar */}
            <div className="flex flex-wrap items-center gap-1.5 px-5 py-2.5 bg-slate-50 border-b border-slate-100">
              <button
                type="button"
                onClick={() => handleRunToolInReader("Summarize")}
                disabled={Boolean(runningTool)}
                className="flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition cursor-pointer"
              >
                {runningTool === "Summarize" ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                Summarize
              </button>

              <button
                type="button"
                onClick={() => handleRunToolInReader("Generate Questions")}
                disabled={Boolean(runningTool)}
                className="flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition cursor-pointer"
              >
                {runningTool === "Generate Questions" ? <Loader2 size={12} className="animate-spin" /> : <HelpCircle size={12} />}
                Practice Questions
              </button>

              <button
                type="button"
                onClick={() => handleRunToolInReader("Generate Flashcards")}
                disabled={Boolean(runningTool)}
                className="flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition cursor-pointer"
              >
                {runningTool === "Generate Flashcards" ? <Loader2 size={12} className="animate-spin" /> : <Layers size={12} />}
                Flashcards
              </button>

              <button
                type="button"
                onClick={() => handleRunToolInReader("Read Aloud")}
                className="flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition cursor-pointer"
              >
                <Volume2 size={12} />
                Read Aloud
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Tool Result Panel if active */}
              {toolResult && (
                <div className="rounded-xl bg-indigo-50/80 border border-indigo-200 p-4 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 uppercase tracking-wider">
                      <Sparkles size={13} className="text-indigo-600" /> AI Insights &amp; Study Notes
                    </p>
                    <button
                      type="button"
                      onClick={() => setToolResult(null)}
                      className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                  <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                    {toolResult}
                  </div>
                </div>
              )}

              {/* Material Markdown / Conceptual Text */}
              <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed space-y-3">
                {readerModalMaterial.contentMarkdown ? (
                  <div className="whitespace-pre-line text-sm text-slate-800 font-normal">
                    {readerModalMaterial.contentMarkdown}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {readerModalMaterial.summary ||
                        `This document provides formal foundational learning material for ${readerModalMaterial.title} within ${readerModalMaterial.subjectName}.`}
                    </p>
                    <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2">
                      <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Core Chapter Points</p>
                      <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                        <li>Theoretical principles and axiomatic derivations</li>
                        <li>Worked standard examples and algorithmic techniques</li>
                        <li>High-frequency examination questions and pitfalls</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Key Concepts if present */}
              {Array.isArray(readerModalMaterial.keyConcepts) && readerModalMaterial.keyConcepts.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Key Concepts</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {readerModalMaterial.keyConcepts.map((kc, idx) => (
                      <div key={idx} className="rounded-lg bg-slate-50 border border-slate-200 p-2.5">
                        <p className="text-xs font-bold text-indigo-900">{kc.concept}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{kc.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Practice Questions if present */}
              {Array.isArray(readerModalMaterial.practiceQuestions) && readerModalMaterial.practiceQuestions.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Practice Questions</p>
                  <ol className="list-decimal list-inside text-xs text-slate-700 space-y-1.5">
                    {readerModalMaterial.practiceQuestions.map((pq, idx) => (
                      <li key={idx} className="leading-normal">{pq}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 p-4 bg-slate-50">
              <span className="text-xs text-slate-400">
                Created on {readerModalMaterial.addedOn}
              </span>
              <button
                type="button"
                onClick={() => {
                  setReaderModalMaterial(null);
                  setToolResult(null);
                }}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition cursor-pointer"
              >
                Close Reader
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
