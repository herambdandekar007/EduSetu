import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, User, Briefcase, FileCheck, GraduationCap, MapPin,
  Settings, Accessibility, Users, Trophy, UserCheck, Shield,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
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
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-sidebar-bg text-sidebar-fg">
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-active">
          <Accessibility className="h-6 w-6 text-sidebar-active-fg" />
        </div>
        <div>
          <h1 className="text-base font-bold text-sidebar-active-fg">Smart Portal</h1>
          <p className="text-xs text-sidebar-muted uppercase tracking-wider">Empowering Ability</p>
        </div>
      </div>

      <nav className="mt-2 flex-1 space-y-0.5 px-3 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-sidebar-active text-sidebar-active-fg shadow-lg shadow-sidebar-active/20"
                  : "text-sidebar-fg hover:bg-sidebar-hover hover:text-sidebar-active-fg"
              }`}
            >
              <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mx-4 mb-4 rounded-lg bg-sidebar-hover p-3">
        <div className="flex items-center justify-between text-xs text-sidebar-fg mb-1.5">
          <span>Profile</span>
          <span className="font-semibold text-sidebar-active-fg">{completion}%</span>
        </div>
        <Progress value={completion} className="h-1.5 bg-sidebar-muted" />
      </div>
    </aside>
  );
};

export default AppSidebar;
