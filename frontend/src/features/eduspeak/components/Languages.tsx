import React from "react";
import { AVAILABLE_LANGUAGES } from "../data/eduspeakData";
import { LanguageCode } from "../types/eduspeak.types";
import { Check } from "lucide-react";

interface LanguagesProps {
  selectedLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
}

export const Languages: React.FC<LanguagesProps> = ({ selectedLanguage, onSelectLanguage }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {AVAILABLE_LANGUAGES.map((lang) => {
        const isSelected = selectedLanguage === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => onSelectLanguage(lang.code)}
            className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
              isSelected
                ? "border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 ring-1 ring-cyan-500/20"
                : "border-border/70 bg-card/60 hover:bg-muted text-foreground"
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <span className="text-xl">{lang.flag}</span>
              <div className="truncate">
                <p className="text-xs font-bold leading-tight truncate">{lang.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{lang.nativeName}</p>
              </div>
            </div>
            {isSelected && <Check className="h-4 w-4 shrink-0 text-cyan-500" />}
          </button>
        );
      })}
    </div>
  );
};