/**
 * HandGestureController — DivyangConnect
 *
 * High-Accuracy Hand Gesture Engine with:
 * - Invariant hand-rotation finger extension analysis
 * - Adaptive dual-speed jitter filter (zero tremor during dwell + zero lag during speed)
 * - Calibrated active bounding box for full screen reachability
 * - Palm-centroid smoothed scrolling
 * - Multi-frame velocity swipe detection
 * - Point-and-Dwell auto-clicking with target lock
 *
 * Lives in App so it stays active across the entire website navigation.
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Hand,
  X,
  Keyboard,
  ChevronUp,
  ChevronDown,
  Wifi,
  Info,
  Play,
  CheckCircle,
  Sparkles,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface Landmark {
  x: number;
  y: number;
  z: number;
}

// ── Constants & Calibration ─────────────────────────────────────────────────
const SCROLL_SENS = 750;
const SCROLL_DEADZONE = 0.008; // normalized palm delta threshold
const MIN_PALM_SIZE = 0.02;
const GESTURE_CONFIRM = 2;
const DWELL_RADIUS = 36; // px radius for dwell locking
const DWELL_FRAMES = 32; // ~1.05s at 30fps
const SWIPE_VELOCITY_THRESH = 0.045; // normalized units/frame
const SWIPE_CD = 40;

// Active tracking box margins for 100% monitor reachability
const MARGIN_X = 0.12;
const MARGIN_Y = 0.12;

// ── Tutorial video URL ─────────────────────────────────────────────────────
const TUTORIAL_VIDEO_URL = "YOUR_VIDEO_URL_HERE";

// ── Gesture guide data ─────────────────────────────────────────────────────
const GESTURE_RULES = [
  {
    emoji: "🖐",
    title: "Smooth Scroll",
    desc: "Open ALL 4 fingers wide. Move hand UP to scroll up, DOWN to scroll down.",
    color: "#6366f1",
  },
  {
    emoji: "☝",
    title: "Point & Click (Dwell)",
    desc: "Extend only your INDEX finger. Move cursor over any element. Hold still ~1s to auto-click.",
    color: "#22c55e",
  },
  {
    emoji: "✌",
    title: "Virtual Keyboard",
    desc: "Show VICTORY sign (index + middle up). Hold briefly to toggle keyboard.",
    color: "#f59e0b",
  },
  {
    emoji: "👋",
    title: "Quick Swipe Navigation",
    desc: "Flick hand quickly LEFT for Back, RIGHT for Forward.",
    color: "#ec4899",
  },
];

// ── Script loader for CDN MediaPipe ─────────────────────────────────────────
const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.crossOrigin = "anonymous";
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
};

// ── Math & Precision Helpers ───────────────────────────────────────────────
const dist2D = (a: Landmark, b: Landmark) => Math.hypot(a.x - b.x, a.y - b.y);
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const pxDist = (ax: number, ay: number, bx: number, by: number) =>
  Math.hypot(ax - bx, ay - by);

/**
 * Robust rotation-invariant finger analysis
 */
function analyzeHighAccuracy(lm: Landmark[]) {
  const wrist = lm[0];
  const th = lm[4];
  const t8 = lm[8];   // Index tip
  const t12 = lm[12]; // Middle tip
  const t16 = lm[16]; // Ring tip
  const t20 = lm[20]; // Pinky tip

  const mcp5 = lm[5];   // Index MCP
  const mcp9 = lm[9];   // Middle MCP (Palm Center)
  const mcp13 = lm[13]; // Ring MCP
  const mcp17 = lm[17]; // Pinky MCP

  const pip6 = lm[6];
  const pip10 = lm[10];
  const pip14 = lm[14];
  const pip18 = lm[18];

  const palmSize = dist2D(wrist, mcp9);
  const safePalmSize = Math.max(MIN_PALM_SIZE, palmSize);

  // Rotation-invariant extension: Tip distance from wrist vs PIP distance from wrist
  const iExt = dist2D(wrist, t8) > dist2D(wrist, pip6) * 1.15 && dist2D(mcp5, t8) > dist2D(mcp5, pip6) * 1.25;
  const mExt = dist2D(wrist, t12) > dist2D(wrist, pip10) * 1.15 && dist2D(mcp9, t12) > dist2D(mcp9, pip10) * 1.25;
  const rExt = dist2D(wrist, t16) > dist2D(wrist, pip14) * 1.15 && dist2D(mcp13, t16) > dist2D(mcp13, pip14) * 1.25;
  const pExt = dist2D(wrist, t20) > dist2D(wrist, pip18) * 1.15 && dist2D(mcp17, t20) > dist2D(mcp17, pip18) * 1.25;

  const extCount = [iExt, mExt, rExt, pExt].filter(Boolean).length;

  // Open hand: 3 or 4 fingers extended
  const isOpen = extCount >= 3;

  // Pointing: Only Index is extended; Middle, Ring, Pinky curled
  const isPoint = iExt && !mExt && !rExt && !pExt;

  // Victory: Index and Middle extended; Ring and Pinky curled
  const isVictory = iExt && mExt && !rExt && !pExt;

  // Pinch: Thumb tip close to index tip
  const pinchDist = dist2D(th, t8) / safePalmSize;
  const isPinch = pinchDist < 0.25;

  return {
    isPinch,
    isPoint,
    isVictory,
    isOpen,
    extCount,
    t8,
    th,
    wrist,
    mcp9, // Palm center for ultra-smooth scrolling
    safePalmSize,
  };
}

