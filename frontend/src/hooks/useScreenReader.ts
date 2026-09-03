import { useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import { useNavigate, NavigateFunction } from "react-router-dom";
import { dispatchA11yUpdate, dispatchA11yReset } from "@/contexts/AccessibilityContext";

/**
 * useScreenReader — in-app TTS + voice-command navigation for EduAccess.
 *
 * v2 fix: voice-navigation commands ("go to jobs", "go home", etc.) call
 * navigate(), which can unmount whatever component instantiated this hook
 * (e.g. if it's called inside a page component rather than a persistent
 * layout). The previous version kept SpeechRecognition, speechSynthesis and
 * the MutationObserver as refs local to that component, so its unmount
 * cleanup effect tore the whole session down — the screen reader silently
 * "deactivated itself" the moment you spoke a command that changed routes.
 *
 * Fix: the recognizer/synth/observer now live in a single module-level
 * ScreenReaderEngine that is NOT tied to any component's lifecycle. Every
 * component that calls useScreenReader() just subscribes to this shared
 * engine via useSyncExternalStore. Voice control now survives navigation
 * (and even multiple call sites) and only stops when the user explicitly
 * calls deactivate(), or the tab closes.
 *
 * Everything from the previous pass is preserved: live-region announcements,
 * richer element labels (required/invalid/disabled, switch/radio state,
 * slider values, heading levels, position-in-set), reduced-motion support,
 * configurable/multilingual TTS with voice matching, and the data-table
 * route map.
 */

// ── Types ────────────────────────────────────────────────────────────────
export interface ScreenReaderSettings {
  /** BCP-47 language tag, e.g. "en-IN", "hi-IN", "mr-IN". */
  lang?: string;
  /** Speech rate, 0.1–10. */
  rate?: number;
  /** Speech pitch, 0–2. */
  pitch?: number;
  /** Speech volume, 0–1. */
  volume?: number;
  /** If true, speaks the recognized command back before executing it. Off by
   *  default — most users find that extra narration slows them down. */
  announceCommands?: boolean;
}

interface RouteCommand {
  patterns: string[];
  path: string;
  announce: string;
}

// Add all platform pages here so voice commands and navigation pick them up.
const ROUTE_COMMANDS: RouteCommand[] = [
  { patterns: ["go home", "home page", "go to dashboard", "open dashboard", "dashboard"], path: "/", announce: "Opening dashboard" },
  { patterns: ["go to jobs", "open jobs", "jobs page", "find jobs", "career"], path: "/jobs", announce: "Opening jobs page" },
  { patterns: ["go to schemes", "open schemes", "schemes page", "government schemes", "welfare"], path: "/schemes", announce: "Opening government schemes page" },
  { patterns: ["go to profile", "open profile", "my profile", "user profile"], path: "/profile", announce: "Opening profile page" },
  { patterns: ["go to learn", "open learn", "learning hub", "courses", "my courses"], path: "/learn", announce: "Opening Learn Hub" },
  { patterns: ["go to eduspeak", "open eduspeak", "speech lab", "pronunciation", "speaking"], path: "/eduspeak", announce: "Opening EduSpeak Lab" },
  { patterns: ["go to eduvault", "open eduvault", "documents", "certificates", "my vault"], path: "/eduvault", announce: "Opening EduVault credentials" },
  { patterns: ["go to edumentor", "open edumentor", "ai tutor", "ask mentor", "mentor tutor"], path: "/edumentor", announce: "Opening EduMentor AI Tutor" },
  { patterns: ["go to roadmap", "open roadmap", "career roadmap", "my roadmap"], path: "/eduroadmap", announce: "Opening career roadmap" },
  { patterns: ["go to performance", "open performance", "analytics", "my grades", "marks"], path: "/performance", announce: "Opening performance analytics" },
  { patterns: ["go to community", "open community", "forum", "discussion"], path: "/community", announce: "Opening community page" },
  { patterns: ["go to mentors", "open mentors", "connect mentor"], path: "/mentors", announce: "Opening mentors page" },
  { patterns: ["go to achievements", "open achievements", "points", "gamification", "streak"], path: "/gamification", announce: "Opening achievements and rewards" },
  { patterns: ["go to accessibility", "open accessibility", "accessibility settings", "a11y"], path: "/accessibility", announce: "Opening accessibility settings" },
  { patterns: ["go to settings", "open settings", "account settings"], path: "/settings", announce: "Opening settings page" },
];

interface A11yToolVoiceCommand {
  patterns: string[];
  action: (engine: ScreenReaderEngine) => void;
  announce: string;
}

// Comprehensive voice commands for controlling all accessibility tools across EduSetu
const A11Y_TOOL_COMMANDS: A11yToolVoiceCommand[] = [
  // ── Visual Impairment (Preset Profile) ─────────────────────────
  {
    patterns: [
      "disable visual impairment", "disable visual mode", "disable visual",
      "turn off visual impairment", "turn off visual", "visual impairment off",
      "visual off", "disable visual implement", "disable visual implemetn"
    ],
    action: () => dispatchA11yUpdate({ highContrast: false, textSize: "normal", focusIndicators: false }),
    announce: "Visual impairment mode disabled. Display restored to normal.",
  },
  {
    patterns: [
      "enable visual impairment", "enable visual mode", "enable visual",
      "turn on visual impairment", "turn on visual", "visual impairment on",
      "visual on", "visual preset", "visual profile", "visual mode",
      "visual impairment", "visual implement", "enable visual implement",
      "enable visual implemetn"
    ],
    action: () => dispatchA11yUpdate({ highContrast: true, textSize: "xl", ttsEnabled: true, focusIndicators: true }),
    announce: "Visual impairment mode enabled: high contrast, extra large text, and focus indicators active.",
  },

  // ── Motor Impairment (Preset Profile) ──────────────────────────
  {
    patterns: [
      "disable motor impairment", "disable motor mode", "disable motor",
      "turn off motor impairment", "turn off motor", "motor impairment off",
      "motor off", "disable motor implement"
    ],
    action: () => dispatchA11yUpdate({ focusIndicators: false, reducedMotion: false }),
    announce: "Motor impairment mode disabled.",
  },
  {
    patterns: [
      "enable motor impairment", "enable motor mode", "enable motor",
      "turn on motor impairment", "turn on motor", "motor impairment on",
      "motor on", "motor preset", "motor profile", "motor mode",
      "motor impairment", "motor implement", "enable motor implement"
    ],
    action: () => dispatchA11yUpdate({ focusIndicators: true, reducedMotion: true }),
    announce: "Motor impairment mode enabled: enhanced focus rings and reduced motion active.",
  },

  // ── Dyslexia (Preset Profile) ──────────────────────────────────
  {
    patterns: [
      "disable dyslexia mode", "disable dyslexia", "turn off dyslexia",
      "dyslexia off", "disable dyslexia profile"
    ],
    action: () => dispatchA11yUpdate({ dyslexiaFont: false, lineSpacing: "normal", letterSpacing: "normal", readingGuide: false }),
    announce: "Dyslexia mode disabled. Typography restored to normal.",
  },
  {
    patterns: [
      "enable dyslexia mode", "enable dyslexia", "turn on dyslexia",
      "dyslexia on", "dyslexia mode", "dyslexia preset", "dyslexia profile"
    ],
    action: () => dispatchA11yUpdate({ dyslexiaFont: true, lineSpacing: "relaxed", letterSpacing: "wide", readingGuide: true }),
    announce: "Dyslexia mode enabled: Lexend font, relaxed line spacing, and reading guide active.",
  },

  // ── Epilepsy / Seizure Safety (Preset Profile) ─────────────────
  {
    patterns: [
      "disable epilepsy mode", "disable epilepsy", "turn off epilepsy",
      "epilepsy off", "disable seizure safe"
    ],
    action: () => dispatchA11yUpdate({ reducedMotion: false }),
    announce: "Epilepsy mode disabled. Animations restored.",
  },
  {
    patterns: [
      "enable epilepsy mode", "enable epilepsy", "turn on epilepsy",
      "epilepsy on", "epilepsy mode", "epilepsy preset", "seizure safe",
      "epilepsy safe"
    ],
    action: () => dispatchA11yUpdate({ reducedMotion: true }),
    announce: "Epilepsy safe mode enabled: all animations paused.",
  },

  // ── High Contrast ──────────────────────────────────────────────
  {
    patterns: ["disable high contrast", "turn off high contrast", "high contrast off", "disable contrast", "contrast off", "normal contrast"],
    action: () => dispatchA11yUpdate({ highContrast: false }),
    announce: "High contrast disabled",
  },
  {
    patterns: ["enable high contrast", "turn on high contrast", "high contrast on", "enable contrast", "contrast on", "high contrast"],
    action: () => dispatchA11yUpdate({ highContrast: true }),
    announce: "High contrast enabled",
  },

  // ── Text Size ──────────────────────────────────────────────────
  {
    patterns: ["disable large text", "disable extra large text", "normal text", "default text", "reset text", "text normal", "text off"],
    action: () => dispatchA11yUpdate({ textSize: "normal" }),
    announce: "Text size reset to normal",
  },
  {
    patterns: ["enable extra large text", "extra large text on", "extra large text", "maximum text", "huge text", "xl text"],
    action: () => dispatchA11yUpdate({ textSize: "xl" }),
    announce: "Extra large text enabled, 125 percent",
  },
  {
    patterns: ["enable large text", "large text on", "large text", "larger text", "increase text", "big text"],
    action: () => dispatchA11yUpdate({ textSize: "large" }),
    announce: "Large text enabled, 112 percent",
  },

  // ── Dyslexia Font ──────────────────────────────────────────────
  {
    patterns: ["disable dyslexia font", "turn off dyslexia font", "dyslexia font off", "default font"],
    action: () => dispatchA11yUpdate({ dyslexiaFont: false }),
    announce: "Dyslexia font disabled",
  },
  {
    patterns: ["enable dyslexia font", "turn on dyslexia font", "dyslexia font on", "enable lexend", "lexend font", "dyslexia font"],
    action: () => dispatchA11yUpdate({ dyslexiaFont: true }),
    announce: "Dyslexia-friendly Lexend font enabled",
  },

  // ── Reduced Motion / Animations ────────────────────────────────
  {
    patterns: ["disable animations", "turn off animations", "stop animations", "pause animations", "enable reduced motion", "reduced motion on"],
    action: () => dispatchA11yUpdate({ reducedMotion: true }),
    announce: "Animations paused",
  },
  {
    patterns: ["enable animations", "turn on animations", "start animations", "play animations", "disable reduced motion", "reduced motion off"],
    action: () => dispatchA11yUpdate({ reducedMotion: false }),
    announce: "Animations enabled",
  },

  // ── Reading Guide Ruler ────────────────────────────────────────
  {
    patterns: ["disable reading guide", "turn off reading guide", "reading guide off", "hide reading guide", "disable ruler", "ruler off"],
    action: () => dispatchA11yUpdate({ readingGuide: false }),
    announce: "Reading guide disabled",
  },
  {
    patterns: ["enable reading guide", "turn on reading guide", "reading guide on", "reading guide", "reading ruler", "enable ruler", "ruler on"],
    action: () => dispatchA11yUpdate({ readingGuide: true }),
    announce: "Reading guide enabled",
  },

  // ── Focus Indicators ───────────────────────────────────────────
  {
    patterns: ["disable focus indicators", "disable focus", "turn off focus", "focus indicators off", "focus off"],
    action: () => dispatchA11yUpdate({ focusIndicators: false }),
    announce: "Focus indicators disabled",
  },
  {
    patterns: ["enable focus indicators", "enable focus", "turn on focus", "focus indicators on", "focus on", "highlight focus"],
    action: () => dispatchA11yUpdate({ focusIndicators: true }),
    announce: "Enhanced focus indicators enabled",
  },

  // ── Line & Letter Spacing ──────────────────────────────────────
  {
    patterns: ["disable relaxed spacing", "disable loose spacing", "normal spacing", "default spacing", "reset spacing"],
    action: () => dispatchA11yUpdate({ lineSpacing: "normal" }),
    announce: "Line spacing reset to normal",
  },
  {
    patterns: ["enable loose spacing", "loose spacing", "loose line spacing", "maximum spacing"],
    action: () => dispatchA11yUpdate({ lineSpacing: "loose" }),
    announce: "Loose spacing enabled",
  },
  {
    patterns: ["enable relaxed spacing", "relaxed spacing", "relaxed line spacing", "increase spacing"],
    action: () => dispatchA11yUpdate({ lineSpacing: "relaxed" }),
    announce: "Relaxed spacing enabled",
  },
  {
    patterns: ["disable wide letters", "normal letters", "default letter spacing", "normal letter spacing"],
    action: () => dispatchA11yUpdate({ letterSpacing: "normal" }),
    announce: "Letter spacing reset to normal",
  },
  {
    patterns: ["enable wide letters", "wide letter spacing", "wide letters", "increase letter spacing"],
    action: () => dispatchA11yUpdate({ letterSpacing: "wide" }),
    announce: "Wide letter spacing enabled",
  },

  // ── Color Blind Filters ────────────────────────────────────────
  {
    patterns: ["disable color blind", "color blind off", "normal colors", "reset colors", "standard colors"],
    action: () => dispatchA11yUpdate({ colorBlindMode: "none" }),
    announce: "Color blind filter disabled. Normal colors restored.",
  },
  {
    patterns: ["enable deuteranopia", "deuteranopia on", "deuteranopia", "green color blind", "green blind"],
    action: () => dispatchA11yUpdate({ colorBlindMode: "deuteranopia" }),
    announce: "Deuteranopia green filter enabled",
  },
  {
    patterns: ["enable protanopia", "protanopia on", "protanopia", "red color blind", "red blind"],
    action: () => dispatchA11yUpdate({ colorBlindMode: "protanopia" }),
    announce: "Protanopia red filter enabled",
  },
  {
    patterns: ["enable tritanopia", "tritanopia on", "tritanopia", "blue color blind", "blue blind"],
    action: () => dispatchA11yUpdate({ colorBlindMode: "tritanopia" }),
    announce: "Tritanopia blue filter enabled",
  },
  {
    patterns: ["enable grayscale", "grayscale on", "grayscale", "monochrome", "black and white"],
    action: () => dispatchA11yUpdate({ colorBlindMode: "monochromacy" }),
    announce: "Grayscale mode enabled",
  },

  // ── Speech Rate Control ────────────────────────────────────────
  {
    patterns: ["speak faster", "faster voice", "speed up"],
    action: (engine) => engine.adjustSpeechRate(0.2),
    announce: "Speaking faster",
  },
  {
    patterns: ["speak slower", "slower voice", "slow down"],
    action: (engine) => engine.adjustSpeechRate(-0.2),
    announce: "Speaking slower",
  },
  {
    patterns: ["normal voice", "default voice", "normal speed"],
    action: (engine) => engine.setSpeechRate(0.95),
    announce: "Voice speed normal",
  },

  // ── Master Reset ───────────────────────────────────────────────
  {
    patterns: ["reset accessibility", "reset all", "reset tools", "default accessibility", "reset all tools"],
    action: () => dispatchA11yReset(),
    announce: "All accessibility settings reset to default",
  },
];

const DEFAULT_SETTINGS: Required<ScreenReaderSettings> = {
  lang: "en-IN",
  rate: 0.95,
  pitch: 1.0,
  volume: 1.0,
  announceCommands: false,
};

// Minimal shape for the Web Speech API's SpeechRecognition — TS's lib.dom
// doesn't ship full typings for it yet, so we declare just what we use.
interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
}

