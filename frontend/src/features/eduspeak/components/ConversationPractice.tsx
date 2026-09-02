// features/eduspeak/components/ConversationPractice.tsx
// Interactive multi-turn conversational AI partner with live voice recognition, instant TTS, and scenario selection.

import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  Bot,
  User,
  Briefcase,
  GraduationCap,
  Users,
  Compass,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  startSpeechRecognition,
  playTextToSpeech,
  stopTextToSpeech,
  requestMicrophoneAccess,
} from "../services/speechService";
import { generateConversationReply } from "../services/eduSpeakAIService";
import type { ConversationMessage, ConversationSession } from "../types/eduspeak.types";

interface ConversationPracticeProps {
  userId: string;
}

interface ScenarioOption {
  id: string;
  title: string;
  role: string;
  aiRole: string;
  icon: React.ReactNode;
  initialPrompt: string;
  description: string;
}

const SCENARIOS: ScenarioOption[] = [
  {
    id: "job-interview",
    title: "HR & Job Interview Panel",
    role: "Candidate",
    aiRole: "Lead HR Interviewer",
    icon: <Briefcase className="h-5 w-5 text-indigo-600" />,
    initialPrompt: "Good morning! Thank you for joining us today. To start off, could you please introduce yourself and tell us what motivated you to apply for this position?",
    description: "Practice answering behavioral and background questions with formal corporate etiquette.",
  },
  {
    id: "tech-interview",
    title: "Technical Architecture Interview",
    role: "Software Engineer Candidate",
    aiRole: "Staff Technical Architect",
    icon: <Sparkles className="h-5 w-5 text-cyan-600" />,
    initialPrompt: "Welcome! Let's discuss your recent engineering projects. Can you explain the data flow and how your system handles concurrent requests?",
    description: "Defend technical trade-offs, algorithms, and system design architecture clearly.",
  },
  {
    id: "college-professor",
    title: "Academic Discussion with Professor",
    role: "Student",
    aiRole: "Faculty Advisor",
    icon: <GraduationCap className="h-5 w-5 text-emerald-600" />,
    initialPrompt: "Hello! I reviewed your project proposal. Which specific methodology are you planning to employ for your evaluation benchmarks?",
    description: "Discuss research papers, course assignments, and seminar topics with academic clarity.",
  },
  {
    id: "friend-chat",
    title: "Casual Campus Conversation",
    role: "Friend",
    aiRole: "Peer Student",
    icon: <Users className="h-5 w-5 text-amber-600" />,
    initialPrompt: "Hey! Are you heading to the technical hackathon this weekend? I was thinking about forming a team together.",
    description: "Build relaxed, spontaneous conversational rhythm for daily social chats.",
  },
];

