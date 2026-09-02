import { Search, Mic, Bell, Languages, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";

// ── Language config (self-contained — no external context needed) ──────────
type Lang = "English" | "Hindi" | "Marathi" | "Tamil" | "Telugu" | "Gujarati";

const LANGUAGES: { code: Lang; native: string; flag: string; iso: string }[] = [
  { code: "English",  native: "English",    flag: "🇬🇧", iso: "en" },
  { code: "Hindi",    native: "हिंदी",       flag: "🇮🇳", iso: "hi" },
  { code: "Marathi",  native: "मराठी",       flag: "🇮🇳", iso: "mr" },
  { code: "Tamil",    native: "தமிழ்",       flag: "🇮🇳", iso: "ta" },
  { code: "Telugu",   native: "తెలుగు",      flag: "🇮🇳", iso: "te" },
  { code: "Gujarati", native: "ગુજરાતી",     flag: "🇮🇳", iso: "gu" },
];

// WeakMap to preserve original text nodes
const origMap = new WeakMap<Text, string>();

// Call Google Translate free API — one text at a time
async function translateOne(text: string, iso: string): Promise<string> {
  try {
    const url = new URL("https://translate.googleapis.com/translate_a/single");
    url.searchParams.set("client", "gtx");
    url.searchParams.set("sl", "en");
    url.searchParams.set("tl", iso);
    url.searchParams.set("dt", "t");
    url.searchParams.set("q", text);
    const res = await fetch(url.toString());
    if (!res.ok) return text;
    const data = await res.json();
    return (data[0] as any[][]).map((c) => c[0] as string).join("") || text;
  } catch {
    return text;
  }
}

// Collect all visible text nodes from #root
function getTextNodes(): Text[] {
  const nodes: Text[] = [];
  const SKIP = new Set(["SCRIPT","STYLE","NOSCRIPT","SVG","CANVAS","CODE","PRE","INPUT","TEXTAREA"]);
  const walker = document.createTreeWalker(
    document.getElementById("root") ?? document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (SKIP.has(p.tagName)) return NodeFilter.FILTER_REJECT;
        if (p.getAttribute("aria-hidden") === "true") return NodeFilter.FILTER_REJECT;
        const t = node.textContent?.trim() ?? "";
        if (t.length < 2) return NodeFilter.FILTER_REJECT;
        if (/^[\d\s₹%+/\-.:,()@]+$/.test(t)) return NodeFilter.FILTER_REJECT;
        if (/^https?:\/\//.test(t)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );
  let n: Node | null;
  while ((n = walker.nextNode())) nodes.push(n as Text);
  return nodes;
}

// ── Component ───────────────────────────────────────────────────────────────
const TopBar = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu]         = useState(false);
  const [currentLang, setCurrentLang]   = useState<Lang>("English");
  const [isTranslating, setTranslating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());
  const prevLang = useRef<Lang>("English");

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  // Close menu on outside click
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [showMenu]);

  // Restore all nodes back to English
  const restoreEnglish = useCallback(() => {
    getTextNodes().forEach((node) => {
      const orig = origMap.get(node);
      if (orig !== undefined) node.textContent = orig;
    });
  }, []);

  // Apply translation to entire page
  const applyTranslation = useCallback(async (lang: Lang) => {
    if (lang === "English") {
      restoreEnglish();
      return;
    }

    setTranslating(true);

    // If switching from another non-English lang, restore first
    if (prevLang.current !== "English") {
      restoreEnglish();
      await new Promise((r) => setTimeout(r, 100));
    }

    const iso = LANGUAGES.find((l) => l.code === lang)!.iso;
    const nodes = getTextNodes();

    // Save originals
    nodes.forEach((node) => {
      if (!origMap.has(node)) origMap.set(node, node.textContent ?? "");
    });

    // Translate in batches of 10
    const BATCH = 10;
    for (let i = 0; i < nodes.length; i += BATCH) {
      const batch = nodes.slice(i, i + BATCH);
      const texts = batch.map((n) => n.textContent?.trim() ?? "");

      const translated = await Promise.all(
        texts.map(async (text) => {
          const key = `${iso}:${text}`;
          if (cacheRef.current.has(key)) return cacheRef.current.get(key)!;
          const result = await translateOne(text, iso);
          cacheRef.current.set(key, result);
          return result;
        })
      );

      batch.forEach((node, j) => {
        if (translated[j] && translated[j] !== texts[j]) {
          node.textContent = translated[j];
        }
      });

      // Small pause between batches to avoid rate limit
      if (i + BATCH < nodes.length) {
        await new Promise((r) => setTimeout(r, 40));
      }
    }

    setTranslating(false);
  }, [restoreEnglish]);

  // When language changes apply translation
  const handleLangSelect = async (lang: Lang) => {
    prevLang.current = currentLang;
    setCurrentLang(lang);
    setShowMenu(false);
    await applyTranslation(lang);
  };

  const activeLang = LANGUAGES.find((l) => l.code === currentLang)!;

  return (
    <>
      {/* Top progress bar while translating */}
      {isTranslating && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 999999,
            height: 3,
            background: "linear-gradient(90deg, hsl(265,80%,56%), hsl(250,84%,54%), hsl(265,80%,56%))",
            backgroundSize: "200% 100%",
            animation: "gradient-rotate 1.2s linear infinite",
          }}
        />
      )}

      {/* Translating toast */}
      {isTranslating && (
        <div
          style={{
            position: "fixed", bottom: 24, left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(10,16,35,0.95)", color: "#fff",
            padding: "10px 22px", borderRadius: 24, zIndex: 999999,
            fontSize: 13, fontWeight: 500,
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(124,58,237,0.4)",
            display: "flex", alignItems: "center", gap: 10,
            boxShadow: "0 4px 24px rgba(124,58,237,0.3)",
          }}
        >
          <span
            style={{
              width: 14, height: 14, borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.3)",
              borderTopColor: "#a78bfa",
              display: "inline-block",
              animation: "spin-y 0.6s linear infinite",
            }}
          />
          Translating to {activeLang.native}...
        </div>
      )}

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-background/80 px-6 backdrop-blur-md">

        {/* Search bar */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search jobs, schemes, or ask AI..."
            className="h-9 rounded-xl border-0 bg-muted/70 pl-10 transition-all focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1">

          {/* Mic */}
          <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground">
            <Mic className="h-5 w-5" />
          </Button>

          {/* ── Language Switcher ── */}
          <div className="relative" ref={menuRef}>
            <Button
              variant="ghost"
              size="sm"
              disabled={isTranslating}
              onClick={() => setShowMenu(!showMenu)}
              title="Translate Page"
              className="rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-1.5 px-2.5 h-9"
            >
              {isTranslating ? (
                <span style={{
                  width: 14, height: 14, borderRadius: "50%",
                  border: "2px solid rgba(124,58,237,0.3)",
                  borderTopColor: "#a78bfa",
                  display: "inline-block",
                  animation: "spin-y 0.6s linear infinite",
                  flexShrink: 0,
                }} />
              ) : (
                <Languages className="h-4 w-4" />
              )}
              <span className="text-xs font-bold hidden sm:inline">
                {activeLang.flag} {currentLang === "English" ? "EN" : activeLang.native.slice(0, 3)}
              </span>
            </Button>

            {/* Dropdown */}
            {showMenu && (
              <div
                className="absolute right-0 top-11 z-50 w-44 rounded-xl border border-border bg-card overflow-hidden"
                style={{ boxShadow: "0 8px 32px rgba(124,58,237,0.25)" }}
              >
                {/* Header */}
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Select Language
                  </p>
                </div>

                {/* Options */}
                {LANGUAGES.map((lang) => {
                  const isActive = currentLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleLangSelect(lang.code)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors hover:bg-muted ${
                        isActive ? "bg-primary/10 text-primary" : "text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{lang.flag}</span>
                        <div className="text-left">
                          <p className={`text-sm leading-tight ${isActive ? "font-bold" : "font-medium"}`}>
                            {lang.native}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{lang.code}</p>
                        </div>
                      </div>
                      {isActive && <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
                    </button>
                  );
                })}

                {/* Footer */}
                <div className="px-3 py-2 border-t border-border bg-muted/30">
                  <p className="text-[9px] text-muted-foreground text-center">
                    Powered by Google Translate
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Accessibility shortcut */}
          <Button
            variant="ghost" size="icon"
            className="rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={() => navigate("/accessibility")}
            title="Accessibility Settings"
          >
            <span className="text-base">♿</span>
          </Button>

          {/* Bell */}
          <Button
            variant="ghost" size="icon"
            className="relative rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          </Button>

          {/* User avatar */}
          <div className="ml-2 flex items-center gap-2.5 border-l border-border pl-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight text-foreground">
                {profile?.full_name || "User"}
              </p>
              <p className="text-xs text-muted-foreground">{profile?.city || "India"}</p>
            </div>
            <Avatar className="h-9 w-9 ring-2 ring-primary/25 ring-offset-1 ring-offset-background">
              <AvatarFallback
                className="text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, hsl(250,84%,54%), hsl(278,80%,60%))" }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
    </>
  );
};

export default TopBar;