type EngineState = {
  isActive: boolean;
  isListening: boolean;
  lastSpoken: string;
  transcript: string;
};

// ── Shared engine — one per tab, independent of any component's lifecycle ─
class ScreenReaderEngine {
  private state: EngineState = {
    isActive: false,
    isListening: false,
    lastSpoken: "",
    transcript: "",
  };

  private settings: Required<ScreenReaderSettings> = { ...DEFAULT_SETTINGS };
  navigateRef: NavigateFunction | null = null;

  private recognition: SpeechRecognitionLike | null = null;
  private currentFocus: Element | null = null;
  private synth = typeof window !== "undefined" ? window.speechSynthesis : null;
  private activeUtterance: SpeechSynthesisUtterance | null = null; // Prevent Chromium GC mid-speech
  private liveRegionObserver: MutationObserver | null = null;
  private micPermissionDenied = false;
  private restartTimer: any = null;

  private listeners = new Set<() => void>();

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        // Pre-warm browser voice list
        try {
          window.speechSynthesis.getVoices();
        } catch {}
      };
    }
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };

  getSnapshot = (): EngineState => this.state;

  private setState(patch: Partial<EngineState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach(l => l());
  }

  updateSettings(next: Partial<ScreenReaderSettings>) {
    this.settings = { ...this.settings, ...next };
    if (this.recognition) this.recognition.lang = this.settings.lang;
  }

  adjustSpeechRate(delta: number) {
    const nextRate = Math.min(2.0, Math.max(0.5, +(this.settings.rate + delta).toFixed(2)));
    this.settings.rate = nextRate;
  }

  setSpeechRate(rate: number) {
    this.settings.rate = rate;
  }

  private prefersReducedMotion() {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  }

  speak = (text: string, priority = false) => {
    if (!text || !this.synth) return;

    if (priority) {
      try {
        this.synth.cancel();
      } catch {}
    } else if (this.synth.paused) {
      try {
        this.synth.resume();
      } catch {}
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.settings.lang;
    utterance.rate = this.settings.rate;
    utterance.pitch = this.settings.pitch;
    utterance.volume = this.settings.volume;

    this.activeUtterance = utterance;
    utterance.onend = () => {
      if (this.activeUtterance === utterance) {
        this.activeUtterance = null;
      }
    };
    utterance.onerror = (err) => {
      if (this.activeUtterance === utterance) {
        this.activeUtterance = null;
      }
      if (err.error !== "interrupted" && err.error !== "canceled") {
        console.warn("SpeechSynthesis error:", err);
      }
    };

    // Robust language-voice matching
    try {
      const voices = this.synth.getVoices();
      const targetLang = this.settings.lang.replace("_", "-").toLowerCase();
      const prefix = targetLang.split("-")[0];
      const voice =
        voices.find(v => v.lang.replace("_", "-").toLowerCase() === targetLang) ||
        voices.find(v => v.lang.replace("_", "-").toLowerCase().startsWith(prefix));
      if (voice) utterance.voice = voice;
    } catch {}

    if (priority) {
      setTimeout(() => {
        if (this.synth) this.synth.speak(utterance);
      }, 15);
    } else {
      this.synth.speak(utterance);
    }

    this.setState({ lastSpoken: text });
  };

  private getElementLabel(el: Element): string {
    if (!el) return "";
    if (el.getAttribute("aria-hidden") === "true") return "";

    const tagName = el.tagName.toLowerCase();
    const role = el.getAttribute("role");
    const type = el.getAttribute("type");
    const alt = el.getAttribute("alt");

    if (tagName === "img" && alt === "") return "";

    const ariaLabel = el.getAttribute("aria-label");
    const describedBy = el.getAttribute("aria-describedby");
    const description = describedBy
      ? describedBy
        .split(/\s+/)
        .map(id => document.getElementById(id)?.innerText?.trim())
        .filter(Boolean)
        .join(". ")
      : "";
    const title = el.getAttribute("title");
    const placeholder = el.getAttribute("placeholder");
    const text = (el as HTMLElement).innerText?.trim();

    const id = el.getAttribute("id");
    const labelEl = id ? document.querySelector(`label[for="${CSS.escape(id)}"]`) : null;
    const labelText = (labelEl as HTMLElement)?.innerText?.trim();

    let label = ariaLabel || labelText || text || placeholder || alt || title || "";

    const isDisabled = el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true";
    const isRequired = el.hasAttribute("required") || el.getAttribute("aria-required") === "true";
    const isInvalid = el.getAttribute("aria-invalid") === "true";

    if (tagName === "button" || role === "button") {
      label = `Button: ${label}`;
    } else if (tagName === "a") {
      label = `Link: ${label}`;
    } else if (tagName === "input") {
      const inputType = type || "text";
      if (inputType === "checkbox" || role === "checkbox") {
        const checked = (el as HTMLInputElement).checked || el.getAttribute("aria-checked") === "true";
        label = `Checkbox ${checked ? "checked" : "unchecked"}: ${label}`;
      } else if (inputType === "radio" || role === "radio") {
        const checked = (el as HTMLInputElement).checked || el.getAttribute("aria-checked") === "true";
        label = `Radio button ${checked ? "selected" : "not selected"}: ${label}`;
      } else if (inputType === "range") {
        const val = (el as HTMLInputElement).value;
        label = `Slider ${label}: value ${val}`;
      } else {
        label = `Input field ${label ? label : ""}: ${inputType}`;
      }
    } else if (role === "switch") {
      const checked = el.getAttribute("aria-checked") === "true";
      label = `Switch ${checked ? "on" : "off"}: ${label}`;
    } else if (tagName === "select") {
      const val = (el as HTMLSelectElement).value;
      label = `Dropdown ${label}: currently selected ${val}`;
    } else if (tagName === "textarea") {
      label = `Text area: ${label}`;
    } else if (tagName === "img") {
      label = `Image: ${label || "no description"}`;
    } else if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(tagName)) {
      label = `Heading level ${tagName.slice(1)}: ${label}`;
    } else if (role === "tab") {
      const selected = el.getAttribute("aria-selected") === "true";
      label = `Tab${selected ? " selected" : ""}: ${label}`;
    } else if (role === "menuitem") {
      label = `Menu item: ${label}`;
    }

    const posInSet = el.getAttribute("aria-posinset");
    const setSize = el.getAttribute("aria-setsize");
    if (posInSet && setSize) {
      label += `, item ${posInSet} of ${setSize}`;
    }

    if (description) label += `. ${description}`;
    if (isRequired) label += ", required";
    if (isInvalid) label += ", invalid entry";
    if (isDisabled) label += ", disabled";

    return label.trim() || "Unknown element";
  }

  private highlightElement(el: Element | null) {
    document.querySelectorAll(".sr-focus-highlight").forEach(e => {
      e.classList.remove("sr-focus-highlight");
    });
    if (el) {
      el.classList.add("sr-focus-highlight");
      el.scrollIntoView({
        behavior: this.prefersReducedMotion() ? "auto" : "smooth",
        block: "center",
      });
    }
  }

  getFocusableElements(): HTMLElement[] {
    const all = Array.from(document.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )) as HTMLElement[];
    return all.filter(el => {
      if (el.getAttribute("aria-hidden") === "true") return false;
      const style = window.getComputedStyle(el);
      return style.display !== "none" && style.visibility !== "hidden";
    });
  }

  private handleFocusChange = (e: FocusEvent) => {
    if (!this.state.isActive) return;
    const el = e.target as Element;
    if (!el) return;
    this.currentFocus = el;
    this.highlightElement(el);
    const label = this.getElementLabel(el);
    if (label) this.speak(label, true);
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (!this.state.isActive) return;

    const target = e.target as HTMLElement;
    const tag = target?.tagName?.toLowerCase();
    const inputType = tag === "input" ? (target as HTMLInputElement).type : "";
    const isTextEntry =
      (tag === "input" && !["checkbox", "radio", "button", "submit", "range", "color"].includes(inputType)) ||
      tag === "textarea" ||
      target?.isContentEditable;

    if (e.key === "Escape") {
      if (this.synth) {
        try { this.synth.cancel(); } catch {}
      }
      this.speak("Stopped", true);
      return;
    }

    // Inside text entry fields, let arrow keys and space/enter behave normally
    if (isTextEntry) return;

    if (e.key === "Enter" || e.key === " ") {
      this.speak("Activated", true);
    } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      // Virtual cursor: navigate to next focusable element
      const focusable = this.getFocusableElements();
      const idx = focusable.indexOf(this.currentFocus as HTMLElement);
      const next = focusable[idx + 1];
      if (next) {
        next.focus();
      } else {
        this.speak("End of page");
      }
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      // Virtual cursor: navigate to previous focusable element
      const focusable = this.getFocusableElements();
      const idx = focusable.indexOf(this.currentFocus as HTMLElement);
      const prev = focusable[idx - 1];
      if (prev) {
        prev.focus();
      } else {
        this.speak("Beginning of page");
      }
    }
  };

  private setupLiveRegionObserver() {
    const debounceTimers = new Map<Element, ReturnType<typeof setTimeout>>();
    const lastAnnounced = new Map<Element, string>();

    const observer = new MutationObserver(mutations => {
      if (!this.state.isActive) return;

      const touchedRegions = new Set<Element>();
      for (const mutation of mutations) {
        const node = mutation.target as Node;
        const el = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
        const liveEl = el?.closest('[aria-live], [role="alert"], [role="status"]');
        if (liveEl) touchedRegions.add(liveEl);
      }

      touchedRegions.forEach(liveEl => {
        clearTimeout(debounceTimers.get(liveEl));
        debounceTimers.set(
          liveEl,
          setTimeout(() => {
            const text = (liveEl as HTMLElement).innerText?.trim();
            if (!text || lastAnnounced.get(liveEl) === text) return;
            lastAnnounced.set(liveEl, text);
            const urgent = liveEl.getAttribute("aria-live") === "assertive" || liveEl.getAttribute("role") === "alert";
            this.speak(text, urgent);
          }, 150)
        );
      });
    });

    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    this.liveRegionObserver = observer;
  }

  private handleVoiceCommand = (command: string) => {
    if (this.settings.announceCommands) this.speak(`Command: ${command}`, true);

    if (command.includes("click") || command.includes("press") || command.includes("select")) {
      const focused = this.currentFocus as HTMLElement;
      if (focused) { focused.click(); this.speak("Clicked"); }
      else this.speak("Nothing is focused to click");
      return;
    }

    const smooth = this.prefersReducedMotion() ? "auto" : "smooth";

    if (command.includes("scroll down") || command.includes("go down")) {
      window.scrollBy({ top: 300, behavior: smooth });
      this.speak("Scrolling down");
      return;
    }
    if (command.includes("scroll up") || command.includes("go up")) {
      window.scrollBy({ top: -300, behavior: smooth });
      this.speak("Scrolling up");
      return;
    }
    if (command.includes("scroll top") || command.includes("top of page")) {
      window.scrollTo({ top: 0, behavior: smooth });
      this.speak("Going to top");
      return;
    }
    if (command.includes("scroll bottom") || command.includes("bottom of page")) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: smooth });
      this.speak("Going to bottom");
      return;
    }

    if (command.includes("go back") || command.includes("previous page")) {
      this.navigateRef?.(-1);
      this.speak("Going back");
      return;
    }

    const routeMatch = ROUTE_COMMANDS.find(r => r.patterns.some(p => command.includes(p)));
    if (routeMatch) {
      this.navigateRef?.(routeMatch.path);
      this.speak(routeMatch.announce);
      return;
    }

    if (command.includes("next") || command.includes("tab forward")) {
      const focusable = this.getFocusableElements();
      const idx = focusable.indexOf(this.currentFocus as HTMLElement);
      const next = focusable[idx + 1];
      if (next) next.focus(); else this.speak("No more elements");
      return;
    }
    if (command.includes("previous") || command.includes("tab back")) {
      const focusable = this.getFocusableElements();
      const idx = focusable.indexOf(this.currentFocus as HTMLElement);
      const prev = focusable[idx - 1];
      if (prev) prev.focus(); else this.speak("Already at the first element");
      return;
    }

    if (command.includes("read page") || command.includes("read all")) {
      this.speak(document.body.innerText.slice(0, 500));
      return;
    }
    if (command.includes("read heading") || command.includes("headings")) {
      const headings = Array.from(document.querySelectorAll("h1,h2,h3"))
        .map(h => (h as HTMLElement).innerText)
        .join(". ");
      this.speak(headings || "No headings found on this page");
      return;
    }

    if (command.includes("stop") || command.includes("quiet") || command.includes("silence")) {
      if (this.synth) {
        try { this.synth.cancel(); } catch {}
      }
      this.speak("Stopped");
      return;
    }

    // Check accessibility tool commands (high contrast, text size, dyslexia, presets, etc.)
    // Check accessibility tool commands (prioritize longest, most specific matching phrase)
    let matchedA11yCmd: A11yToolVoiceCommand | null = null;
    let longestLen = 0;
    for (const cmd of A11Y_TOOL_COMMANDS) {
      for (const pattern of cmd.patterns) {
        if (command.includes(pattern) && pattern.length > longestLen) {
          matchedA11yCmd = cmd;
          longestLen = pattern.length;
        }
      }
    }

    if (matchedA11yCmd) {
      matchedA11yCmd.action(this);
      this.speak(matchedA11yCmd.announce, true);
      return;
    }

    if (command.includes("repeat") || command.includes("say again")) {
      this.speak(this.state.lastSpoken, true);
      return;
    }

    if (command.includes("help") || command.includes("commands")) {
      this.speak(
        "Simple commands available: say enable visual impairment, or disable visual impairment. Enable motor impairment, or disable motor impairment. Enable dyslexia, or disable dyslexia. Enable epilepsy, or disable epilepsy. Enable or disable high contrast, enable large text, enable dyslexia font, disable animations, enable reading guide, enable focus indicators, deuteranopia, normal colors, or reset accessibility."
      );
      return;
    }

    this.speak(`Command not recognized: ${command}. Say help for available commands.`);
  };

  private setupVoiceRecognition() {
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      this.speak("Voice recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {}
      this.recognition = null;
    }

    const recognition: SpeechRecognitionLike = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.lang = this.settings.lang;
    recognition.interimResults = false;

    recognition.onstart = () => {
      if (this.recognition === recognition) {
        this.setState({ isListening: true });
      }
    };

    recognition.onend = () => {
      if (this.recognition !== recognition) return;
      this.setState({ isListening: false });

      if (this.state.isActive && !this.micPermissionDenied) {
        clearTimeout(this.restartTimer);
        this.restartTimer = setTimeout(() => {
          if (this.recognition === recognition && this.state.isActive && !this.micPermissionDenied) {
            try {
              recognition.start();
            } catch (err) {
              console.warn("SpeechRecognition auto-restart skipped:", err);
            }
          }
        }, 400);
      }
    };

    recognition.onresult = (event: any) => {
      if (this.recognition !== recognition) return;
      const command = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      this.setState({ transcript: command });
      this.handleVoiceCommand(command);
    };

    recognition.onerror = (e: any) => {
      if (this.recognition !== recognition) return;
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        this.micPermissionDenied = true;
        this.speak("Microphone access was denied. Please allow microphone permissions in your browser to use voice commands.");
      } else if (e.error !== "no-speech" && e.error !== "aborted") {
        console.error("Voice recognition error:", e.error);
      }
      this.setState({ isListening: false });
    };

    this.recognition = recognition;
    try {
      recognition.start();
    } catch (err) {
      console.warn("Failed to start voice recognition:", err);
    }
  }

  activate = () => {
    if (this.state.isActive) return;
    this.micPermissionDenied = false;
    this.setState({ isActive: true });
    document.addEventListener("focusin", this.handleFocusChange);
    document.addEventListener("keydown", this.handleKeyDown);
    this.speak("Screen reader activated. Press Tab to navigate, or say help for voice commands.", true);
    this.setupVoiceRecognition();
    this.setupLiveRegionObserver();
    setTimeout(() => {
      const first = this.getFocusableElements()[0];
      if (first) first.focus();
    }, 600);
  };

  deactivate = () => {
    if (!this.state.isActive) return;
    this.setState({ isActive: false, isListening: false });
    document.removeEventListener("focusin", this.handleFocusChange);
    document.removeEventListener("keydown", this.handleKeyDown);
    clearTimeout(this.restartTimer);
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {}
      this.recognition = null;
    }
    this.liveRegionObserver?.disconnect();
    this.liveRegionObserver = null;
    document.querySelectorAll(".sr-focus-highlight, .sr-focus-ring").forEach(e => {
      e.classList.remove("sr-focus-highlight", "sr-focus-ring");
    });
    this.speak("Screen reader deactivated", true);
  };
}

