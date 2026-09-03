import React, { useState } from "react";
import { REAL_LIFE_SCENARIOS } from "../data/eduspeakData";
import { RealLifeScenario } from "../types/eduspeak.types";
import { evaluateSpeechInput, playSpeechAudio } from "../services/eduSpeakService";
import { StartSpeaking } from "./StartSpeaking";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Bot, User, Volume2 } from "lucide-react";

export const RealLifeCommunication: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<RealLifeScenario>(REAL_LIFE_SCENARIOS[0]);
  const [conversation, setConversation] = useState<{ sender: "ai" | "user"; text: string }[]>([
    { sender: "ai", text: REAL_LIFE_SCENARIOS[0].initialPrompt },
  ]);

  const handleResponse = async (transcript: string) => {
    setConversation((prev) => [...prev, { sender: "user", text: transcript }]);

    const evaluation = await evaluateSpeechInput(transcript);

    setTimeout(() => {
      const aiFollowUp =
        evaluation.overallScore > 80
          ? "Great point! That clarifies the architectural scope well. How did the client respond?"
          : "Understood. Could you elaborate on what steps you took to mitigate the potential failure points?";
      setConversation((prev) => [...prev, { sender: "ai", text: aiFollowUp }]);
      playSpeechAudio(aiFollowUp);
    }, 600);
  };

  const handleSelectScenario = (sc: RealLifeScenario) => {
    setSelectedScenario(sc);
    setConversation([{ sender: "ai", text: sc.initialPrompt }]);
  };

  return (
    <div className="space-y-6">
      {/* Scenario Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {REAL_LIFE_SCENARIOS.map((sc) => (
          <button
            key={sc.id}
            type="button"
            onClick={() => handleSelectScenario(sc)}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedScenario.id === sc.id
                ? "border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500/30"
                : "border-border/70 bg-card/60 hover:bg-muted"
            }`}
          >
            <Badge variant="outline" className="text-[10px] mb-1.5">
              {sc.setting}
            </Badge>
            <h4 className="font-bold text-sm text-foreground">{sc.title}</h4>
            <p className="text-xs text-muted-foreground mt-1">Role: {sc.role}</p>
          </button>
        ))}
      </div>

      {/* Roleplay Chat Window */}
      <Card className="rounded-2xl border-border/70 bg-card/60">
        <CardContent className="p-5 space-y-4">
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {conversation.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 items-start ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                    msg.sender === "ai" ? "bg-cyan-500/10 text-cyan-600" : "bg-primary text-primary-foreground"
                  }`}
                >
                  {msg.sender === "ai" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[80%] ${
                    msg.sender === "ai"
                      ? "bg-muted/70 text-foreground rounded-tl-none"
                      : "bg-primary text-primary-foreground rounded-tr-none"
                  }`}
                >
                  {msg.text}
                  {msg.sender === "ai" && (
                    <button
                      type="button"
                      onClick={() => playSpeechAudio(msg.text)}
                      className="block text-[10px] text-cyan-600 dark:text-cyan-400 hover:underline mt-1.5"
                    >
                      <Volume2 className="h-3 w-3 inline mr-1" /> Replay audio
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-border/40">
            <StartSpeaking onRecordingComplete={(transcript) => handleResponse(transcript)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};