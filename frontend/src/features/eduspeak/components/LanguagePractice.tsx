// features/eduspeak/components/LanguagePractice.tsx
// Multi-language speaking practice supporting Indian regional and international languages.

import React, { useState } from "react";
import {
  Globe,
  Volume2,
  Mic,
  Play,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SUPPORTED_LANGUAGES } from "../services/eduSpeakService";
import { playTextToSpeech } from "../services/speechService";
import type { LanguageOption, SpeakingPracticeMode } from "../types/eduspeak.types";

interface LanguagePracticeProps {
  currentLanguage: string;
  onChangeLanguage: (lang: LanguageOption) => void;
  onSelectPracticeTopic: (topic: {
    title: string;
    mode: SpeakingPracticeMode;
    instructions: string;
    durationSeconds: number;
    language: string;
  }) => void;
}

const REGIONAL_PROMPTS: Record<
  string,
  { title: string; prompt: string; instructions: string; samplePhrase: string }[]
> = {
  "hi-IN": [
    {
      title: "अपना परिचय (Self Introduction in Hindi)",
      prompt: "कृपया अपना नाम, शिक्षा और अपने लक्ष्यों के बारे में संक्षेप में बताएं।",
      instructions: "60 सेकंड तक स्पष्ट रूप से बोलें। अपने नाम, कॉलेज, और रुचियों का उल्लेख करें।",
      samplePhrase: "नमस्ते! मेरा नाम राहुल है और मैं कंप्यूटर इंजीनियरिंग का छात्र हूँ।",
    },
    {
      title: "दैनिक बातचीत (Daily Social Conversation in Hindi)",
      prompt: "अपने पसंदीदा शौक या तकनीक में आपकी रुचि के बारे में बात करें।",
      instructions: "60 सेकंड तक आत्मविश्वास के साथ बोलें।",
      samplePhrase: "मुझे नई तकनीक और सॉफ्टवेयर प्रोग्रामिंग सीखने में बहुत आनंद आता है।",
    },
  ],
  "mr-IN": [
    {
      title: "स्वतःची ओळख (Self Introduction in Marathi)",
      prompt: "आपले नाव, शिक्षण आणि भविष्यातील ध्येयांविषयी माहिती सांगा.",
      instructions: "60 सेकंद स्पष्टपणे बोला. आपले नाव, कॉलेज आणि आवडी सांगा.",
      samplePhrase: "नमस्कार! माझे नाव आदित्य आहे आणि मी संगणक अभियांत्रिकीचा विद्यार्थी आहे.",
    },
    {
      title: "दैनंदिन संभाषण (Daily Conversation in Marathi)",
      prompt: "तुमच्या आवडत्या विषयाबद्दल आणि प्रकल्पाबद्दल सांगा.",
      instructions: "आत्मविश्वासाने 60 सेकंद बोला.",
      samplePhrase: "तंत्रज्ञान आणि नवीन सॉफ्टवेअर शिकणे मला खूप आवडते.",
    },
  ],
  "ta-IN": [
    {
      title: "சுய அறிமுகம் (Self Introduction in Tamil)",
      prompt: "உங்கள் பெயர், கல்வி மற்றும் எதிர்கால இலக்குகள் பற்றி பேசவும்.",
      instructions: "60 வினாடிகள் தெளிவாக பேசவும்.",
      samplePhrase: "வணக்கம்! என் பெயர் கார்த்திக், நான் பொறியியல் படித்து வருகிறேன்.",
    },
  ],
  "te-IN": [
    {
      title: "స్వీయ పరిచయం (Self Introduction in Telugu)",
      prompt: "మీ పేరు, విద్య మరియు భవిష్యత్ లక్ష్యాల గురించి మాట్లాడండి.",
      instructions: "60 సెకన్ల పాటు స్పష్టంగా మాట్లాడండి.",
      samplePhrase: "నమస్కారం! నా పేరు సురేష్, నేను కంప్యూటర్ సైన్స్ చదువుతున్నాను.",
    },
  ],
  "bn-IN": [
    {
      title: "নিজের পরিচয় (Self Introduction in Bengali)",
      prompt: "আপনার নাম, শিক্ষা এবং ভবিষ্যৎ লক্ষ্য সম্পর্কে বলুন।",
      instructions: "৬০ সেকেন্ড স্পষ্ট করে বলুন।",
      samplePhrase: "নমস্কার! আমার নাম অনিরুদ্ধ, আমি কম্পিউটার সায়েন্সে পড়াশোনা করছি।",
    },
  ],
};

