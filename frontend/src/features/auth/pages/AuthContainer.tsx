// frontend/src/features/auth/pages/AuthContainer.tsx
// Master 3D Animated Authentication Orchestrator with Full Accessibility Integration for SMART EDUCATION AI

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AuthBackground } from "../components/AuthBackground";
import { FloatingEducationObjects } from "../components/FloatingEducationObjects";
import { BrandHeroSection } from "../components/BrandHeroSection";
import { LoginForm } from "../components/LoginForm";
import { SignupStepper } from "../components/SignupStepper";
import { EduIdSuccessModal } from "../components/EduIdSuccessModal";
import { AccessibilitySetupModal } from "../components/AccessibilitySetupModal";
import { AuthAccessibilityBar } from "../components/AuthAccessibilityBar";
import { AuthReadingGuide } from "../components/AuthReadingGuide";
import { DEFAULT_ACCESSIBILITY_PREFERENCES, type AccessibilityPreferences } from "../types/auth.types";
import { useAccessibility } from "@/contexts/AccessibilityContext";

export const AuthContainer: React.FC = () => {
  const navigate = useNavigate();
  const { settings, update: updateGlobalA11y, speak } = useAccessibility();

  const [authMode, setAuthMode] = useState<"login" | "signup" | "success">("login");
  const [previewEduId, setPreviewEduId] = useState<string>("EDU-IN-2026-X8F42A");
  const [isA11yModalOpen, setIsA11yModalOpen] = useState(false);
  const [a11yPreferences, setA11yPreferences] = useState<AccessibilityPreferences>({
    ...DEFAULT_ACCESSIBILITY_PREFERENCES,
  });

  const [newUserData, setNewUserData] = useState<{
    fullName: string;
    email: string;
    eduId: string;
  } | null>(null);

  // Global Accessible Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check Alt modifier
      if (e.altKey) {
        if (e.key.toLowerCase() === "a") {
          e.preventDefault();
          setIsA11yModalOpen((prev) => !prev);
          speak("Toggled Accessibility settings menu");
        } else if (e.key.toLowerCase() === "h") {
          e.preventDefault();
          const nextVal = !settings.highContrast;
          updateGlobalA11y({ highContrast: nextVal });
          speak(nextVal ? "High contrast mode active" : "Standard contrast mode active");
        } else if (e.key.toLowerCase() === "t") {
          e.preventDefault();
          const nextVal = !settings.ttsEnabled;
          updateGlobalA11y({ ttsEnabled: nextVal });
          speak(nextVal ? "Text to speech enabled" : "Text to speech disabled");
        } else if (e.key.toLowerCase() === "d") {
          e.preventDefault();
          const nextVal = !settings.dyslexiaFont;
          updateGlobalA11y({ dyslexiaFont: nextVal });
          speak(nextVal ? "OpenDyslexic font enabled" : "Default font restored");
        } else if (e.key.toLowerCase() === "r") {
          e.preventDefault();
          const nextVal = !settings.readingGuide;
          updateGlobalA11y({ readingGuide: nextVal });
          speak(nextVal ? "Reading focus ruler activated" : "Reading focus ruler deactivated");
        } else if (e.key.toLowerCase() === "s") {
          e.preventDefault();
          setAuthMode((prev) => (prev === "login" ? "signup" : "login"));
          speak(authMode === "login" ? "Switched to registration form" : "Switched to login form");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [settings, updateGlobalA11y, speak, authMode]);

  const handleSignupSuccess = (data: { fullName: string; email: string; eduId: string }) => {
    setNewUserData(data);
    setPreviewEduId(data.eduId);
    setAuthMode("success");
  };

  const handleApplyPreferences = (prefs: AccessibilityPreferences) => {
    setA11yPreferences(prefs);
    // Apply globally via AccessibilityContext
    updateGlobalA11y({
      highContrast: prefs.highContrast,
      textSize: prefs.largeText ? "large" : "normal",
      dyslexiaFont: prefs.dyslexiaFont,
      ttsEnabled: prefs.textToSpeech,
      focusIndicators: prefs.focusIndicators,
      readingGuide: prefs.readingGuide,
    });
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#030014] text-white flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* ── Top Dedicated Accessibility Toolbar ── */}
      <AuthAccessibilityBar onOpenFullModal={() => setIsA11yModalOpen(true)} />

      {/* ── Accessible Reading Focus Guide Line ── */}
      <AuthReadingGuide />

      {/* ── 3D Dynamic Ambient Canvas & Stars ── */}
      <AuthBackground />

      {/* ── 3D Floating Education Objects ── */}
      <FloatingEducationObjects />

      {/* ── Main Split-Screen Container ── */}
      <main id="main-content" className="relative z-10 mx-auto w-full max-w-7xl px-4 py-6 md:py-8 lg:px-8 flex-1 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
          {/* Left Brand Hero Column */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col justify-center">
            <BrandHeroSection previewEduId={previewEduId} />
          </div>

          {/* Right Interactive Form Column */}
          <div className="lg:col-span-6 xl:col-span-5 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {authMode === "login" && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 25 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -25 }}
                  transition={{ duration: 0.35 }}
                  className="w-full flex justify-center"
                >
                  <LoginForm
                    onSwitchToSignup={() => {
                      setAuthMode("signup");
                      speak("Switched to registration stepper");
                    }}
                    onOpenAccessibilityModal={() => setIsA11yModalOpen(true)}
                    onEduIdChangeFor3DCard={(id) => setPreviewEduId(id)}
                  />
                </motion.div>
              )}

              {authMode === "signup" && (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, x: 25 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -25 }}
                  transition={{ duration: 0.35 }}
                  className="w-full flex justify-center"
                >
                  <SignupStepper
                    onSwitchToLogin={() => {
                      setAuthMode("login");
                      speak("Switched to login form");
                    }}
                    onSignupSuccess={handleSignupSuccess}
                  />
                </motion.div>
              )}

              {authMode === "success" && newUserData && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="w-full flex justify-center"
                >
                  <EduIdSuccessModal
                    studentName={newUserData.fullName}
                    email={newUserData.email}
                    eduId={newUserData.eduId}
                    onContinue={() => navigate("/")}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* ── Complete Accessibility & Comfort Mode Modal ── */}
      <AccessibilitySetupModal
        isOpen={isA11yModalOpen}
        onClose={() => setIsA11yModalOpen(false)}
        preferences={a11yPreferences}
        onSavePreferences={handleApplyPreferences}
      />
    </div>
  );
};

export default AuthContainer;