// ══════════════════════════════════════════════════════════════════════════
//  Tutorial Modal
// ══════════════════════════════════════════════════════════════════════════
interface TutorialModalProps {
  onEnable: () => void;
  onSkip: () => void;
}

function TutorialModal({ onEnable, onSkip }: TutorialModalProps) {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    setVideoPlaying(true);
    videoRef.current?.play().catch(() => { });
  };

  const isYouTube =
    TUTORIAL_VIDEO_URL.includes("youtube.com") ||
    TUTORIAL_VIDEO_URL.includes("youtu.be");
  const isPlaceholder = TUTORIAL_VIDEO_URL === "YOUR_VIDEO_URL_HERE";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.78)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999999,
        backdropFilter: "blur(6px)",
        animation: "fadeIn 0.2s ease",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onSkip();
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { transform:translateY(24px);opacity:0 } to { transform:translateY(0);opacity:1 } }
      `}</style>

      <div
        style={{
          background: "#fff",
          borderRadius: 22,
          width: 520,
          maxWidth: "calc(100vw - 24px)",
          maxHeight: "calc(100vh - 40px)",
          overflowY: "auto",
          boxShadow: "0 28px 90px rgba(0,0,0,0.6)",
          animation: "slideUp 0.25s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 22px 14px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              flexShrink: 0,
              boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
            }}
          >
            🖐
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: "#111",
                marginBottom: 2,
              }}
            >
              High-Precision Gesture Control
            </div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              AI Vision Hand Tracking with Dwell Auto-Click
            </div>
          </div>
          <button
            onClick={onSkip}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "1px solid #e5e7eb",
              background: "#f9fafb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#9ca3af",
              flexShrink: 0,
              fontSize: 14,
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Video Area */}
        <div
          style={{
            background: "#0a0a14",
            position: "relative",
            aspectRatio: "16/9",
            overflow: "hidden",
          }}
        >
          {isPlaceholder ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                padding: 16,
              }}
            >
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: "50%",
                  background: "rgba(99,102,241,0.15)",
                  border: "2px dashed rgba(99,102,241,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Hand size={30} color="rgba(99,102,241,0.9)" />
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    color: "rgba(255,255,255,0.95)",
                    fontSize: 14,
                    fontWeight: 700,
                    marginBottom: 4,
                  }}
                >
                  Sub-Pixel Jitter Filter & Calibrated Viewport
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.55)",
                    fontSize: 12,
                    maxWidth: 340,
                  }}
                >
                  Point with index finger to move cursor & dwell over buttons to auto-click. Open hand to scroll effortlessly.
                </div>
              </div>
            </div>
          ) : isYouTube ? (
            <iframe
              src={TUTORIAL_VIDEO_URL}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                border: "none",
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <>
              <video
                ref={videoRef}
                src={TUTORIAL_VIDEO_URL}
                controls
                style={{
                  width: "100%",
                  height: "100%",
                  display: videoPlaying ? "block" : "none",
                  objectFit: "cover",
                }}
                onEnded={() => setVideoPlaying(false)}
              />
              {!videoPlaying && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 14,
                  }}
                >
                  <button
                    onClick={handlePlay}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      background: "rgba(99,102,241,0.95)",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 24px rgba(99,102,241,0.55)",
                    }}
                  >
                    <Play size={26} color="#fff" fill="#fff" />
                  </button>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
                    Click to watch gesture demo
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Gesture Chips */}
        <div style={{ padding: "16px 22px 10px" }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#6b7280",
              marginBottom: 10,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Gestures & Capabilities
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {GESTURE_RULES.map((rule) => (
              <div
                key={rule.title}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 20,
                  border: `1px solid ${rule.color}35`,
                  background: `${rule.color}0f`,
                  fontSize: 12,
                  color: "#374151",
                }}
              >
                <span style={{ fontSize: 15 }}>{rule.emoji}</span>
                <span style={{ color: rule.color, fontWeight: 700 }}>
                  {rule.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tips Row */}
        <div
          style={{
            margin: "0 22px 16px",
            padding: "11px 14px",
            background: "#fefce8",
            borderRadius: 12,
            border: "1px solid #fde68a",
            fontSize: 12,
            color: "#92400e",
            display: "flex",
            gap: 8,
            alignItems: "flex-start",
          }}
        >
          <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
          <span>
            Position your hand <strong>30–60 cm</strong> from the camera in good lighting. Move naturally across the frame to reach all screen edges.
          </span>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 22px 20px",
            display: "flex",
            gap: 10,
            alignItems: "center",
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <button
            onClick={onSkip}
            style={{
              padding: "11px 20px",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              background: "#f9fafb",
              color: "#6b7280",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Skip
          </button>
          <button
            onClick={onEnable}
            style={{
              flex: 1,
              padding: "12px 0",
              borderRadius: 12,
              background: "linear-gradient(135deg,#1e40af,#2563eb)",
              color: "#fff",
              border: "none",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 4px 18px rgba(37,99,235,0.4)",
            }}
          >
            <CheckCircle size={18} />
            Enable High-Accuracy Control
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//  Main High-Accuracy Component
// ══════════════════════════════════════════════════════════════════════════
export const HandGestureController = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [showKB, setShowKB] = useState(false);
  const [kbText, setKbText] = useState("");
  const [label, setLabel] = useState("Show your hand to the camera");
  const [scrollDir, setScrollDir] = useState<"up" | "down" | null>(null);
  const [cur, setCur] = useState({ x: -200, y: -200 });
  const [dwellPct, setDwellPct] = useState(0);
  const [hovKey, setHovKey] = useState<string | null>(null);
  const [fps, setFps] = useState(0);
  const [showGuide, setShowGuide] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const handsRef = useRef<any>(null);
  const camRef = useRef<any>(null);

  // Dual-speed adaptive smoothed coordinates
  const sX = useRef(0.5);
  const sY = useRef(0.5);

  // Dwell-click state
  const dwellAnchorX = useRef(-999);
  const dwellAnchorY = useRef(-999);
  const dwellCount = useRef(0);
  const dwellFired = useRef(false);

  // Scroll & swipe tracking
  const prevPalmY = useRef<number | null>(null);
  const scrollAcc = useRef(0);

  // Swipe velocity buffer
  const wristHistory = useRef<{ x: number; time: number }[]>([]);
  const swipeCD = useRef(0);

  const kbRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const showKBRef = useRef(false);
  const kbTextRef = useRef("");
  const victoryCnt = useRef(0);
  const fpsFrames = useRef(0);
  const fpsTimer = useRef(0);

  useEffect(() => {
    showKBRef.current = showKB;
  }, [showKB]);
  useEffect(() => {
    kbTextRef.current = kbText;
  }, [kbText]);

  // ── Draw skeleton ────────────────────────────────────────────────────────
  const drawSkeleton = useCallback(
    (lm: Landmark[], w: number, h: number, ctx: CanvasRenderingContext2D) => {
      const CONN = [
        [0, 1], [1, 2], [2, 3], [3, 4],
        [0, 5], [5, 6], [6, 7], [7, 8],
        [5, 9], [9, 10], [10, 11], [11, 12],
        [9, 13], [13, 14], [14, 15], [15, 16],
        [13, 17], [0, 17], [17, 18], [18, 19], [19, 20],
      ];
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 2.5;

      CONN.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(lm[a].x * w, lm[a].y * h);
        ctx.lineTo(lm[b].x * w, lm[b].y * h);
        ctx.strokeStyle =
          a <= 4 || b <= 4
            ? "rgba(249,115,22,0.75)"
            : "rgba(99,102,241,0.65)";
        ctx.stroke();
      });

      lm.forEach((p, i) => {
        ctx.beginPath();
        const r =
          i === 8 ? 8 : i === 4 ? 7 : [0, 5, 9, 13, 17].includes(i) ? 5 : 3.5;
        ctx.arc(p.x * w, p.y * h, r, 0, Math.PI * 2);
        ctx.fillStyle =
          i === 8
            ? "#818cf8"
            : i === 4
              ? "#fb923c"
              : i === 0
                ? "#e2e8f0"
                : "rgba(255,255,255,0.75)";
        ctx.fill();
      });
    },
    []
  );

  // ── Ripple effect ────────────────────────────────────────────────────────
  const ripple = useCallback((cx: number, cy: number) => {
    const el = document.createElement("div");
    el.style.cssText = `
      position:fixed;left:${cx - 28}px;top:${cy - 28}px;
      width:56px;height:56px;border-radius:50%;
      border:3px solid #22c55e;background:rgba(34,197,94,0.22);
      pointer-events:none;z-index:999999;
      box-shadow: 0 0 20px rgba(34,197,94,0.6);
      transition:transform 0.4s ease-out,opacity 0.4s ease-out;
    `;
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.transform = "scale(2.6)";
      el.style.opacity = "0";
    });
    setTimeout(() => el.remove(), 420);
  }, []);

  // ── Fire Click ───────────────────────────────────────────────────────────
  const fireClick = useCallback(
    (cx: number, cy: number) => {
      const dot = document.getElementById("hgc-cursor");
      if (dot) dot.style.display = "none";
      const el = document.elementFromPoint(cx, cy) as HTMLElement | null;
      if (dot) dot.style.display = "block";
      if (!el) return;

      const target = (el.closest("a") ||
        el.closest("button") ||
        el.closest("[role='button']") ||
        el.closest("[role='link']") ||
        el.closest("input") ||
        el.closest("select") ||
        el.closest("textarea") ||
        el.closest("label") ||
        el) as HTMLElement;

      const anchor = target.closest("a") as HTMLAnchorElement | null;
      if (anchor && anchor.href) {
        const url = new URL(anchor.href, window.location.href);
        const isSameOrigin = url.origin === window.location.origin;
        const hasModifier =
          anchor.target === "_blank" || anchor.rel?.includes("external");
        if (isSameOrigin && !hasModifier) {
          window.history.pushState({}, "", url.pathname + url.search + url.hash);
          window.dispatchEvent(new PopStateEvent("popstate", { state: {} }));
          ripple(cx, cy);
          setLabel("✅ Navigated!");
          return;
        }
      }

      const opts = { bubbles: true, cancelable: true, clientX: cx, clientY: cy };
      target.dispatchEvent(new PointerEvent("pointerdown", opts));
      target.dispatchEvent(new MouseEvent("mousedown", opts));
      target.dispatchEvent(new PointerEvent("pointerup", opts));
      target.dispatchEvent(new MouseEvent("mouseup", opts));
      target.dispatchEvent(new MouseEvent("click", opts));

      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      ) {
        target.focus();
      }
      ripple(cx, cy);
      setLabel("✅ Clicked!");
    },
    [ripple]
  );

  // ── High Accuracy OnFrame Handler ────────────────────────────────────────
  const onFrame = useCallback(
    (lm: Landmark[]) => {
      fpsFrames.current++;
      const now = performance.now();
      if (now - fpsTimer.current >= 1000) {
        setFps(fpsFrames.current);
        fpsFrames.current = 0;
        fpsTimer.current = now;
      }

      const g = analyzeHighAccuracy(lm);

      // Calibrate active zone to guarantee 100% monitor reachability
      const normRawX = clamp((1 - g.t8.x - MARGIN_X) / (1 - 2 * MARGIN_X), 0, 1);
      const normRawY = clamp((g.t8.y - MARGIN_Y) / (1 - 2 * MARGIN_Y), 0, 1);

      const targetX = normRawX * window.innerWidth;
      const targetY = normRawY * window.innerHeight;

      // Adaptive dual-speed filter:
      // When moving slowly (aiming) -> high smoothing (alpha=0.08) eliminates jitter
      // When moving fast -> low smoothing (alpha=0.45) eliminates lag
      const currentX = sX.current * window.innerWidth;
      const currentY = sY.current * window.innerHeight;
      const moveDelta = pxDist(currentX, currentY, targetX, targetY);

      let alpha = 0.12;
      if (moveDelta > 50) alpha = 0.45;
      else if (moveDelta > 20) alpha = 0.25;
      else if (moveDelta < 6) alpha = 0.06;

      sX.current = sX.current + (normRawX - sX.current) * alpha;
      sY.current = sY.current + (normRawY - sY.current) * alpha;

      const cx = sX.current * window.innerWidth;
      const cy = sY.current * window.innerHeight;
      setCur({ x: cx, y: cy });

      if (swipeCD.current > 0) swipeCD.current--;

      // ── 1. VICTORY SIGN (Index + Middle extended) -> Toggle Keyboard
      if (g.isVictory) {
        victoryCnt.current++;
        if (victoryCnt.current >= GESTURE_CONFIRM && swipeCD.current <= 0) {
          setShowKB((v) => !v);
          swipeCD.current = 35;
          setLabel("✌ Keyboard toggled");
          victoryCnt.current = 0;
          dwellCount.current = 0;
          dwellFired.current = false;
          setDwellPct(0);
          return;
        }
        setLabel("✌ Hold — toggling keyboard");
      } else {
        victoryCnt.current = 0;
      }

      // ── 2. VIRTUAL KEYBOARD MODE
      if (showKBRef.current) {
        let foundKey: string | null = null;
        kbRefs.current.forEach((el, key) => {
          const r = el.getBoundingClientRect();
          if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) {
            foundKey = key;
          }
        });
        setHovKey(foundKey);

        if (foundKey) {
          setLabel(`Key: ${foundKey} — hold still to type`);
          const dist = pxDist(cx, cy, dwellAnchorX.current, dwellAnchorY.current);
          if (dist > DWELL_RADIUS) {
            dwellAnchorX.current = cx;
            dwellAnchorY.current = cy;
            dwellCount.current = 0;
            dwellFired.current = false;
            setDwellPct(0);
          } else {
            dwellCount.current++;
            setDwellPct(Math.min(dwellCount.current / DWELL_FRAMES, 1) * 100);
            if (dwellCount.current >= DWELL_FRAMES && !dwellFired.current) {
              dwellFired.current = true;
              if (foundKey === "⌫") setKbText((t) => t.slice(0, -1));
              else if (foundKey === "CLEAR") setKbText("");
              else if (foundKey === "SPACE") setKbText((t) => t + " ");
              else if (foundKey === "ENTER") {
                let inp = document.activeElement as HTMLInputElement;
                if (!inp || !["INPUT", "TEXTAREA"].includes(inp.tagName)) {
                  inp = document.querySelector<HTMLInputElement>(
                    "input[type='text'],input[type='search'],input[type='email'],input[type='password'],input:not([type])"
                  ) as HTMLInputElement;
                }
                if (inp) {
                  inp.focus();
                  const nativeSetter = Object.getOwnPropertyDescriptor(
                    window.HTMLInputElement.prototype,
                    "value"
                  )?.set;
                  if (nativeSetter) nativeSetter.call(inp, kbTextRef.current);
                  else inp.value = kbTextRef.current;
                  inp.dispatchEvent(new Event("input", { bubbles: true }));
                  inp.dispatchEvent(new Event("change", { bubbles: true }));
                  inp.dispatchEvent(
                    new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
                  );
                }
                setShowKB(false);
                setKbText("");
              } else setKbText((t) => t + foundKey!);
              ripple(cx, cy);
            }
          }
        } else {
          setLabel("☝ Point at a key");
          dwellCount.current = 0;
          dwellFired.current = false;
          setDwellPct(0);
        }
        return;
      }

      // ── 3. OPEN HAND -> PALM CENTROID SMOOTH SCROLLING
      if (g.isOpen) {
        dwellCount.current = 0;
        dwellFired.current = false;
        setDwellPct(0);

        if (prevPalmY.current !== null) {
          const dy = (g.mcp9.y - prevPalmY.current) * SCROLL_SENS;
          scrollAcc.current += dy;
          if (Math.abs(scrollAcc.current) > SCROLL_DEADZONE * SCROLL_SENS) {
            window.scrollBy({ top: scrollAcc.current, behavior: "auto" });
            setScrollDir(scrollAcc.current > 0 ? "down" : "up");
            scrollAcc.current = 0;
          }
          if (dy < -1.2) setLabel("↑ Scrolling UP");
          else if (dy > 1.2) setLabel("↓ Scrolling DOWN");
          else setLabel("🖐 Open hand — move up/down to scroll");
        }
        prevPalmY.current = g.mcp9.y;
        wristHistory.current = [];
        return;
      }
      prevPalmY.current = null;
      setScrollDir(null);

      // ── 4. SWIPE (Velocity-based Back/Forward navigation)
      wristHistory.current.push({ x: g.wrist.x, time: now });
      if (wristHistory.current.length > 5) wristHistory.current.shift();

      if (wristHistory.current.length >= 3 && swipeCD.current <= 0) {
        const oldest = wristHistory.current[0];
        const newest = wristHistory.current[wristHistory.current.length - 1];
        const dt = (newest.time - oldest.time) || 16;
        const dx = (oldest.x - newest.x); // Mirrored: positive = swipe left in real world
        const vx = dx / (dt / 16);

        if (Math.abs(vx) > SWIPE_VELOCITY_THRESH) {
          if (vx > 0) {
            setLabel("👈 Navigating Back");
            window.history.back();
          } else {
            setLabel("👉 Navigating Forward");
            window.history.forward();
          }
          swipeCD.current = SWIPE_CD;
          wristHistory.current = [];
          dwellCount.current = 0;
          dwellFired.current = false;
          setDwellPct(0);
          return;
        }
      }

      // ── 5. POINT & DWELL AUTO-CLICK (With Target Lock)
      if (g.isPoint) {
        const distFromAnchor = pxDist(cx, cy, dwellAnchorX.current, dwellAnchorY.current);

        if (distFromAnchor > DWELL_RADIUS) {
          // Reset anchor when finger moves to a new target
          dwellAnchorX.current = cx;
          dwellAnchorY.current = cy;
          dwellCount.current = 0;
          dwellFired.current = false;
          setDwellPct(0);
          setLabel("☝ Pointing — hold steady to auto-click");
        } else {
          // Inside dwell zone: accumulate dwell frames smoothly
          dwellCount.current++;
          const pct = Math.min(dwellCount.current / DWELL_FRAMES, 1) * 100;
          setDwellPct(pct);

          if (dwellCount.current >= DWELL_FRAMES && !dwellFired.current) {
            dwellFired.current = true;
            fireClick(dwellAnchorX.current, dwellAnchorY.current);
            setDwellPct(100);
          } else if (!dwellFired.current) {
            const remaining = Math.ceil((DWELL_FRAMES - dwellCount.current) / 30);
            setLabel(
              dwellCount.current > DWELL_FRAMES * 0.5
                ? "🎯 Clicking target..."
                : `☝ Hold still (${remaining}s)`
            );
          } else {
            setLabel("✅ Clicked! Move to next element");
          }
        }
        return;
      }

      dwellCount.current = 0;
      dwellFired.current = false;
      setDwellPct(0);
      setLabel("Show your hand to the camera");
    },
    [fireClick, ripple]
  );

  // ── Start camera & vision engine ─────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      setLabel("Starting high-accuracy hand tracker...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 480,
          height: 360,
          facingMode: "user",
          frameRate: { ideal: 30, max: 30 },
        },
      });
      streamRef.current = stream;
      const vid = videoRef.current!;
      vid.srcObject = stream;

      // Ensure MediaPipe scripts are loaded
      if (!(window as any).Hands || !(window as any).Camera) {
        await Promise.all([
          loadScript(
            "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"
          ),
          loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"),
        ]);
      }

      const HandsConstructor = (window as any).Hands;
      const CameraConstructor = (window as any).Camera;

      if (!HandsConstructor || !CameraConstructor) {
        throw new Error("MediaPipe libraries failed to load");
      }

      const hands = new HandsConstructor({
        locateFile: (f: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/${f}`,
      });
      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.75, // Balanced for zero frame drops & robust accuracy
        minTrackingConfidence: 0.75,
      });

      hands.onResults((res: any) => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video) return;
        canvas.width = video.videoWidth || 480;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext("2d")!;
        if (res.multiHandLandmarks?.length > 0) {
          drawSkeleton(res.multiHandLandmarks[0], canvas.width, canvas.height, ctx);
          onFrame(res.multiHandLandmarks[0]);
          setReady(true);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          setLabel("Show your hand to the camera");
          setScrollDir(null);
          setCur({ x: -200, y: -200 });
          setDwellPct(0);
          prevPalmY.current = null;
          victoryCnt.current = 0;
          dwellCount.current = 0;
          dwellFired.current = false;
        }
      });

      handsRef.current = hands;
      const cam = new CameraConstructor(vid, {
        onFrame: async () => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            await hands.send({ image: vid });
          }
        },
        width: 480,
        height: 360,
      });
      camRef.current = cam;
      await cam.start();
      fpsTimer.current = performance.now();
      setReady(true);
      setShowGuide(true);
    } catch (err) {
      console.error("HandGestureController error:", err);
      setLabel("Camera unavailable — check browser permissions");
    }
  }, [drawSkeleton, onFrame]);

  // ── Stop camera ──────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    try {
      camRef.current?.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      handsRef.current?.close();
    } catch (e) {
      console.warn("Cleanup warning:", e);
    }
    streamRef.current = null;
    setReady(false);
    setShowKB(false);
    setShowGuide(false);
    setScrollDir(null);
    setCur({ x: -200, y: -200 });
    setDwellPct(0);
  }, []);

  // ── Toggle: FAB click ────────────────────────────────────────────────────
  const toggle = useCallback(() => {
    if (enabled) {
      stopCamera();
      setEnabled(false);
    } else {
      setShowTutorial(true);
    }
  }, [enabled, stopCamera]);

  // ── Tutorial modal handlers ──────────────────────────────────────────────
  const handleEnableFromModal = useCallback(() => {
    setShowTutorial(false);
    setEnabled(true);
    startCamera();
  }, [startCamera]);

  const handleSkipModal = useCallback(() => {
    setShowTutorial(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  // ── Dwell ring SVG Dimensions ────────────────────────────────────────────
  const RING_R = 24;
  const RING_C = RING_R + 4;
  const RING_SZ = RING_C * 2;
  const circ = 2 * Math.PI * RING_R;
  const dash = (dwellPct / 100) * circ;

  return (
    <>
      {/* ── Tutorial Video Modal ───────────────────────────────────────── */}
      {showTutorial && (
        <TutorialModal
          onEnable={handleEnableFromModal}
          onSkip={handleSkipModal}
        />
      )}

      {/* ── Cursor dot (Sub-pixel filtered) ────────────────────────────── */}
      <div
        id="hgc-cursor"
        style={{
          position: "fixed",
          left: cur.x,
          top: cur.y,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "rgba(99,102,241,0.95)",
          border: "2.5px solid #a5b4fc",
          transform: "translate(-50%,-50%)",
          pointerEvents: "none",
          zIndex: 999998,
          boxShadow: "0 0 12px rgba(99,102,241,0.5)",
          display: enabled && cur.x > 0 ? "block" : "none",
        }}
      />

      {/* ── Dwell Progress Ring ───────────────────────────────────────── */}
      {enabled && cur.x > 0 && dwellPct > 0 && (
        <svg
          style={{
            position: "fixed",
            left: (dwellAnchorX.current > 0 ? dwellAnchorX.current : cur.x) - RING_SZ / 2,
            top: (dwellAnchorY.current > 0 ? dwellAnchorY.current : cur.y) - RING_SZ / 2,
            width: RING_SZ,
            height: RING_SZ,
            pointerEvents: "none",
            zIndex: 999997,
            transform: "rotate(-90deg)",
          }}
        >
          <circle
            cx={RING_C}
            cy={RING_C}
            r={RING_R}
            fill="rgba(0,0,0,0.15)"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth={3}
          />
          <circle
            cx={RING_C}
            cy={RING_C}
            r={RING_R}
            fill="none"
            stroke={dwellPct >= 100 ? "#22c55e" : "#818cf8"}
            strokeWidth={3.5}
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.04s linear, stroke 0.2s" }}
          />
        </svg>
      )}

      {/* ── Scroll Direction Indicator ────────────────────────────────── */}
      {enabled && scrollDir && (
        <div
          style={{
            position: "fixed",
            right: 18,
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(99,102,241,0.95)",
            color: "#fff",
            borderRadius: 28,
            padding: "10px 12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            zIndex: 999996,
            fontSize: 12,
            fontWeight: 800,
            boxShadow: "0 4px 18px rgba(99,102,241,0.55)",
          }}
        >
          {scrollDir === "up" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          {scrollDir === "up" ? "UP" : "DN"}
        </div>
      )}

      {/* ── Camera Preview HUD ────────────────────────────────────────── */}
      {enabled && (
        <div
          style={{
            position: "fixed",
            top: 14,
            left: 14,
            zIndex: 999995,
            borderRadius: 14,
            overflow: "hidden",
            border: "2px solid rgba(99,102,241,0.65)",
            boxShadow: "0 6px 28px rgba(0,0,0,0.5)",
            width: 210,
            background: "#0a0a14",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: "100%",
              display: "block",
              transform: "scaleX(-1)",
              opacity: 0.9,
            }}
          />
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              transform: "scaleX(-1)",
            }}
          />

          <div
            style={{
              position: "absolute",
              top: 5,
              left: 6,
              right: 28,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                background: ready
                  ? "rgba(34,197,94,0.9)"
                  : "rgba(245,158,11,0.9)",
                color: "#fff",
                fontSize: 9,
                fontWeight: 800,
                padding: "2px 7px",
                borderRadius: 8,
              }}
            >
              {ready ? "AI TRACKING" : "CALIBRATING"}
            </span>
            {ready && (
              <span
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 9,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  fontWeight: 600,
                }}
              >
                <Wifi size={9} />
                {fps}fps
              </span>
            )}
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "rgba(0,0,0,0.75)",
              color: "#e0e7ff",
              fontSize: 10,
              padding: "5px 6px",
              textAlign: "center",
              lineHeight: 1.4,
              fontWeight: 600,
              backdropFilter: "blur(4px)",
            }}
          >
            {label}
          </div>

          <button
            onClick={toggle}
            style={{
              position: "absolute",
              top: 5,
              right: 5,
              background: "rgba(0,0,0,0.65)",
              border: "none",
              borderRadius: "50%",
              width: 22,
              height: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#fff",
            }}
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* ── Gesture Rules Panel ───────────────────────────────────────── */}
      {enabled && showGuide && (
        <div
          style={{
            position: "fixed",
            bottom: showKB ? 320 : 88,
            left: 16,
            width: 275,
            background: "rgba(10,10,22,0.97)",
            borderRadius: 16,
            border: "1px solid rgba(99,102,241,0.4)",
            padding: "14px 14px 12px",
            zIndex: 999993,
            backdropFilter: "blur(18px)",
            boxShadow: "0 10px 36px rgba(0,0,0,0.55)",
            transition: "bottom 0.3s",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <span
              style={{
                color: "#a5b4fc",
                fontWeight: 800,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Hand size={14} /> Gesture Quick Guide
            </span>
            <button
              onClick={() => setShowGuide(false)}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.4)",
                cursor: "pointer",
                padding: 2,
              }}
            >
              <X size={14} />
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {GESTURE_RULES.map((rule) => (
              <div
                key={rule.title}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 10,
                  border: `1px solid ${rule.color}45`,
                  padding: "8px 10px",
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    minWidth: 30,
                    height: 30,
                    borderRadius: 8,
                    background: `${rule.color}20`,
                    border: `1px solid ${rule.color}50`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {rule.emoji}
                </div>
                <div>
                  <div
                    style={{
                      color: rule.color,
                      fontSize: 11,
                      fontWeight: 700,
                      marginBottom: 2,
                    }}
                  >
                    {rule.title}
                  </div>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.55)",
                      fontSize: 10,
                      lineHeight: 1.5,
                    }}
                  >
                    {rule.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Virtual Keyboard ──────────────────────────────────────────── */}
      {enabled && showKB && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "rgba(10,10,20,0.97)",
            borderTop: "1.5px solid rgba(99,102,241,0.45)",
            padding: "10px 8px 18px",
            zIndex: 999994,
            backdropFilter: "blur(18px)",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.07)",
              borderRadius: 10,
              padding: "8px 14px",
              marginBottom: 8,
              fontSize: 15,
              color: "#e0e7ff",
              minHeight: 40,
              border: "1px solid rgba(99,102,241,0.4)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Keyboard size={14} style={{ opacity: 0.5, flexShrink: 0 }} />
            <span style={{ flex: 1, fontWeight: 500 }}>
              {kbText || (
                <span style={{ opacity: 0.4 }}>
                  Point at keys, hold steady to type...
                </span>
              )}
            </span>
            <button
              onClick={() => setShowKB(false)}
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                opacity: 0.6,
                cursor: "pointer",
              }}
            >
              <X size={15} />
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
            {[
              ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
              ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
              ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
              ["Z", "X", "C", "V", "B", "N", "M", "⌫"],
              ["SPACE", "CLEAR", "ENTER"],
            ].map((row, ri) => (
              <div
                key={ri}
                style={{ display: "flex", gap: 3.5, justifyContent: "center" }}
              >
                {row.map((key) => {
                  const hov = hovKey === key;
                  const wide =
                    key === "SPACE" || key === "ENTER" || key === "CLEAR";
                  return (
                    <div
                      key={key}
                      ref={(el) => {
                        if (el) kbRefs.current.set(key, el);
                        else kbRefs.current.delete(key);
                      }}
                      onClick={() => {
                        if (key === "⌫") setKbText((t) => t.slice(0, -1));
                        else if (key === "CLEAR") setKbText("");
                        else if (key === "SPACE") setKbText((t) => t + " ");
                        else if (key === "ENTER") setShowKB(false);
                        else setKbText((t) => t + key);
                      }}
                      style={{
                        minWidth: wide ? 84 : 30,
                        flex: wide ? 2 : 1,
                        maxWidth: wide ? 135 : 40,
                        height: 36,
                        borderRadius: 8,
                        border: hov
                          ? "2px solid #818cf8"
                          : "1px solid rgba(255,255,255,0.12)",
                        background: hov
                          ? "rgba(99,102,241,0.92)"
                          : "rgba(255,255,255,0.06)",
                        color: hov ? "#fff" : "#c7d2fe",
                        fontSize: 12,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.1s",
                        transform: hov ? "scale(1.08)" : "scale(1)",
                        userSelect: "none",
                        boxShadow: hov
                          ? "0 0 12px rgba(99,102,241,0.5)"
                          : "none",
                      }}
                    >
                      {key}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FAB + Info button (Fixed Bottom-Left) ───────────────────── */}
      <div
        style={{
          position: "fixed",
          bottom: showKB ? 310 : 24,
          left: 24,
          zIndex: 999994,
          display: "flex",
          gap: 8,
          alignItems: "flex-end",
          transition: "bottom 0.3s",
        }}
      >
        <button
          onClick={toggle}
          title={enabled ? "Disable gesture control" : "Enable gesture control"}
          style={{
            width: 54,
            height: 54,
            borderRadius: "50%",
            border: "none",
            background: enabled
              ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
              : "linear-gradient(135deg,#1d4ed8,#2563eb)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: enabled
              ? "0 6px 26px rgba(99,102,241,0.65)"
              : "0 4px 18px rgba(37,99,235,0.5)",
            transition: "all 0.2s",
            position: "relative",
          }}
        >
          <Hand size={23} />
          {enabled && (
            <span
              style={{
                position: "absolute",
                top: -2,
                right: -2,
                width: 13,
                height: 13,
                borderRadius: "50%",
                background: ready ? "#22c55e" : "#f59e0b",
                border: "2px solid #fff",
                boxShadow: ready ? "0 0 8px #22c55e" : "none",
              }}
            />
          )}
        </button>

        {enabled && (
          <button
            onClick={() => setShowGuide((v) => !v)}
            title="Gesture guide"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              cursor: "pointer",
              background: showGuide
                ? "rgba(99,102,241,0.95)"
                : "rgba(20,20,40,0.92)",
              border: `1px solid ${showGuide ? "#6366f1" : "rgba(99,102,241,0.45)"
                }`,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 12px rgba(0,0,0,0.45)",
              transition: "all 0.2s",
            }}
          >
            <Info size={16} />
          </button>
        )}
      </div>
    </>
  );
};

export default HandGestureController;
