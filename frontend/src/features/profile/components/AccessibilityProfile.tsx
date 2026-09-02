// frontend/src/features/profile/components/AccessibilityProfile.tsx
// Pure Minimalist White & Grayscale Accessibility Information Section for SMART EDUCATION AI

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Accessibility, Save, Loader2, Info } from "lucide-react";
import type { AccessibilityProfileSettings, StudentPersonalProfile } from "../types/profile.types";
import { toast } from "sonner";

interface AccessibilityProfileProps {
  settings: AccessibilityProfileSettings;
  personalProfile?: StudentPersonalProfile | null;
  saving: boolean;
  onSave: (settings: Partial<AccessibilityProfileSettings>) => Promise<void>;
  onSavePersonal?: (data: Partial<StudentPersonalProfile>) => Promise<void>;
}

const DISABILITY_TYPES = [
  "Visual Impairment / Low Vision",
  "Hearing Impairment",
  "Locomotor / Physical Disability",
  "Intellectual Disability",
  "Speech & Language Disability",
  "Learning Disability (Dyslexia / ADHD)",
  "Multiple Disabilities",
  "Other",
];

export const AccessibilityProfile: React.FC<AccessibilityProfileProps> = ({
  settings,
  personalProfile,
  saving,
  onSave,
  onSavePersonal,
}) => {
  const [formData, setFormData] = useState<AccessibilityProfileSettings>({ ...settings });
  const [disabilityType, setDisabilityType] = useState(personalProfile?.disabilityType || "");
  const [disabilityPercentage, setDisabilityPercentage] = useState(personalProfile?.disabilityPercentage || 0);
  const [assistiveTech, setAssistiveTech] = useState(personalProfile?.assistiveTech || "");
  const [isPwD, setIsPwD] = useState(personalProfile?.studentType === "pwd");

  useEffect(() => {
    setFormData({ ...settings });
    if (personalProfile) {
      setDisabilityType(personalProfile.disabilityType || "");
      setDisabilityPercentage(personalProfile.disabilityPercentage || 0);
      setAssistiveTech(personalProfile.assistiveTech || "");
      setIsPwD(personalProfile.studentType === "pwd");
    }
  }, [settings, personalProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    if (onSavePersonal && personalProfile) {
      await onSavePersonal({
        studentType: isPwD ? "pwd" : "general",
        accessibilityRequired: isPwD,
        disabilityType: isPwD ? disabilityType : "",
        disabilityPercentage: isPwD ? disabilityPercentage : 0,
        assistiveTech: isPwD ? assistiveTech : "",
      });
    }
    toast.success("Accessibility settings updated.");
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8 text-black shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-lg font-bold text-black flex items-center gap-2">
            <Accessibility className="h-5 w-5 text-gray-700" />
            Accessibility & Assistive Preferences
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Optional accessibility settings to customize your interface across Smart Education AI.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Optional Disability Declaration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div>
              <p className="text-xs font-bold text-black">Accessibility Accommodations Required</p>
              <p className="text-[11px] text-gray-500">
                Enable tailored accessibility presets, screen reader optimizers, and scheme eligibility.
              </p>
            </div>
            <Switch
              checked={isPwD}
              onCheckedChange={setIsPwD}
              className="data-[state=checked]:bg-black"
            />
          </div>

          {isPwD && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-900">Disability Category</Label>
                <Select value={disabilityType || DISABILITY_TYPES[0]} onValueChange={setDisabilityType}>
                  <SelectTrigger className="h-10 rounded-lg border-gray-300 bg-white text-xs text-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 text-black text-xs">
                    {DISABILITY_TYPES.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-900">Disability Percentage (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={disabilityPercentage || ""}
                  onChange={(e) => setDisabilityPercentage(parseInt(e.target.value) || 0)}
                  placeholder="e.g. 40"
                  className="h-10 rounded-lg border-gray-300 bg-white text-xs text-black"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs font-semibold text-gray-900">Assistive Technology Used</Label>
                <Input
                  value={assistiveTech}
                  onChange={(e) => setAssistiveTech(e.target.value)}
                  placeholder="e.g. Screen Reader (NVDA / TalkBack), Braille display, Speech-to-Text"
                  className="h-10 rounded-lg border-gray-300 bg-white text-xs text-black"
                />
              </div>
            </div>
          )}
        </div>

        {/* Interface Accessibility Options */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Interface Display Preferences
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { key: "highContrast", label: "High Contrast Display", desc: "Maximum text contrast" },
              { key: "largeText", label: "Large Text Mode", desc: "Enlarges body and headings" },
              { key: "dyslexiaFont", label: "OpenDyslexic Typography", desc: "Dyslexia-friendly letterforms" },
              { key: "textToSpeech", label: "Text-to-Speech (TTS)", desc: "Reads explanations aloud" },
              { key: "readingGuide", label: "Reading Focus Guide", desc: "Ruler bar following cursor" },
              { key: "focusIndicators", label: "High Visibility Focus Rings", desc: "Enhanced keyboard focus" },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3.5"
              >
                <div>
                  <p className="text-xs font-semibold text-black">{item.label}</p>
                  <p className="text-[10px] text-gray-500">{item.desc}</p>
                </div>
                <Switch
                  checked={!!formData[item.key as keyof AccessibilityProfileSettings]}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, [item.key]: checked })
                  }
                  className="data-[state=checked]:bg-black"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <Button
            type="submit"
            disabled={saving}
            className="h-9 rounded-lg bg-black px-5 text-xs font-semibold text-white hover:bg-gray-800"
          >
            {saving ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="mr-1.5 h-3.5 w-3.5" />
            )}
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};
