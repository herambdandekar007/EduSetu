import React from "react";
import { SpeakingProgress } from "./SpeakingProgress";
import { DailyVocabulary } from "./DailyVocabulary";
import { LearningModules } from "./LearningModules";

export const SpeakingDashboard: React.FC = () => (
  <div className="space-y-6">
    <SpeakingProgress />
    <DailyVocabulary />
    <LearningModules />
  </div>
);