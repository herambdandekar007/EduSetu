/**
 * HandGestureController — DivyangConnect
 *
 * High-Accuracy Hand Gesture Engine with:
 * - Rotation-invariant finger extension analysis (distance + joint-angle fusion)
 * - One-Euro adaptive filter for the cursor (kills jitter at rest, kills lag when fast)
 * - Gesture debouncing (majority vote over a short frame history) to stop flicker
 * - Calibrated active bounding box for full screen reachability
 * - Palm-centroid smoothed 4-direction scrolling (up / down / left / right) with axis lock
 * - Multi-frame velocity swipe detection (Back / Forward)
 * - Point-and-Dwell auto-clicking with target lock
 * - Auto-opening virtual keyboard the moment you point at (or dwell-click) any
 *   search box / text field / textarea / contenteditable element, with live
 *   two-way sync to the real DOM input so search-as-you-type & submit work.
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
  ChevronLeft,
  ChevronRight,
  Wifi,
  Info,
  Play,
  CheckCircle,
  Sparkles,
  Settings,
  Pause,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface Landmark {
  x: number;
  y: number;
  z: number;
}

type ScrollDir = "up" | "down" | "left" | "right" | null;
type Gesture = "victory" | "open" | "point" | "fist" | "none";
type SpeedLevel = "slow" | "medium" | "fast";
type DwellLevel = "patient" | "normal" | "quick";
type TremorLevel = "high" | "medium" | "low";

// ── Constants & Calibration ─────────────────────────────────────────────────
// Everything below defaults to the gentlest, most forgiving setting. This is
// built for people with limited fine-motor control / hand tremor: the cursor
// moves calmly instead of snapping to every micro-twitch, targets stay locked
// in even if the hand shakes a little, and nothing fires until the person has
// clearly held their intent for a while. All of this is adjustable live from
// the in-app Accessibility Settings panel (gear icon).
const SCROLL_SENS = 750;
const SCROLL_DEADZONE = 0.008; // normalized palm delta threshold
const MIN_PALM_SIZE = 0.02;
const GESTURE_CONFIRM = 5; // consecutive confirmed frames before a toggle gesture fires
const SWIPE_VELOCITY_THRESH = 0.065; // normalized units/frame — requires a deliberate flick
const SWIPE_CD = 46;
const AXIS_SWITCH_RATIO = 1.4; // how much one axis must dominate to lock scroll direction
const AXIS_RELEASE_FRAMES = 8; // frames of near-stillness before axis lock releases

// Adjustable-via-settings tables — see the Accessibility Settings panel.
const CURSOR_SPEED_PARAMS: Record<SpeedLevel, { minCutoff: number; beta: number }> = {
  slow: { minCutoff: 0.45, beta: 0.08 }, // heavy smoothing — best for tremor, default
  medium: { minCutoff: 0.9, beta: 0.3 },
  fast: { minCutoff: 1.5, beta: 0.6 },
};
const SCROLL_GAIN: Record<SpeedLevel, number> = { slow: 0.5, medium: 0.8, fast: 1.15 };
const DWELL_TIME_FRAMES: Record<DwellLevel, number> = {
  patient: 50, // ~1.65s — default, gives plenty of time to settle before a click fires
  normal: 32, // ~1.05s
  quick: 20, // ~0.65s
};
const TREMOR_RADIUS: Record<TremorLevel, number> = {
  high: 58, // px — default, forgives a shaky hand without losing the target
  medium: 44,
  low: 30,
};

// Active tracking box margins for 100% monitor reachability
const MARGIN_X = 0.12;
const MARGIN_Y = 0.12;

// Reliable tracking distance band (normalized palm size). Outside this band the
// landmark estimate is noisy (hand too close / too far / partially out of frame).
const PALM_SIZE_MIN = 0.045;
const PALM_SIZE_MAX = 0.55;

// ── Tutorial video URL ─────────────────────────────────────────────────────
const TUTORIAL_VIDEO_URL = "YOUR_VIDEO_URL_HERE";

// ── Gesture guide data ─────────────────────────────────────────────────────
const GESTURE_RULES = [
  {
    emoji: "🖐",
    title: "4-Way Smooth Scroll",
    desc: "Open ALL 4 fingers wide. Move hand UP / DOWN / LEFT / RIGHT to scroll that direction.",
    color: "#6366f1",
  },
  {
    emoji: "☝",
    title: "Point & Click (Dwell)",
    desc: "Extend only your INDEX finger. Move cursor over any element. Hold still ~1s to auto-click.",
    color: "#22c55e",
  },
  {
    emoji: "🔎",
    title: "Auto Search Keyboard",
    desc: "Point at any search box or text field — the keyboard opens automatically so you can type right away.",
    color: "#0ea5e9",
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
  {
    emoji: "✊",
    title: "Pause / Clutch",
    desc: "Make a closed FIST anytime to freeze the cursor — reposition your hand safely, then open it again to resume, just like lifting a mouse.",
    color: "#64748b",
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

/** Angle (degrees) at vertex `b` formed by rays b→a and b→c. ~180° = straight, small = bent. */
const angleDeg = (a: Landmark, b: Landmark, c: Landmark) => {
  const v1x = a.x - b.x,
    v1y = a.y - b.y;
  const v2x = c.x - b.x,
    v2y = c.y - b.y;
  const m1 = Math.hypot(v1x, v1y) || 1e-6;
  const m2 = Math.hypot(v2x, v2y) || 1e-6;
  const cos = clamp((v1x * v2x + v1y * v2y) / (m1 * m2), -1, 1);
  return (Math.acos(cos) * 180) / Math.PI;
};