export const ConversationPractice: React.FC<ConversationPracticeProps> = ({ userId }) => {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioOption>(SCENARIOS[0]);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputSpeech, setInputSpeech] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [followUpChips, setFollowUpChips] = useState<string[]>([]);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const recognitionRef = useRef<{ stop: () => void; abort: () => void } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize scenario
  useEffect(() => {
    handleResetScenario(selectedScenario);
  }, [selectedScenario]);

  // Scroll on message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleResetScenario = (scenario: ScenarioOption) => {
    stopTextToSpeech();
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const initMsg: ConversationMessage = {
      id: `msg_init_${Date.now()}`,
      role: "assistant",
      content: scenario.initialPrompt,
      timestamp: new Date().toISOString(),
    };

    setMessages([initMsg]);
    setInputSpeech("");
    setFollowUpChips([
      "Good morning! I am very excited for this opportunity.",
      "My background is in Computer Science with a focus on web applications.",
      "I have built multiple fullstack and accessibility tools.",
    ]);
  };

  const handleToggleVoiceInput = async () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsListening(false);
      return;
    }

    const perm = await requestMicrophoneAccess();
    if (!perm.granted) {
      alert("Microphone permission required for conversational speaking.");
      return;
    }

    const rec = startSpeechRecognition("en-IN", {
      onStart: () => setIsListening(true),
      onResult: (transcript) => {
        setInputSpeech(transcript);
      },
      onError: () => setIsListening(false),
      onEnd: () => setIsListening(false),
    });

    recognitionRef.current = rec;
    setIsListening(true);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputSpeech).trim();
    if (!text || isLoading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMsg: ConversationMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputSpeech("");
    setIsLoading(true);

    try {
      const res = await generateConversationReply({
        scenario: selectedScenario.id,
        scenarioTitle: selectedScenario.title,
        history: newHistory,
        userSpeech: text,
      });

      const aiMsg: ConversationMessage = {
        id: `ai_${Date.now()}`,
        role: "assistant",
        content: res.reply,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setFollowUpChips(res.followUpPrompts || []);

      // Auto-narrate response
      handlePlayNarration(aiMsg.id, res.reply);
    } catch (err) {
      console.error("Conversation reply error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayNarration = async (msgId: string, text: string) => {
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
    <div className="space-y-6">
      {/* ── Scenario Selection Bar ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SCENARIOS.map((sc) => {
          const isSelected = selectedScenario.id === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => setSelectedScenario(sc)}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                isSelected
                  ? "bg-cyan-600/10 border-cyan-600 text-foreground shadow-xs ring-1 ring-cyan-600/20"
                  : "bg-card border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="h-9 w-9 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                {sc.icon}
              </div>
              <div className="space-y-0.5 truncate">
                <p className="text-xs font-bold text-foreground truncate">{sc.title}</p>
                <p className="text-[10px] text-muted-foreground truncate">{sc.aiRole}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Chat & Voice Dialogue Container ────────────────────────────── */}
      <Card className="rounded-2xl border border-border/70 bg-card overflow-hidden h-[640px] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border/70 bg-muted/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-cyan-600/10 text-cyan-600 flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">{selectedScenario.title}</h3>
              <p className="text-[10px] text-muted-foreground">
                Speaking with <strong>{selectedScenario.aiRole}</strong>
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleResetScenario(selectedScenario)}
            className="gap-1.5 rounded-xl text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restart Conversation
          </Button>
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
                    <p className="whitespace-pre-wrap">{m.content}</p>

                    {!isUser && (
                      <div className="flex items-center justify-end pt-2 mt-2 border-t border-border/40">
                        <button
                          onClick={() => handlePlayNarration(m.id, m.content)}
                          className="text-[10px] text-muted-foreground hover:text-cyan-600 flex items-center gap-1"
                          title="Listen Voice"
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
                {selectedScenario.aiRole} is formulating a response...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {followUpChips.length > 0 && !isLoading && (
          <div className="px-4 py-2 bg-muted/20 border-t border-border/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-bold text-muted-foreground uppercase shrink-0">
              Suggested:
            </span>
            {followUpChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                className="text-[11px] px-3 py-1 rounded-full bg-background border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 whitespace-nowrap transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

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
              onClick={handleToggleVoiceInput}
              className={`h-11 w-11 rounded-xl flex items-center justify-center border transition-all shrink-0 ${
                isListening
                  ? "bg-rose-500 text-white border-rose-600 animate-pulse"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground border-border"
              }`}
              title={isListening ? "Listening... (Click to stop)" : "Speak via Voice"}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            <input
              value={inputSpeech}
              onChange={(e) => setInputSpeech(e.target.value)}
              placeholder="Speak via microphone or type your response..."
              className="flex-1 h-11 rounded-xl border border-border bg-background px-4 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/40 text-foreground"
              disabled={isLoading}
            />

            <Button
              type="submit"
              disabled={!inputSpeech.trim() || isLoading}
              className="h-11 px-5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white gap-2 shrink-0 shadow-xs"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Reply</span>
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};
