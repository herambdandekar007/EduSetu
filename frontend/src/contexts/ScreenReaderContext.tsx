import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ROUTE_NAMES: Record<string, string> = {
  "/": "Home Dashboard",
  "/jobs": "Jobs Portal",
  "/schemes": "Government Schemes",
  "/profile": "User Profile",
  "/education": "Education Directory",
  "/learn": "Learning Hub",
  "/eduspeak": "EduSpeak Pronunciation Lab",
  "/eduvault": "EduVault Document Locker",
  "/mentors": "Mentors Network",
  "/edumentor": "EduMentor AI Tutor",
  "/eduroadmap": "Career Roadmap",
  "/nearby": "Nearby Institutes",
  "/community": "Community Forum",
  "/performance": "Performance Analytics",
  "/gamification": "Rewards and Gamification",
  "/accessibility": "Accessibility Tools",
  "/settings": "Account Settings",
  "/admin": "Admin Panel",
};

export interface VoiceCommandItem {
  command: string;
  action: string;
  category: "navigation" | "reading" | "control";
  description: string;
  keywords: string[];
  run: (navigate: (path: string | number) => void, speak: (t: string, p?: boolean) => void) => void;
}

export const ALL_VOICE_COMMANDS: VoiceCommandItem[] = [
  {
    command: "go to home",
    action: "Go to Dashboard",
    category: "navigation",
    description: "Navigates directly to the main student dashboard",
    keywords: ["home", "dashboard", "main page", "start page", "index", "dash board", "go to home", "go home", "open home"],
    run: (nav, speak) => { nav("/"); speak("Navigating to home dashboard", true); },
  },
  {
    command: "go to jobs",
    action: "Open Jobs Portal",
    category: "navigation",
    description: "Browse inclusive job listings, internships, and careers",
    keywords: ["job", "jobs", "career", "careers", "internship", "internships", "employment", "work", "go to jobs", "open jobs"],
    run: (nav, speak) => { nav("/jobs"); speak("Opening jobs and careers portal", true); },
  },
  {
    command: "go to schemes",
    action: "Open Schemes",
    category: "navigation",
    description: "Find government welfare schemes, scholarships, and financial aid",
    keywords: ["scheme", "schemes", "scholarship", "scholarships", "yojana", "grant", "financial aid", "go to schemes", "open schemes"],
    run: (nav, speak) => { nav("/schemes"); speak("Opening government schemes and scholarships", true); },
  },
  {
    command: "go to profile",
    action: "Open Profile",
    category: "navigation",
    description: "View and edit your personal profile and digital EduID card",
    keywords: ["profile", "eduid", "edu id", "id card", "identity", "my profile", "go to profile", "open profile"],
    run: (nav, speak) => { nav("/profile"); speak("Opening user profile and EduID card", true); },
  },
  {
    command: "go to education",
    action: "Open Education",
    category: "navigation",
    description: "Browse accessible colleges, courses, and institutes",
    keywords: ["education", "college", "colleges", "university", "universities", "institutes", "institute", "go to education", "open education"],
    run: (nav, speak) => { nav("/education"); speak("Opening education and colleges directory", true); },
  },
  {
    command: "go to learn",
    action: "Open Learn Hub",
    category: "navigation",
    description: "Study subject modules, interactive flashcards, and quizzes",
    keywords: ["learn", "learning", "study", "courses", "subjects", "study hub", "go to learn", "open learn"],
    run: (nav, speak) => { nav("/learn"); speak("Opening learning hub", true); },
  },
  {
    command: "go to eduspeak",
    action: "Open EduSpeak",
    category: "navigation",
    description: "Interactive AI speech and pronunciation practice lab",
    keywords: ["eduspeak", "speak", "speech", "speaking", "pronunciation", "accent", "go to speak", "open eduspeak"],
    run: (nav, speak) => { nav("/eduspeak"); speak("Opening EduSpeak pronunciation lab", true); },
  },
  {
    command: "go to eduvault",
    action: "Open EduVault",
    category: "navigation",
    description: "Secure digital document locker with OCR and QR verification",
    keywords: ["vault", "eduvault", "document", "documents", "certificate", "certificates", "locker", "go to vault", "open eduvault"],
    run: (nav, speak) => { nav("/eduvault"); speak("Opening EduVault document locker", true); },
  },
  {
    command: "go to mentors",
    action: "Open Mentors",
    category: "navigation",
    description: "Connect with verified mentors, counselors, and guides",
    keywords: ["mentor", "mentors", "guide", "guidance", "advisor", "go to mentors", "open mentors"],
    run: (nav, speak) => { nav("/mentors"); speak("Opening mentors network", true); },
  },
  {
    command: "go to edumentor",
    action: "Open AI Tutor",
    category: "navigation",
    description: "24/7 AI academic tutor aligned with your syllabus",
    keywords: ["edumentor", "ai mentor", "ai tutor", "tutor", "academic assistant", "open tutor", "ask tutor"],
    run: (nav, speak) => { nav("/edumentor"); speak("Opening EduMentor AI academic tutor", true); },
  },
  {
    command: "go to roadmap",
    action: "Open Career Roadmap",
    category: "navigation",
    description: "Personalized AI milestones and step-by-step career pathway",
    keywords: ["roadmap", "road map", "pathway", "career path", "career plan", "go to roadmap", "open roadmap"],
    run: (nav, speak) => { nav("/eduroadmap"); speak("Opening career roadmap", true); },
  },
  {
    command: "go to nearby",
    action: "Open Nearby Institutes",
    category: "navigation",
    description: "Map and directory of accessible institutes and facilities nearby",
    keywords: ["nearby", "near me", "centers", "facilities", "accessible centers", "go to nearby", "open nearby"],
    run: (nav, speak) => { nav("/nearby"); speak("Opening nearby accessible institutes", true); },
  },
  {
    command: "go to community",
    action: "Open Community",
    category: "navigation",
    description: "Peer discussion forums, study groups, and announcements",
    keywords: ["community", "forum", "discussion", "discussions", "peers", "go to community", "open community"],
    run: (nav, speak) => { nav("/community"); speak("Opening community forum", true); },
  },
  {
    command: "go to performance",
    action: "Open Performance",
    category: "navigation",
    description: "Track academic progress, quiz scores, and analytics",
    keywords: ["performance", "grades", "analytics", "progress", "results", "scores", "go to performance", "open performance"],
    run: (nav, speak) => { nav("/performance"); speak("Opening performance analytics", true); },
  },
  {
    command: "go to gamification",
    action: "Open Rewards & Badges",
    category: "navigation",
    description: "Earned XP points, learning streaks, badges, and leaderboard",
    keywords: ["gamification", "rewards", "reward", "badge", "badges", "points", "xp", "streak", "leaderboard", "open rewards"],
    run: (nav, speak) => { nav("/gamification"); speak("Opening rewards and gamification", true); },
  },
  {
    command: "go to accessibility",
    action: "Open Accessibility Tools",
    category: "navigation",
    description: "Configure high contrast, text size, dyslexia font, and themes",
    keywords: ["accessibility", "a11y", "assistive", "tools", "contrast", "dyslexia", "go to accessibility", "open accessibility"],
    run: (nav, speak) => { nav("/accessibility"); speak("Opening accessibility tools page", true); },
  },
  {
    command: "go to settings",
    action: "Open Settings",
    category: "navigation",
    description: "Manage system preferences, notifications, and account options",
    keywords: ["setting", "settings", "preference", "preferences", "config", "go to settings", "open settings"],
    run: (nav, speak) => { nav("/settings"); speak("Opening account settings", true); },
  },
  {
    command: "go back",
    action: "Go to Previous Page",
    category: "navigation",
    description: "Navigates back to the previous screen",
    keywords: ["go back", "back", "previous page", "return", "step back"],
    run: (nav, speak) => { nav(-1); speak("Going back to previous page", true); },
  },
  {
    command: "read page",
    action: "Read Page Content",
    category: "reading",
    description: "Reads the main text content of the active screen aloud",
    keywords: ["read page", "read all", "read content", "read text"],
    run: (_, speak) => {
      const el = document.getElementById("main-content") || document.body;
      const text = el.innerText?.slice(0, 500) || "No text found to read.";
      speak(text, true);
    },
  },
  {
    command: "read headings",
    action: "Read All Headings",
    category: "reading",
    description: "Summarizes all section headings on this screen",
    keywords: ["read headings", "headings", "read titles", "titles"],
    run: (_, speak) => {
      const headings = Array.from(document.querySelectorAll("h1, h2, h3"))
        .map((h) => (h as HTMLElement).innerText?.trim())
        .filter(Boolean)
        .join(". ");
      speak(headings ? `Headings: ${headings}` : "No headings found on this page.", true);
    },
  },
  {
    command: "scroll down",
    action: "Scroll Down",
    category: "reading",
    description: "Scrolls the page down by 400 pixels",
    keywords: ["scroll down", "go down", "down", "page down"],
    run: (_, speak) => {
      window.scrollBy({ top: 400, behavior: "smooth" });
      speak("Scrolling down", true);
    },
  },
  {
    command: "scroll up",
    action: "Scroll Up",
    category: "reading",
    description: "Scrolls the page up by 400 pixels",
    keywords: ["scroll up", "go up", "up", "page up"],
    run: (_, speak) => {
      window.scrollBy({ top: -400, behavior: "smooth" });
      speak("Scrolling up", true);
    },
  },
  {
    command: "scroll top",
    action: "Scroll To Top",
    category: "reading",
    description: "Jumps smoothly to the very top of the page",
    keywords: ["scroll top", "top", "top of page", "go to top"],
    run: (_, speak) => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      speak("Going to top of page", true);
    },
  },
  {
    command: "scroll bottom",
    action: "Scroll To Bottom",
    category: "reading",
    description: "Jumps to the bottom of the page",
    keywords: ["scroll bottom", "bottom", "bottom of page", "go to bottom"],
    run: (_, speak) => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      speak("Going to bottom of page", true);
    },
  },
  {
    command: "click",
    action: "Click Focused Element",
    category: "control",
    description: "Clicks the currently active or highlighted interactive item",
    keywords: ["click", "press", "select", "choose", "enter"],
    run: (_, speak) => {
      const focused = (document.querySelector(".sr-focus-highlight") ||
        document.activeElement) as HTMLElement;
      if (focused && typeof focused.click === "function") {
        focused.click();
        speak("Element clicked", true);
      } else {
        speak("No element selected. Press Tab or say next.", true);
      }
    },
  },
  {
    command: "next",
    action: "Focus Next Element",
    category: "control",
    description: "Moves the green focus highlight to the next interactive button or link",
    keywords: ["next", "next element", "tab", "tab forward"],
    run: (_, speak) => {
      const focusable = Array.from(
        document.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null && !el.closest(".sr-command-board"));
      const current = (document.querySelector(".sr-focus-highlight") ||
        document.activeElement) as HTMLElement;
      const idx = focusable.indexOf(current);
      const next = focusable[idx + 1] || focusable[0];
      if (next) {
        next.focus();
        document.querySelectorAll(".sr-focus-highlight").forEach((e) =>
          e.classList.remove("sr-focus-highlight")
        );
        next.classList.add("sr-focus-highlight");
        next.scrollIntoView({ behavior: "smooth", block: "center" });
        const label =
          next.getAttribute("aria-label") ||
          next.innerText?.trim() ||
          next.getAttribute("placeholder") ||
          next.tagName.toLowerCase();
        speak(`Focus: ${label}`, true);
      }
    },
  },
  {
    command: "previous",
    action: "Focus Previous Element",
    category: "control",
    description: "Moves focus highlight to the previous interactive element",
    keywords: ["previous", "previous element", "tab back", "prev"],
    run: (_, speak) => {
      const focusable = Array.from(
        document.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null && !el.closest(".sr-command-board"));
      const current = (document.querySelector(".sr-focus-highlight") ||
        document.activeElement) as HTMLElement;
      const idx = focusable.indexOf(current);
      const prev = idx > 0 ? focusable[idx - 1] : focusable[focusable.length - 1];
      if (prev) {
        prev.focus();
        document.querySelectorAll(".sr-focus-highlight").forEach((e) =>
          e.classList.remove("sr-focus-highlight")
        );
        prev.classList.add("sr-focus-highlight");
        prev.scrollIntoView({ behavior: "smooth", block: "center" });
        const label =
          prev.getAttribute("aria-label") ||
          prev.innerText?.trim() ||
          prev.getAttribute("placeholder") ||
          prev.tagName.toLowerCase();
        speak(`Focus: ${label}`, true);
      }
    },
  },
  {
    command: "stop",
    action: "Stop Speaking",
    category: "control",
    description: "Immediately silences all speech synthesis",
    keywords: ["stop", "quiet", "silence", "shut up", "pause", "mute"],
    run: () => {
      window.speechSynthesis?.cancel();
    },
  },
  {
    command: "repeat",
    action: "Repeat Last Spoken",
    category: "control",
    description: "Repeats the last spoken announcement",
    keywords: ["repeat", "say again", "what did you say"],
    run: (_, speak) => {
      speak("Repeating last announcement", true);
    },
  },
  {
    command: "show commands",
    action: "Open Command Board",
    category: "control",
    description: "Displays the side command board panel on the right",
    keywords: ["show commands", "open command board", "show command board", "open commands"],
    run: (_, speak) => {
      speak("Command board opened", true);
    },
  },
  {
    command: "hide commands",
    action: "Hide Command Board",
    category: "control",
    description: "Minimizes the side command board panel",
    keywords: ["hide commands", "close command board", "hide command board", "minimize command board"],
    run: (_, speak) => {
      speak("Command board minimized", true);
    },
  },
  {
    command: "help",
    action: "List Available Commands",
    category: "control",
    description: "Speaks summary of common voice navigation commands",
    keywords: ["help", "commands", "what can i say", "help me"],
    run: (_, speak) => {
      speak(
        "You can say: go to home, go to jobs, go to schemes, go to profile, go to education, go to learn, scroll down, next, previous, or stop.",
        true
      );
    },
  },
];