/**
 * One-Euro Filter — adaptively smooths a noisy signal:
 * low speed → heavy smoothing (kills tremor), high speed → light smoothing (kills lag).
 * This replaces hand-tuned alpha thresholds with a principled, well-known filter,
 * giving noticeably steadier dwell-clicks and snappier fast movement.
 */
class OneEuroFilter {
  private freq: number;
  private minCutoff: number;
  private beta: number;
  private dCutoff: number;
  private xPrev: number | null = null;
  private dxPrev = 0;
  private tPrev: number | null = null;

  constructor(freq = 30, minCutoff = 1.0, beta = 0.02, dCutoff = 1.0) {
    this.freq = freq;
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
  }

  private alpha(cutoff: number) {
    const te = 1 / this.freq;
    const tau = 1 / (2 * Math.PI * cutoff);
    return 1 / (1 + tau / te);
  }

  setParams(minCutoff: number, beta: number) {
    this.minCutoff = minCutoff;
    this.beta = beta;
  }

  filter(x: number, tMs: number) {
    if (this.tPrev !== null) {
      const dt = (tMs - this.tPrev) / 1000;
      if (dt > 0) this.freq = 1 / Math.max(dt, 1 / 120);
    }
    this.tPrev = tMs;

    if (this.xPrev === null) {
      this.xPrev = x;
      this.dxPrev = 0;
      return x;
    }

    const dx = (x - this.xPrev) * this.freq;
    const aD = this.alpha(this.dCutoff);
    const dxHat = aD * dx + (1 - aD) * this.dxPrev;

    const cutoff = this.minCutoff + this.beta * Math.abs(dxHat);
    const a = this.alpha(cutoff);
    const xHat = a * x + (1 - a) * this.xPrev;

    this.xPrev = xHat;
    this.dxPrev = dxHat;
    return xHat;
  }

  reset() {
    this.xPrev = null;
    this.dxPrev = 0;
    this.tPrev = null;
  }
}

/** True for any element that accepts typed text — inputs, textareas, contenteditable, search/combobox roles. */
function isTextEntryElement(
  el: Element | null
): el is HTMLInputElement | HTMLTextAreaElement | HTMLElement {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "TEXTAREA") return true;
  if (tag === "INPUT") {
    const type = (el as HTMLInputElement).type;
    return ["text", "search", "email", "tel", "url", "number", "password", ""].includes(
      type
    );
  }
  if ((el as HTMLElement).isContentEditable) return true;
  const role = el.getAttribute("role");
  if (role === "searchbox" || role === "combobox" || role === "textbox") return true;
  return false;
}

/** Finds the nearest ancestor (or self) that is a real text-entry element, or null. */
function nearestTextEntry(el: Element | null): HTMLElement | null {
  if (!el) return null;
  const match = el.closest(
    "input, textarea, [contenteditable='true'], [role='searchbox'], [role='combobox'], [role='textbox']"
  ) as HTMLElement | null;
  return match && isTextEntryElement(match) ? match : null;
}

/**
 * Robust rotation-invariant finger analysis.
 * Extension = (tip clearly farther from wrist than PIP) AND (PIP joint angle is near-straight).
 * Fusing distance + joint angle makes this far more resistant to hand tilt/rotation
 * and to partially-curled "fake extensions" than distance alone.
 */
