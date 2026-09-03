// features/learn/components/LearningMaterials.tsx
// Materials grid + AI semantic search (NVIDIA embeddings) + "Scan Notes" OCR.
import React, { useMemo, useState } from "react";
import { FileText, Video, Image as ImageIcon, Headphones, FileSpreadsheet, File, Search, Camera, Loader2, X } from "lucide-react";
import { LearningMaterial, MaterialType } from "../types/learn.types";
import { learningMaterials } from "../data/learnData";
import { semanticSearch, scanNotesOCR, fileToBase64 } from "../services/aiLearnService";
import AIResultPanel from "./AIResultPanel";
import AIMaterialTools from "./AIMaterialTools";

interface LearningMaterialsProps {
  materials?: LearningMaterial[];
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

export default function LearningMaterials({ materials = learningMaterials }: LearningMaterialsProps) {
  const [activeMaterial, setActiveMaterial] = useState<LearningMaterial | null>(null);
  const types = useMemo(() => Array.from(new Set(materials.map((m) => m.type))), [materials]);
  const [filter, setFilter] = useState<MaterialType | "All">("All");

  // AI semantic search state
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [rankedIds, setRankedIds] = useState<string[] | null>(null);

  // OCR ("Scan Notes") state
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scannedText, setScannedText] = useState<string | null>(null);

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
        materials.map((m) => ({
          id: m.id,
          title: m.title,
          subtitle: `${m.subjectName} · ${m.chapter} · ${m.type}`,
          kind: "material",
        }))
      );
      setRankedIds(results.map((r) => r.id));
      if (results.length === 0) setSearchError("No close matches found — try different words.");
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Search failed.");
    } finally {
      setSearching(false);
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

  let filtered =
    filter === "All" ? materials : materials.filter((m) => m.type === filter);

  // Apply AI relevance ranking when a search is active
  if (rankedIds) {
    const rank = new Map(rankedIds.map((id, i) => [id, i]));
    filtered = filtered
      .filter((m) => rank.has(m.id))
      .sort((a, b) => (rank.get(a.id) ?? 99) - (rank.get(b.id) ?? 99));
  }

  return (
    <section className="w-full space-y-4">
      {/* AI tools row: semantic search + Scan Notes */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-3">
        <div className="flex min-w-[220px] flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="AI search: 'photosynthesis basics', 'algebra practice'..."
              aria-label="AI semantic search"
              className="w-full rounded-lg border border-indigo-200 bg-white py-2 pl-8 pr-3 text-sm outline-none focus:border-indigo-400"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searching || !query.trim()}
            className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            Search
          </button>
          {(rankedIds || searchError) && (
            <button
              onClick={() => {
                setQuery("");
                setRankedIds(null);
                setSearchError(null);
              }}
              title="Clear search"
              className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-slate-800"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <label className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-violet-700">
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

      {searchError && (
        <p className="rounded-lg bg-slate-100 p-3 text-sm text-slate-600">{searchError}</p>
      )}

      {/* Scanned notes result + AI tools bound to the extracted text */}
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

      {!scannedText && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("All")}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              filter === "All" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            All
          </button>
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                filter === t ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {!scannedText && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((m) => {
            const Icon = TYPE_ICON[m.type] ?? File;
            return (
              <button
                key={m.id}
                onClick={() => setActiveMaterial(m)}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-indigo-300 hover:shadow-md"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Icon size={18} />
                </span>
                <span className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{m.title}</p>
                  <p className="text-xs text-slate-500">
                    {m.subjectName} · {m.chapter}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {m.type} {m.durationOrPages ? `· ${m.durationOrPages}` : ""}
                  </p>
                </span>
              </button>
            );
          })}
          {filtered.length === 0 && !searchError && (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No materials found.</p>
          )}
        </div>
      )}

      {!scannedText && activeMaterial && <AIMaterialTools key={activeMaterial.id} material={activeMaterial} />}
    </section>
  );
}
