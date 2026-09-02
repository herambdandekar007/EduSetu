import React from "react";
import { SPEAKING_TOPICS } from "../data/eduspeakData";
import { SpeakingTopic } from "../types/eduspeak.types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface AITopicSelectorProps {
  selectedTopic: SpeakingTopic | null;
  onSelectTopic: (topic: SpeakingTopic) => void;
}

export const AITopicSelector: React.FC<AITopicSelectorProps> = ({ selectedTopic, onSelectTopic }) => {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground">Select an AI Speech Prompt:</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SPEAKING_TOPICS.map((topic) => {
          const isSelected = selectedTopic?.id === topic.id;
          return (
            <Card
              key={topic.id}
              onClick={() => onSelectTopic(topic)}
              className={`cursor-pointer rounded-2xl border transition-all ${
                isSelected
                  ? "border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500/30"
                  : "border-border/70 bg-card/60 hover:bg-muted"
              }`}
            >
              <CardContent className="p-4 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {topic.category}
                    </Badge>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" /> {topic.suggestedDurationSeconds}s
                    </span>
                  </div>
                  <h5 className="font-bold text-sm text-foreground">{topic.title}</h5>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{topic.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};