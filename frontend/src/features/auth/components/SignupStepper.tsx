// frontend/src/features/auth/components/SignupStepper.tsx
// 3-Step Guided Registration Stepper with Voice Input, Audio Feedback & Accessibility

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Accessibility,
  GraduationCap,
  Building,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  CheckCircle2,
  Loader2,
  Mic,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { registerNewStudent } from "../services/authService";
import { useAuthVoiceInput } from "../hooks/useAuthVoiceInput";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { DEFAULT_ACCESSIBILITY_PREFERENCES, type SignupFormData, type EducationLevelType } from "../types/auth.types";
import { toast } from "sonner";

interface SignupStepperProps {
  onSwitchToLogin: () => void;
  onSignupSuccess: (data: { fullName: string; email: string; eduId: string }) => void;
}

const INDIAN_STATES = [
  "Maharashtra",
  "Delhi",
  "Karnataka",
  "Tamil Nadu",
  "Telangana",
  "Gujarat",
  "Uttar Pradesh",
  "West Bengal",
  "Rajasthan",
  "Kerala",
  "Madhya Pradesh",
  "Punjab",
  "Haryana",
  "Bihar",
  "Odisha",
  "Andhra Pradesh",
  "Assam",
  "Other State / UT",
];

export const SignupStepper: React.FC<SignupStepperProps> = ({ onSwitchToLogin, onSignupSuccess }) => {
  const { settings, speak } = useAccessibility();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [formData, setFormData] = useState<SignupFormData>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    accessibilityPreferences: { ...DEFAULT_ACCESSIBILITY_PREFERENCES },
    education: {
      educationLevel: "College",
      institutionName: "",
      state: "Maharashtra",
      classOrGrade: "Class 12",
      board: "CBSE",
      medium: "English",
      degreeOrCourse: "B.Tech / B.E.",
      branchOrSpecialization: "Computer Science & Engineering",
      year: "1st Year",
      semester: "Semester 1",
      university: "State Technical University",
    },
  });

  // Voice Input Hooks
  const nameVoice = useAuthVoiceInput((text) => setFormData((prev) => ({ ...prev, fullName: text })));
  const emailVoice = useAuthVoiceInput((text) =>
    setFormData((prev) => ({ ...prev, email: text.replace(/\s+/g, "").toLowerCase() }))
  );
  const phoneVoice = useAuthVoiceInput((text) =>
    setFormData((prev) => ({ ...prev, phone: text.replace(/[^\d+]/g, "") }))
  );
  const instVoice = useAuthVoiceInput((text) =>
    setFormData((prev) => ({
      ...prev,
      education: { ...prev.education, institutionName: text },
    }))
  );

  const speakIfEnabled = (text: string) => {
    if (settings.ttsEnabled) {
      speak(text);
    }
  };

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name.");
      speakIfEnabled("Please enter your full name.");
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast.error("Please enter a valid email address.");
      speakIfEnabled("Please enter a valid email address.");
      return false;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      speakIfEnabled("Password must be at least 6 characters long.");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match. Please re-enter.");
      speakIfEnabled("Passwords do not match. Please re-enter.");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
      speakIfEnabled("Step 2: Customize Accessibility and Comfort Mode preferences.");
    } else if (currentStep === 2) {
      setCurrentStep(3);
      speakIfEnabled("Step 3: Enter your academic and institution details.");
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      speakIfEnabled("Back to Step 1: Personal Details.");
    }
    if (currentStep === 3) {
      setCurrentStep(2);
      speakIfEnabled("Back to Step 2: Accessibility Preferences.");
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.education.institutionName.trim()) {
      toast.error("Please enter your School or College/University name.");
      speakIfEnabled("Please enter your School or College/University name.");
      return;
    }

    setLoading(true);
    speakIfEnabled("Generating your permanent EduID and provisioning your Smart Education profile.");

    try {
      const result = await registerNewStudent(formData);
      if (result.success && result.eduId) {
        toast.success("Welcome to Smart Education AI! Your EduID is ready.");
        speakIfEnabled(`Congratulations ${formData.fullName}! Your permanent EduID has been generated successfully.`);
        onSignupSuccess({
          fullName: formData.fullName,
          email: formData.email,
          eduId: result.eduId,
        });
      } else {
        toast.error(result.error || "Registration failed. Please check details.");
        speakIfEnabled(result.error || "Registration failed. Please check details.");
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred during signup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-slate-950/75 p-6 md:p-8 text-white shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-2xl"
    >
      {/* Step Indicator Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-300">
            <Sparkles className="h-3 w-3 text-indigo-400" />
            <span>STEP {currentStep} OF 3</span>
          </div>

          <button
            type="button"
            onClick={onSwitchToLogin}
            onMouseEnter={() => speakIfEnabled("Already registered? Switch to Sign In")}
            className="text-xs text-indigo-300 hover:text-indigo-200 hover:underline"
          >
            Already registered? Sign In
          </button>
        </div>

        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            {currentStep === 1 && "Start Your Education Journey 🚀"}
            {currentStep === 2 && "Accessibility & Comfort Mode ♿"}
            {currentStep === 3 && "Academic & Institution Details 🎓"}
          </h2>
          <p className="text-xs text-indigo-200/70 mt-0.5">
            {currentStep === 1 && "Create your lifelong Smart Education AI identity."}
            {currentStep === 2 && "Customize sensory & motor preferences anytime. Open to everyone."}
            {currentStep === 3 && "Link your subjects, grade, and institution to your EduID."}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((stepNum) => (
            <div
              key={stepNum}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                currentStep >= stepNum
                  ? "bg-gradient-to-r from-indigo-500 to-pink-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                  : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Dynamic Form Step Content */}
      <form onSubmit={currentStep === 3 ? handleFinalSubmit : (e) => { e.preventDefault(); handleNext(); }} className="mt-6 space-y-4">
        <AnimatePresence mode="wait">
          {/* ════════════ STEP 1: PERSONAL DETAILS ════════════ */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3.5"
            >
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-white/90">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    onFocus={() => speakIfEnabled("Full name field")}
                    placeholder="Aditya Sharma"
                    required
                    className="h-10 rounded-xl border-white/15 bg-white/5 pl-10 pr-10 text-sm text-white placeholder:text-white/30 focus-visible:border-indigo-400"
                  />
                  <button
                    type="button"
                    onClick={nameVoice.toggleListening}
                    title="Speak Name"
                    className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 ${
                      nameVoice.isListening ? "text-red-400 animate-pulse" : "text-white/40 hover:text-white"
                    }`}
                  >
                    <Mic className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-white/90">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onFocus={() => speakIfEnabled("Email address field")}
                      placeholder="student@gmail.com"
                      required
                      className="h-10 rounded-xl border-white/15 bg-white/5 pl-10 pr-10 text-sm text-white placeholder:text-white/30 focus-visible:border-indigo-400"
                    />
                    <button
                      type="button"
                      onClick={emailVoice.toggleListening}
                      title="Speak Email"
                      className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 ${
                        emailVoice.isListening ? "text-red-400 animate-pulse" : "text-white/40 hover:text-white"
                      }`}
                    >
                      <Mic className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-white/90">Mobile Number (Optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      onFocus={() => speakIfEnabled("Mobile number field")}
                      placeholder="+91 98765 43210"
                      className="h-10 rounded-xl border-white/15 bg-white/5 pl-10 pr-10 text-sm text-white placeholder:text-white/30 focus-visible:border-indigo-400"
                    />
                    <button
                      type="button"
                      onClick={phoneVoice.toggleListening}
                      title="Speak Phone"
                      className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 ${
                        phoneVoice.isListening ? "text-red-400 animate-pulse" : "text-white/40 hover:text-white"
                      }`}
                    >
                      <Mic className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-white/90">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <Input
                      type={showPass ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="h-10 rounded-xl border-white/15 bg-white/5 pl-10 pr-9 text-sm text-white placeholder:text-white/30 focus-visible:border-indigo-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                      {showPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-white/90">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <Input
                      type={showConfirmPass ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="h-10 rounded-xl border-white/15 bg-white/5 pl-10 pr-9 text-sm text-white placeholder:text-white/30 focus-visible:border-indigo-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                      {showConfirmPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ════════════ STEP 2: ACCESSIBILITY PREFERENCES ════════════ */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              <p className="text-xs text-white/70">
                Choose how you would like to interact with the platform. You can change these anytime in Settings.
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      accessibilityPreferences: { ...DEFAULT_ACCESSIBILITY_PREFERENCES, enabled: false },
                    })
                  }
                  className={`rounded-xl border p-3 text-left transition-all ${
                    !formData.accessibilityPreferences.enabled
                      ? "border-indigo-500 bg-indigo-500/15 shadow-md"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="text-xs font-bold text-white">Standard Mode</div>
                  <div className="text-[10px] text-white/60 mt-0.5">Default responsive interface</div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      accessibilityPreferences: {
                        ...formData.accessibilityPreferences,
                        enabled: true,
                        largeText: true,
                        focusIndicators: true,
                        textToSpeech: true,
                      },
                    })
                  }
                  className={`rounded-xl border p-3 text-left transition-all ${
                    formData.accessibilityPreferences.enabled
                      ? "border-purple-500 bg-purple-500/15 shadow-md"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Assistive Mode</span>
                    <Sparkles className="h-3 w-3 text-purple-400" />
                  </div>
                  <div className="text-[10px] text-purple-300 mt-0.5">High-contrast, TTS & gestures</div>
                </button>
              </div>

              {/* Quick Assistive Toggles */}
              <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm max-h-[190px] overflow-y-auto pr-1 custom-scrollbar">
                {[
                  { key: "highContrast", label: "High Contrast Theme", desc: "Maximum readable contrast" },
                  { key: "largeText", label: "Enlarged Text & Buttons", desc: "Larger readable fonts" },
                  { key: "textToSpeech", label: "Text-to-Speech (TTS)", desc: "Reads explanations aloud" },
                  { key: "dyslexiaFont", label: "OpenDyslexic Font", desc: "Dyslexia-friendly typography" },
                  { key: "voiceControl", label: "Voice Navigation", desc: "Control via spoken commands" },
                  { key: "gestureControl", label: "Touchless Gesture Control", desc: "Webcam hands-free navigation" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
                    <div>
                      <div className="text-xs font-semibold text-white">{item.label}</div>
                      <div className="text-[10px] text-white/50">{item.desc}</div>
                    </div>
                    <Switch
                      checked={!!formData.accessibilityPreferences[item.key as keyof typeof formData.accessibilityPreferences]}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          accessibilityPreferences: {
                            ...formData.accessibilityPreferences,
                            [item.key]: checked,
                            enabled: true,
                          },
                        })
                      }
                      className="data-[state=checked]:bg-indigo-500"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ════════════ STEP 3: EDUCATION DETAILS ════════════ */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {/* Level Selector */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-white/90">Education Category</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["School", "College", "University"] as EducationLevelType[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          education: { ...formData.education, educationLevel: lvl },
                        })
                      }
                      className={`rounded-xl border py-2 text-xs font-bold transition-all ${
                        formData.education.educationLevel === lvl
                          ? "border-indigo-500 bg-indigo-600/30 text-white shadow"
                          : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Institution Name */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-white/90">
                  {formData.education.educationLevel === "School" ? "School Name" : "College / Institute Name"}
                </Label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <Input
                    value={formData.education.institutionName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        education: { ...formData.education, institutionName: e.target.value },
                      })
                    }
                    onFocus={() => speakIfEnabled("Institution name field")}
                    placeholder={
                      formData.education.educationLevel === "School"
                        ? "Delhi Public School / Kendriya Vidyalaya"
                        : "IIT Bombay / COEP Technological University"
                    }
                    required
                    className="h-10 rounded-xl border-white/15 bg-white/5 pl-10 pr-10 text-sm text-white placeholder:text-white/30 focus-visible:border-indigo-400"
                  />
                  <button
                    type="button"
                    onClick={instVoice.toggleListening}
                    title="Speak Institution Name"
                    className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 ${
                      instVoice.isListening ? "text-red-400 animate-pulse" : "text-white/40 hover:text-white"
                    }`}
                  >
                    <Mic className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Dynamic School vs College fields */}
              {formData.education.educationLevel === "School" ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-white/90">Class / Grade</Label>
                    <Select
                      value={formData.education.classOrGrade}
                      onValueChange={(v) =>
                        setFormData({
                          ...formData,
                          education: { ...formData.education, classOrGrade: v },
                        })
                      }
                    >
                      <SelectTrigger className="h-10 rounded-xl border-white/15 bg-slate-900 text-xs text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/15 text-white text-xs">
                        {["Class 8", "Class 9", "Class 10", "Class 11 (Science)", "Class 11 (Commerce)", "Class 12 (Science)", "Class 12 (Commerce)", "Class 12 (Arts)"].map(
                          (c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-white/90">Board</Label>
                    <Select
                      value={formData.education.board}
                      onValueChange={(v) =>
                        setFormData({
                          ...formData,
                          education: { ...formData.education, board: v },
                        })
                      }
                    >
                      <SelectTrigger className="h-10 rounded-xl border-white/15 bg-slate-900 text-xs text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/15 text-white text-xs">
                        {["CBSE", "ICSE / ISC", "State Board", "NIOS (Open School)", "IB / Cambridge"].map((b) => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-white/90">Degree / Course</Label>
                    <Input
                      value={formData.education.degreeOrCourse}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          education: { ...formData.education, degreeOrCourse: e.target.value },
                        })
                      }
                      placeholder="B.Tech / BCA / B.Sc"
                      className="h-10 rounded-xl border-white/15 bg-white/5 text-xs text-white placeholder:text-white/30"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-white/90">Branch / Major</Label>
                    <Input
                      value={formData.education.branchOrSpecialization}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          education: { ...formData.education, branchOrSpecialization: e.target.value },
                        })
                      }
                      placeholder="Computer Science"
                      className="h-10 rounded-xl border-white/15 bg-white/5 text-xs text-white placeholder:text-white/30"
                    />
                  </div>
                </div>
              )}

              {/* State */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-white/90">State</Label>
                <Select
                  value={formData.education.state}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      education: { ...formData.education, state: v },
                    })
                  }
                >
                  <SelectTrigger className="h-10 rounded-xl border-white/15 bg-slate-900 text-xs text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/15 text-white text-xs max-h-48">
                    {INDIAN_STATES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="border-white/15 bg-white/5 text-white hover:bg-white/10 text-xs h-10 px-4"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              <span>Back</span>
            </Button>
          ) : (
            <div />
          )}

          <Button
            type="submit"
            disabled={loading}
            className="h-10 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 font-bold text-white shadow-lg text-xs px-6 hover:opacity-95 active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : currentStep === 3 ? (
              <>
                <span>Generate EduID & Launch</span>
                <Sparkles className="ml-1.5 h-4 w-4" />
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
