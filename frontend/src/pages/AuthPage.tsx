import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accessibility, Loader2, Sparkles, Briefcase, Shield, GraduationCap, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const features = [
  { icon: Briefcase, text: "AI-powered job matching tailored to your abilities" },
  { icon: Shield, text: "Check eligibility for 50+ government schemes instantly" },
  { icon: GraduationCap, text: "Curated courses to close your skill gaps" },
  { icon: Sparkles, text: "Smart AI assistant available 24/7 in Hindi & English" },
];

const stats = [
  { value: "50K+", label: "PWD Served" },
  { value: "200+", label: "Jobs Listed" },
  { value: "80+", label: "Schemes" },
];

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Welcome back!");
        navigate("/");
      }
    } else {
      if (!fullName.trim()) {
        toast.error("Please enter your full name");
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account created! Please check your email to verify.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* ── Left hero panel ── */}
      <div
        className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex lg:w-[46%]"
        style={{
          background:
            "linear-gradient(145deg, hsl(248,62%,11%) 0%, hsl(258,58%,17%) 45%, hsl(276,54%,21%) 100%)",
        }}
      >
        {/* Ambient blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-28 -left-20 h-80 w-80 rounded-full opacity-25"
            style={{ background: "radial-gradient(circle, hsl(265,80%,62%), transparent 70%)" }}
          />
          <div
            className="absolute bottom-8 -right-16 h-64 w-64 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, hsl(250,84%,54%), transparent 70%)" }}
          />
          <div
            className="absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, hsl(280,80%,70%), transparent 70%)" }}
          />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg"
            style={{ background: "linear-gradient(135deg, hsl(265,80%,62%), hsl(250,84%,54%))" }}
          >
            <Accessibility className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">DivyangConnectAI</h1>
            <p className="text-[10px] uppercase tracking-widest" style={{ color: "hsl(265,55%,68%)" }}>
              Empowering Ability
            </p>
          </div>
        </div>

        {/* Hero copy */}
        <div className="relative space-y-7">
          <div>
            <h2 className="mb-3 text-4xl font-extrabold leading-tight text-white">
              Empowering
              <br />
              <span
                style={{
                  backgroundImage: "linear-gradient(90deg, hsl(265,80%,76%), hsl(200,85%,70%))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Every Ability
              </span>
            </h2>
            <p className="text-[15px] leading-relaxed" style={{ color: "hsl(250,28%,68%)" }}>
              India's first AI-powered inclusion platform built for persons with disabilities.
            </p>
          </div>

          <ul className="space-y-3">
            {features.map((f, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  <f.icon className="h-4 w-4 text-white/80" />
                </div>
                <span className="text-sm" style={{ color: "hsl(250,25%,70%)" }}>
                  {f.text}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Stats row */}
        <div className="relative grid grid-cols-3 gap-3">
          {stats.map(({ value, label }) => (
            <div
              key={label}
              className="rounded-xl p-3 text-center"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="text-2xl font-extrabold text-white">{value}</div>
              <div className="mt-0.5 text-xs" style={{ color: "hsl(250,28%,62%)" }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 items-center justify-center bg-background px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile-only logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: "linear-gradient(135deg, hsl(265,80%,62%), hsl(250,84%,54%))" }}
            >
              <Accessibility className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-extrabold text-foreground">DivyangConnectAI</h1>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="mb-1.5 text-3xl font-extrabold text-foreground">
              {isLogin ? "Welcome back 👋" : "Join us today 🚀"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isLogin
                ? "Sign in to access your personalized dashboard"
                : "Create your free account and start your journey"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Aditya Kumar"
                  required
                  className="h-11 rounded-xl border-border/70 focus-visible:ring-primary/40"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="h-11 rounded-xl border-border/70 focus-visible:ring-primary/40"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                {isLogin && (
                  <button
                    type="button"
                    className="text-xs font-medium hover:underline"
                    style={{ color: "hsl(var(--primary))" }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="h-11 rounded-xl border-border/70 focus-visible:ring-primary/40"
              />
            </div>

            <Button
              type="submit"
              className="h-11 w-full rounded-xl font-semibold text-white shadow-md transition-all hover:opacity-90 hover:shadow-lg active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, hsl(250,84%,54%), hsl(278,80%,60%))",
              }}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          {/* Toggle */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold hover:underline"
              style={{ color: "hsl(var(--primary))" }}
            >
              {isLogin ? "Sign up free" : "Sign in"}
            </button>
          </p>

          {/* Trust badge */}
          <div className="mt-8 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            <p className="text-center text-xs text-muted-foreground/60">
              Trusted by 50,000+ persons with disabilities across India
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
