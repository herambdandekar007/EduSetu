// features/edumentor/components/MentorChat.tsx
// Complete personalized AI education mentor chat with modes, speech recognition, formatted markdown, and TTS narration.

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  User,
  Send,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Copy,
  Check,
  Plus,
  Trash2,
  MessageSquare,
  History,
  Code2,
  HelpCircle,
  Lightbulb,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type {
  StudentLearningContext,
  MentorChatMessage,
  MentorChatSession,
  MentorResponseMode,
} from "../types/mentor.types";
import { sendMentorChatMessage } from "../services/mentorAIService";
import { saveMentorChat } from "../services/mentorService";

interface MentorChatProps {
  context: StudentLearningContext;
  sessions: MentorChatSession[];
  activeSessionId: string | null;
  initialPrompt?: string;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
}

const RESPONSE_MODES: {
  id: MentorResponseMode;
  label: string;
  emoji: string;
  desc: string;
  color: string;
}[] = [
  { id: "simple", label: "Simple", emoji: "🟢", desc: "Concise, plain English ELI5 explanation", color: "text-emerald-600 border-emerald-300" },
  { id: "detailed", label: "Detailed", emoji: "🟡", desc: "Comprehensive academic depth with theory", color: "text-amber-600 border-amber-300" },
  { id: "with_examples", label: "With Examples", emoji: "🔵", desc: "Concrete real-world problems & code snippets", color: "text-blue-600 border-blue-300" },
  { id: "step_by_step", label: "Step by Step", emoji: "🟣", desc: "Numbered sequential breakdown", color: "text-purple-600 border-purple-300" },
  { id: "exam_focused", label: "Exam Focused", emoji: "🔴", desc: "High-yield scoring tips & formulas", color: "text-rose-600 border-rose-300" },
];

/**
 * Renders structured markdown text into styled, beautiful HTML
 */
