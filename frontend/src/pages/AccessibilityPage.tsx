import { useState, useEffect, useCallback, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import type { ColorBlindMode, LineSpacing, LetterSpacing, TextSize } from "@/contexts/AccessibilityContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Accessibility, Eye, EyeOff, BookOpen, Zap, Keyboard, Volume2, VolumeX,
  Sun, Contrast, Type, MousePointer, RotateCcw, Check, Play, Square,
  ALargeSmall, Columns3, AlignJustify, ScanLine, Hand, Brain,
  Mic, MicOff, Navigation, ChevronRight,
} from "lucide-react";

// ─── Preset Profiles ──────────────────────────────────────────────────────────
const PRESETS = [
  {
    id: "visual",
    name: "Visual Impairment",
    icon: Eye,
    desc: "High contrast + extra-large text + text-to-speech",
    color: "from-blue-600 to-indigo-700",
    settings: { highContrast: true, textSize: "xl" as TextSize, ttsEnabled: true, focusIndicators: true },
  },
  {
    id: "motor",
    name: "Motor Impairment",
    icon: Hand,
    desc: "Enhanced focus rings + reduced motion",
    color: "from-green-600 to-teal-700",
    settings: { focusIndicators: true, reducedMotion: true },
  },
  {
    id: "dyslexia",
    name: "Dyslexia",
    icon: Brain,
    desc: "Dyslexia-friendly font + relaxed spacing + reading guide",
    color: "from-orange-500 to-amber-600",
    settings: { dyslexiaFont: true, lineSpacing: "relaxed" as LineSpacing, letterSpacing: "wide" as LetterSpacing, readingGuide: true },
  },
  {
    id: "epilepsy",
    name: "Epilepsy / Vestibular",
    icon: Zap,
    desc: "Disable all animations and motion effects",
    color: "from-purple-600 to-violet-700",
    settings: { reducedMotion: true },
  },
];

const CB_MODES: { value: ColorBlindMode; label: string; desc: string }[] = [
  { value: "none",         label: "None (default)",   desc: "Standard colors" },
  { value: "deuteranopia", label: "Deuteranopia",     desc: "Green color-blind friendly" },
  { value: "protanopia",   label: "Protanopia",       desc: "Red color-blind friendly" },
  { value: "tritanopia",   label: "Tritanopia",       desc: "Blue color-blind friendly" },
  { value: "monochromacy", label: "Monochromacy",     desc: "Grayscale — no color" },
];

const KEYBOARD_SHORTCUTS = [
  { keys: "Alt + H", action: "Toggle High Contrast" },
  { keys: "Alt + L", action: "Cycle Text Size" },
  { keys: "Alt + M", action: "Toggle Reduced Motion" },
  { keys: "Alt + R", action: "Toggle Reading Guide" },
  { keys: "Alt + T", action: "Stop Text-to-Speech" },
  { keys: "Tab",     action: "Navigate between elements" },
  { keys: "Enter / Space", action: "Activate buttons and links" },
  { keys: "Esc",     action: "Close dialogs and menus" },
];

