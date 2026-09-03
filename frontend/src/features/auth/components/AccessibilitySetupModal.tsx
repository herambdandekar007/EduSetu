// frontend/src/features/auth/components/AccessibilitySetupModal.tsx
// Modern Accessible Comfort & Assistive Tools Configuration Panel for SMART EDUCATION AI

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Accessibility,
  Mic,
  Volume2,
  ZoomIn,
  Sun,
  Eye,
  Hand,
  Keyboard,
  MousePointer,
  FileText,
  Check,
  X,
  Sparkles,
  Camera,
  Shield,
  Sliders,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import type { AccessibilityPreferences } from "../types/auth.types";

interface AccessibilitySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: AccessibilityPreferences;
  onSavePreferences: (prefs: AccessibilityPreferences) => void;
}

export const AccessibilitySetupModal: React.FC<AccessibilitySetupModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onSavePreferences,
}) => {
  const { update: updateGlobalA11y } = useAccessibility();
  const [localPrefs, setLocalPrefs] = useState<AccessibilityPreferences>(preferences);
  const [showGestureCamPrompt, setShowGestureCamPrompt] = useState(false);

  if (!isOpen) return null;

  const handleToggle = (key: keyof AccessibilityPreferences, value: boolean) => {
    if (key === "gestureControl" && value) {
      // Prompt user about camera before enabling
      setShowGestureCamPrompt(true);
      return;
    }

    const updated = { ...localPrefs, [key]: value, enabled: true };
    setLocalPrefs(updated);

    // Apply live previews where supported by AccessibilityContext
    if (key === "highContrast") updateGlobalA11y({ highContrast: value });
    if (key === "largeText") updateGlobalA11y({ textSize: value ? "large" : "normal" });
    if (key === "dyslexiaFont") updateGlobalA11y({ dyslexiaFont: value });
    if (key === "textToSpeech") updateGlobalA11y({ ttsEnabled: value });
    if (key === "focusIndicators") updateGlobalA11y({ focusIndicators: value });
  };

  const handleConfirmGestureCamera = async () => {
    setShowGestureCamPrompt(false);
    try {
      // Test or trigger camera permission prompt
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setLocalPrefs((prev) => ({ ...prev, gestureControl: true, enabled: true }));
    } catch (e) {
      console.warn("Camera permission denied or cancelled:", e);
      setLocalPrefs((prev) => ({ ...prev, gestureControl: false }));
    }
  };

  const handleSaveAndApply = () => {
    onSavePreferences(localPrefs);
    onClose();
  };

  const a11yTools = [
    {
      id: "voiceControl" as const,
      icon: Mic,
      title: "Voice Control",
      desc: "Navigate Smart Education AI using spoken voice commands.",
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      id: "textToSpeech" as const,
      icon: Volume2,
      title: "Text-to-Speech (TTS)",
      desc: "Automatically read aloud questions, study materials, and buttons.",
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      id: "largeText" as const,
      icon: ZoomIn,
      title: "Zoom & Large Text",
      desc: "Enlarge all typography and buttons for comfortable reading.",
      color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    },
    {
      id: "highContrast" as const,
      icon: Sun,
      title: "High Contrast Mode",
      desc: "Maximize foreground-to-background contrast ratio (WCAG AAA).",
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      id: "dyslexiaFont" as const,
      icon: FileText,
      title: "OpenDyslexic Typography",
      desc: "Enable weighted letterforms designed specifically for dyslexic readers.",
      color: "text-teal-400 bg-teal-500/10 border-teal-500/20",
    },
    {
      id: "screenReader" as const,
      icon: Eye,
      title: "Screen Reader Optimizations",
      desc: "Enhanced ARIA labels, semantic landmark trees, and live region announcements.",
      color: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    },
    {
      id: "gestureControl" as const,
      icon: Hand,
      title: "Touchless Gesture Control",
      desc: "Control cursor, clicks, and page scrolling hands-free using your webcam.",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      id: "keyboardNavigation" as const,
      icon: Keyboard,
      title: "Keyboard Focus & Shortcuts",
      desc: "Full keyboard trap-free navigation with highlighted focus borders.",
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-white/15 bg-gradient-to-b from-slate-900/95 via-indigo-950/90 to-slate-900/95 p-6 text-white shadow-2xl backdrop-blur-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
              <Accessibility className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <span>Accessibility & Comfort Mode</span>
                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/30">
                  Inclusive Design
                </span>
              </h2>
              <p className="text-xs text-indigo-200/70">
                Customize your sensory, motor, and learning preferences anytime. Open to everyone.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-4 pr-1 space-y-3 custom-scrollbar">
          {/* Quick Preset Selector */}
          <div className="grid grid-cols-2 gap-3 pb-2">
            <button
              type="button"
              onClick={() => {
                setLocalPrefs({
                  ...localPrefs,
                  enabled: false,
                  highContrast: false,
                  largeText: false,
                  dyslexiaFont: false,
                  textToSpeech: false,
                  gestureControl: false,
                });
                updateGlobalA11y({
                  highContrast: false,
                  textSize: "normal",
                  dyslexiaFont: false,
                  ttsEnabled: false,
                });
              }}
              className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                !localPrefs.highContrast && !localPrefs.largeText && !localPrefs.gestureControl
                  ? "border-indigo-500/50 bg-indigo-500/15"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <div>
                <div className="text-xs font-bold text-white">Standard Experience</div>
                <div className="text-[10px] text-white/60">Default high-definition interface</div>
              </div>
              {!localPrefs.highContrast && !localPrefs.largeText && !localPrefs.gestureControl && (
                <Check className="h-4 w-4 text-indigo-400" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                const enhanced: AccessibilityPreferences = {
                  ...localPrefs,
                  enabled: true,
                  largeText: true,
                  focusIndicators: true,
                  textToSpeech: true,
                };
                setLocalPrefs(enhanced);
                updateGlobalA11y({ textSize: "large", focusIndicators: true, ttsEnabled: true });
              }}
              className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                localPrefs.largeText || localPrefs.highContrast || localPrefs.gestureControl
                  ? "border-purple-500/50 bg-purple-500/15"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <div>
                <div className="text-xs font-bold text-white">Enhanced Assistive Mode</div>
                <div className="text-[10px] text-purple-300">Customized visual, audio & motor aids</div>
              </div>
              {(localPrefs.largeText || localPrefs.highContrast || localPrefs.gestureControl) && (
                <Sparkles className="h-4 w-4 text-purple-400" />
              )}
            </button>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {a11yTools.map((tool) => {
              const Icon = tool.icon;
              const isChecked =
                tool.id === "keyboardNavigation"
                  ? localPrefs.focusIndicators
                  : !!localPrefs[tool.id as keyof AccessibilityPreferences];

              return (
                <div
                  key={tool.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm transition-all hover:border-white/20"
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border ${tool.color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-white block cursor-pointer">
                        {tool.title}
                      </Label>
                      <p className="text-[10px] text-white/60 leading-relaxed mt-0.5">
                        {tool.desc}
                      </p>
                    </div>
                  </div>

                  <Switch
                    checked={isChecked}
                    onCheckedChange={(val) => {
                      if (tool.id === "keyboardNavigation") {
                        handleToggle("focusIndicators", val);
                      } else {
                        handleToggle(tool.id as keyof AccessibilityPreferences, val);
                      }
                    }}
                    className="data-[state=checked]:bg-indigo-500"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
          <span className="text-[11px] text-indigo-300/70">
            Preferences will automatically save to your permanent profile.
          </span>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveAndApply}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold text-white shadow-lg text-xs hover:opacity-90"
            >
              Apply & Save Preferences
            </Button>
          </div>
        </div>

        {/* Camera Permission Modal for Gestures */}
        <AnimatePresence>
          {showGestureCamPrompt && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-slate-950/95 p-6 text-center backdrop-blur-xl border border-emerald-500/30"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-3 shadow-lg">
                <Camera className="h-7 w-7" />
              </div>
              <h3 className="text-base font-extrabold text-white">Enable Camera for Hand Tracking</h3>
              <p className="text-xs text-white/70 max-w-md mt-1.5 leading-relaxed">
                Touchless gesture control requires local camera access to track 21 hand landmarks
                via MediaPipe. Video is processed 100% on your device and never uploaded to any server.
              </p>

              <div className="flex items-center gap-3 mt-5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGestureCamPrompt(false)}
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10 text-xs"
                >
                  Not Now
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirmGestureCamera}
                  className="bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 text-xs shadow-lg"
                >
                  Enable Camera
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
