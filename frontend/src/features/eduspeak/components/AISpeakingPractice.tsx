import React, { useState } from "react";
import { SPEAKING_TOPICS } from "../data/eduspeakData";
import { SpeakingTopic } from "../types/eduspeak.types";
import { AITopicSelector } from "./AITopicSelector";
import { VoiceSpeakingPractice } from "./VoiceSpeakingPractice";

export const AISpeakingPractice: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<SpeakingTopic>(SPEAKING_TOPICS[0]);

  return (
    <div className="space-y-6">
      <AITopicSelector selectedTopic={selectedTopic} onSelectTopic={setSelectedTopic} />
      <VoiceSpeakingPractice />
    </div>
  );
};