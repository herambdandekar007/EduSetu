import React from "react";
import { LearningModules } from "./LearningModules";
import { GrammarLearning } from "./GrammarLearning";

export const LearnToSpeak: React.FC = () => (
  <div className="space-y-6">
    <LearningModules />
    <GrammarLearning />
  </div>
);