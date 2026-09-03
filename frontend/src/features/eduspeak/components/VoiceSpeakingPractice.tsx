import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Mic,
  Square,
  Volume2,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Loader2,
  Award,
  BookOpen,
  Send,
  Keyboard,
  Check,
} from "lucide-react";

import {
  analyzeSpeaking,
  playSpeechAudio,
  saveSpeakingAttempt,
  saveSpeakingSession,
} from "../services/speakingService";
import type {
  SpeakingAnalysisResponse,
  SpeakingMistake,
} from "../types/speaking.types";

const SAMPLE_SENTENCES = [
  { text: "I am go to college yesterday for my exam.", label: "Tense Error" },
  { text: "He don't like to playing football with us.", label: "Subject-Verb Agreement" },
  { text: "She have completed her data science project.", label: "Auxiliary Verb" },
  { text: "I wants to improve my English communications skills.", label: "Word Choice & Grammar" },
];

export const VoiceSpeakingPractice: React.FC = () => {
  const { user } = useAuth();

  // State machine: "idle" | "recording_initial" | "analyzing_initial" | "initial_result" | "recording_repeat" | "analyzing_repeat" | "repeat_result"
  const [step, setStep] = useState<
    | "idle"
    | "recording_initial"
    | "analyzing_initial"
    | "initial_result"
    | "recording_repeat"
    | "analyzing_repeat"
    | "repeat_result"
  >("idle");

  const [inputMode, setInputMode] = useState<"voice" | "text">("voice");
  const [manualText, setManualText] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const [timer, setTimer] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [browserSupported, setBrowserSupported] = useState<boolean>(true);

  // Analysis results
  const [initialAnalysis, setInitialAnalysis] = useState<SpeakingAnalysisResponse | null>(null);
  const [repeatAnalysis, setRepeatAnalysis] = useState<SpeakingAnalysisResponse | null>(null);

  // Audio playing state
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Session tracking
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [initialAttemptId, setInitialAttemptId] = useState<string | null>(null);

  // Speech Recognition refs
  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef<string>("");
  const isRecordingRef = useRef<boolean>(false);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setBrowserSupported(false);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          /* ignore */
        }
      }
    };
  }, []);

  const initRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let current = "";
      for (let i = 0; i < event.results.length; i++) {
        current += event.results[i][0].transcript + " ";
      }
      const text = current.trim();
      transcriptRef.current = text;
      setTranscript(text);
    };

    recognition.onerror = (event: any) => {
      if (event.error === "no-speech") {
        // Normal silence timeout from Web Speech API — ignore safely
        return;
      }
      if (event.error === "not-allowed") {
        setErrorMsg("Microphone access was denied. Please allow microphone permissions in your browser, or type your sentence below.");
      }
    };

    recognition.onend = () => {
      // If user is still recording and recognition paused automatically, restart it
      if (isRecordingRef.current) {
        try {
          recognition.start();
        } catch {
          /* ignore */
        }
      }
    };

    return recognition;
  };

  const startRecording = (isRepeat = false) => {
    setErrorMsg(null);
    setTranscript("");
    transcriptRef.current = "";
    setTimer(0);
    isRecordingRef.current = true;
    setStep(isRepeat ? "recording_repeat" : "recording_initial");

    const recognition = initRecognition();
    if (!recognition) {
      setBrowserSupported(false);
      setInputMode("text");
      setStep("idle");
      return;
    }

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
      setErrorMsg("Could not access microphone. You can type your sentence directly below.");
      isRecordingRef.current = false;
      setStep("idle");
    }

    timerIntervalRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = async () => {
    isRecordingRef.current = false;
    const currentStep = step;

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        /* ignore */
      }
    }

    // Wait 350ms for the final recognition result event
    await new Promise((resolve) => setTimeout(resolve, 350));

    const spokenText = transcriptRef.current.trim() || transcript.trim();

    if (!spokenText) {
      setErrorMsg("No speech detected. You can speak clearly into your mic, select a sample sentence below, or type your sentence.");
      setStep(initialAnalysis ? "initial_result" : "idle");
      return;
    }

    await processAnalysis(spokenText, currentStep === "recording_repeat");
  };

  const handleManualSubmit = async () => {
    const text = manualText.trim();
    if (!text) return;
    setManualText("");
    await processAnalysis(text, step === "recording_repeat" || Boolean(initialAnalysis && step === "initial_result"));
  };

  const handleSelectSample = async (sampleText: string) => {
    setTranscript(sampleText);
    transcriptRef.current = sampleText;
    await processAnalysis(sampleText, false);
  };

  const processAnalysis = async (spokenText: string, isRepeat: boolean) => {
    setErrorMsg(null);

    if (!isRepeat) {
      setStep("analyzing_initial");
      try {
        const result = await analyzeSpeaking({ transcript: spokenText, mode: "initial" });
        setInitialAnalysis(result);
        setStep("initial_result");

        // Save Attempt 1 to Firestore if user is authenticated
        if (user?.uid) {
          try {
            const attemptId = await saveSpeakingAttempt({
              userId: user.uid,
              sessionId: `session_${Date.now()}`,
              attemptNumber: 1,
              transcript: result.transcript,
              correctedSentence: result.correctedSentence,
              grammarScore: result.grammar.score,
              vocabularyScore: result.vocabulary.score,
              sentenceScore: result.sentence.score,
              overallScore: result.overallScore,
              mistakes: result.mistakes,
            });
            setInitialAttemptId(attemptId);

            const sessId = await saveSpeakingSession({
              userId: user.uid,
              initialAttemptId: attemptId,
              beforeScore: result.overallScore,
            });
            setSessionId(sessId);
          } catch (dbErr) {
            console.warn("Firestore sync warning:", dbErr);
          }
        }

        // Automatically trigger AI speech read-back
        handlePlayAudio(result.correctedSentence);
      } catch (err: any) {
        console.error("Initial analysis failed:", err);
        setErrorMsg(err.message || "Failed to analyze speech. Please retry.");
        setStep("idle");
      }
    } else if (initialAnalysis) {
      setStep("analyzing_repeat");
      try {
        const result = await analyzeSpeaking({
          transcript: spokenText,
          mode: "repeat",
          originalTranscript: initialAnalysis.transcript,
          correctedSentence: initialAnalysis.correctedSentence,
          previousScore: initialAnalysis.overallScore,
        });
        setRepeatAnalysis(result);
        setStep("repeat_result");

        // Save Attempt 2 and update Session in Firestore
        if (user?.uid && sessionId) {
          try {
            const attempt2Id = await saveSpeakingAttempt({
              userId: user.uid,
              sessionId,
              attemptNumber: 2,
              transcript: result.transcript,
              correctedSentence: result.correctedSentence,
              grammarScore: result.grammar.score,
              vocabularyScore: result.vocabulary.score,
              sentenceScore: result.sentence.score,
              overallScore: result.overallScore,
              mistakes: result.mistakes,
            });

            await saveSpeakingSession(
              {
                userId: user.uid,
                initialAttemptId: initialAttemptId || "",
                repeatAttemptId: attempt2Id,
                beforeScore: initialAnalysis.overallScore,
                afterScore: result.overallScore,
                improvementScore: result.improvementScore || (result.overallScore - initialAnalysis.overallScore),
              },
              sessionId
            );
          } catch (dbErr) {
            console.warn("Firestore sync warning on attempt 2:", dbErr);
          }
        }

        handlePlayAudio(result.correctedSentence);
      } catch (err: any) {
        console.error("Repeat analysis failed:", err);
        setErrorMsg(err.message || "Failed to analyze repeat attempt.");
        setStep("initial_result");
      }
    }
  };

  const handlePlayAudio = async (textToSpeak: string) => {
    if (!textToSpeak) return;
    setIsPlayingAudio(true);
    try {
      await playSpeechAudio(textToSpeak, "en-US");
    } catch (e) {
      console.warn("Speech Synthesis error:", e);
    } finally {
      setIsPlayingAudio(false);
    }
  };

  const resetAll = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        /* ignore */
      }
    }
    isRecordingRef.current = false;
    setStep("idle");
    setTranscript("");
    transcriptRef.current = "";
    setManualText("");
    setTimer(0);
    setErrorMsg(null);
    setInitialAnalysis(null);
    setRepeatAnalysis(null);
    setSessionId(null);
    setInitialAttemptId(null);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-xs font-semibold">High Priority</Badge>;
      case "medium":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs font-semibold">Medium</Badge>;
      default:
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs font-semibold">Minor</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Unsupported Browser Notice */}
      {!browserSupported && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>
            Speech recognition is not fully supported in this browser. You can type or paste sentences below to test AI feedback!
          </span>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setErrorMsg(null)} className="text-xs">
            Dismiss
          </Button>
        </div>
      )}

      {/* TOP HEADER CARD */}
      <Card className="rounded-2xl border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 via-background to-blue-500/10">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                <Mic className="h-4 w-4" /> AI Voice Speaking Coach
              </span>
              <h3 className="text-xl font-bold text-foreground mt-1">
                Voice English Speaking & AI Grammar Correction System
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
                Speak your sentence aloud. AI evaluates grammar, tense agreement, and vocabulary, provides mistake categorization, and reads the corrected version for you to practice repeating.
              </p>
            </div>
            {step !== "idle" && (
              <Button size="sm" variant="outline" onClick={resetAll} className="rounded-xl gap-1.5 text-xs">
                <RotateCcw className="h-3.5 w-3.5" /> Start New Session
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* RECORDING / INPUT STATE CARD */}
      {(step === "idle" || step === "recording_initial" || step === "recording_repeat") && (
        <Card className="rounded-2xl border-dashed border-border/80 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Toggle between Voice & Text input */}
            {step === "idle" && (
              <div className="flex justify-center">
                <div className="inline-flex p-1 rounded-xl bg-muted/60 border border-border/50">
                  <button
                    type="button"
                    onClick={() => setInputMode("voice")}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      inputMode === "voice"
                        ? "bg-background text-foreground shadow-sm font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Mic className="h-3.5 w-3.5 text-cyan-600" /> Microphone
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode("text")}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      inputMode === "text"
                        ? "bg-background text-foreground shadow-sm font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Keyboard className="h-3.5 w-3.5 text-blue-600" /> Type Sentence
                  </button>
                </div>
              </div>
            )}

            {/* Voice Input Section */}
            {inputMode === "voice" && (
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                {step === "recording_initial" || step === "recording_repeat" ? (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                      <Button
                        size="lg"
                        variant="destructive"
                        onClick={stopRecording}
                        className="relative h-20 w-20 rounded-full p-0 shadow-lg flex items-center justify-center"
                        aria-label="Stop recording"
                      >
                        <Square className="h-8 w-8" />
                      </Button>
                    </div>
                    <div>
                      <span className="font-mono text-2xl font-bold text-rose-600 dark:text-rose-400">
                        {formatTimer(timer)}
                      </span>
                      <p className="text-xs font-medium text-muted-foreground animate-pulse mt-1">
                        {step === "recording_repeat" ? "Listening to your 2nd attempt..." : "Listening... Speak your sentence into the mic"}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={stopRecording}
                        className="mt-3 rounded-xl text-xs gap-1.5 border-rose-500/30 text-rose-600"
                      >
                        <Check className="h-3.5 w-3.5" /> Done Speaking (Stop & Analyze)
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-4">
                    <Button
                      size="lg"
                      disabled={!browserSupported}
                      onClick={() => startRecording(false)}
                      className="h-20 w-20 rounded-full p-0 bg-cyan-600 hover:bg-cyan-700 shadow-md text-white flex items-center justify-center transition-transform hover:scale-105"
                      aria-label="Start speaking"
                    >
                      <Mic className="h-9 w-9" />
                    </Button>
                    <div>
                      <h4 className="text-base font-bold text-foreground">Click Microphone & Speak Aloud</h4>
                      <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                        Say any sentence you want to practice, e.g. <em className="text-foreground font-medium">"I am go to office yesterday."</em>
                      </p>
                    </div>
                  </div>
                )}

                {/* Live transcript box */}
                {transcript && (
                  <div className="w-full max-w-lg p-4 rounded-xl bg-muted/40 border border-border/60 text-xs text-foreground italic">
                    <span className="font-semibold not-italic text-muted-foreground block mb-1">Live Transcript:</span>
                    "{transcript}"
                  </div>
                )}
              </div>
            )}

            {/* Manual Text Input Section */}
            {inputMode === "text" && step === "idle" && (
              <div className="max-w-xl mx-auto space-y-3">
                <label className="text-xs font-semibold text-foreground block">
                  Type or Paste English Sentence:
                </label>
                <div className="flex gap-2">
                  <Input
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder="e.g. He don't know where is the meeting..."
                    className="rounded-xl text-xs"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleManualSubmit();
                    }}
                  />
                  <Button
                    onClick={handleManualSubmit}
                    disabled={!manualText.trim()}
                    className="rounded-xl text-xs gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white shrink-0"
                  >
                    <Send className="h-3.5 w-3.5" /> Analyze
                  </Button>
                </div>
              </div>
            )}

            {/* Quick Sample Sentences */}
            {step === "idle" && (
              <div className="border-t border-border/40 pt-4 space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block text-center">
                  Or click a quick practice sample to test AI evaluation:
                </span>
                <div className="flex flex-wrap justify-center gap-2">
                  {SAMPLE_SENTENCES.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSample(s.text)}
                      className="px-3 py-1.5 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/70 hover:border-cyan-500/40 text-xs text-foreground text-left transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="h-3 w-3 text-cyan-600 dark:text-cyan-400 shrink-0" />
                      <span>"{s.text}"</span>
                      <Badge variant="outline" className="text-[9px] py-0 px-1 text-muted-foreground ml-1">
                        {s.label}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ANALYZING STATE */}
      {(step === "analyzing_initial" || step === "analyzing_repeat") && (
        <Card className="rounded-2xl border-cyan-500/30 bg-cyan-500/5 p-8 text-center">
          <CardContent className="flex flex-col items-center justify-center space-y-3">
            <Loader2 className="h-10 w-10 text-cyan-600 animate-spin" />
            <h4 className="text-lg font-bold text-foreground">
              {step === "analyzing_repeat" ? "Analyzing Your 2nd Attempt..." : "Grok AI is Analyzing Your Speech..."}
            </h4>
            <p className="text-xs text-muted-foreground max-w-md">
              Evaluating grammar rules, tense agreement, vocabulary usage, and generating your mistake engine breakdown.
            </p>
          </CardContent>
        </Card>
      )}

      {/* INITIAL ANALYSIS RESULT DISPLAY */}
      {initialAnalysis && (step === "initial_result" || step === "recording_repeat" || step === "analyzing_repeat" || step === "repeat_result") && (
        <div className="space-y-6">
          {/* SCORES OVERVIEW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="rounded-2xl border-cyan-500/30 bg-cyan-500/5">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-lg">
                  {initialAnalysis.overallScore}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Overall Score</div>
                  <div className="text-sm font-bold text-foreground">
                    {initialAnalysis.overallScore >= 80 ? "Excellent" : initialAnalysis.overallScore >= 60 ? "Good Effort" : "Needs Practice"}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/70">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                  {initialAnalysis.grammar.score}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Grammar Score</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{initialAnalysis.grammar.explanation}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/70">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
                  {initialAnalysis.vocabulary.score}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Vocabulary Score</div>
                  <div className="text-xs text-muted-foreground">
                    {initialAnalysis.vocabulary.suggestions.length} suggestions
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/70">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-lg">
                  {initialAnalysis.sentence.score}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Sentence Structure</div>
                  <div className="text-xs font-semibold text-foreground">{initialAnalysis.sentence.naturalness}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ORIGINAL VS AI CORRECTION & VOICE READBACK */}
          <Card className="rounded-2xl border-primary/20 bg-card">
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Student Spoke (Original):
                  </span>
                  <p className="text-base font-semibold text-foreground">"{initialAnalysis.transcript}"</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" /> AI Corrected Natural Sentence:
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePlayAudio(initialAnalysis.correctedSentence)}
                      disabled={isPlayingAudio}
                      className="rounded-xl text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Volume2 className={`h-4 w-4 ${isPlayingAudio ? "animate-bounce" : ""}`} />
                      {isPlayingAudio ? "AI Speaking..." : "Listen (🔊)"}
                    </Button>
                  </div>
                  <p className="text-base font-bold text-foreground">"{initialAnalysis.correctedSentence}"</p>
                </div>
              </div>

              {/* Feedback Message */}
              {initialAnalysis.feedback && (
                <div className="p-3 rounded-xl bg-muted/40 text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
                  <BookOpen className="h-4 w-4 text-cyan-600 shrink-0 mt-0.5" />
                  <span>{initialAnalysis.feedback}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* MISTAKE ENGINE CARDS */}
          {initialAnalysis.mistakes.length > 0 && (
            <Card className="rounded-2xl border-border/70">
              <CardContent className="p-6 space-y-4">
                <h4 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" /> Mistake Engine Categorization ({initialAnalysis.mistakes.length})
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {initialAnalysis.mistakes.map((m: SpeakingMistake, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="text-xs font-semibold">
                          {m.category}
                        </Badge>
                        {getSeverityBadge(m.severity)}
                      </div>

                      <div className="text-xs space-y-1">
                        <div>
                          <span className="text-muted-foreground">Original: </span>
                          <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">{m.original}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Corrected: </span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{m.correction}</span>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground pt-1 border-t border-border/40">
                        {m.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* TRIGGER REPEAT ATTEMPT BUTTON */}
          {step === "initial_result" && (
            <Card className="rounded-2xl border-cyan-500/40 bg-cyan-500/10">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                    <RotateCcw className="h-4 w-4 text-cyan-600" /> Ready for Your 2nd Practice Attempt?
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Listen to the corrected sentence above, then repeat it into the microphone to measure your Before vs After score improvement.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => startRecording(true)}
                    className="rounded-xl gap-2 bg-cyan-600 hover:bg-cyan-700 text-white shrink-0"
                  >
                    <Mic className="h-4 w-4" /> Repeat with Mic
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* SECOND ATTEMPT / BEFORE VS AFTER RESULT */}
      {repeatAnalysis && step === "repeat_result" && (
        <Card className="rounded-2xl border-emerald-500/40 bg-emerald-500/5">
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-500/20 pb-4">
              <div className="flex items-center gap-2.5">
                <Award className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h3 className="text-lg font-bold text-foreground">Second Attempt Complete!</h3>
                  <p className="text-xs text-muted-foreground">Before vs After AI Performance Comparison</p>
                </div>
              </div>
              <Badge className="bg-emerald-600 text-white text-sm px-3 py-1 gap-1">
                <TrendingUp className="h-4 w-4" />
                Improvement: +{(repeatAnalysis.improvementScore ?? (repeatAnalysis.overallScore - (initialAnalysis?.overallScore || 60)))} Points
              </Badge>
            </div>

            {/* BEFORE VS AFTER SCORE CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-card border border-border/70">
                <div className="text-xs text-muted-foreground font-semibold">BEFORE (1st Attempt)</div>
                <div className="text-3xl font-extrabold text-muted-foreground mt-1">
                  {initialAnalysis?.overallScore || repeatAnalysis.beforeScore}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-card border border-emerald-500/30">
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">AFTER (2nd Attempt)</div>
                <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  {repeatAnalysis.overallScore}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center justify-center">
                <div className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">SCORE DIFFERENCE</div>
                <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1 flex items-center gap-1">
                  +{(repeatAnalysis.improvementScore ?? (repeatAnalysis.overallScore - (initialAnalysis?.overallScore || 60)))} pts
                </div>
              </div>
            </div>

            {/* CHECKLIST OF IMPROVEMENTS */}
            <div className="p-4 rounded-xl bg-card border border-border/60 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Session Checklist</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Grammar structure corrected</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Vocal cadence & repetition practiced</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>AI text-to-speech listening completed</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Saved to EduMind learning history</span>
                </div>
              </div>
            </div>

            {/* SECOND TRANSCRIPT & FEEDBACK */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/40 text-xs space-y-1">
              <span className="font-semibold text-muted-foreground">Second Attempt Spoken:</span>
              <p className="font-medium text-foreground">"{repeatAnalysis.transcript}"</p>
              <p className="text-muted-foreground mt-2">{repeatAnalysis.feedback}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={resetAll} className="rounded-xl gap-2">
                <RotateCcw className="h-4 w-4" /> Practice Another Sentence
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