// ── Voice commands list ───────────────────────────────────────────────────────
const VOICE_COMMANDS_LIST = [
  { command: "go home",        action: "Go to Dashboard" },
  { command: "go to jobs",     action: "Open Jobs page" },
  { command: "go to schemes",  action: "Open Schemes page" },
  { command: "go to profile",  action: "Open Profile page" },
  { command: "go to mentors",  action: "Open Mentors page" },
  { command: "go to community",action: "Open Community page" },
  { command: "go back",        action: "Go to previous page" },
  { command: "scroll down",    action: "Scroll page down" },
  { command: "scroll up",      action: "Scroll page up" },
  { command: "scroll top",     action: "Go to top of page" },
  { command: "click",          action: "Click focused element" },
  { command: "next",           action: "Focus next element" },
  { command: "previous",       action: "Focus previous element" },
  { command: "read page",      action: "Read page content aloud" },
  { command: "read headings",  action: "Read all headings" },
  { command: "stop",           action: "Stop speaking" },
  { command: "repeat",         action: "Repeat last spoken text" },
  { command: "help",           action: "List all commands" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
const ToggleRow = ({
  icon: Icon, label, description, checked, onCheckedChange,
}: {
  icon: React.ElementType; label: string; description?: string;
  checked: boolean; onCheckedChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between gap-4 py-1">
    <div className="flex items-start gap-3 min-w-0">
      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10">
        <Icon className="h-4 w-4 text-accent" />
      </div>
      <div className="min-w-0">
        <Label className="text-sm font-semibold text-foreground cursor-pointer">{label}</Label>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
    </div>
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
  </div>
);

// ─── Screen Reader Hook (inline) ──────────────────────────────────────────────
const useScreenReader = () => {
  const [isActive, setIsActive]       = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastSpoken, setLastSpoken]   = useState("");
  const [transcript, setTranscript]   = useState("");
  const navigate = useNavigate();
  const recognitionRef   = useRef<any>(null);
  const currentFocusRef  = useRef<Element | null>(null);
  const synthRef         = useRef(window.speechSynthesis);
  const lastSpokenRef    = useRef("");

  // ── Speak ──────────────────────────────────────────────────────────────
  const speak = useCallback((text: string, priority = false) => {
    if (!text) return;
    if (priority) synthRef.current.cancel();
    const utt   = new SpeechSynthesisUtterance(text);
    utt.lang    = "en-IN";
    utt.rate    = 0.95;
    utt.pitch   = 1.0;
    utt.volume  = 1.0;
    synthRef.current.speak(utt);
    setLastSpoken(text);
    lastSpokenRef.current = text;
  }, []);

  // ── Get readable label ─────────────────────────────────────────────────
  const getLabel = useCallback((el: Element): string => {
    if (!el) return "";
    const aria  = el.getAttribute("aria-label");
    const ph    = el.getAttribute("placeholder");
    const alt   = el.getAttribute("alt");
    const text  = (el as HTMLElement).innerText?.trim().slice(0, 100);
    const tag   = el.tagName.toLowerCase();
    const type  = el.getAttribute("type");
    const id    = el.getAttribute("id");
    const lbl   = id ? (document.querySelector(`label[for="${id}"]`) as HTMLElement)?.innerText?.trim() : "";
    let label   = aria || lbl || text || ph || alt || "";

    if (tag === "button" || el.getAttribute("role") === "button") label = `Button: ${label}`;
    else if (tag === "a")         label = `Link: ${label}`;
    else if (tag === "input") {
      if (type === "checkbox")    label = `Checkbox ${(el as HTMLInputElement).checked ? "checked" : "unchecked"}: ${label}`;
      else if (type === "radio")  label = `Radio: ${label}`;
      else                        label = `Input ${label}: ${type || "text"}`;
    } else if (tag === "select")  label = `Dropdown ${label}: ${(el as HTMLSelectElement).value}`;
    else if (/^h[1-6]$/.test(tag)) label = `Heading: ${label}`;
    return label || "Element";
  }, []);

  // ── Highlight element ──────────────────────────────────────────────────
  const highlight = useCallback((el: Element | null) => {
    document.querySelectorAll(".sr-focus-ring").forEach(e => e.classList.remove("sr-focus-ring"));
    if (el) {
      el.classList.add("sr-focus-ring");
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  // ── Get all focusable elements ─────────────────────────────────────────
  const getFocusable = () => Array.from(document.querySelectorAll(
    'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
  )) as HTMLElement[];

  // ── Voice command handler ──────────────────────────────────────────────
  const handleCommand = useCallback((cmd: string) => {
    speak(`Command: ${cmd}`, true);

    if (cmd.includes("click") || cmd.includes("press") || cmd.includes("select")) {
      (currentFocusRef.current as HTMLElement)?.click();
      speak("Clicked"); return;
    }
    if (cmd.includes("scroll down") || cmd.includes("go down")) {
      window.scrollBy({ top: 300, behavior: "smooth" }); speak("Scrolling down"); return;
    }
    if (cmd.includes("scroll up") || cmd.includes("go up")) {
      window.scrollBy({ top: -300, behavior: "smooth" }); speak("Scrolling up"); return;
    }
    if (cmd.includes("scroll top") || cmd.includes("top of page")) {
      window.scrollTo({ top: 0, behavior: "smooth" }); speak("Going to top"); return;
    }
    if (cmd.includes("scroll bottom")) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); speak("Going to bottom"); return;
    }
    if (cmd.includes("go home") || cmd.includes("home page")) { navigate("/");          speak("Going to dashboard"); return; }
    if (cmd.includes("go back"))                               { navigate(-1);           speak("Going back"); return; }
    if (cmd.includes("go to jobs") || cmd.includes("open jobs"))           { navigate("/jobs");      speak("Opening jobs"); return; }
    if (cmd.includes("go to schemes") || cmd.includes("open schemes"))     { navigate("/schemes");   speak("Opening schemes"); return; }
    if (cmd.includes("go to profile") || cmd.includes("open profile"))     { navigate("/profile");   speak("Opening profile"); return; }
    if (cmd.includes("go to mentors") || cmd.includes("open mentors"))     { navigate("/mentors");   speak("Opening mentors"); return; }
    if (cmd.includes("go to community") || cmd.includes("open community")) { navigate("/community"); speak("Opening community"); return; }
    if (cmd.includes("next") || cmd.includes("tab forward")) {
      const list = getFocusable(); const idx = list.indexOf(currentFocusRef.current as HTMLElement);
      list[idx + 1]?.focus(); speak("Next element"); return;
    }
    if (cmd.includes("previous") || cmd.includes("tab back")) {
      const list = getFocusable(); const idx = list.indexOf(currentFocusRef.current as HTMLElement);
      list[idx - 1]?.focus(); speak("Previous element"); return;
    }
    if (cmd.includes("read page") || cmd.includes("read all")) {
      const t = (document.getElementById("main-content") as HTMLElement)?.innerText?.slice(0, 500) || "";
      speak(t); return;
    }
    if (cmd.includes("read heading")) {
      const h = Array.from(document.querySelectorAll("h1,h2,h3")).map(x => (x as HTMLElement).innerText).join(". ");
      speak(h || "No headings found"); return;
    }
    if (cmd.includes("stop") || cmd.includes("quiet") || cmd.includes("silence")) {
      synthRef.current.cancel(); speak("Stopped"); return;
    }
    if (cmd.includes("repeat") || cmd.includes("say again")) {
      speak(lastSpokenRef.current, true); return;
    }
    if (cmd.includes("help") || cmd.includes("commands")) {
      speak("Say: click, scroll down, scroll up, go home, go to jobs, go to schemes, next, previous, read page, stop, repeat"); return;
    }
    speak(`Not recognized: ${cmd}. Say help for commands.`);
  }, [navigate, speak]);

  // ── Setup voice recognition ────────────────────────────────────────────
  const setupVoice = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { speak("Voice recognition not supported in this browser"); return; }
    const rec          = new SR();
    rec.continuous     = true;
    rec.lang           = "en-IN";
    rec.interimResults = false;
    rec.onstart  = () => setIsListening(true);
    rec.onend    = () => { setIsListening(false); };
    rec.onresult = (e: any) => {
      const cmd = e.results[e.results.length - 1][0].transcript.trim().toLowerCase();
      setTranscript(cmd);
      handleCommand(cmd);
    };
    rec.onerror = () => setIsListening(false);
    recognitionRef.current = rec;
    rec.start();
  }, [handleCommand, speak]);

  // ── Focus + key listeners ──────────────────────────────────────────────
  const onFocus = useCallback((e: FocusEvent) => {
    const el = e.target as Element; if (!el || !isActive) return;
    currentFocusRef.current = el; highlight(el); speak(getLabel(el), true);
  }, [isActive, speak, getLabel, highlight]);

  const onKey = useCallback((e: KeyboardEvent) => {
    if (!isActive) return;
    if (e.key === "Enter" || e.key === " ") speak("Activated", true);
    if (e.key === "Escape") speak("Escaped", true);
  }, [isActive, speak]);

  useEffect(() => {
    if (isActive) { document.addEventListener("focusin", onFocus); document.addEventListener("keydown", onKey); }
    else          { document.removeEventListener("focusin", onFocus); document.removeEventListener("keydown", onKey); }
    return () => { document.removeEventListener("focusin", onFocus); document.removeEventListener("keydown", onKey); };
  }, [isActive, onFocus, onKey]);

  // ── Activate / Deactivate ──────────────────────────────────────────────
  const activate = useCallback(() => {
    // Inject focus ring style
    if (!document.getElementById("sr-style")) {
      const s = document.createElement("style");
      s.id = "sr-style";
      s.textContent = `.sr-focus-ring{outline:3px solid #00ff88!important;outline-offset:4px!important;box-shadow:0 0 0 6px rgba(0,255,136,0.25)!important;border-radius:6px!important;}`;
      document.head.appendChild(s);
    }
    setIsActive(true);
    speak("Screen reader activated. Press Tab to navigate elements. Say help for voice commands.", true);
    setupVoice();
    setTimeout(() => { const f = getFocusable()[0]; if (f) f.focus(); }, 1200);
  }, [speak, setupVoice]);

  const deactivate = useCallback(() => {
    setIsActive(false);
    synthRef.current.cancel();
    recognitionRef.current?.stop();
    setIsListening(false);
    document.querySelectorAll(".sr-focus-ring").forEach(e => e.classList.remove("sr-focus-ring"));
    speak("Screen reader deactivated", true);
  }, [speak]);

  useEffect(() => () => { synthRef.current.cancel(); recognitionRef.current?.stop(); }, []);

  return { isActive, isListening, lastSpoken, transcript, activate, deactivate };
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const AccessibilityPage = () => {
  const { settings, update, reset, speak, stopSpeaking, isSpeaking, activeCount } = useAccessibility();
  const [voices, setVoices]     = useState<SpeechSynthesisVoice[]>([]);
  const [ttsSupported]          = useState(() => "speechSynthesis" in window);
  const [showCmdList, setShowCmdList] = useState(false);

  const {
    isActive: srActive, isListening, lastSpoken, transcript,
    activate: srActivate, deactivate: srDeactivate,
  } = useScreenReader();

  // Load TTS voices
  useEffect(() => {
    if (!ttsSupported) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, [ttsSupported]);

  const applyPreset = (preset: (typeof PRESETS)[0]) => {
    update(preset.settings);
    toast.success(`${preset.name} preset applied!`);
  };

  const handleReset = () => { reset(); toast.success("All accessibility settings reset to defaults."); };

  const readPage = () => {
    const el   = document.getElementById("main-content");
    const text = el?.innerText?.replace(/\s+/g, " ").trim() ?? "";
    if (text) speak(text.slice(0, 2000));
  };

  const textSizeLabel:    Record<TextSize,     string> = { normal: "Normal", large: "Large (112%)", xl: "Extra Large (125%)" };
  const lineSpacingLabel: Record<LineSpacing,  string> = { normal: "Normal", relaxed: "Relaxed (1.9×)", loose: "Loose (2.4×)" };
  const letterSpacingLabel: Record<LetterSpacing, string> = { normal: "Normal", wide: "Wide (+0.06em)", wider: "Wider (+0.12em)" };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-10" id="main-content">

        {/* Header */}
        <PageHeader
          icon={<Accessibility className="h-5 w-5 text-white" />}
          title="Accessibility Tools"
          subtitle="Customize your experience for visual, motor, cognitive, and hearing needs"
        >
          {activeCount > 0 && (
            <div className="flex items-center gap-2 rounded-xl px-4 py-2"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
              <Check className="h-4 w-4 text-green-300" />
              <span className="text-sm font-medium text-white">{activeCount} active</span>
            </div>
          )}
        </PageHeader>

        {/* Quick Presets */}
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-5 w-5 text-accent" />
              Quick Presets — One-click profiles for common disability types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {PRESETS.map((preset) => {
                const Icon = preset.icon;
                return (
                  <button key={preset.id} onClick={() => applyPreset(preset)}
                    className={`group relative overflow-hidden rounded-xl p-4 text-left transition-all hover:scale-[1.02] bg-gradient-to-br ${preset.color} text-white`}>
                    <Icon className="h-6 w-6 mb-2 opacity-90" />
                    <p className="text-sm font-bold leading-tight">{preset.name}</p>
                    <p className="text-xs mt-1 opacity-70 leading-snug">{preset.desc}</p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ══ SCREEN READER CARD — NEW ══════════════════════════════════════ */}
        <Card className={`border-2 transition-all ${srActive ? "border-green-500 shadow-lg shadow-green-500/20" : "border-border"}`}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Navigation className="h-5 w-5 text-green-500" />
              Screen Reader & Voice Control
              <Badge className={`ml-auto text-xs ${srActive ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"}`}>
                {srActive ? "ACTIVE" : "OFF"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              Designed for <span className="font-semibold text-foreground">totally blind users</span>.
              Reads every focused element aloud using Text-to-Speech and accepts voice commands
              for navigation — no mouse or keyboard needed.
            </p>

            {/* Feature list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                "Tab key announces every element",
                "Voice command navigation",
                "Green focus highlight ring",
                "Works with any browser",
                "Supports Indian English",
                "No internet needed",
              ].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>

            {/* Status panel — shows when active */}
            <AnimatePresence>
              {srActive && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4 space-y-3">
                    {/* Listening indicator */}
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isListening ? "bg-red-500 animate-pulse" : "bg-muted"}`} />
                      <span className="text-sm font-medium text-foreground">
                        {isListening ? "🎤 Listening for voice command..." : "Microphone standby"}
                      </span>
                    </div>

                    {/* Last spoken */}
                    {lastSpoken && (
                      <div className="rounded-lg bg-background border border-border p-3">
                        <p className="text-[10px] text-muted-foreground mb-1">Currently speaking:</p>
                        <p className="text-sm text-foreground font-medium line-clamp-2">{lastSpoken}</p>
                      </div>
                    )}

                    {/* Last command */}
                    {transcript && (
                      <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-3">
                        <p className="text-[10px] text-muted-foreground mb-1">Last voice command:</p>
                        <p className="text-sm text-foreground font-medium">"{transcript}"</p>
                      </div>
                    )}

                    {/* Quick tips */}
                    <div className="text-xs text-muted-foreground space-y-1 pt-1 border-t border-border">
                      <p>⌨️ Press <kbd className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-mono">Tab</kbd> to move to next element</p>
                      <p>🎤 Say <span className="font-medium text-foreground">"help"</span> to hear all voice commands</p>
                      <p>🔇 Say <span className="font-medium text-foreground">"stop"</span> to silence reading</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toggle button */}
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                onClick={srActive ? srDeactivate : srActivate}
                className={`gap-2 ${srActive
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"}`}
                aria-label={srActive ? "Disable screen reader" : "Enable screen reader for blind users"}
              >
                {srActive
                  ? <><MicOff className="h-4 w-4" /> Disable Screen Reader</>
                  : <><Mic className="h-4 w-4" /> Enable Screen Reader</>
                }
              </Button>

              {/* Show commands toggle */}
              <Button variant="outline" size="sm" className="gap-1.5"
                onClick={() => setShowCmdList(!showCmdList)}>
                <Keyboard className="h-3.5 w-3.5" />
                {showCmdList ? "Hide" : "Show"} Voice Commands
                <ChevronRight className={`h-3.5 w-3.5 transition-transform ${showCmdList ? "rotate-90" : ""}`} />
              </Button>
            </div>

            {/* Voice commands list */}
            <AnimatePresence>
              {showCmdList && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <p className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                      <Mic className="h-4 w-4 text-accent" /> All Voice Commands
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {VOICE_COMMANDS_LIST.map(vc => (
                        <div key={vc.command}
                          className="flex items-center justify-between rounded-lg bg-background border border-border px-3 py-2 gap-2">
                          <span className="text-xs text-muted-foreground">{vc.action}</span>
                          <kbd className="text-[10px] font-mono bg-muted border border-border px-2 py-0.5 rounded whitespace-nowrap text-foreground flex-shrink-0">
                            "{vc.command}"
                          </kbd>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      💡 Tip: Speak clearly in English. The mic activates automatically when Screen Reader is ON.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
        {/* ══ END SCREEN READER CARD ════════════════════════════════════════ */}

        {/* Visual Tools */}
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Eye className="h-5 w-5 text-accent" /> Visual Accessibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <ToggleRow icon={Contrast} label="High Contrast Mode"
              description="Black & white high-contrast theme — maximizes readability for low vision"
              checked={settings.highContrast} onCheckedChange={(v) => update({ highContrast: v })} />

            {/* Text Size */}
            <div className="flex items-center justify-between gap-4 py-1">
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <ALargeSmall className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-foreground">Text Size</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Increase font size across all pages</p>
                </div>
              </div>
              <Select value={settings.textSize} onValueChange={(v) => update({ textSize: v as TextSize })}>
                <SelectTrigger className="w-44"><SelectValue>{textSizeLabel[settings.textSize]}</SelectValue></SelectTrigger>
                <SelectContent>
                  {(Object.keys(textSizeLabel) as TextSize[]).map((k) => (
                    <SelectItem key={k} value={k}>{textSizeLabel[k]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Colour Blind Mode */}
            <div className="flex items-center justify-between gap-4 py-1">
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <Sun className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-foreground">Colour-Blind Mode</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Adjusts colours for different types of colour vision deficiency</p>
                </div>
              </div>
              <Select value={settings.colorBlindMode} onValueChange={(v) => update({ colorBlindMode: v as ColorBlindMode })}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CB_MODES.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ToggleRow icon={MousePointer} label="Enhanced Focus Indicators"
              description="Adds bold, high-visibility focus rings for keyboard navigation"
              checked={settings.focusIndicators} onCheckedChange={(v) => update({ focusIndicators: v })} />
          </CardContent>
        </Card>

        {/* Reading & Cognitive */}
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-5 w-5 text-accent" /> Reading & Cognitive Accessibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <ToggleRow icon={Type} label="Dyslexia-Friendly Font (Lexend)"
              description="Uses the Lexend font — designed to reduce visual stress for dyslexic readers"
              checked={settings.dyslexiaFont} onCheckedChange={(v) => update({ dyslexiaFont: v })} />

            {/* Line Spacing */}
            <div className="flex items-center justify-between gap-4 py-1">
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <AlignJustify className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-foreground">Line Spacing</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">More space between lines improves readability</p>
                </div>
              </div>
              <Select value={settings.lineSpacing} onValueChange={(v) => update({ lineSpacing: v as LineSpacing })}>
                <SelectTrigger className="w-44"><SelectValue>{lineSpacingLabel[settings.lineSpacing]}</SelectValue></SelectTrigger>
                <SelectContent>
                  {(Object.keys(lineSpacingLabel) as LineSpacing[]).map((k) => (
                    <SelectItem key={k} value={k}>{lineSpacingLabel[k]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Letter Spacing */}
            <div className="flex items-center justify-between gap-4 py-1">
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <Columns3 className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-foreground">Letter Spacing</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">More space between characters for clarity</p>
                </div>
              </div>
              <Select value={settings.letterSpacing} onValueChange={(v) => update({ letterSpacing: v as LetterSpacing })}>
                <SelectTrigger className="w-44"><SelectValue>{letterSpacingLabel[settings.letterSpacing]}</SelectValue></SelectTrigger>
                <SelectContent>
                  {(Object.keys(letterSpacingLabel) as LetterSpacing[]).map((k) => (
                    <SelectItem key={k} value={k}>{letterSpacingLabel[k]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ToggleRow icon={ScanLine} label="Reading Guide"
              description="A horizontal highlight bar follows your mouse to help track your reading position"
              checked={settings.readingGuide} onCheckedChange={(v) => update({ readingGuide: v })} />
          </CardContent>
        </Card>

        {/* Motor & Navigation */}
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Hand className="h-5 w-5 text-accent" /> Motor & Navigation Accessibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleRow icon={EyeOff} label="Reduce Motion"
              description="Disables all animations and transitions — helps users with epilepsy or vestibular disorders"
              checked={settings.reducedMotion} onCheckedChange={(v) => update({ reducedMotion: v })} />
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Keyboard className="h-4 w-4 text-accent" /> Keyboard Navigation is always available
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Use <kbd className="rounded bg-border px-1.5 py-0.5 text-xs font-mono">Tab</kbd> to move between elements,{" "}
                <kbd className="rounded bg-border px-1.5 py-0.5 text-xs font-mono">Enter</kbd> or{" "}
                <kbd className="rounded bg-border px-1.5 py-0.5 text-xs font-mono">Space</kbd> to activate.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Text-to-Speech */}
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Volume2 className="h-5 w-5 text-accent" /> Text-to-Speech (TTS)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <ToggleRow
              icon={ttsSupported ? Volume2 : VolumeX}
              label={ttsSupported ? "Auto-read Selected Text" : "Text-to-Speech (not supported)"}
              description={ttsSupported
                ? "When enabled, selecting any text on screen will read it aloud automatically"
                : "Your browser does not support the Web Speech API"}
              checked={settings.ttsEnabled && ttsSupported}
              onCheckedChange={(v) => ttsSupported && update({ ttsEnabled: v })}
            />

            {ttsSupported && (
              <>
                {voices.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Voice</Label>
                    <Select value={settings.ttsVoice || "__default__"}
                      onValueChange={(v) => update({ ttsVoice: v === "__default__" ? "" : v })}>
                      <SelectTrigger><SelectValue placeholder="System default" /></SelectTrigger>
                      <SelectContent className="max-h-60">
                        <SelectItem value="__default__">System default</SelectItem>
                        {voices.map((v) => (
                          <SelectItem key={v.name} value={v.name}>{v.name} ({v.lang})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Tip: Voices labeled "hi-IN" or "en-IN" speak in Indian English/Hindi.</p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Speaking Speed</Label>
                    <Badge variant="outline" className="text-xs">{settings.ttsRate.toFixed(1)}×</Badge>
                  </div>
                  <Slider min={0.5} max={2} step={0.1} value={[settings.ttsRate]}
                    onValueChange={([v]) => update({ ttsRate: v })} className="w-full" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Slower (0.5×)</span><span>Faster (2×)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Pitch</Label>
                    <Badge variant="outline" className="text-xs">{settings.ttsPitch.toFixed(1)}</Badge>
                  </div>
                  <Slider min={0.5} max={2} step={0.1} value={[settings.ttsPitch]}
                    onValueChange={([v]) => update({ ttsPitch: v })} className="w-full" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Lower</span><span>Higher</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button size="sm" onClick={readPage} disabled={isSpeaking} className="gap-2 bg-primary text-primary-foreground">
                    <Play className="h-4 w-4" /> Read This Page
                  </Button>
                  <Button size="sm" variant="outline" disabled={isSpeaking} className="gap-2"
                    onClick={() => speak("Welcome to EduSetu. Text-to-speech is working correctly.")}>
                    <Volume2 className="h-4 w-4" /> Test Voice
                  </Button>
                  {isSpeaking && (
                    <Button size="sm" variant="destructive" onClick={stopSpeaking} className="gap-2">
                      <Square className="h-4 w-4" /> Stop
                    </Button>
                  )}
                </div>

                {isSpeaking && (
                  <div className="flex items-center gap-2 text-sm text-accent">
                    <span className="inline-flex gap-0.5">
                      {[0,1,2].map((i) => (
                        <span key={i} className="inline-block h-3 w-1 rounded-full bg-accent animate-bounce"
                          style={{ animationDelay: `${i * 150}ms` }} />
                      ))}
                    </span>
                    Speaking…
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Keyboard Shortcuts */}
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Keyboard className="h-5 w-5 text-accent" /> Keyboard Shortcuts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {KEYBOARD_SHORTCUTS.map((s) => (
                <div key={s.keys} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 gap-3">
                  <span className="text-sm text-foreground">{s.action}</span>
                  <kbd className="flex-shrink-0 rounded bg-background border border-border px-2 py-1 text-xs font-mono text-muted-foreground">
                    {s.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* WCAG Info */}
        <Card className="border border-border bg-muted/30">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">ℹ️ About Accessibility Compliance — </span>
              This portal follows WCAG 2.1 AA guidelines. All pages support screen readers (NVDA, JAWS, VoiceOver),
              keyboard-only navigation, and have a skip-to-content link. If you encounter any accessibility barrier,
              please report it via the Community Forum.
            </p>
          </CardContent>
        </Card>

        {/* Reset */}
        <div className="flex justify-end">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset All to Defaults
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccessibilityPage;