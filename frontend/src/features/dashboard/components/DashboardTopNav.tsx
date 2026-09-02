// frontend/src/features/dashboard/components/DashboardTopNav.tsx
// Layered 3D Top Navigation Header for SMART EDUCATION AI

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Bot,
  Accessibility,
  Bell,
  Sparkles,
  User,
  GraduationCap,
  Flame,
  Award,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { StudentDashboardData, DashboardNotificationItem } from "../types/dashboard.types";
import { useAccessibility } from "@/contexts/AccessibilityContext";

interface DashboardTopNavProps {
  student: StudentDashboardData;
  notifications: DashboardNotificationItem[];
}

export const DashboardTopNav: React.FC<DashboardTopNavProps> = ({ student, notifications }) => {
  const navigate = useNavigate();
  const { settings, update } = useAccessibility();
  const [searchQuery, setSearchQuery] = useState("");

  const toggleHighContrast = () => {
    update({ highContrast: !settings.highContrast });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/learn?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/95 px-4 sm:px-6 py-3 backdrop-blur-md transition-all shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        
        {/* Left: Brand Identity & Breadcrumb */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-sm group-hover:bg-indigo-700 transition-colors">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-bold tracking-tight text-slate-900 block leading-tight">
                SMART EDUCATION AI
              </span>
              <span className="text-[10px] font-semibold text-indigo-600 tracking-wider uppercase">
                Student Command Center
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Global Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subjects, AI topics, roadmap skills, or schemes..."
              className="h-9 w-full rounded-xl border-slate-200 bg-slate-50 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
            />
          </div>
        </form>

        {/* Right: Quick Action Badges & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Streak & Points Pill */}
          <div className="hidden lg:flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs">
            <div className="flex items-center gap-1 font-semibold text-amber-600">
              <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <span>{student.streakDays}d Streak</span>
            </div>
            <div className="h-3 w-px bg-slate-200" />
            <div className="flex items-center gap-1 font-semibold text-indigo-600 font-mono">
              <Award className="h-3.5 w-3.5" />
              <span>{student.userPoints} pts</span>
            </div>
          </div>

          {/* AI Quick Chat Access */}
          <Button
            size="sm"
            onClick={() => navigate("/edumentor")}
            className="h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3 text-xs font-semibold text-white shadow-xs transition-colors gap-1.5"
          >
            <Bot className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Ask AI Tutor</span>
          </Button>

          {/* Quick Accessibility Button */}
          <button
            type="button"
            onClick={toggleHighContrast}
            title={settings.highContrast ? "Disable High Contrast" : "Enable High Contrast"}
            aria-pressed={settings.highContrast}
            className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors ${
              settings.highContrast
                ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Accessibility className="h-4 w-4" />
          </button>

          {/* Notification Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink-600 text-[9px] font-black text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <span className="text-xs font-bold text-slate-900">Notifications & AI Alerts</span>
                <span className="text-[10px] text-indigo-600 font-mono font-semibold">{notifications.length} alerts</span>
              </div>
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`rounded-xl border p-2.5 transition-colors ${
                      !n.read
                        ? "border-indigo-200 bg-indigo-50/60 text-slate-900"
                        : "border-slate-100 bg-slate-50 text-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                      <span className="text-[9px] text-slate-400">{n.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{n.description}</p>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Student Profile Avatar */}
          <Link
            to="/profile"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1 pr-2.5 hover:bg-slate-100 transition-colors group"
          >
            <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs overflow-hidden">
              {student.avatarUrl || student.photoURL ? (
                <img src={student.avatarUrl || student.photoURL} alt={student.fullName} className="h-full w-full object-cover" />
              ) : (
                student.firstName[0] || "A"
              )}
            </div>
            <span className="hidden md:inline text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
              {student.firstName}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};
