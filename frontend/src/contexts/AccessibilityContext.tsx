import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";

export type TextSize = "normal" | "large" | "xl";
export type ColorBlindMode = "none" | "deuteranopia" | "protanopia" | "tritanopia" | "monochromacy";
export type LineSpacing = "normal" | "relaxed" | "loose";
export type LetterSpacing = "normal" | "wide" | "wider";

export interface A11ySettings {
  highContrast: boolean;
  textSize: TextSize;
  dyslexiaFont: boolean;
  reducedMotion: boolean;
  colorBlindMode: ColorBlindMode;
  focusIndicators: boolean;
  lineSpacing: LineSpacing;
  letterSpacing: LetterSpacing;
  readingGuide: boolean;
  ttsEnabled: boolean;
  ttsRate: number;
  ttsPitch: number;
  ttsVoice: string;
}

const DEFAULTS: A11ySettings = {
  highContrast: false,
  textSize: "normal",
  dyslexiaFont: false,
  reducedMotion: false,
  colorBlindMode: "none",
  focusIndicators: false,
  lineSpacing: "normal",
  letterSpacing: "normal",
  readingGuide: false,
  ttsEnabled: false,
  ttsRate: 1,
  ttsPitch: 1,
  ttsVoice: "",
};

interface A11yCtx {
  settings: A11ySettings;
  update: (patch: Partial<A11ySettings>) => void;
  reset: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
  activeCount: number;
}

const A11yContext = createContext<A11yCtx>({
  settings: DEFAULTS,
  update: () => {},
  reset: () => {},
  speak: () => {},
  stopSpeaking: () => {},
  isSpeaking: false,
  activeCount: 0,
});

const STORAGE_KEY = "pwd_a11y_v1";

const ALL_A11Y_CLASSES = [
  "a11y-high-contrast",
  "a11y-text-large",
  "a11y-text-xl",
  "a11y-dyslexia-font",
  "a11y-reduced-motion",
  "a11y-cb-deuteranopia",
  "a11y-cb-protanopia",
  "a11y-cb-tritanopia",
  "a11y-cb-monochromacy",
  "a11y-focus-indicators",
  "a11y-ls-relaxed",
  "a11y-ls-loose",
  "a11y-letter-wide",
  "a11y-letter-wider",
];

function applyToDom(s: A11ySettings) {
  const html = document.documentElement;
  html.classList.remove(...ALL_A11Y_CLASSES);
  if (s.highContrast) html.classList.add("a11y-high-contrast");
  if (s.textSize === "large") html.classList.add("a11y-text-large");
  if (s.textSize === "xl") html.classList.add("a11y-text-xl");
  if (s.dyslexiaFont) html.classList.add("a11y-dyslexia-font");
  if (s.reducedMotion) html.classList.add("a11y-reduced-motion");
  if (s.colorBlindMode !== "none") html.classList.add(`a11y-cb-${s.colorBlindMode}`);
  if (s.focusIndicators) html.classList.add("a11y-focus-indicators");
  if (s.lineSpacing === "relaxed") html.classList.add("a11y-ls-relaxed");
  if (s.lineSpacing === "loose") html.classList.add("a11y-ls-loose");
  if (s.letterSpacing === "wide") html.classList.add("a11y-letter-wide");
  if (s.letterSpacing === "wider") html.classList.add("a11y-letter-wider");
}

function countActive(s: A11ySettings): number {
  let n = 0;
  if (s.highContrast) n++;
  if (s.textSize !== "normal") n++;
  if (s.dyslexiaFont) n++;
  if (s.reducedMotion) n++;
  if (s.colorBlindMode !== "none") n++;
  if (s.focusIndicators) n++;
  if (s.lineSpacing !== "normal") n++;
  if (s.letterSpacing !== "normal") n++;
  if (s.readingGuide) n++;
  if (s.ttsEnabled) n++;
  return n;
}

const MAX_AUTO_READ_LENGTH = 600;

function doSpeak(text: string, s: A11ySettings, onStart?: () => void, onEnd?: () => void) {
  if (!("speechSynthesis" in window) || !text.trim()) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text.trim());
  utt.rate = Math.max(0.1, Math.min(2, s.ttsRate));
  utt.pitch = Math.max(0, Math.min(2, s.ttsPitch));
  if (s.ttsVoice) {
    const voice = window.speechSynthesis.getVoices().find((v) => v.name === s.ttsVoice);
    if (voice) utt.voice = voice;
  }
  if (onStart) utt.onstart = onStart;
  if (onEnd) {
    utt.onend = onEnd;
    utt.onerror = onEnd;
  }
  window.speechSynthesis.speak(utt);
}

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<A11ySettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
    applyToDom(settings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Auto-read selected text when TTS is enabled
  useEffect(() => {
    if (!settings.ttsEnabled) return;
    const handleSelection = () => {
      const selected = window.getSelection()?.toString().trim() ?? "";
      if (selected.length > 1 && selected.length < MAX_AUTO_READ_LENGTH) {
        doSpeak(selected, settingsRef.current, () => setIsSpeaking(true), () => setIsSpeaking(false));
      }
    };
    document.addEventListener("mouseup", handleSelection);
    return () => document.removeEventListener("mouseup", handleSelection);
  }, [settings.ttsEnabled]);

  // Global keyboard shortcuts (Alt+key)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      const tag = (e.target as HTMLElement)?.tagName ?? "";
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;

      const TEXT_SIZES: TextSize[] = ["normal", "large", "xl"];
      switch (e.key.toLowerCase()) {
        case "h":
          e.preventDefault();
          setSettings((p) => ({ ...p, highContrast: !p.highContrast }));
          break;
        case "l":
          e.preventDefault();
          setSettings((p) => {
            const i = TEXT_SIZES.indexOf(p.textSize);
            return { ...p, textSize: TEXT_SIZES[(i + 1) % TEXT_SIZES.length] };
          });
          break;
        case "m":
          e.preventDefault();
          setSettings((p) => ({ ...p, reducedMotion: !p.reducedMotion }));
          break;
        case "r":
          e.preventDefault();
          setSettings((p) => ({ ...p, readingGuide: !p.readingGuide }));
          break;
        case "t":
          e.preventDefault();
          window.speechSynthesis?.cancel();
          setIsSpeaking(false);
          break;
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const update = useCallback((patch: Partial<A11ySettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => setSettings(DEFAULTS), []);

  const speak = useCallback((text: string) => {
    doSpeak(text, settingsRef.current, () => setIsSpeaking(true), () => setIsSpeaking(false));
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  return (
    <A11yContext.Provider
      value={{
        settings,
        update,
        reset,
        speak,
        stopSpeaking,
        isSpeaking,
        activeCount: countActive(settings),
      }}
    >
      {children}
    </A11yContext.Provider>
  );
};

export const useAccessibility = () => useContext(A11yContext);