export const LanguagePractice: React.FC<LanguagePracticeProps> = ({
  currentLanguage,
  onChangeLanguage,
  onSelectPracticeTopic,
}) => {
  const [selectedLang, setSelectedLang] = useState<LanguageOption>(
    SUPPORTED_LANGUAGES.find((l) => l.name === currentLanguage || l.code === currentLanguage) ||
      SUPPORTED_LANGUAGES[0]
  );

  const handleSelectLanguage = (lang: LanguageOption) => {
    setSelectedLang(lang);
    onChangeLanguage(lang);
  };

  const handleListenSample = (phrase: string, locale: string) => {
    playTextToSpeech(phrase, locale);
  };

  const activePrompts =
    REGIONAL_PROMPTS[selectedLang.code] || [
      {
        title: `Self Introduction in ${selectedLang.name}`,
        prompt: `Introduce yourself in ${selectedLang.name} covering your background and aspirations.`,
        instructions: "Speak clearly for 60 seconds into your microphone.",
        samplePhrase: `Hello! I am practicing speaking in ${selectedLang.name}.`,
      },
    ];

  return (
    <div className="space-y-6">
      {/* ── Language Selector Grid ─────────────────────────────────────── */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Select Practice Language & Locale
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = selectedLang.code === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelectLanguage(lang)}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between text-left ${
                  isSelected
                    ? "bg-cyan-600/10 border-cyan-600 text-cyan-600 dark:text-cyan-400 font-bold shadow-xs"
                    : "bg-card border-border hover:bg-muted text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{lang.flag}</span>
                  <div>
                    <p className="text-xs font-bold leading-tight">{lang.name}</p>
                    <p className="text-[10px] text-muted-foreground">{lang.nativeName}</p>
                  </div>
                </div>
                {isSelected && <CheckCircle2 className="h-4 w-4 text-cyan-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Active Language Drill Cards ────────────────────────────────── */}
      <Card className="rounded-2xl border border-border/70 bg-card">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedLang.flag}</span>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {selectedLang.name} ({selectedLang.nativeName}) Speaking Drills
                </h3>
                <p className="text-xs text-muted-foreground">
                  AI Speech Recognition calibrated for {selectedLang.speechLocale} phonetic dialect
                </p>
              </div>
            </div>

            <Badge variant="outline" className="text-xs">
              Locale: {selectedLang.speechLocale}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {activePrompts.map((drill, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-border/70 bg-muted/20 hover:border-cyan-500/40 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold text-cyan-600">
                      Regional Practice
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleListenSample(drill.samplePhrase, selectedLang.speechLocale)}
                      className="h-7 text-xs text-primary gap-1 px-2"
                      title="Listen to native audio guide"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      Listen Native
                    </Button>
                  </div>

                  <h4 className="text-sm font-bold text-foreground">{drill.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{drill.prompt}</p>

                  <div className="p-2.5 rounded-lg bg-background border border-border/60 text-xs italic text-foreground/80">
                    "{drill.samplePhrase}"
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-end">
                  <Button
                    size="sm"
                    onClick={() =>
                      onSelectPracticeTopic({
                        title: drill.title,
                        mode: "Topic Speaking",
                        instructions: drill.instructions,
                        durationSeconds: 60,
                        language: selectedLang.speechLocale,
                      })
                    }
                    className="gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs shadow-xs"
                  >
                    <Mic className="h-3.5 w-3.5" />
                    Record in {selectedLang.nativeName}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
