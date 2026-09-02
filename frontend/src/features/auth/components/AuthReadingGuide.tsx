// frontend/src/features/auth/components/AuthReadingGuide.tsx
// Accessible Reading Guide Focus Line / Ruler for Dyslexia, ADHD & Low-Vision readers

import React, { useEffect, useState } from "react";
import { useAccessibility } from "@/contexts/AccessibilityContext";

export const AuthReadingGuide: React.FC = () => {
  const { settings } = useAccessibility();
  const [mouseY, setMouseY] = useState(300);

  useEffect(() => {
    if (!settings.readingGuide) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [settings.readingGuide]);

  if (!settings.readingGuide) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {/* Top Dimming Screen */}
      <div
        className="absolute inset-x-0 top-0 bg-black/40 transition-all duration-75"
        style={{ height: Math.max(0, mouseY - 45) }}
      />

      {/* Focus Reading Window */}
      <div
        className="absolute inset-x-0 border-y-2 border-indigo-400/80 bg-indigo-500/10 backdrop-blur-[0.5px] transition-all duration-75 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
        style={{
          top: Math.max(0, mouseY - 45),
          height: 90,
        }}
      >
        <div className="absolute right-4 top-1/2 -translate-y-1/2 rounded bg-indigo-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
          Reading Guide
        </div>
      </div>

      {/* Bottom Dimming Screen */}
      <div
        className="absolute inset-x-0 bottom-0 bg-black/40 transition-all duration-75"
        style={{ top: mouseY + 45 }}
      />
    </div>
  );
};
