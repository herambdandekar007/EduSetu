import React, { useState, useRef, useMemo } from "react";
import {
  useScreenReader,
  ALL_VOICE_COMMANDS,
  MIN_BOARD_WIDTH,
  MAX_BOARD_WIDTH,
} from "@/contexts/ScreenReaderContext";
import {
  Mic,
  Volume2,
  X,
  Minimize2,
  Search,
  Compass,
  BookOpen,
  Sliders,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Keyboard,
  Radio,
  AlertTriangle,
  RefreshCw,
  Send,
  Info,
} from "lucide-react";

export const ScreenReaderCommandBoard: React.FC = () => {
  const {
    isActive,
    isListening,
    lastSpoken,
    transcript,
    lastRecognizedAction,
    micError,
    isCommandBoardOpen,
    commandBoardWidth,
    isDragging,
    setIsCommandBoardOpen,
    setCommandBoardWidth,
    setIsDragging,
    deactivate,
    restartMic,
    executeCommand,
  } = useScreenReader();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "navigation" | "reading" | "control">("all");
  const [commandInput, setCommandInput] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragStartRef.current = {
      startX: e.clientX,
      startWidth: commandBoardWidth,
    };
    setIsDragging(true);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStartRef.current) return;
      const delta = dragStartRef.current.startX - moveEvent.clientX;
      const newWidth = Math.max(
        MIN_BOARD_WIDTH,
        Math.min(MAX_BOARD_WIDTH, dragStartRef.current.startWidth + delta)
      );
      setCommandBoardWidth(newWidth);
    };

    const handleMouseUp = () => {
      dragStartRef.current = null;
      setIsDragging(false);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const filteredCommands = useMemo(() => {
    return ALL_VOICE_COMMANDS.filter((cmd) => {
      const matchCat = activeCategory === "all" || cmd.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        cmd.command.toLowerCase().includes(q) ||
        cmd.action.toLowerCase().includes(q) ||
        cmd.description.toLowerCase().includes(q) ||
        (cmd.keywords && cmd.keywords.some((kw) => kw.toLowerCase().includes(q)));
      return matchCat && matchQuery;
    });
  }, [activeCategory, searchQuery]);

  if (!isActive || !isCommandBoardOpen) {
    return null;
  }

  return (
    <aside
      ref={panelRef}
      role="region"
      aria-label="Voice Command Reference Board"
      className="sr-command-board fixed top-0 right-0 bottom-0 h-screen z-[9999] flex flex-col bg-slate-950/95 text-slate-100 backdrop-blur-xl border-l border-emerald-500/30 shadow-[-12px_0_40px_rgba(0,255,136,0.12)] selection:bg-emerald-500/30"
      style={{
        width: `${commandBoardWidth}px`,
        transition: isDragging ? "none" : "width 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div
        onMouseDown={handleMouseDown}
        title="Click and drag to adjust width of command board"
        className="absolute left-0 top-0 bottom-0 w-3 -translate-x-1.5 cursor-col-resize z-50 group flex items-center justify-center hover:w-4 transition-all"
        style={{ touchAction: "none" }}
      >
        <div
          className={`h-24 w-1.5 rounded-full transition-all duration-200 ${
            isDragging
              ? "bg-emerald-400 shadow-[0_0_12px_rgba(0,255,136,0.9)] scale-y-125"
              : "bg-emerald-500/40 group-hover:bg-emerald-400 group-hover:shadow-[0_0_8px_rgba(0,255,136,0.6)]"
          }`}
        />
        <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 border border-emerald-500/40 px-2 py-1 text-[10px] font-medium text-emerald-300 shadow-lg transition-opacity duration-150">
          Drag to resize ({commandBoardWidth}px)
        </div>
      </div>

      <div className="p-4 border-b border-white/10 bg-slate-900/60 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex-shrink-0">
              <Mic className={`w-4 h-4 ${isListening ? "text-emerald-400 animate-pulse" : "text-slate-400"}`} />
              {isListening && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
                  Voice Commands
                </h2>
                <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-mono border ${
                  isListening
                    ? "bg-red-500/20 text-red-300 border-red-500/40"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                }`}>
                  {isListening ? "MIC LIVE" : "READY"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Speak any command hands-free
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsCommandBoardOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Minimize command board"
              aria-label="Minimize command board"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={deactivate}
              className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors"
              title="Disable Screen Reader"
              aria-label="Disable Screen Reader"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {micError && (
          <div className="mt-2.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-amber-300 text-xs">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <p className="leading-tight text-[11px]">{micError}</p>
            </div>
            <button
              onClick={restartMic}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-semibold hover:bg-amber-500/30 transition-colors w-fit"
            >
              <RefreshCw className="w-3 h-3" />
              Restart Microphone
            </button>
          </div>
        )}

        {!micError && !isListening && isActive && (
          <div className="mt-2.5 flex items-center gap-2">
            <button
              onClick={restartMic}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold hover:bg-emerald-500/30 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Restart Microphone
            </button>
          </div>
        )}

        <div className="mt-2.5 flex gap-2">
          <input
            type="text"
            placeholder='Type command (e.g. go to home)...'
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && commandInput.trim()) {
                executeCommand(commandInput.trim());
                setCommandInput("");
              }
            }}
            className="flex-1 bg-slate-950/70 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-all"
          />
          <button
            onClick={() => {
              if (commandInput.trim()) {
                executeCommand(commandInput.trim());
                setCommandInput("");
              }
            }}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 transition-colors"
            title="Send command"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <Info className="w-3 h-3" />
          {showInstructions ? "Hide" : "Show"} Voice Command Instructions
        </button>

        {showInstructions && (
          <div className="mt-2 p-2.5 rounded-lg bg-slate-950/60 border border-emerald-500/20 text-[11px] text-slate-300 space-y-1.5">
            <p className="font-semibold text-emerald-400">How to use Voice Commands:</p>
            <p>1. Click "Screen Reader" button (bottom-right) or press <kbd className="font-mono bg-white/10 px-1 rounded text-white">Alt+S</kbd></p>
            <p>2. Allow microphone permission when browser asks</p>
            <p>3. Wait for <span className="text-red-400 font-semibold">MIC LIVE</span> indicator</p>
            <p>4. Speak clearly: <span className="text-emerald-300 font-semibold">"go to home"</span>, <span className="text-emerald-300 font-semibold">"go to schemes"</span>, <span className="text-emerald-300 font-semibold">"scroll down"</span></p>
            <p>5. Or type commands in the text box above and press Enter</p>
            <p className="text-slate-500 mt-1">Tip: Use Chrome or Edge for best speech recognition support</p>
          </div>
        )}

        <div className="mt-3 p-2.5 rounded-xl bg-slate-900/80 border border-emerald-500/20 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isListening
                    ? "bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse"
                    : "bg-slate-500"
                }`}
              />
              <span className="text-[11px] font-medium text-slate-300">
                {isListening ? "Listening... Say any command" : "Microphone not active"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce" />
            </div>
          </div>

          {lastSpoken && (
            <div className="bg-slate-950/60 border border-emerald-500/30 rounded-lg p-2 flex items-start gap-2">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-emerald-400/80 uppercase font-mono block">
                  Assistant:
                </span>
                <p className="text-[11px] text-emerald-200 line-clamp-2 leading-tight">
                  "{lastSpoken}"
                </p>
              </div>
            </div>
          )}

          {transcript && (
            <div className="bg-slate-950/80 border border-white/10 rounded-lg p-2 flex items-start gap-2">
              <Radio className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0 animate-pulse" />
              <div className="min-w-0">
                <span className="text-[10px] text-amber-400/80 uppercase font-mono block">
                  Heard via Mic:
                </span>
                <p className="text-[11px] text-amber-200 font-semibold truncate">
                  "{transcript}"
                </p>
                {lastRecognizedAction && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    {lastRecognizedAction}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-col gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search commands (e.g. home, jobs, scroll)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/70 border border-white/10 rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
            {[
              { id: "all", label: "All", icon: Sparkles },
              { id: "navigation", label: "Navigate", icon: Compass },
              { id: "reading", label: "Read", icon: BookOpen },
              { id: "control", label: "Actions", icon: Sliders },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id as any)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? "bg-emerald-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(0,255,136,0.3)]"
                      : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
        {filteredCommands.length === 0 ? (
          <div className="text-center py-8 px-4 text-slate-400">
            <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-500 opacity-60" />
            <p className="text-xs font-semibold">No matching commands</p>
            <p className="text-[11px] mt-1 text-slate-500">
              Try searching for "home", "jobs", "schemes", or "scroll"
            </p>
          </div>
        ) : (
          filteredCommands.map((cmd) => {
            return (
              <div
                key={cmd.command}
                className="rounded-xl bg-slate-900/50 border border-white/5 hover:border-emerald-500/30 p-3 transition-colors flex flex-col gap-1.5 shadow-sm"
              >
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-semibold">
                    <Mic className="w-3 h-3 text-emerald-400" />
                    "{cmd.command}"
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-100 flex items-center gap-1">
                    {cmd.action}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    {cmd.description}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 border-t border-white/10 bg-slate-900/80 flex-shrink-0 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <Keyboard className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            Toggle: <kbd className="font-mono bg-white/10 px-1 py-0.5 rounded text-white">Alt + S</kbd>
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <span>Width: {commandBoardWidth}px</span>
          <button
            onClick={() => setCommandBoardWidth(350)}
            className="text-[10px] text-emerald-400 hover:underline"
            title="Reset to default width"
          >
            Reset
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ScreenReaderCommandBoard;
