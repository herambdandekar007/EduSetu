// features/eduspeak/services/speechService.ts
// Reusable, robust browser speech recognition, audio recording, and TTS narration.

import type { LanguageCode } from "../types/eduspeak.types";

export interface SpeechRecognitionHandlers {
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

/**
 * 1. Check if browser supports Speech Recognition
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

/**
 * 2. Check if browser supports Audio Recording (MediaRecorder)
 */
export function isMediaRecorderSupported(): boolean {
  if (typeof window === "undefined" || !navigator.mediaDevices) return false;
  return !!window.MediaRecorder;
}

/**
 * 3. Request Microphone Permissions
 */
export async function requestMicrophoneAccess(): Promise<{ granted: boolean; error?: string }> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return { granted: false, error: "Microphone access is not supported in this browser." };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Immediately stop tracks to release hardware until recording starts
    stream.getTracks().forEach((track) => track.stop());
    return { granted: true };
  } catch (err: any) {
    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
      return { granted: false, error: "Microphone permission was denied. Please allow mic access in your browser settings." };
    }
    return { granted: false, error: err.message || "Failed to access microphone." };
  }
}

/**
 * 4. Start Live Speech-to-Text Recognition instance
 */
export function startSpeechRecognition(
  lang: string = "en-IN",
  handlers: SpeechRecognitionHandlers
): { stop: () => void; abort: () => void } | null {
  const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRec) {
    handlers.onError?.("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
    return null;
  }

  try {
    const recognition = new SpeechRec();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => handlers.onStart?.();

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const fullTranscript = (finalTranscript || interimTranscript).trim();
      handlers.onResult?.(fullTranscript, !!finalTranscript);
    };

    recognition.onerror = (event: any) => {
      let message = "Speech recognition error";
      if (event.error === "not-allowed") {
        message = "Microphone access denied.";
      } else if (event.error === "no-speech") {
        message = "No speech was detected. Please try speaking closer to the microphone.";
      } else if (event.error === "network") {
        message = "Network connection lost for speech service.";
      }
      handlers.onError?.(message);
    };

    recognition.onend = () => handlers.onEnd?.();

    recognition.start();

    return {
      stop: () => {
        try {
          recognition.stop();
        } catch {}
      },
      abort: () => {
        try {
          recognition.abort();
        } catch {}
      },
    };
  } catch (err: any) {
    handlers.onError?.(err.message || "Failed to initialize speech recognition.");
    return null;
  }
}

/**
 * 5. Audio Recorder Session Wrapper
 */
export class AudioRecorderSession {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async start(): Promise<void> {
    this.audioChunks = [];
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(this.stream);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(250);
  }

  stop(): Promise<{ audioBlob: Blob; audioUrl: string }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        return reject(new Error("MediaRecorder not initialized"));
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Stop all audio hardware tracks
        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop());
          this.stream = null;
        }

        resolve({ audioBlob, audioUrl });
      };

      this.mediaRecorder.stop();
    });
  }

  cancel(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.audioChunks = [];
  }
}

/**
 * 6. Play Text-to-Speech audio
 */
export function playTextToSpeech(
  text: string,
  lang: string = "en-IN",
  rate: number = 0.95
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      reject(new Error("Speech synthesis not supported in this browser."));
      return;
    }

    window.speechSynthesis.cancel(); // Stop any pending speech
    const cleanText = text.replace(/[*#`_~[\]]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = 1.0;

    utterance.onend = () => resolve();
    utterance.onerror = (err) => {
      if (err.error === "canceled") {
        resolve();
      } else {
        reject(err);
      }
    };

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * 7. Stop Text-to-Speech playback
 */
export function stopTextToSpeech(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