function analyzeHighAccuracy(lm: Landmark[]) {
  const wrist = lm[0];
  const th = lm[4];
  const t8 = lm[8]; // Index tip
  const t12 = lm[12]; // Middle tip
  const t16 = lm[16]; // Ring tip
  const t20 = lm[20]; // Pinky tip

  const mcp5 = lm[5]; // Index MCP
  const mcp9 = lm[9]; // Middle MCP (Palm Center)
  const mcp13 = lm[13]; // Ring MCP
  const mcp17 = lm[17]; // Pinky MCP

  const pip6 = lm[6];
  const pip10 = lm[10];
  const pip14 = lm[14];
  const pip18 = lm[18];

  const palmSize = dist2D(wrist, mcp9);
  const safePalmSize = Math.max(MIN_PALM_SIZE, palmSize);

  const iStraight = angleDeg(mcp5, pip6, t8) > 150;
  const mStraight = angleDeg(mcp9, pip10, t12) > 150;
  const rStraight = angleDeg(mcp13, pip14, t16) > 150;
  const pStraight = angleDeg(mcp17, pip18, t20) > 150;

  const iExt =
    iStraight &&
    dist2D(wrist, t8) > dist2D(wrist, pip6) * 1.15 &&
    dist2D(mcp5, t8) > dist2D(mcp5, pip6) * 1.25;
  const mExt =
    mStraight &&
    dist2D(wrist, t12) > dist2D(wrist, pip10) * 1.15 &&
    dist2D(mcp9, t12) > dist2D(mcp9, pip10) * 1.25;
  const rExt =
    rStraight &&
    dist2D(wrist, t16) > dist2D(wrist, pip14) * 1.15 &&
    dist2D(mcp13, t16) > dist2D(mcp13, pip14) * 1.25;
  const pExt =
    pStraight &&
    dist2D(wrist, t20) > dist2D(wrist, pip18) * 1.15 &&
    dist2D(mcp17, t20) > dist2D(mcp17, pip18) * 1.25;

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

  // Fist: nothing extended — used as a deliberate "clutch" to pause the cursor
  const isFist = extCount === 0;

  return {
    isPinch,
    isPoint,
    isVictory,
    isOpen,
    isFist,
    extCount,
    t8,
    th,
    wrist,
    mcp9, // Palm center for ultra-smooth scrolling
    safePalmSize,
    rawPalmSize: palmSize,
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
                  Point with index finger to move cursor & dwell over buttons to
                  auto-click. Point at a search box to open the keyboard
                  automatically. Open hand to scroll in any direction.
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
            Position your hand <strong>30–60 cm</strong> from the camera in good
            lighting. Move naturally across the frame to reach all screen edges.
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
//  Accessibility Settings Panel
// ══════════════════════════════════════════════════════════════════════════
interface SettingsPanelProps {
  cursorSpeed: SpeedLevel;
  setCursorSpeed: (v: SpeedLevel) => void;
  dwellTime: DwellLevel;
  setDwellTime: (v: DwellLevel) => void;
  tremorTolerance: TremorLevel;
  setTremorTolerance: (v: TremorLevel) => void;
  onClose: () => void;
  bottomOffset: number;
}

function SettingsRow<T extends string>({
  label,
  hint,
  value,
  options,
  onChange,
}: {
  label: string;
  hint: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ color: "#e0e7ff", fontSize: 12, fontWeight: 700, marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10.5, marginBottom: 8, lineHeight: 1.4 }}>
        {hint}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              style={{
                flex: 1,
                padding: "8px 6px",
                borderRadius: 9,
                border: active ? "1.5px solid #818cf8" : "1px solid rgba(255,255,255,0.15)",
                background: active ? "rgba(99,102,241,0.35)" : "rgba(255,255,255,0.05)",
                color: active ? "#fff" : "rgba(255,255,255,0.6)",
                fontSize: 11.5,
                fontWeight: active ? 800 : 600,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SettingsPanel({
  cursorSpeed,
  setCursorSpeed,
  dwellTime,
  setDwellTime,
  tremorTolerance,
  setTremorTolerance,
  onClose,
  bottomOffset,
}: SettingsPanelProps) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: bottomOffset,
        left: 16,
        width: 280,
        background: "rgba(10,10,22,0.97)",
        borderRadius: 16,
        border: "1px solid rgba(99,102,241,0.4)",
        padding: "14px 14px 6px",
        zIndex: 999993,
        backdropFilter: "blur(18px)",
        boxShadow: "0 10px 36px rgba(0,0,0,0.55)",
        transition: "bottom 0.3s",
        maxHeight: "72vh",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 4,
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
          <Settings size={14} /> Accessibility Settings
        </span>
        <button
          onClick={onClose}
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
      <div
        style={{
          fontSize: 10.5,
          color: "rgba(255,255,255,0.45)",
          marginBottom: 12,
          lineHeight: 1.5,
        }}
      >
        Defaults are already tuned for limited hand control. Adjust anytime — changes apply instantly.
      </div>

      <SettingsRow<SpeedLevel>
        label="🐢 Cursor & Scroll Speed"
        hint="How closely the cursor follows your finger. Slow = calmest, ignores small shakes."
        value={cursorSpeed}
        onChange={setCursorSpeed}
        options={[
          { value: "slow", label: "Slow" },
          { value: "medium", label: "Medium" },
          { value: "fast", label: "Fast" },
        ]}
      />
      <SettingsRow<DwellLevel>
        label="⏳ Hold Time to Click"
        hint="How long you must hold still before a click or key-press fires."
        value={dwellTime}
        onChange={setDwellTime}
        options={[
          { value: "patient", label: "Patient" },
          { value: "normal", label: "Normal" },
          { value: "quick", label: "Quick" },
        ]}
      />
      <SettingsRow<TremorLevel>
        label="🎯 Tremor Tolerance"
        hint="How far your hand can shake before a hold resets. High = most forgiving."
        value={tremorTolerance}
        onChange={setTremorTolerance}
        options={[
          { value: "high", label: "High" },
          { value: "medium", label: "Medium" },
          { value: "low", label: "Low" },
        ]}
      />
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
  const [scrollDir, setScrollDir] = useState<ScrollDir>(null);
  const [cur, setCur] = useState({ x: -200, y: -200 });
  const [dwellPct, setDwellPct] = useState(0);
  const [hovKey, setHovKey] = useState<string | null>(null);
  const [fps, setFps] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [paused, setPaused] = useState(false);

  // ── Accessibility settings — default to the gentlest, most forgiving values ──
  const [cursorSpeed, setCursorSpeed] = useState<SpeedLevel>("slow");
  const [dwellTime, setDwellTime] = useState<DwellLevel>("patient");
  const [tremorTolerance, setTremorTolerance] = useState<TremorLevel>("high");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const handsRef = useRef<any>(null);
  const camRef = useRef<any>(null);

  // One-Euro filtered cursor coordinates (normalized 0–1)
  const sX = useRef(0.5);
  const sY = useRef(0.5);
  const oneEuroXRef = useRef(new OneEuroFilter(30, 0.9, 0.35, 1.0));
  const oneEuroYRef = useRef(new OneEuroFilter(30, 0.9, 0.35, 1.0));

  // Gesture debouncing (majority vote over last few frames)
  const gestureHistRef = useRef<Gesture[]>([]);

  // Dwell-click state
  const dwellAnchorX = useRef(-999);
  const dwellAnchorY = useRef(-999);
  const dwellCount = useRef(0);
  const dwellFired = useRef(false);

  // Scroll tracking (both axes, with axis-lock to avoid diagonal jitter)
  const prevPalmY = useRef<number | null>(null);
  const prevPalmX = useRef<number | null>(null);
  const scrollAccY = useRef(0);
  const scrollAccX = useRef(0);
  const scrollAxisLock = useRef<"v" | "h" | null>(null);
  const axisIdleFrames = useRef(0);

  // Swipe velocity buffer
  const wristHistory = useRef<{ x: number; time: number }[]>([]);
  const swipeCD = useRef(0);

  // Auto-keyboard: which real DOM field we're currently typing into
  const activeInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLElement | null>(
    null
  );
  const searchHoverCount = useRef(0);

  const kbRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const showKBRef = useRef(false);
  const kbTextRef = useRef("");
  const victoryCnt = useRef(0);
  const fpsFrames = useRef(0);
  const fpsTimer = useRef(0);

  // Live-tunable values read every frame inside onFrame (kept in a ref so
  // changing a setting takes effect instantly, without restarting the camera).
  const settingsRef = useRef({
    dwellFrames: DWELL_TIME_FRAMES.patient,
    dwellRadius: TREMOR_RADIUS.high,
    searchHoverFrames: Math.round(DWELL_TIME_FRAMES.patient * 0.55),
    scrollGain: SCROLL_GAIN.slow,
  });

  useEffect(() => {
    showKBRef.current = showKB;
  }, [showKB]);
  useEffect(() => {
    kbTextRef.current = kbText;
  }, [kbText]);

  useEffect(() => {
    const dwellFrames = DWELL_TIME_FRAMES[dwellTime];
    settingsRef.current = {
      dwellFrames,
      dwellRadius: TREMOR_RADIUS[tremorTolerance],
      searchHoverFrames: Math.max(10, Math.round(dwellFrames * 0.55)),
      scrollGain: SCROLL_GAIN[cursorSpeed],
    };
    const p = CURSOR_SPEED_PARAMS[cursorSpeed];
    oneEuroXRef.current.setParams(p.minCutoff, p.beta);
    oneEuroYRef.current.setParams(p.minCutoff, p.beta);
  }, [cursorSpeed, dwellTime, tremorTolerance]);

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

  // ── Sync typed text into the real DOM field (search-as-you-type, etc.) ──
  const syncActiveInput = useCallback((text: string) => {
    const el = activeInputRef.current;
    if (!el || !document.contains(el)) return;
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      const proto =
        el instanceof HTMLTextAreaElement
          ? window.HTMLTextAreaElement.prototype
          : window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
      if (setter) setter.call(el, text);
      else el.value = text;
      el.dispatchEvent(new Event("input", { bubbles: true }));
    } else if ((el as HTMLElement).isContentEditable) {
      el.textContent = text;
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }, []);

  // ── Open the auto-keyboard bound to a specific real text field ─────────
  const openKeyboardFor = useCallback(
    (el: HTMLElement, label_: string) => {
      el.focus();
      activeInputRef.current = el;
      const initial =
        el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
          ? el.value
          : el.textContent || "";
      setKbText(initial);
      setShowKB(true);
      setLabel(label_);
      dwellCount.current = 0;
      dwellFired.current = false;
      setDwellPct(0);
    },
    []
  );

  // ── Fire Click ───────────────────────────────────────────────────────────
  const fireClick = useCallback(
    (cx: number, cy: number) => {
      const dot = document.getElementById("hgc-cursor");
      if (dot) dot.style.display = "none";
      const el = document.elementFromPoint(cx, cy) as HTMLElement | null;
      if (dot) dot.style.display = "block";
      if (!el) return;

      // If this is (or is inside) a text-entry field, auto-open the keyboard
      // instead of just firing a click — this is what makes typing "just work".
      const entryEl = nearestTextEntry(el);
      if (entryEl) {
        openKeyboardFor(entryEl, "🔎 Search field selected — keyboard opened");
        ripple(cx, cy);
        return;
      }

      const target = (el.closest("a") ||
        el.closest("button") ||
        el.closest("[role='button']") ||
        el.closest("[role='link']") ||
        el.closest("select") ||
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

      ripple(cx, cy);
      setLabel("✅ Clicked!");
    },
    [ripple, openKeyboardFor]
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

      // Reject unreliable frames (hand too close / far / clipped) instead of
      // acting on noisy landmarks — a big source of "inaccuracy" in practice.
      if (g.rawPalmSize < PALM_SIZE_MIN || g.rawPalmSize > PALM_SIZE_MAX) {
        setLabel("Move your hand to a clear distance from the camera");
        return;
      }

      if (swipeCD.current > 0) swipeCD.current--;

      // ── Debounced gesture classification (majority vote, last 4 frames) ──
      // Classified BEFORE the cursor is touched, so a fist can freeze
      // everything — including cursor movement — without any lag.
      let rawGesture: Gesture = "none";
      if (g.isVictory) rawGesture = "victory";
      else if (g.isOpen) rawGesture = "open";
      else if (g.isPoint) rawGesture = "point";
      else if (g.isFist) rawGesture = "fist";

      gestureHistRef.current.push(rawGesture);
      if (gestureHistRef.current.length > 4) gestureHistRef.current.shift();
      const counts: Partial<Record<Gesture, number>> = {};
      gestureHistRef.current.forEach((x) => (counts[x] = (counts[x] || 0) + 1));
      let gesture: Gesture = rawGesture;
      let bestCount = 0;
      (Object.entries(counts) as [Gesture, number][]).forEach(([k, v]) => {
        if (v > bestCount) {
          bestCount = v;
          gesture = k;
        }
      });

      // ── 0. FIST = CLUTCH / PAUSE — freeze the cursor exactly where it is,
      // like lifting a mouse off the mat. Lets someone reposition their hand,
      // rest, or steady themselves without the cursor drifting or misfiring.
      // Any in-progress dwell is paused (not lost) so they can resume it.
      if (gesture === "fist") {
        setPaused(true);
        setLabel("✊ Paused — open your hand or point to resume");
        prevPalmY.current = null;
        prevPalmX.current = null;
        scrollAxisLock.current = null;
        setScrollDir(null);
        wristHistory.current = [];
        searchHoverCount.current = 0;
        return;
      }
      setPaused(false);

      // Calibrate active zone to guarantee 100% monitor reachability
      const normRawX = clamp((1 - g.t8.x - MARGIN_X) / (1 - 2 * MARGIN_X), 0, 1);
      const normRawY = clamp((g.t8.y - MARGIN_Y) / (1 - 2 * MARGIN_Y), 0, 1);

      // One-Euro filter: smooth at rest, snappy while moving fast. Tuned by
      // the Cursor Speed setting (default: Slow, heaviest smoothing).
      sX.current = oneEuroXRef.current.filter(normRawX, now);
      sY.current = oneEuroYRef.current.filter(normRawY, now);

      const cx = sX.current * window.innerWidth;
      const cy = sY.current * window.innerHeight;
      setCur({ x: cx, y: cy });

      // ── 1. VICTORY SIGN (Index + Middle extended) -> Toggle Keyboard
      if (gesture === "victory") {
        victoryCnt.current++;
        if (victoryCnt.current >= GESTURE_CONFIRM && swipeCD.current <= 0) {
          const turningOn = !showKBRef.current;
          setShowKB(turningOn);
          if (!turningOn) activeInputRef.current = null;
          swipeCD.current = 35;
          setLabel(turningOn ? "✌ Keyboard opened" : "✌ Keyboard closed");
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
          if (dist > settingsRef.current.dwellRadius) {
            dwellAnchorX.current = cx;
            dwellAnchorY.current = cy;
            dwellCount.current = 0;
            dwellFired.current = false;
            setDwellPct(0);
          } else {
            dwellCount.current++;
            setDwellPct(Math.min(dwellCount.current / settingsRef.current.dwellFrames, 1) * 100);
            if (dwellCount.current >= settingsRef.current.dwellFrames && !dwellFired.current) {
              dwellFired.current = true;

              if (foundKey === "⌫") {
                const nt = kbTextRef.current.slice(0, -1);
                setKbText(nt);
                syncActiveInput(nt);
              } else if (foundKey === "CLEAR") {
                setKbText("");
                syncActiveInput("");
              } else if (foundKey === "SPACE") {
                const nt = kbTextRef.current + " ";
                setKbText(nt);
                syncActiveInput(nt);
              } else if (foundKey === "ENTER") {
                let inp: HTMLElement | null = activeInputRef.current;
                if (!inp || !document.contains(inp)) {
                  const active = document.activeElement as HTMLElement | null;
                  inp =
                    active && ["INPUT", "TEXTAREA"].includes(active.tagName)
                      ? active
                      : document.querySelector<HTMLInputElement>(
                        "input[type='text'],input[type='search'],input[type='email'],input[type='password'],input:not([type])"
                      );
                }
                if (inp) {
                  inp.focus();
                  activeInputRef.current = inp;
                  syncActiveInput(kbTextRef.current);
                  inp.dispatchEvent(
                    new KeyboardEvent("keydown", { key: "Enter", code: "Enter", bubbles: true })
                  );
                  inp.dispatchEvent(
                    new KeyboardEvent("keyup", { key: "Enter", code: "Enter", bubbles: true })
                  );
                  const form = inp.closest("form");
                  if (form) {
                    const f = form as HTMLFormElement;
                    if (typeof f.requestSubmit === "function") f.requestSubmit();
                    else f.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
                  }
                }
                setShowKB(false);
                setKbText("");
                activeInputRef.current = null;
              } else {
                const nt = kbTextRef.current + foundKey!;
                setKbText(nt);
                syncActiveInput(nt);
              }
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

      // ── 3. OPEN HAND -> PALM CENTROID SMOOTH 4-DIRECTION SCROLLING
      if (gesture === "open") {
        dwellCount.current = 0;
        dwellFired.current = false;
        setDwellPct(0);

        if (prevPalmY.current !== null && prevPalmX.current !== null) {
          const dy = (g.mcp9.y - prevPalmY.current) * SCROLL_SENS * settingsRef.current.scrollGain;
          const dx = (g.mcp9.x - prevPalmX.current) * SCROLL_SENS * settingsRef.current.scrollGain;
          const absDy = Math.abs(dy);
          const absDx = Math.abs(dx);

          // Axis lock with hysteresis: pick whichever axis dominates, and hold
          // that axis until movement settles — prevents diagonal drift from
          // causing the scroll to flicker between vertical and horizontal.
          if (scrollAxisLock.current === null) {
            if (absDy > absDx * AXIS_SWITCH_RATIO && absDy > 1) scrollAxisLock.current = "v";
            else if (absDx > absDy * AXIS_SWITCH_RATIO && absDx > 1) scrollAxisLock.current = "h";
          }
          if (absDy < 0.4 && absDx < 0.4) {
            axisIdleFrames.current++;
            if (axisIdleFrames.current > AXIS_RELEASE_FRAMES) scrollAxisLock.current = null;
          } else {
            axisIdleFrames.current = 0;
          }

          if (scrollAxisLock.current === "v") {
            scrollAccY.current += dy;
            if (Math.abs(scrollAccY.current) > SCROLL_DEADZONE * SCROLL_SENS) {
              window.scrollBy({ top: scrollAccY.current, behavior: "auto" });
              setScrollDir(scrollAccY.current > 0 ? "down" : "up");
              scrollAccY.current = 0;
            }
            setLabel(
              dy < -1.2 ? "↑ Scrolling UP" : dy > 1.2 ? "↓ Scrolling DOWN" : "🖐 Open hand — move to scroll"
            );
          } else if (scrollAxisLock.current === "h") {
            scrollAccX.current += dx;
            if (Math.abs(scrollAccX.current) > SCROLL_DEADZONE * SCROLL_SENS) {
              window.scrollBy({ left: scrollAccX.current, behavior: "auto" });
              setScrollDir(scrollAccX.current > 0 ? "right" : "left");
              scrollAccX.current = 0;
            }
            setLabel(
              dx < -1.2 ? "← Scrolling LEFT" : dx > 1.2 ? "→ Scrolling RIGHT" : "🖐 Open hand — move to scroll"
            );
          } else {
            setScrollDir(null);
            setLabel("🖐 Open hand — move up/down/left/right to scroll");
          }
        }
        prevPalmY.current = g.mcp9.y;
        prevPalmX.current = g.mcp9.x;
        wristHistory.current = [];
        return;
      }
      prevPalmY.current = null;
      prevPalmX.current = null;
      scrollAxisLock.current = null;
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

      // ── 5. POINT & DWELL AUTO-CLICK (with auto-keyboard fast-path for text fields)
      if (gesture === "point") {
        // Fast-path: pointing at a search box / text field opens the keyboard
        // almost immediately, rather than waiting for a full 1s dwell-click.
        const dot = document.getElementById("hgc-cursor");
        if (dot) dot.style.display = "none";
        const elUnder = document.elementFromPoint(cx, cy) as HTMLElement | null;
        if (dot) dot.style.display = "block";

        const entryEl = nearestTextEntry(elUnder);
        if (entryEl && activeInputRef.current !== entryEl) {
          searchHoverCount.current++;
          if (searchHoverCount.current > settingsRef.current.searchHoverFrames) {
            openKeyboardFor(entryEl, "🔎 Search field detected — keyboard opened");
            searchHoverCount.current = 0;
            return;
          }
          setLabel("🔎 Search field — hold steady to open keyboard");
        } else {
          searchHoverCount.current = 0;
        }

        const distFromAnchor = pxDist(cx, cy, dwellAnchorX.current, dwellAnchorY.current);

        if (distFromAnchor > settingsRef.current.dwellRadius) {
          // Reset anchor when finger moves to a new target
          dwellAnchorX.current = cx;
          dwellAnchorY.current = cy;
          dwellCount.current = 0;
          dwellFired.current = false;
          setDwellPct(0);
          if (!entryEl) setLabel("☝ Pointing — hold steady to auto-click");
        } else {
          // Inside dwell zone: accumulate dwell frames smoothly
          dwellCount.current++;
          const dwellFrames = settingsRef.current.dwellFrames;
          const pct = Math.min(dwellCount.current / dwellFrames, 1) * 100;
          setDwellPct(pct);

          if (dwellCount.current >= dwellFrames && !dwellFired.current) {
            dwellFired.current = true;
            fireClick(dwellAnchorX.current, dwellAnchorY.current);
            setDwellPct(100);
          } else if (!dwellFired.current && !entryEl) {
            const remaining = Math.ceil(((dwellFrames - dwellCount.current) / 30) * 10) / 10;
            setLabel(
              dwellCount.current > dwellFrames * 0.5
                ? "🎯 Clicking target..."
                : `☝ Hold still (${remaining}s)`
            );
          } else if (dwellFired.current) {
            setLabel("✅ Clicked! Move to next element");
          }
        }
        return;
      }

      dwellCount.current = 0;
      dwellFired.current = false;
      setDwellPct(0);
      searchHoverCount.current = 0;
      setLabel("Show your hand to the camera");
    },
    [fireClick, ripple, openKeyboardFor, syncActiveInput]
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
          prevPalmX.current = null;
          scrollAxisLock.current = null;
          victoryCnt.current = 0;
          dwellCount.current = 0;
          dwellFired.current = false;
          searchHoverCount.current = 0;
          gestureHistRef.current = [];
          oneEuroXRef.current.reset();
          oneEuroYRef.current.reset();
          setPaused(false);
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
    activeInputRef.current = null;
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
  const RING_R = 30;
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

      {/* ── Cursor dot (One-Euro filtered; greys out + shows pause while frozen) ── */}
      <div
        id="hgc-cursor"
        style={{
          position: "fixed",
          left: cur.x,
          top: cur.y,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: paused ? "rgba(100,116,139,0.9)" : "rgba(99,102,241,0.95)",
          border: paused ? "2.5px solid #cbd5e1" : "2.5px solid #a5b4fc",
          transform: "translate(-50%,-50%)",
          pointerEvents: "none",
          zIndex: 999998,
          boxShadow: paused ? "0 0 10px rgba(100,116,139,0.5)" : "0 0 14px rgba(99,102,241,0.55)",
          display: enabled && cur.x > 0 ? "flex" : "none",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.15s, border-color 0.15s",
        }}
      >
        {paused && <Pause size={11} color="#fff" fill="#fff" />}
      </div>

      {/* ── Paused chip ──────────────────────────────────────────────── */}
      {enabled && paused && (
        <div
          style={{
            position: "fixed",
            top: 14,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(51,65,85,0.95)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            padding: "8px 16px",
            borderRadius: 20,
            zIndex: 999996,
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
          }}
        >
          <Pause size={13} /> Paused — open your hand to resume
        </div>
      )}

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
            right: scrollDir === "left" || scrollDir === "right" ? undefined : 18,
            left: scrollDir === "left" ? 18 : undefined,
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
          {scrollDir === "up" && <ChevronUp size={18} />}
          {scrollDir === "down" && <ChevronDown size={18} />}
          {scrollDir === "left" && <ChevronLeft size={18} />}
          {scrollDir === "right" && <ChevronRight size={18} />}
          {scrollDir === "up" && "UP"}
          {scrollDir === "down" && "DN"}
          {scrollDir === "left" && "LFT"}
          {scrollDir === "right" && "RGT"}
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
            maxHeight: "70vh",
            overflowY: "auto",
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
              border: activeInputRef.current
                ? "1px solid rgba(34,197,94,0.6)"
                : "1px solid rgba(99,102,241,0.4)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Keyboard size={14} style={{ opacity: 0.5, flexShrink: 0 }} />
            <span style={{ flex: 1, fontWeight: 500 }}>
              {kbText || (
                <span style={{ opacity: 0.4 }}>
                  {activeInputRef.current
                    ? "Point at keys, hold steady to type — synced live..."
                    : "Point at keys, hold steady to type..."}
                </span>
              )}
            </span>
            <button
              onClick={() => {
                setShowKB(false);
                activeInputRef.current = null;
              }}
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
                        if (key === "⌫") {
                          const nt = kbText.slice(0, -1);
                          setKbText(nt);
                          syncActiveInput(nt);
                        } else if (key === "CLEAR") {
                          setKbText("");
                          syncActiveInput("");
                        } else if (key === "SPACE") {
                          const nt = kbText + " ";
                          setKbText(nt);
                          syncActiveInput(nt);
                        } else if (key === "ENTER") {
                          setShowKB(false);
                          activeInputRef.current = null;
                        } else {
                          const nt = kbText + key;
                          setKbText(nt);
                          syncActiveInput(nt);
                        }
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

        {enabled && (
          <button
            onClick={() => setShowSettings((v) => !v)}
            title="Accessibility settings"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              cursor: "pointer",
              background: showSettings
                ? "rgba(99,102,241,0.95)"
                : "rgba(20,20,40,0.92)",
              border: `1px solid ${showSettings ? "#6366f1" : "rgba(99,102,241,0.45)"
                }`,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 12px rgba(0,0,0,0.45)",
              transition: "all 0.2s",
            }}
          >
            <Settings size={16} />
          </button>
        )}
      </div>

      {/* ── Accessibility Settings Panel ─────────────────────────────── */}
      {enabled && showSettings && (
        <SettingsPanel
          cursorSpeed={cursorSpeed}
          setCursorSpeed={setCursorSpeed}
          dwellTime={dwellTime}
          setDwellTime={setDwellTime}
          tremorTolerance={tremorTolerance}
          setTremorTolerance={setTremorTolerance}
          onClose={() => setShowSettings(false)}
          bottomOffset={showKB ? 320 : 88}
        />
      )}
    </>
  );
};

export default HandGestureController;