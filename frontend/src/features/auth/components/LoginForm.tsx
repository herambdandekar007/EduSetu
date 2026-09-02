// frontend/src/features/auth/components/LoginForm.tsx
// Glassmorphism Login Card with Voice Input, TTS Narration, EduID / Email Tabs, Google OAuth, and Password Recovery

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Eye,
  EyeOff,
  Lock,
  Mail,
  CreditCard,
  ArrowRight,
  Loader2,
  Accessibility,
  Mic,
  MicOff,
  Volume2,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { loginWithEmail, loginWithEduId, loginWithGoogle, sendResetEmail } from "../services/authService";
import { useAuthVoiceInput } from "../hooks/useAuthVoiceInput";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface LoginFormProps {
  onSwitchToSignup: () => void;
  onOpenAccessibilityModal: () => void;
  onEduIdChangeFor3DCard?: (id: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToSignup,
  onOpenAccessibilityModal,
  onEduIdChangeFor3DCard,
}) => {
  const navigate = useNavigate();
  const { settings, speak } = useAccessibility();

  const [loginTab, setLoginTab] = useState<"eduid" | "email">("eduid");
  const [eduId, setEduId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Forgot password dialog
  const [forgotDialogOpen, setForgotDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // Voice Input hooks for fields
  const eduIdVoice = useAuthVoiceInput((text) => {
    // strip spaces and format
    const cleaned = text.replace(/\s+/g, "").toUpperCase();
    handleEduIdInput(cleaned);
  });

  const emailVoice = useAuthVoiceInput((text) => {
    const cleaned = text.replace(/\s+/g, "").toLowerCase();
    setEmail(cleaned);
  });

  const handleEduIdInput = (val: string) => {
    const formatted = val.toUpperCase();
    setEduId(formatted);
    if (onEduIdChangeFor3DCard) {
      onEduIdChangeFor3DCard(formatted || "EDU-IN-2026-X8F42A");
    }
  };

  const speakIfEnabled = (text: string) => {
    if (settings.ttsEnabled) {
      speak(text);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (loginTab === "eduid") {
        if (!eduId.trim()) {
          toast.error("Please enter your permanent EduID.");
          speakIfEnabled("Please enter your permanent EduID.");
          setLoading(false);
          return;
        }
        result = await loginWithEduId(eduId, password);
      } else {
        if (!email.trim()) {
          toast.error("Please enter your email address.");
          speakIfEnabled("Please enter your email address.");
          setLoading(false);
          return;
        }
        result = await loginWithEmail(email, password);
      }

      if (result.success) {
        toast.success(`Welcome back to Smart Education AI!`);
        speakIfEnabled("Login successful. Loading your personalized Smart Education dashboard.");
        navigate("/");
      } else {
        toast.error(result.error || "Authentication failed. Please verify credentials.");
        speakIfEnabled(result.error || "Authentication failed. Please verify credentials.");
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        toast.success("Google sign-in successful! Welcome to Smart Education AI.");
        speakIfEnabled("Google sign in successful. Welcome to Smart Education AI.");
        navigate("/");
      } else {
        toast.error(result.error || "Google authentication was cancelled.");
      }
    } catch (err: any) {
      toast.error("Google sign-in failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      toast.error("Please enter your registered email address.");
      return;
    }
    setResetLoading(true);
    const res = await sendResetEmail(resetEmail);
    if (res.success) {
      toast.success(res.message);
      speakIfEnabled(res.message);
      setForgotDialogOpen(false);
      setResetEmail("");
    } else {
      toast.error(res.message);
      speakIfEnabled(res.message);
    }
    setResetLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full max-w-md rounded-3xl border border-white/15 bg-slate-950/70 p-7 md:p-8 text-white shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
    >
      {/* Decorative gradient perimeter */}
      <div className="pointer-events-none absolute -inset-0.5 rounded-3xl bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-pink-500/30 opacity-70 blur-sm" />

      <div className="relative z-10 space-y-6">
        {/* Top Header & Accessibility Trigger */}
        <div className="flex items-start justify-between">
          <div>
            <div
              className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-300 cursor-pointer"
              onMouseEnter={() => speakIfEnabled("Smart Education AI login section")}
              onFocus={() => speakIfEnabled("Smart Education AI login section")}
            >
              <Sparkles className="h-3 w-3 text-indigo-400" />
              <span>SMART EDUCATION AI</span>
            </div>
            <h2
              className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight text-white"
              onMouseEnter={() => speakIfEnabled("Welcome back. Continue your learning journey.")}
            >
              Welcome Back 👋
            </h2>
            <p className="text-xs text-indigo-200/70 mt-1">
              Continue your lifelong education journey.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenAccessibilityModal}
            onMouseEnter={() => speakIfEnabled("Accessibility and Comfort Mode settings")}
            title="Open Accessibility & Comfort Mode"
            className="group flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/80 shadow-md backdrop-blur-md transition-all hover:border-indigo-400/50 hover:bg-indigo-500/20 hover:text-white"
          >
            <Accessibility className="h-4 w-4 text-indigo-300 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Login Method Tabs */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-md">
          <div className="grid grid-cols-2 gap-1 text-xs">
            <button
              type="button"
              onClick={() => {
                setLoginTab("eduid");
                speakIfEnabled("Switched to EduID login");
              }}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 font-semibold transition-all ${
                loginTab === "eduid"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Login with EduID</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginTab("email");
                speakIfEnabled("Switched to Email login");
              }}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 font-semibold transition-all ${
                loginTab === "email"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Login with Email</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {loginTab === "eduid" ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="eduid"
                  className="text-xs font-semibold text-white/90"
                  onMouseEnter={() => speakIfEnabled("Permanent EduID field")}
                >
                  Permanent EduID
                </Label>
                <span className="text-[10px] text-indigo-300/80 font-mono">
                  e.g. EDU-IN-2026-XXXXXX
                </span>
              </div>
              <div className="relative">
                <CreditCard className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <Input
                  id="eduid"
                  value={eduId}
                  onChange={(e) => handleEduIdInput(e.target.value)}
                  onFocus={() => speakIfEnabled("Enter your permanent EduID")}
                  placeholder="EDU-IN-2026-AB12CD"
                  required
                  className="h-11 rounded-xl border-white/15 bg-white/5 pl-10 pr-10 font-mono text-sm tracking-wider text-white placeholder:text-white/30 focus-visible:border-indigo-400 focus-visible:ring-indigo-500/30"
                />

                {/* Voice Dictation Button inside Input */}
                <button
                  type="button"
                  onClick={eduIdVoice.toggleListening}
                  title="Speak EduID using microphone"
                  className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 transition-colors ${
                    eduIdVoice.isListening
                      ? "bg-red-500/30 text-red-400 animate-pulse"
                      : "text-white/40 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Mic className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-xs font-semibold text-white/90"
                onMouseEnter={() => speakIfEnabled("Email address field")}
              >
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => speakIfEnabled("Enter your registered email address")}
                  placeholder="student@education.gov.in"
                  required
                  className="h-11 rounded-xl border-white/15 bg-white/5 pl-10 pr-10 text-sm text-white placeholder:text-white/30 focus-visible:border-indigo-400 focus-visible:ring-indigo-500/30"
                />

                {/* Voice Dictation Button */}
                <button
                  type="button"
                  onClick={emailVoice.toggleListening}
                  title="Speak email using microphone"
                  className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 transition-colors ${
                    emailVoice.isListening
                      ? "bg-red-500/30 text-red-400 animate-pulse"
                      : "text-white/40 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Mic className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Password field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="text-xs font-semibold text-white/90"
                onMouseEnter={() => speakIfEnabled("Password field")}
              >
                Password
              </Label>
              <button
                type="button"
                onClick={() => setForgotDialogOpen(true)}
                onMouseEnter={() => speakIfEnabled("Forgot password button")}
                className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => speakIfEnabled("Enter your password")}
                placeholder="••••••••••••"
                required
                minLength={6}
                className="h-11 rounded-xl border-white/15 bg-white/5 pl-10 pr-10 text-sm text-white placeholder:text-white/30 focus-visible:border-indigo-400 focus-visible:ring-indigo-500/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none text-white/80">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-white/20 bg-white/10 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Remember this session</span>
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            onMouseEnter={() => speakIfEnabled("Continue learning button. Submit credentials to login.")}
            className="h-11 w-full rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 font-bold text-white shadow-lg transition-all hover:opacity-95 hover:shadow-indigo-500/25 active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>Continue Learning</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <span className="relative bg-slate-950/80 px-3 text-[11px] uppercase tracking-wider text-white/40">
            or continue with
          </span>
        </div>

        {/* Google OAuth Button */}
        <Button
          type="button"
          onClick={handleGoogleSignIn}
          onMouseEnter={() => speakIfEnabled("Continue with Google button")}
          disabled={googleLoading}
          variant="outline"
          className="h-11 w-full rounded-xl border-white/15 bg-white/5 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/30"
        >
          {googleLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2.5 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </Button>

        {/* Switch to Signup */}
        <div className="text-center pt-1">
          <p className="text-xs text-white/60">
            New to Smart Education AI?{" "}
            <button
              type="button"
              onClick={onSwitchToSignup}
              onMouseEnter={() => speakIfEnabled("Create your permanent EduID link")}
              className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              Create your permanent EduID →
            </button>
          </p>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotDialogOpen} onOpenChange={setForgotDialogOpen}>
        <DialogContent className="rounded-2xl border border-white/15 bg-slate-950 p-6 text-white sm:max-w-md">
          <DialogHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 mb-2">
              <KeyRound className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-white">Reset Account Password</DialogTitle>
            <DialogDescription className="text-xs text-white/60">
              Enter your registered email address. We'll send you a secure link to reset your Smart Education AI password.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleResetPassword} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-white/90">Registered Email</Label>
              <Input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="student@example.com"
                required
                className="h-10 rounded-xl border-white/15 bg-white/5 text-sm text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setForgotDialogOpen(false)}
                className="border-white/15 bg-white/5 text-white hover:bg-white/10 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={resetLoading}
                size="sm"
                className="bg-indigo-600 text-white font-semibold hover:bg-indigo-500 text-xs shadow-md"
              >
                {resetLoading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                Send Reset Link
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
