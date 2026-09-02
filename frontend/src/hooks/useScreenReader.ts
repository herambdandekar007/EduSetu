import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ── All voice commands ────────────────────────────────────────────────────
const VOICE_COMMANDS: Record<string, () => void> = {};

export const useScreenReader = () => {
  const [isActive, setIsActive]       = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastSpoken, setLastSpoken]   = useState("");
  const [transcript, setTranscript]   = useState("");
  const navigate = useNavigate();

  const recognitionRef = useRef<any>(null);
  const currentFocusRef = useRef<Element | null>(null);
  const synthRef = useRef(window.speechSynthesis);

  // ── Speak text using TTS ──────────────────────────────────────────────
  const speak = useCallback((text: string, priority = false) => {
    if (!text) return;
    if (priority) synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang  = "en-IN";
    utterance.rate  = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    synthRef.current.speak(utterance);
    setLastSpoken(text);
  }, []);

  // ── Get readable label for any element ───────────────────────────────
  const getElementLabel = useCallback((el: Element): string => {
    if (!el) return "";

    // Priority order for getting label
    const ariaLabel    = el.getAttribute("aria-label");
    const ariaDesc     = el.getAttribute("aria-describedby");
    const title        = el.getAttribute("title");
    const placeholder  = el.getAttribute("placeholder");
    const alt          = el.getAttribute("alt");
    const text         = (el as HTMLElement).innerText?.trim();
    const tagName      = el.tagName.toLowerCase();
    const role         = el.getAttribute("role");
    const type         = el.getAttribute("type");

    // Get associated label element
    const id = el.getAttribute("id");
    const labelEl = id ? document.querySelector(`label[for="${id}"]`) : null;
    const labelText = (labelEl as HTMLElement)?.innerText?.trim();

    // Build spoken label
    let label = ariaLabel || labelText || text || placeholder || alt || title || "";

    // Add element type context
    if (tagName === "button" || role === "button") {
      label = `Button: ${label}`;
    } else if (tagName === "a") {
      label = `Link: ${label}`;
    } else if (tagName === "input") {
      const inputType = type || "text";
      if (inputType === "checkbox") {
        const checked = (el as HTMLInputElement).checked;
        label = `Checkbox ${checked ? "checked" : "unchecked"}: ${label}`;
      } else if (inputType === "radio") {
        label = `Radio button: ${label}`;
      } else {
        label = `Input field ${label ? label : ""}: ${inputType}`;
      }
    } else if (tagName === "select") {
      const val = (el as HTMLSelectElement).value;
      label = `Dropdown ${label}: currently selected ${val}`;
    } else if (tagName === "textarea") {
      label = `Text area: ${label}`;
    } else if (tagName === "img") {
      label = `Image: ${label || "no description"}`;
    } else if (["h1","h2","h3","h4","h5","h6"].includes(tagName)) {
      label = `Heading: ${label}`;
    }

    return label || "Unknown element";
  }, []);

  // ── Highlight focused element ─────────────────────────────────────────
  const highlightElement = useCallback((el: Element | null) => {
    // Remove from previous
    document.querySelectorAll(".sr-focus-highlight").forEach(e => {
      e.classList.remove("sr-focus-highlight");
    });
    if (el) {
      el.classList.add("sr-focus-highlight");
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  // ── Handle Tab key focus changes ──────────────────────────────────────
  const handleFocusChange = useCallback((e: FocusEvent) => {
    if (!isActive) return;
    const el = e.target as Element;
    if (!el) return;
    currentFocusRef.current = el;
    highlightElement(el);
    const label = getElementLabel(el);
    speak(label, true);
  }, [isActive, speak, getElementLabel, highlightElement]);

  // ── Handle keypress announcements ─────────────────────────────────────
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isActive) return;

    if (e.key === "Tab") {
      // Tab navigation — focus event handles this
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      speak("Activated", true);
    }
    if (e.key === "Escape") {
      speak("Escaped", true);
    }
    if (e.key === "ArrowDown") {
      speak("Moving down");
    }
    if (e.key === "ArrowUp") {
      speak("Moving up");
    }
  }, [isActive, speak]);

  // ── Voice Recognition Setup ───────────────────────────────────────────
  const setupVoiceRecognition = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      speak("Voice recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous  = true;
    recognition.lang        = "en-IN";
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend   = () => {
      setIsListening(false);
      // Auto restart if screen reader still active
      if (isActive) setTimeout(() => recognition.start(), 500);
    };

    recognition.onresult = (event: any) => {
      const command = event.results[event.results.length - 1][0].transcript
        .trim()
        .toLowerCase();
      setTranscript(command);
      handleVoiceCommand(command);
    };

    recognition.onerror = (e: any) => {
      console.error("Voice error:", e.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isActive]);

  // ── Handle voice commands ─────────────────────────────────────────────
  const handleVoiceCommand = useCallback((command: string) => {
    speak(`Command: ${command}`, true);

    // Click commands
    if (command.includes("click") || command.includes("press") || command.includes("select")) {
      const focused = currentFocusRef.current as HTMLElement;
      if (focused) { focused.click(); speak("Clicked"); }
      return;
    }

    // Scroll commands
    if (command.includes("scroll down") || command.includes("go down")) {
      window.scrollBy({ top: 300, behavior: "smooth" });
      speak("Scrolling down");
      return;
    }
    if (command.includes("scroll up") || command.includes("go up")) {
      window.scrollBy({ top: -300, behavior: "smooth" });
      speak("Scrolling up");
      return;
    }
    if (command.includes("scroll top") || command.includes("top of page")) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      speak("Going to top");
      return;
    }
    if (command.includes("scroll bottom") || command.includes("bottom of page")) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      speak("Going to bottom");
      return;
    }

    // Navigation commands
    if (command.includes("go home") || command.includes("home page")) {
      navigate("/"); speak("Going to home");
      return;
    }
    if (command.includes("go back") || command.includes("go back")) {
      navigate(-1); speak("Going back");
      return;
    }
    if (command.includes("go to jobs") || command.includes("open jobs")) {
      navigate("/jobs"); speak("Opening jobs page");
      return;
    }
    if (command.includes("go to schemes") || command.includes("open schemes")) {
      navigate("/schemes"); speak("Opening schemes page");
      return;
    }
    if (command.includes("go to profile") || command.includes("open profile")) {
      navigate("/profile"); speak("Opening profile page");
      return;
    }
    if (command.includes("go to dashboard") || command.includes("open dashboard")) {
      navigate("/"); speak("Opening dashboard");
      return;
    }
    if (command.includes("go to mentors") || command.includes("open mentors")) {
      navigate("/mentors"); speak("Opening mentors page");
      return;
    }
    if (command.includes("go to community") || command.includes("open community")) {
      navigate("/community"); speak("Opening community page");
      return;
    }

    // Tab navigation commands
    if (command.includes("next") || command.includes("tab forward")) {
      const focusable = getFocusableElements();
      const idx = focusable.indexOf(currentFocusRef.current as HTMLElement);
      const next = focusable[idx + 1];
      if (next) { next.focus(); speak("Moving to next"); }
      return;
    }
    if (command.includes("previous") || command.includes("tab back")) {
      const focusable = getFocusableElements();
      const idx = focusable.indexOf(currentFocusRef.current as HTMLElement);
      const prev = focusable[idx - 1];
      if (prev) { prev.focus(); speak("Moving to previous"); }
      return;
    }

    // Read page
    if (command.includes("read page") || command.includes("read all")) {
      const text = document.body.innerText.slice(0, 500);
      speak(text);
      return;
    }
    if (command.includes("read heading") || command.includes("headings")) {
      const headings = Array.from(document.querySelectorAll("h1,h2,h3"))
        .map(h => (h as HTMLElement).innerText).join(". ");
      speak(headings || "No headings found");
      return;
    }

    // Stop reading
    if (command.includes("stop") || command.includes("quiet") || command.includes("silence")) {
      synthRef.current.cancel();
      speak("Stopped");
      return;
    }

    // Repeat last
    if (command.includes("repeat") || command.includes("say again")) {
      speak(lastSpoken, true);
      return;
    }

    // Help
    if (command.includes("help") || command.includes("commands")) {
      speak("Available commands: click, scroll down, scroll up, go home, go back, go to jobs, go to schemes, next, previous, read page, stop, repeat");
      return;
    }

    speak(`Command not recognized: ${command}. Say help for available commands.`);
  }, [navigate, lastSpoken, speak]);

  // ── Get all focusable elements ────────────────────────────────────────
  const getFocusableElements = (): HTMLElement[] => {
    return Array.from(document.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )) as HTMLElement[];
  };

  // ── Activate / Deactivate ─────────────────────────────────────────────
  const activate = useCallback(() => {
    setIsActive(true);
    speak("Screen reader activated. Press Tab to navigate. Say help for voice commands.", true);
    setupVoiceRecognition();
    // Focus first element
    setTimeout(() => {
      const first = getFocusableElements()[0];
      if (first) first.focus();
    }, 1000);
  }, [speak, setupVoiceRecognition]);

  const deactivate = useCallback(() => {
    setIsActive(false);
    synthRef.current.cancel();
    recognitionRef.current?.stop();
    setIsListening(false);
    document.querySelectorAll(".sr-focus-highlight").forEach(e => {
      e.classList.remove("sr-focus-highlight");
    });
    speak("Screen reader deactivated", true);
  }, [speak]);

  // ── Attach / detach event listeners ───────────────────────────────────
  useEffect(() => {
    if (isActive) {
      document.addEventListener("focusin", handleFocusChange);
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("focusin", handleFocusChange);
      document.removeEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("focusin", handleFocusChange);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive, handleFocusChange, handleKeyDown]);

  // ── Cleanup on unmount ────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      synthRef.current.cancel();
      recognitionRef.current?.stop();
    };
  }, []);

  return {
    isActive,
    isListening,
    lastSpoken,
    transcript,
    activate,
    deactivate,
    speak,
  };
};