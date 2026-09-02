// features/eduspeak/components/AISpeakingMentor.tsx
// AI Communication & Speaking Coach with audio narration and rapid drill generator.

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  User,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  RotateCcw,
  BookOpen,
  Award,
  Play,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  startSpeechRecognition,
  playTextToSpeech,
  stopTextToSpeech,
} from "../services/speechService";
import { chatWithSpeakingMentor } from "../services/eduSpeakAIService";
import type { EduSpeakProfile, SpeakingPracticeMode } from "../types/eduspeak.types";

interface AISpeakingMentorProps {
  profile: EduSpeakProfile;
  onLaunchDrill: (topic: {
    title: string;
    mode: SpeakingPracticeMode;
    instructions: string;
    durationSeconds: number;
  }) => void;
}

export const AISpeakingMentor: React.FC<AISpeakingMentorProps> = ({
  profile,
  onLaunchDrill,
}) => {
  const [messages, setMessages] = useState<{ id: string; role: "user" | "assistant"; content: string }[]>([
    {
      id: "init-mentor",
      role: "assistant",
      content: `### Hello ${profile.userId ? "there" : "Student"}! 👋\n\nI am your **AI Speaking & Communication Coach**.\n\nI have reviewed your communication profile:\n- **Current Level:** ${profile.currentLevel}\n- **Preferred Language:** ${profile.preferredLanguage}\n- **Pronunciation Rating:** ${profile.pronunciationScore}%\n- **Top Focus Words:** ${profile.weakWords?.slice(0, 3).join(", ") || "General Vocabulary"}\n\nAsk any question about improving your spoken English, interview answers, or public speaking. Or ask me to conduct a mock interview drill!`,
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<{ stop: () => void; abort: () => void } | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleToggleVoice = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsListening(false);
      return;
    }

    const rec = startSpeechRecognition("en-IN", {
      onStart: () => setIsListening(true),
      onResult: (transcript) => setInput(transcript),
      onError: () => setIsListening(false),
      onEnd: () => setIsListening(false),
    });

    recognitionRef.current = rec;
    setIsListening(true);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMsg = { id: `user_${Date.now()}`, role: "user" as const, content: text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setIsLoading(true);

    try {
      const res = await chatWithSpeakingMentor({
        message: text,
        history: newHistory,
        profile,
      });

      const aiMsg = {
        id: `ai_${Date.now()}`,
        role: "assistant" as const,
        content: res.reply,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Mentor chat error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = async (msgId: string, text: string) => {
    if (speakingMsgId === msgId) {
      stopTextToSpeech();
      setSpeakingMsgId(null);
      return;
    }

    setSpeakingMsgId(msgId);
    try {
      await playTextToSpeech(text, "en-IN", 0.95);
    } catch {}
    setSpeakingMsgId(null);
  };

  return (
    <Card className="rounded-2xl border border-border/70 bg-card overflow-hidden h-[640px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/70 bg-muted/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-cyan-600/10 text-cyan-600 flex items-center justify-center">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">AI Speaking Coach</h3>
            <p className="text-[10px] text-muted-foreground">
              Personalized communication and pronunciation mentor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              onLaunchDrill({
                title: "60-Second Elevator Pitch Practice",
                mode: "Self Introduction",
                instructions: "Speak for 60 seconds introducing your technical background and career goals.",
                durationSeconds: 60,
              })
            }
            className="gap-1.5 rounded-xl text-xs border-cyan-500/30 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/40"
          >
            <Play className="h-3 w-3" />
            Quick 60s Drill
          </Button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={`flex gap-3 items-start ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs text-white shrink-0 shadow-xs ${
                  isUser ? "bg-gradient-to-br from-indigo-600 to-purple-600" : "bg-cyan-600"
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div className="space-y-1.5 max-w-[85%] md:max-w-[75%]">
                <div
                  className={`rounded-2xl p-4 text-xs leading-relaxed ${
                    isUser
                      ? "bg-cyan-600 text-white rounded-tr-none shadow-xs"
                      : "bg-muted/50 border border-border/60 text-foreground rounded-tl-none"
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{m.content}</div>

                  {!isUser && (
                    <div className="flex items-center justify-end pt-2 mt-2 border-t border-border/40">
                      <button
                        onClick={() => handlePlayAudio(m.id, m.content)}
                        className="text-[10px] text-muted-foreground hover:text-cyan-600 flex items-center gap-1"
                        title="Listen to Voice Narration"
                      >
                        {speakingMsgId === m.id ? (
                          <VolumeX className="h-3 w-3 text-rose-500 animate-pulse" />
                        ) : (
                          <Volume2 className="h-3 w-3" />
                        )}
                        <span>{speakingMsgId === m.id ? "Stop" : "Listen"}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 items-start">
            <div className="h-8 w-8 rounded-xl bg-cyan-600/20 text-cyan-600 flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-muted/50 border border-border/60 rounded-2xl rounded-tl-none p-3.5 text-xs text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 animate-spin text-cyan-600" />
              Speaking mentor is thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions */}
      <div className="px-4 py-2 bg-muted/20 border-t border-border/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-bold text-muted-foreground uppercase shrink-0">
          Ask:
        </span>
        {[
          "How do I eliminate filler words?",
          "How to introduce myself in an HR interview?",
          "Tips for clear technical pronunciation",
        ].map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="text-[11px] px-3 py-1 rounded-full bg-background border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 whitespace-nowrap transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 md:p-4 border-t border-border/70 bg-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`h-11 w-11 rounded-xl flex items-center justify-center border transition-all shrink-0 ${
              isListening
                ? "bg-rose-500 text-white border-rose-600 animate-pulse"
                : "bg-muted hover:bg-muted/80 text-muted-foreground border-border"
            }`}
            title={isListening ? "Listening... (Click to stop)" : "Voice Query"}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask communication doubts, pronunciation questions, or interview advice..."
            className="flex-1 h-11 rounded-xl border border-border bg-background px-4 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/40 text-foreground"
            disabled={isLoading}
          />

          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="h-11 px-5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white gap-2 shrink-0 shadow-xs"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Send</span>
          </Button>
        </form>
      </div>
    </Card>
  );
};
