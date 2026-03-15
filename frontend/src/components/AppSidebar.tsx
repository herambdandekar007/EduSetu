import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, User, Briefcase, FileCheck, GraduationCap, MapPin,
  Settings, Accessibility, Users, Trophy, UserCheck, Shield,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/profile", icon: User, label: "Profile" },
  { to: "/jobs", icon: Briefcase, label: "Job Matches" },
  { to: "/schemes", icon: FileCheck, label: "Scheme Eligibility" },
  { to: "/education", icon: GraduationCap, label: "Education" },
  { to: "/nearby", icon: MapPin, label: "Nearby Services" },
  { to: "/community", icon: Users, label: "Community" },
  { to: "/mentors", icon: UserCheck, label: "Mentors" },
  { to: "/achievements", icon: Trophy, label: "Achievements" },
  { to: "/accessibility", icon: Accessibility, label: "Accessibility" },
  { to: "/admin", icon: Shield, label: "Admin Panel" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

const AppSidebar = () => {
  const location = useLocation();
  const { profile } = useAuth();

  const completion = (() => {
    if (!profile) return 0;
    let filled = 0;
    const fields = ["full_name", "disability_type", "education_level", "skills", "city"];
    fields.forEach(f => { if (profile[f] && (Array.isArray(profile[f]) ? profile[f].length > 0 : true)) filled++; });
    return Math.round((filled / fields.length) * 100);
  })();

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col overflow-hidden"
      style={{ background: "linear-gradient(180deg, hsl(248,62%,12%) 0%, hsl(252,58%,16%) 55%, hsl(256,54%,14%) 100%)" }}
    >
      {/* Decorative ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-20 -left-10 h-56 w-56 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, hsl(265,80%,62%), transparent 70%)" }}
        />
        <div
          className="absolute bottom-28 -right-10 h-40 w-40 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, hsl(250,84%,54%), transparent 70%)" }}
        />
      </div>

      {/* Logo / branding */}
      <div className="relative flex items-center gap-3 px-6 py-5">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl shadow-lg"
          style={{ background: "linear-gradient(135deg, hsl(265,80%,62%), hsl(250,84%,54%))" }}
        >
          <Accessibility className="h-5 w-5 text-white drop-shadow" />
        </div>
        <div>
          <h1 className="text-[15px] font-extrabold text-white leading-tight">DivyangConnectAI</h1>
          <p className="text-[10px] uppercase tracking-widest" style={{ color: "hsl(265,55%,68%)" }}>
            Empowering Ability
          </p>
        </div>
      </div>

      {/* Thin gradient divider */}
      <div
        className="mx-5 mb-2 h-px opacity-25"
        style={{ background: "linear-gradient(90deg, transparent, hsl(265,70%,60%), transparent)" }}
      />

      {/* Navigation */}
      <nav className="mt-1 flex-1 space-y-0.5 overflow-y-auto px-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "text-white shadow-lg"
                  : "text-sidebar-fg hover:text-white hover:bg-white/5"
              }`}
              style={
                isActive
                  ? {
                      background: "linear-gradient(135deg, hsl(265,78%,56%), hsl(250,84%,52%))",
                      boxShadow: "0 4px 16px hsl(265 78% 56% / 0.45)",
                    }
                  : undefined
              }
            >
              <item.icon
                className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? "drop-shadow" : ""
                }`}
              />
              <span className="truncate">{item.label}</span>
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white/70" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Profile completion meter */}
      <div
        className="relative mx-4 mb-5 rounded-xl p-3"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div className="mb-2 flex items-center justify-between text-xs">
          <span style={{ color: "hsl(250,30%,65%)" }}>Profile Strength</span>
          <span className="font-bold text-white">{completion}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${completion}%`,
              background: "linear-gradient(90deg, hsl(265,80%,62%), hsl(250,84%,54%))",
            }}
          />
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