// One engine per tab — module scope means it survives every remount.
const engine = new ScreenReaderEngine();

// ── React hook — a thin, subscribable wrapper around the shared engine ────
export const useScreenReader = (settingsOverride: ScreenReaderSettings = {}) => {
  const navigate = useNavigate();

  // The engine needs a live navigate() — this is the one thing genuinely
  // tied to a component's Router context — so keep it current every render.
  useEffect(() => {
    engine.navigateRef = navigate;
  }, [navigate]);

  // Apply this call site's initial settings once. For runtime changes
  // (e.g. a language switcher), call the returned updateSettings() instead.
  const initialSettingsRef = useRef(settingsOverride);
  useEffect(() => {
    if (Object.keys(initialSettingsRef.current).length > 0) {
      engine.updateSettings(initialSettingsRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { isActive, isListening, lastSpoken, transcript } = useSyncExternalStore(
    engine.subscribe,
    engine.getSnapshot
  );

  const activate = useCallback(() => engine.activate(), []);
  const deactivate = useCallback(() => engine.deactivate(), []);
  const speak = useCallback((text: string, priority?: boolean) => engine.speak(text, priority), []);
  const updateSettings = useCallback((next: Partial<ScreenReaderSettings>) => engine.updateSettings(next), []);

  // Deliberately no cleanup-on-unmount here: the engine is shared and must
  // keep running across route changes. It only stops via deactivate().

  return { isActive, isListening, lastSpoken, transcript, activate, deactivate, speak, updateSettings };
};