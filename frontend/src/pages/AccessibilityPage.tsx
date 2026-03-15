import { useState, useEffect } from "react";
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
import {
  Accessibility, Eye, EyeOff, BookOpen, Zap, Keyboard, Volume2, VolumeX,
  Sun, Contrast, Type, MousePointer, RotateCcw, Check, Play, Square,
  ALargeSmall, Columns3, AlignJustify, ScanLine, Hand, Brain,
} from "lucide-react";

// ─── Preset Profiles ─────────────────────────────────────────────────────────
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
  { value: "none", label: "None (default)", desc: "Standard colors" },
  { value: "deuteranopia", label: "Deuteranopia", desc: "Green color-blind friendly" },
  { value: "protanopia", label: "Protanopia", desc: "Red color-blind friendly" },
  { value: "tritanopia", label: "Tritanopia", desc: "Blue color-blind friendly" },
  { value: "monochromacy", label: "Monochromacy", desc: "Grayscale — no color" },
];

const KEYBOARD_SHORTCUTS = [
  { keys: "Alt + H", action: "Toggle High Contrast" },
  { keys: "Alt + L", action: "Cycle Text Size" },
  { keys: "Alt + M", action: "Toggle Reduced Motion" },
  { keys: "Alt + R", action: "Toggle Reading Guide" },
  { keys: "Alt + T", action: "Stop Text-to-Speech" },
  { keys: "Tab", action: "Navigate between elements" },
  { keys: "Enter / Space", action: "Activate buttons and links" },
  { keys: "Esc", action: "Close dialogs and menus" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const ToggleRow = ({
  icon: Icon,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  icon: React.ElementType;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
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

// ─── Main Page ────────────────────────────────────────────────────────────────
const AccessibilityPage = () => {
  const { settings, update, reset, speak, stopSpeaking, isSpeaking, activeCount } = useAccessibility();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [ttsSupported] = useState(() => "speechSynthesis" in window);

  // Load TTS voices
  useEffect(() => {
    if (!ttsSupported) return;
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, [ttsSupported]);

  const applyPreset = (preset: (typeof PRESETS)[0]) => {
    update(preset.settings);
    toast.success(`${preset.name} preset applied!`);
  };

  const handleReset = () => {
    reset();
    toast.success("All accessibility settings reset to defaults.");
  };

  const readPage = () => {
    const el = document.getElementById("main-content");
    const text = el?.innerText?.replace(/\s+/g, " ").trim() ?? "";
    if (text) speak(text.slice(0, 2000));
  };

  const textSizeLabel: Record<TextSize, string> = { normal: "Normal", large: "Large (112%)", xl: "Extra Large (125%)" };
  const lineSpacingLabel: Record<LineSpacing, string> = { normal: "Normal", relaxed: "Relaxed (1.9×)", loose: "Loose (2.4×)" };
  const letterSpacingLabel: Record<LetterSpacing, string> = { normal: "Normal", wide: "Wide (+0.06em)", wider: "Wider (+0.12em)" };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-10">
        {/* Header */}
        <PageHeader
          icon={<Accessibility className="h-5 w-5 text-white" />}
          title="Accessibility Tools"
          subtitle="Customize your experience for visual, motor, cognitive, and hearing needs"
        >
          {activeCount > 0 && (
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-2"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
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
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className={`group relative overflow-hidden rounded-xl p-4 text-left transition-all hover:scale-[1.02] bg-gradient-to-br ${preset.color} text-white`}
                  >
                    <Icon className="h-6 w-6 mb-2 opacity-90" />
                    <p className="text-sm font-bold leading-tight">{preset.name}</p>
                    <p className="text-xs mt-1 opacity-70 leading-snug">{preset.desc}</p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Visual Tools */}
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Eye className="h-5 w-5 text-accent" />
              Visual Accessibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* High Contrast */}
            <ToggleRow
              icon={Contrast}
              label="High Contrast Mode"
              description="Black & white high-contrast theme — maximizes readability for low vision"
              checked={settings.highContrast}
              onCheckedChange={(v) => update({ highContrast: v })}
            />

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
              <Select
                value={settings.textSize}
                onValueChange={(v) => update({ textSize: v as TextSize })}
              >
                <SelectTrigger className="w-44">
                  <SelectValue>{textSizeLabel[settings.textSize]}</SelectValue>
                </SelectTrigger>
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
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Adjusts colours for different types of colour vision deficiency
                  </p>
                </div>
              </div>
              <Select
                value={settings.colorBlindMode}
                onValueChange={(v) => update({ colorBlindMode: v as ColorBlindMode })}
              >
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CB_MODES.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      <span>{m.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Focus Indicators */}
            <ToggleRow
              icon={MousePointer}
              label="Enhanced Focus Indicators"
              description="Adds bold, high-visibility focus rings for keyboard navigation"
              checked={settings.focusIndicators}
              onCheckedChange={(v) => update({ focusIndicators: v })}
            />
          </CardContent>
        </Card>

        {/* Reading & Cognitive Tools */}
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-5 w-5 text-accent" />
              Reading & Cognitive Accessibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Dyslexia Font */}
            <ToggleRow
              icon={Type}
              label="Dyslexia-Friendly Font (Lexend)"
              description="Uses the Lexend font — designed to reduce visual stress for dyslexic readers"
              checked={settings.dyslexiaFont}
              onCheckedChange={(v) => update({ dyslexiaFont: v })}
            />

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
              <Select
                value={settings.lineSpacing}
                onValueChange={(v) => update({ lineSpacing: v as LineSpacing })}
              >
                <SelectTrigger className="w-44">
                  <SelectValue>{lineSpacingLabel[settings.lineSpacing]}</SelectValue>
                </SelectTrigger>
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
              <Select
                value={settings.letterSpacing}
                onValueChange={(v) => update({ letterSpacing: v as LetterSpacing })}
              >
                <SelectTrigger className="w-44">
                  <SelectValue>{letterSpacingLabel[settings.letterSpacing]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(letterSpacingLabel) as LetterSpacing[]).map((k) => (
                    <SelectItem key={k} value={k}>{letterSpacingLabel[k]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reading Guide */}
            <ToggleRow
              icon={ScanLine}
              label="Reading Guide"
              description="A horizontal highlight bar follows your mouse to help track your reading position"
              checked={settings.readingGuide}
              onCheckedChange={(v) => update({ readingGuide: v })}
            />
          </CardContent>
        </Card>

        {/* Motion & Navigation */}
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Hand className="h-5 w-5 text-accent" />
              Motor & Navigation Accessibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleRow
              icon={EyeOff}
              label="Reduce Motion"
              description="Disables all animations and transitions — helps users with epilepsy or vestibular disorders"
              checked={settings.reducedMotion}
              onCheckedChange={(v) => update({ reducedMotion: v })}
            />
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Keyboard className="h-4 w-4 text-accent" /> Keyboard Navigation is always available
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Use <kbd className="rounded bg-border px-1.5 py-0.5 text-xs font-mono">Tab</kbd> to move between elements,{" "}
                <kbd className="rounded bg-border px-1.5 py-0.5 text-xs font-mono">Enter</kbd> or{" "}
                <kbd className="rounded bg-border px-1.5 py-0.5 text-xs font-mono">Space</kbd> to activate.
                A "Skip to main content" link is available at the top of every page — press{" "}
                <kbd className="rounded bg-border px-1.5 py-0.5 text-xs font-mono">Tab</kbd> once after page load.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Text-to-Speech */}
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Volume2 className="h-5 w-5 text-accent" />
              Text-to-Speech (TTS)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <ToggleRow
              icon={ttsSupported ? Volume2 : VolumeX}
              label={ttsSupported ? "Auto-read Selected Text" : "Text-to-Speech (not supported)"}
              description={
                ttsSupported
                  ? "When enabled, selecting any text on screen will read it aloud automatically"
                  : "Your browser does not support the Web Speech API"
              }
              checked={settings.ttsEnabled && ttsSupported}
              onCheckedChange={(v) => ttsSupported && update({ ttsEnabled: v })}
            />

            {ttsSupported && (
              <>
                {/* Voice selection */}
                {voices.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Voice</Label>
                    <Select
                      value={settings.ttsVoice || "__default__"}
                      onValueChange={(v) => update({ ttsVoice: v === "__default__" ? "" : v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="System default" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        <SelectItem value="__default__">System default</SelectItem>
                        {voices.map((v) => (
                          <SelectItem key={v.name} value={v.name}>
                            {v.name} ({v.lang})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Tip: Voices labeled "hi-IN" or "en-IN" speak in Indian English/Hindi.
                    </p>
                  </div>
                )}

                {/* Speaking speed */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Speaking Speed</Label>
                    <Badge variant="outline" className="text-xs">{settings.ttsRate.toFixed(1)}×</Badge>
                  </div>
                  <Slider
                    min={0.5} max={2} step={0.1}
                    value={[settings.ttsRate]}
                    onValueChange={([v]) => update({ ttsRate: v })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Slower (0.5×)</span><span>Faster (2×)</span>
                  </div>
                </div>

                {/* Pitch */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Pitch</Label>
                    <Badge variant="outline" className="text-xs">{settings.ttsPitch.toFixed(1)}</Badge>
                  </div>
                  <Slider
                    min={0.5} max={2} step={0.1}
                    value={[settings.ttsPitch]}
                    onValueChange={([v]) => update({ ttsPitch: v })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Lower</span><span>Higher</span>
                  </div>
                </div>

                {/* Test buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    size="sm"
                    onClick={readPage}
                    disabled={isSpeaking}
                    className="gap-2 bg-primary text-primary-foreground"
                  >
                    <Play className="h-4 w-4" /> Read This Page
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => speak("Welcome to the DivyangConnectAI accessibility tools. Text-to-speech is working correctly.")}
                    disabled={isSpeaking}
                    className="gap-2"
                  >
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
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="inline-block h-3 w-1 rounded-full bg-accent animate-bounce"
                          style={{ animationDelay: `${i * 150}ms` }}
                        />
                      ))}
                    </span>
                    Speaking…
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Keyboard Shortcuts Reference */}
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Keyboard className="h-5 w-5 text-accent" />
              Keyboard Shortcuts
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
