// frontend/src/features/dashboard/components/DashboardSkeleton.tsx
// 3D Pulsating Skeleton Loader for SMART EDUCATION AI Dashboard

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";

export const DashboardSkeleton: React.FC = () => {
  return (
    <DashboardLayout hideTopBar noPadding>
      <div className="flex flex-col min-h-screen bg-slate-50/70 text-slate-900">
        <div className="h-16 w-full border-b border-slate-200/90 bg-white" />
        <div className="max-w-7xl mx-auto w-full space-y-6 p-4 sm:p-6 pb-20 animate-pulse">
          {/* Hero Skeleton */}
          <div className="h-64 rounded-3xl border border-slate-200/90 bg-white p-8">
            <div className="flex justify-between items-center h-full">
              <div className="space-y-4 w-1/2">
                <div className="h-5 w-40 rounded-full bg-slate-200" />
                <div className="h-9 w-72 rounded-xl bg-slate-200" />
                <div className="h-4 w-96 rounded bg-slate-100" />
                <div className="flex gap-3 pt-2">
                  <div className="h-10 w-32 rounded-xl bg-slate-200" />
                  <div className="h-10 w-32 rounded-xl bg-slate-100" />
                </div>
              </div>
              <div className="h-44 w-44 rounded-full bg-slate-100" />
            </div>
          </div>

          {/* 2-Column Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 h-72 rounded-3xl border border-slate-200/90 bg-white" />
            <div className="lg:col-span-8 h-72 rounded-3xl border border-slate-200/90 bg-white" />
          </div>

          {/* 3-Column Recommendations Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-56 rounded-3xl border border-slate-200/90 bg-white" />
            <div className="h-56 rounded-3xl border border-slate-200/90 bg-white" />
            <div className="h-56 rounded-3xl border border-slate-200/90 bg-white" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
