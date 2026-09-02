import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square } from "lucide-react";

interface StartSpeakingProps {
  onRecordingComplete: (transcript: string, durationSeconds?: number) => void;
  disabled?: boolean;
}

export const StartSpeaking: React.FC<StartSpeakingProps> = ({ onRecordingComplete, disabled }) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [timer, setTimer] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Ref mirrors transcript so handleStop always reads the latest value (no stale closure)
  const transcriptRef = useRef<string>("");

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg("Your browser does not support speech recognition. Please use Google Chrome.");
      return;
    }

    setErrorMsg(null);
    setLiveTranscript("");
    transcriptRef.current = "";
    setTimer(0);
    setIsRecording(true);

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
      transcriptRef.current = text; // always up-to-date
      setLiveTranscript(text);
    };

    recognition.onerror = (err: any) => {
      if (err.error === "no-speech") {
        // Benign silence event
        return;
      }
      if (err.error === "not-allowed") {
        setErrorMsg("Microphone access denied. Please allow microphone access in your browser settings.");
        setIsRecording(false);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      }
    };

    recognition.onend = () => {
      // Auto-triggered when recognition ends (e.g. from stop() call)
      // Do not call onRecordingComplete here — handleStop manages that
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.error("Failed to start recognition:", e);
      setErrorMsg("Could not start microphone. Please check permissions and try again.");
      setIsRecording(false);
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
  };

  const handleStop = async () => {
    setIsRecording(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const elapsed = timer;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        /* ignore */
      }
    }

    // Wait for browser to fire final onresult before reading the ref
    await new Promise((resolve) => setTimeout(resolve, 400));

    const finalTranscript = transcriptRef.current.trim();

    if (!finalTranscript) {
      setErrorMsg("No speech detected. Please speak clearly into your microphone and try again.");
      return;
    }

    onRecordingComplete(finalTranscript, elapsed || 1);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 border rounded-2xl border-dashed border-border/80 bg-muted/20 space-y-4">
      {isRecording ? (
        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <Button
              size="lg"
              variant="destructive"
              onClick={handleStop}
              className="relative h-16 w-16 rounded-full p-0 shadow-lg"
            >
              <Square className="h-6 w-6" />
            </Button>
          </div>
          <div className="text-center">
            <span className="font-mono text-lg font-bold text-rose-600">{formatTimer(timer)}</span>
            <p className="text-xs text-muted-foreground animate-pulse mt-1">Listening &amp; analyzing cadence...</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-3">
          <Button
            size="lg"
            disabled={disabled}
            onClick={handleStart}
            className="h-16 w-16 rounded-full p-0 bg-cyan-600 hover:bg-cyan-700 shadow-md text-white"
          >
            <Mic className="h-7 w-7" />
          </Button>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">Click to Start Speaking</p>
            <p className="text-xs text-muted-foreground">Your microphone audio will be evaluated by AI</p>
          </div>
        </div>
      )}

      {liveTranscript && isRecording && (
        <div className="w-full max-w-lg p-3 rounded-xl bg-background border border-border/70 text-xs text-muted-foreground italic text-center">
          "{liveTranscript}"
        </div>
      )}

      {errorMsg && !isRecording && (
        <p className="text-xs text-rose-600 dark:text-rose-400 text-center font-medium">{errorMsg}</p>
      )}
    </div>
  );
};