// frontend/src/features/auth/components/AuthAccessibilityBar.tsx
// Prominent Top Accessibility Toolbar for SMART EDUCATION AI Login & Signup

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Accessibility,
  Sun,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
  FileText,
  Hand,
  Sliders,
  Keyboard,
  Eye,
  Check,
  Sparkles,
  HelpCircle,
  X,
  Compass,
} from "lucide-react";
import { useAccessibility, type TextSize } from "@/contexts/AccessibilityContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AuthAccessibilityBarProps {
  onOpenFullModal: () => void;
}

export const AuthAccessibilityBar: React.FC<AuthAccessibilityBarProps> = ({ onOpenFullModal }) => {
  const { settings, update, speak, activeCount, reset } = useAccessibility();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Cycle text size: normal -> large -> xl
  const handleCycleTextSize = () => {
    const sequence: TextSize[] = ["normal", "large", "xl"];
    const nextIdx = (sequence.indexOf(settings.textSize) + 1) % sequence.length;
    const nextSize = sequence[nextIdx];
    update({ textSize: nextSize });
    speak(`Text size set to ${nextSize}`);
  };

  const handleToggleHighContrast = () => {
    const next = !settings.highContrast;
    update({ highContrast: next });
    speak(next ? "High contrast mode enabled" : "High contrast mode disabled");
  };

  const handleToggleTts = () => {
    const next = !settings.ttsEnabled;
    update({ ttsEnabled: next });
    speak(next ? "Text to speech narrator enabled" : "Text to speech narrator disabled");
  };

  const handleToggleDyslexia = () => {
    const next = !settings.dyslexiaFont;
    update({ dyslexiaFont: next });
    speak(next ? "OpenDyslexic font enabled" : "Default font restored");
  };

  const handleToggleReadingGuide = () => {
    const next = !settings.readingGuide;
    update({ readingGuide: next });
    speak(next ? "Reading focus ruler activated" : "Reading focus ruler deactivated");
  };

  const KEYBOARD_SHORTCUTS = [
    { key: "Alt + A", action: "Open Complete Accessibility Menu" },
    { key: "Alt + H", action: "Toggle High Contrast (WCAG AAA)" },
    { key: "Alt + T", action: "Toggle Text-to-Speech Narrator" },
    { key: "Alt + D", action: "Toggle OpenDyslexic Typography" },
    { key: "Alt + R", action: "Toggle Reading Focus Ruler" },
    { key: "Alt + 1", action: "Switch to EduID Login Tab" },
    { key: "Alt + 2", action: "Switch to Email Login Tab" },
    { key: "Alt + S", action: "Switch between Login and Signup" },
    { key: "Tab / Shift+Tab", action: "Navigate focus trap-free" },
  ];

  return (
    <>
      <div className="relative z-30 w-full border-b border-white/10 bg-slate-950/80 px-4 py-2.5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 text-white">
          {/* Left: Accessibility Badge & Prompt */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenFullModal}
              className="flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-bold text-indigo-300 transition-all hover:bg-indigo-500/20 hover:border-indigo-400"
            >
              <Accessibility className="h-4 w-4 text-indigo-400" />
              <span className="hidden sm:inline">Accessibility & Comfort Mode</span>
              <span className="sm:hidden">A11y</span>
              {activeCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-black text-white">
                  {activeCount}
                </span>
              )}
            </button>

            <span className="hidden md:inline text-[11px] text-white/50">
              Customize sensory, visual, audio & motor preferences
            </span>
          </div>

          {/* Right: Quick 1-Click Accessibility Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* High Contrast */}
            <button
              type="button"
              onClick={handleToggleHighContrast}
              title="Toggle High Contrast Mode (Alt+H)"
              className={`flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-all ${
                settings.highContrast
                  ? "border-amber-400 bg-amber-400 text-black shadow-md font-bold"
                  : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Contrast</span>
            </button>

            {/* Text Zoom */}
            <button
              type="button"
              onClick={handleCycleTextSize}
              title="Cycle Text Size (Normal / Large / Extra Large)"
              className={`flex h-8 items-center gap-1 rounded-lg border px-2.5 text-xs font-semibold transition-all ${
                settings.textSize !== "normal"
                  ? "border-sky-400 bg-sky-500/20 text-sky-300 font-bold"
                  : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="font-bold text-[13px]">A</span>
              <span className="text-[10px] text-sky-400 uppercase font-mono">
                {settings.textSize === "xl" ? "++" : settings.textSize === "large" ? "+" : "1x"}
              </span>
            </button>

            {/* Dyslexia Font */}
            <button
              type="button"
              onClick={handleToggleDyslexia}
              title="Toggle OpenDyslexic Typography (Alt+D)"
              className={`hidden sm:flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-all ${
                settings.dyslexiaFont
                  ? "border-teal-400 bg-teal-500/20 text-teal-300 font-bold"
                  : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Dyslexia</span>
            </button>

            {/* TTS Read Aloud */}
            <button
              type="button"
              onClick={handleToggleTts}
              title="Toggle Text-to-Speech Narrator (Alt+T)"
              className={`flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-all ${
                settings.ttsEnabled
                  ? "border-purple-400 bg-purple-500/20 text-purple-300 font-bold"
                  : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              {settings.ttsEnabled ? (
                <Volume2 className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
              ) : (
                <VolumeX className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">TTS</span>
            </button>

            {/* Reading Guide Ruler */}
            <button
              type="button"
              onClick={handleToggleReadingGuide}
              title="Toggle Reading Focus Ruler Line (Alt+R)"
              className={`hidden md:flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-all ${
                settings.readingGuide
                  ? "border-indigo-400 bg-indigo-500/20 text-indigo-300 font-bold"
                  : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Ruler</span>
            </button>

            {/* Keyboard Shortcuts Dialog Trigger */}
            <button
              type="button"
              onClick={() => setShortcutsOpen(true)}
              title="View Accessible Keyboard Shortcuts"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <Keyboard className="h-3.5 w-3.5" />
            </button>

            {/* Full Settings Cog */}
            <button
              type="button"
              onClick={onOpenFullModal}
              title="More Accessibility Options"
              className="flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-3 text-xs font-bold text-white shadow-md hover:opacity-90 active:scale-95"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
        <DialogContent className="rounded-2xl border border-white/15 bg-slate-950 p-6 text-white sm:max-w-md">
          <DialogHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 mb-2">
              <Keyboard className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-white">
              Accessible Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription className="text-xs text-white/60">
              Navigate Smart Education AI completely hands-free using standard keyboard triggers.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
            {KEYBOARD_SHORTCUTS.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs"
              >
                <span className="text-white/80">{item.action}</span>
                <kbd className="rounded-md border border-white/20 bg-white/10 px-2 py-1 font-mono text-[11px] font-bold text-indigo-300">
                  {item.key}
                </kbd>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              size="sm"
              onClick={() => setShortcutsOpen(false)}
              className="bg-indigo-600 font-bold text-white text-xs hover:bg-indigo-500"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