interface ScreenReaderContextType {
  isActive: boolean;
  isListening: boolean;
  lastSpoken: string;
  transcript: string;
  lastRecognizedAction: string | null;
  micError: string | null;
  isCommandBoardOpen: boolean;
  commandBoardWidth: number;
  isDragging: boolean;
  activate: () => void;
  deactivate: () => void;
  toggle: () => void;
  toggleCommandBoard: () => void;
  setIsCommandBoardOpen: (open: boolean) => void;
  setCommandBoardWidth: (width: number) => void;
  setIsDragging: (dragging: boolean) => void;
  speak: (text: string, priority?: boolean) => void;
  executeCommand: (commandStr: string) => void;
}

const ScreenReaderContext = createContext<ScreenReaderContextType | null>(null);

const STORAGE_ACTIVE_KEY = "edu_screen_reader_active";
const STORAGE_BOARD_OPEN_KEY = "edu_screen_reader_board_open";
const STORAGE_WIDTH_KEY = "edu_screen_reader_width";

export const DEFAULT_BOARD_WIDTH = 350;
export const MIN_BOARD_WIDTH = 270;
export const MAX_BOARD_WIDTH = 650;

export const ScreenReaderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_ACTIVE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const [isCommandBoardOpen, setIsCommandBoardOpen] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_BOARD_OPEN_KEY);
      return stored !== null ? stored === "true" : true;
    } catch {
      return true;
    }
  });

  const [commandBoardWidth, setCommandBoardWidthState] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_WIDTH_KEY);
      const parsed = stored ? parseInt(stored, 10) : DEFAULT_BOARD_WIDTH;
      return !isNaN(parsed) && parsed >= MIN_BOARD_WIDTH && parsed <= MAX_BOARD_WIDTH
        ? parsed
        : DEFAULT_BOARD_WIDTH;
    } catch {
      return DEFAULT_BOARD_WIDTH;
    }
  });

  const [isListening, setIsListening] = useState<boolean>(false);
  const [lastSpoken, setLastSpoken] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const [lastRecognizedAction, setLastRecognizedAction] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();

  const recognitionRef = useRef<any>(null);
  const currentFocusRef = useRef<Element | null>(null);
  const synthRef = useRef(typeof window !== "undefined" ? window.speechSynthesis : null);
  const isActiveRef = useRef(isActive);
  const lastSpokenRef = useRef(lastSpoken);
  const lastActionTimeRef = useRef(0);
  const restartTimeoutRef = useRef<any>(null);

  useEffect(() => {
    isActiveRef.current = isActive;
    try {
      localStorage.setItem(STORAGE_ACTIVE_KEY, String(isActive));
    } catch {}
  }, [isActive]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_BOARD_OPEN_KEY, String(isCommandBoardOpen));
    } catch {}
  }, [isCommandBoardOpen]);

  const setCommandBoardWidth = useCallback((w: number) => {
    const clamped = Math.max(MIN_BOARD_WIDTH, Math.min(MAX_BOARD_WIDTH, w));
    setCommandBoardWidthState(clamped);
    try {
      localStorage.setItem(STORAGE_WIDTH_KEY, String(clamped));
    } catch {}
  }, []);

  const speak = useCallback((text: string, priority = false) => {
    if (!text || !synthRef.current) return;
    if (priority) {
      synthRef.current.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = navigator.language || "en-IN";
    utterance.rate = 0.96;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setLastSpoken(text);
      lastSpokenRef.current = text;
    };

    synthRef.current.speak(utterance);
  }, []);

  const analyzeAndExecute = useCallback(
    (rawSpeech: string) => {
      const clean = rawSpeech.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
      if (!clean) return;

      setTranscript(rawSpeech.trim());

      const now = Date.now();
      if (now - lastActionTimeRef.current < 600) {
        return;
      }

      if (clean.includes("open command") || clean.includes("show command")) {
        lastActionTimeRef.current = now;
        setIsCommandBoardOpen(true);
        setLastRecognizedAction("Opened Command Board");
        speak("Command board opened", true);
        return;
      }
      if (clean.includes("hide command") || clean.includes("close command") || clean.includes("minimize command")) {
        lastActionTimeRef.current = now;
        setIsCommandBoardOpen(false);
        setLastRecognizedAction("Minimized Command Board");
        speak("Command board minimized", true);
        return;
      }

      if (clean.includes("repeat") || clean.includes("say again")) {
        lastActionTimeRef.current = now;
        if (lastSpokenRef.current) {
          speak(lastSpokenRef.current, true);
        } else {
          speak("Nothing to repeat", true);
        }
        return;
      }

      if (/\b(stop|quiet|silence|shut up|pause|mute)\b/.test(clean)) {
        lastActionTimeRef.current = now;
        synthRef.current?.cancel();
        setLastRecognizedAction("Speech Silenced");
        return;
      }

      for (const item of ALL_VOICE_COMMANDS) {
        if (clean === item.command || clean.includes(item.command)) {
          lastActionTimeRef.current = now;
          setLastRecognizedAction(item.action);
          item.run(navigate, speak);
          return;
        }
        if (item.keywords && item.keywords.some((kw) => clean.includes(kw))) {
          lastActionTimeRef.current = now;
          setLastRecognizedAction(item.action);
          item.run(navigate, speak);
          return;
        }
      }

      if (/\b(home|dashboard|dash board|main page|index|start page)\b/.test(clean)) {
        lastActionTimeRef.current = now;
        setLastRecognizedAction("Go to Dashboard");
        navigate("/");
        speak("Navigating to home dashboard", true);
      } else if (/\b(job|jobs|career|careers|internship|internships|employment|work)\b/.test(clean)) {
        lastActionTimeRef.current = now;
        setLastRecognizedAction("Open Jobs Portal");
        navigate("/jobs");
        speak("Opening jobs and careers portal", true);
      } else if (/\b(scheme|schemes|scholarship|scholarships|yojana|grant|grants|pension)\b/.test(clean)) {
        lastActionTimeRef.current = now;
        setLastRecognizedAction("Open Schemes");
        navigate("/schemes");
        speak("Opening government schemes and scholarships", true);
      } else if (/\b(profile|eduid|edu id|id card|identity|my account)\b/.test(clean)) {
        lastActionTimeRef.current = now;
        setLastRecognizedAction("Open Profile");
        navigate("/profile");
        speak("Opening user profile and EduID card", true);
      } else if (/\b(education|college|colleges|university|institutes|institute)\b/.test(clean)) {
        lastActionTimeRef.current = now;
        setLastRecognizedAction("Open Education");
        navigate("/education");
        speak("Opening education and colleges directory", true);
      } else if (/\b(eduspeak|speech|speaking|pronunciation|accent)\b/.test(clean)) {
        lastActionTimeRef.current = now;
        setLastRecognizedAction("Open EduSpeak");
        navigate("/eduspeak");
        speak("Opening EduSpeak pronunciation lab", true);
      } else if (/\b(vault|eduvault|document|documents|certificate|certificates|locker)\b/.test(clean)) {
        lastActionTimeRef.current = now;
        setLastRecognizedAction("Open EduVault");
        navigate("/eduvault");
        speak("Opening EduVault document locker", true);
      } else if (/\b(learn|learning|study|courses|subjects)\b/.test(clean)) {
        lastActionTimeRef.current = now;
        setLastRecognizedAction("Open Learn Hub");
        navigate("/learn");
        speak("Opening learning hub", true);
      } else if (/\b(edumentor|ai tutor|ai mentor|tutor)\b/.test(clean)) {
        lastActionTimeRef.current = now;
        setLastRecognizedAction("Open AI Tutor");
        navigate("/edumentor");
        speak("Opening EduMentor academic tutor", true);
      } else if (/\b(mentor|mentors|guide|guidance)\b/.test(clean)) {
        lastActionTimeRef.current = now;
        setLastRecognizedAction("Open Mentors");
        navigate("/mentors");
        speak("Opening mentors network", true);
      } else if (/\b(roadmap|road map|pathway|career path)\b/.test(clean)) {
        lastActionTimeRef.current = now;
        setLastRecognizedAction("Open Roadmap");
        navigate("/eduroadmap");
        speak("Opening career roadmap", true);
      } else if (/\b(nearby|near me|centers|facilities)\b/.test(clean)) {
        lastActionTimeRef.current = now;
        setLastRecognizedAction("Open Nearby");
        navigate("/nearby");
        speak("Opening nearby accessible institutes", true);
      } else if (/\b(community|forum|discussions|discussion|peers)\b/.test(clean)) {
        lastActionTimeRef.current = now;
        setLastRecognizedAction("Open Community");
        navigate("/community");
        speak("Opening community forum", true);
      } else if (/\b(performance|grades|progress|results|analytics)\b/.test(clean)) {
        lastActionTimeRef.current = now;
        setLastRecognizedAction("Open Performance");
        navigate("/performance");
        speak("Opening performance analytics", true);
      } else if (/\b(gamification|rewards|reward|badges|badge|streaks|streak|points|xp)\b/.test(clean)) {
        lastActionTimeRef.current = now;
        setLastRecognizedAction("Open Rewards");
        navigate("/gamification");
        speak("Opening rewards and achievements", true);
      } else if (/\b(accessibility|a11y|assistive|contrast|dyslexia)\b/.test(clean)) {
        lastActionTimeRef.current = now;
        setLastRecognizedAction("Open Accessibility");
        navigate("/accessibility");
        speak("Opening accessibility tools page", true);
      } else if (/\b(setting|settings|preference|preferences)\b/.test(clean)) {
        lastActionTimeRef.current = now;
        setLastRecognizedAction("Open Settings");
        navigate("/settings");
        speak("Opening account settings", true);
      } else if (/\b(back|go back|previous page)\b/.test(clean)) {
        lastActionTimeRef.current = now;
        setLastRecognizedAction("Go Back");
        navigate(-1);
        speak("Going back to previous page", true);
      } else if (/\b(scroll down|go down|page down)\b/.test(clean)) {
        lastActionTimeRef.current = now;
        window.scrollBy({ top: 400, behavior: "smooth" });
        speak("Scrolling down", true);
      } else if (/\b(scroll up|go up|page up)\b/.test(clean)) {
        lastActionTimeRef.current = now;
        window.scrollBy({ top: -400, behavior: "smooth" });
        speak("Scrolling up", true);
      } else if (/\b(top|scroll top|top of page)\b/.test(clean)) {
        lastActionTimeRef.current = now;
        window.scrollTo({ top: 0, behavior: "smooth" });
        speak("Going to top of page", true);
      } else if (/\b(bottom|scroll bottom|bottom of page)\b/.test(clean)) {
        lastActionTimeRef.current = now;
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        speak("Going to bottom of page", true);
      }
    },
    [navigate, speak]
  );

  const executeCommand = useCallback(
    (commandStr: string) => {
      analyzeAndExecute(commandStr);
    },
    [analyzeAndExecute]
  );

  const startListeningInstance = useCallback(() => {
    if (typeof window === "undefined" || !isActiveRef.current) return;

    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      setMicError("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.abort();
      } catch {}
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = navigator.language || "en-US";
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setMicError(null);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (isActiveRef.current) {
          if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
          restartTimeoutRef.current = setTimeout(() => {
            if (isActiveRef.current) {
              startListeningInstance();
            }
          }, 150);
        }
      };

      recognition.onresult = (event: any) => {
        const results = event.results;
        if (!results || results.length === 0) return;

        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < results.length; i++) {
          const chunk = results[i][0]?.transcript || "";
          if (results[i].isFinal) {
            finalTranscript += chunk;
          } else {
            interimTranscript += chunk;
          }
        }

        if (interimTranscript) {
          setTranscript(interimTranscript.trim());
        }

        if (finalTranscript.trim()) {
          setTranscript(finalTranscript.trim());
          analyzeAndExecute(finalTranscript.trim());
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          setIsListening(false);
          setMicError("Microphone permission denied. Please allow microphone in your browser settings.");
        } else if (e.error === "network") {
          setMicError("Network error with speech recognition. Reconnecting...");
        } else if (e.error !== "no-speech" && e.error !== "aborted") {
          console.warn("Speech recognition notice:", e.error);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn("Could not start speech recognition:", err);
      if (err.name === "InvalidStateError") {
        setIsListening(true);
      }
    }
  }, [analyzeAndExecute]);

  const activate = useCallback(() => {
    isActiveRef.current = true;
    setIsActive(true);
    setIsCommandBoardOpen(true);
    setMicError(null);

    speak("Screen reader activated. Microphone is live. Say go to home, go to jobs, or any command.", true);

    startListeningInstance();

    setTimeout(() => {
      const focusable = Array.from(
        document.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled])'
        )
      ).filter((el) => !el.closest(".sr-command-board"));
      if (focusable[0]) {
        focusable[0].focus();
      }
    }, 500);
  }, [speak, startListeningInstance]);

  const deactivate = useCallback(() => {
    isActiveRef.current = false;
    setIsActive(false);
    setIsCommandBoardOpen(false);
    synthRef.current?.cancel();
    if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.abort();
      } catch {}
    }
    setIsListening(false);
    document.querySelectorAll(".sr-focus-highlight").forEach((e) => {
      e.classList.remove("sr-focus-highlight");
    });
    speak("Screen reader deactivated", true);
  }, [speak]);

  const toggle = useCallback(() => {
    if (isActive) {
      deactivate();
    } else {
      activate();
    }
  }, [isActive, activate, deactivate]);

  const toggleCommandBoard = useCallback(() => {
    setIsCommandBoardOpen((prev) => !prev);
  }, []);

  const getElementLabel = useCallback((el: Element): string => {
    if (!el) return "";
    const ariaLabel = el.getAttribute("aria-label");
    const title = el.getAttribute("title");
    const placeholder = el.getAttribute("placeholder");
    const alt = el.getAttribute("alt");
    const text = (el as HTMLElement).innerText?.trim();
    const tagName = el.tagName.toLowerCase();
    const role = el.getAttribute("role");
    const type = el.getAttribute("type");

    const id = el.getAttribute("id");
    const labelEl = id ? document.querySelector(`label[for="${id}"]`) : null;
    const labelText = (labelEl as HTMLElement)?.innerText?.trim();

    let label = ariaLabel || labelText || text || placeholder || alt || title || "";

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
        label = `Input field ${label}: ${inputType}`;
      }
    } else if (tagName === "select") {
      const val = (el as HTMLSelectElement).value;
      label = `Dropdown ${label}: currently selected ${val}`;
    } else if (tagName === "textarea") {
      label = `Text area: ${label}`;
    } else if (tagName === "img") {
      label = `Image: ${label || "graphic"}`;
    } else if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(tagName)) {
      label = `Heading: ${label}`;
    }

    return label || "Interactive element";
  }, []);

  const highlightElement = useCallback((el: Element | null) => {
    document.querySelectorAll(".sr-focus-highlight").forEach((e) => {
      e.classList.remove("sr-focus-highlight");
    });
    if (el) {
      el.classList.add("sr-focus-highlight");
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const handleFocusChange = useCallback(
    (e: FocusEvent) => {
      if (!isActive) return;
      const el = e.target as Element;
      if (!el || el.closest(".sr-command-board")) return;
      currentFocusRef.current = el;
      highlightElement(el);
      const label = getElementLabel(el);
      speak(label, true);
    },
    [isActive, speak, getElementLabel, highlightElement]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (isActive) {
          deactivate();
        } else {
          activate();
        }
        return;
      }

      if (!isActive) return;

      if (e.key === "Enter" || e.key === " ") {
        const activeEl = document.activeElement;
        if (activeEl && !activeEl.closest(".sr-command-board")) {
          speak("Activated", true);
        }
      } else if (e.key === "Escape") {
        speak("Escaped", true);
      }
    },
    [isActive, activate, deactivate, speak]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    if (isActive) {
      document.addEventListener("focusin", handleFocusChange);
      startListeningInstance();
    } else {
      document.removeEventListener("focusin", handleFocusChange);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocusChange);
    };
  }, [isActive, handleFocusChange, handleKeyDown, startListeningInstance]);

  useEffect(() => {
    if (isActive) {
      const routeName = ROUTE_NAMES[location.pathname] || location.pathname.replace("/", "") || "Dashboard";
      speak(`Navigated to ${routeName}`);
    }
  }, [location.pathname, isActive, speak]);

  useEffect(() => {
    if (isActive && !isCommandBoardOpen) {
      setIsCommandBoardOpen(true);
    }
  }, [isActive, isCommandBoardOpen]);

  useEffect(() => {
    return () => {
      synthRef.current?.cancel();
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  return (
    <ScreenReaderContext.Provider
      value={{
        isActive,
        isListening,
        lastSpoken,
        transcript,
        lastRecognizedAction,
        micError,
        isCommandBoardOpen,
        commandBoardWidth,
        isDragging,
        activate,
        deactivate,
        toggle,
        toggleCommandBoard,
        setIsCommandBoardOpen,
        setCommandBoardWidth,
        setIsDragging,
        speak,
        executeCommand,
      }}
    >
      {children}
    </ScreenReaderContext.Provider>
  );
};

export const useScreenReader = () => {
  const ctx = useContext(ScreenReaderContext);
  if (!ctx) {
    throw new Error("useScreenReader must be used within a ScreenReaderProvider");
  }
  return ctx;
};