const FormattedMarkdownContent: React.FC<{ content: string; isUser: boolean }> = ({ content, isUser }) => {
  if (isUser) {
    return <div className="whitespace-pre-wrap font-sans break-words">{content}</div>;
  }

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <div key={`code-${idx}`} className="my-2 p-3.5 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
            <pre>{codeBuffer.join("\n")}</pre>
          </div>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    if (trimmed.startsWith("### ")) {
      elements.push(
        <h4 key={idx} className="text-sm font-bold text-foreground mt-3 mb-1.5 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          {renderFormattedInline(trimmed.replace(/^###\s+/, ""))}
        </h4>
      );
    } else if (trimmed.startsWith("## ")) {
      elements.push(
        <h3 key={idx} className="text-base font-extrabold text-foreground mt-3 mb-2">
          {renderFormattedInline(trimmed.replace(/^##\s+/, ""))}
        </h3>
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      elements.push(
        <div key={idx} className="flex items-start gap-2 my-1 pl-1 text-xs leading-relaxed text-foreground/90">
          <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
          <span>{renderFormattedInline(trimmed.replace(/^[-*]\s+/, ""))}</span>
        </div>
      );
    } else if (/^\d+\.\s+/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (match) {
        elements.push(
          <div key={idx} className="flex items-start gap-2 my-1 pl-1 text-xs leading-relaxed text-foreground/90">
            <span className="h-4 w-4 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
              {match[1]}
            </span>
            <span>{renderFormattedInline(match[2])}</span>
          </div>
        );
      }
    } else if (trimmed === "") {
      elements.push(<div key={idx} className="h-2" />);
    } else {
      elements.push(
        <p key={idx} className="text-xs leading-relaxed text-foreground/90 my-1">
          {renderFormattedInline(line)}
        </p>
      );
    }
  });

  return <div className="space-y-0.5">{elements}</div>;
};

function renderFormattedInline(text: string): React.ReactNode {
  // Bold **text**
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-muted font-mono text-[11px] text-primary border border-border">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export const MentorChat: React.FC<MentorChatProps> = ({
  context,
  sessions,
  activeSessionId,
  initialPrompt,
  onSelectSession,
  onNewSession,
  onDeleteSession,
}) => {
  const [messages, setMessages] = useState<MentorChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [selectedMode, setSelectedMode] = useState<MentorResponseMode>("detailed");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showMobileHistory, setShowMobileHistory] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize messages from active session
  useEffect(() => {
    if (activeSessionId) {
      const active = sessions.find((s) => s.id === activeSessionId);
      if (active && active.messages.length) {
        setMessages(active.messages);
        return;
      }
    }

    // Default introductory greeting
    setMessages([
      {
        id: "msg-welcome",
        role: "assistant",
        content: `### Hello ${context.name || "Student"}! 👋\n\nI am your personal **EduMentor** AI tutor.\n\n- **Course:** ${context.course || "Curriculum"} (${context.branch || "Core"})\n- **Active Subjects:** ${context.subjects.slice(0, 3).join(", ") || "General"}\n- **Priority Focus Area:** ${context.weakTopics[0] || "Foundational Concepts"}\n- **Diagnostic Accuracy:** ${context.recentAccuracy}%\n\nHow can I help your learning today? Ask any academic doubt, request practice problems, or click a Quick Question below!`,
        mode: "detailed",
        timestamp: new Date().toISOString(),
        followUps: [
          "What should I revise first today?",
          `Explain ${context.weakTopics[0] || "core concepts"} with simple examples`,
          "Generate 3 practice questions on my syllabus",
          "Give me an exam countdown checklist",
        ],
      },
    ]);
  }, [activeSessionId, sessions, context]);

  // Handle initial prompt from parent/quick action
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Speech-to-Text Voice Input
  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-IN";

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join("");
        setInput(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Speech recognition error:", err);
      setIsListening(false);
    }
  };

  // Text-to-Speech Voice Narration
  const toggleSpeechNarration = (id: string, text: string) => {
    if (speakingMsgId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[#*`_~[\]]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Copy Message Text
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Send Message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: MentorChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await sendMentorChatMessage({
        message: text,
        history: newMessages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        studentContext: context,
        responseMode: selectedMode,
      });

      const assistantMsg: MentorChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: res.reply,
        mode: res.mode || selectedMode,
        timestamp: new Date().toISOString(),
        followUps: res.followUps,
      };

      const finalMessages = [...newMessages, assistantMsg];
      setMessages(finalMessages);

      // Save to Firestore session
      const sessionId = activeSessionId || `session_${context.userId}_${Date.now()}`;
      const sessionTitle = text.slice(0, 30) + (text.length > 30 ? "..." : "");

      await saveMentorChat({
        id: sessionId,
        userId: context.userId,
        eduId: context.eduId,
        title: sessionTitle,
        messages: finalMessages,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Mentor chat error:", err);
      const errMsg: MentorChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "⚠️ I encountered an error retrieving this explanation. Please check your connection and try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[740px] rounded-2xl overflow-hidden border border-border/70 bg-card shadow-sm">
      {/* ── 1. Chat Sessions Sidebar ───────────────────────────────────── */}
      <div className="hidden lg:flex flex-col w-72 shrink-0 border-r border-border/70 bg-muted/30 p-4 space-y-3">
        <Button
          onClick={onNewSession}
          className="w-full gap-2 rounded-xl bg-primary text-primary-foreground shadow hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          New Mentor Chat
        </Button>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Chat History
          </span>
          <Badge variant="outline" className="text-[10px]">
            {sessions.length}
          </Badge>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {sessions.length ? (
            sessions.map((s) => {
              const isActive = s.id === activeSessionId;
              return (
                <div
                  key={s.id}
                  onClick={() => onSelectSession(s.id)}
                  className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between group ${
                    isActive
                      ? "bg-primary/10 text-primary font-semibold border border-primary/20"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate text-xs">
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="truncate">{s.title || "Academic Mentorship"}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(s.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-opacity p-1"
                    title="Delete Chat"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-muted-foreground italic p-2 text-center">
              No previous chats yet.
            </p>
          )}
        </div>

        {/* Personalized Context Badge */}
        <div className="p-3 rounded-xl bg-background/90 border border-border text-[11px] space-y-1 text-muted-foreground">
          <div className="font-bold text-foreground flex items-center gap-1.5">
            <Bot className="h-3.5 w-3.5 text-primary" />
            AI Student Context
          </div>
          <p className="truncate">🎓 {context.name} • {context.eduId}</p>
          <p className="truncate">📚 Focus: {context.weakTopics[0] || "Foundations"}</p>
        </div>
      </div>

      {/* ── 2. Main Chat Window ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full bg-background min-w-0">
        {/* Header: Mode Selector Bar */}
        <div className="p-3.5 border-b border-border/70 flex items-center justify-between gap-2 flex-wrap bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                Ask EduMentor AI
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {context.eduId}
                </span>
              </h3>
              <p className="text-[10px] text-muted-foreground">Personalized AI mentor calibrated to your syllabus</p>
            </div>
          </div>

          {/* Response Mode Selector Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-muted-foreground hidden md:inline">
              Mode:
            </span>
            {RESPONSE_MODES.map((mode) => {
              const isSelected = selectedMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1 border ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background text-muted-foreground hover:bg-muted border-border/70"
                  }`}
                  title={mode.desc}
                >
                  <span>{mode.emoji}</span>
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div
                key={m.id}
                className={`flex gap-3 items-start ${isUser ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div
                  className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                    isUser
                      ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white"
                      : "bg-gradient-to-br from-primary to-indigo-600 text-white"
                  }`}
                >
                  {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-2 max-w-[90%] md:max-w-[80%]">
                  <div
                    className={`rounded-2xl p-4 text-xs leading-relaxed ${
                      isUser
                        ? "bg-primary text-primary-foreground rounded-tr-none shadow-sm"
                        : "bg-muted/50 border border-border/60 text-foreground rounded-tl-none"
                    }`}
                  >
                    <FormattedMarkdownContent content={m.content} isUser={isUser} />

                    {/* Meta & Audio Controls for AI Message */}
                    {!isUser && (
                      <div className="flex items-center justify-between pt-3 mt-2 border-t border-border/40 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1 font-mono">
                          {m.mode && (
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 uppercase">
                              {m.mode.replace("_", " ")}
                            </Badge>
                          )}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => toggleSpeechNarration(m.id, m.content)}
                            className="p-1 rounded-md hover:bg-muted transition-colors"
                            title={speakingMsgId === m.id ? "Stop Reading" : "Read Aloud"}
                          >
                            {speakingMsgId === m.id ? (
                              <VolumeX className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
                            ) : (
                              <Volume2 className="h-3.5 w-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => handleCopy(m.id, m.content)}
                            className="p-1 rounded-md hover:bg-muted transition-colors"
                            title="Copy Answer"
                          >
                            {copiedId === m.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Follow-up Question Chips */}
                  {!isUser && m.followUps && m.followUps.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.followUps.map((q) => (
                        <button
                          key={q}
                          onClick={() => handleSendMessage(q)}
                          className="text-xs px-3 py-1 rounded-full bg-background border border-primary/25 text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 text-left shadow-2xs"
                        >
                          <Sparkles className="h-3 w-3 shrink-0" />
                          <span>{q}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 items-start">
              <div className="h-9 w-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-muted/60 border border-border/50 rounded-2xl rounded-tl-none p-4 text-xs text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 animate-spin text-primary" />
                EduMentor is thinking and generating your answer...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
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
              onClick={toggleVoiceInput}
              className={`h-11 w-11 rounded-xl flex items-center justify-center border transition-all shrink-0 ${
                isListening
                  ? "bg-rose-500 text-white border-rose-600 animate-pulse"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground border-border"
              }`}
              title={isListening ? "Listening... (Click to stop)" : "Voice Query Input"}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your syllabus, doubt, concept, or exam prep..."
              className="flex-1 h-11 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-foreground"
              disabled={isLoading}
            />

            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="h-11 px-5 rounded-xl bg-primary text-primary-foreground gap-2 shrink-0 shadow hover:shadow-md"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MentorChat;
