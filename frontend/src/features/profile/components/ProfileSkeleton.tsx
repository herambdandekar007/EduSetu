// frontend/src/features/profile/components/ProfileSkeleton.tsx
// Pure Minimalist White Skeleton Loader for SMART EDUCATION AI Profile

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";

export const ProfileSkeleton: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-pulse bg-white">
        {/* Header Skeleton */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 rounded-full bg-gray-100 shrink-0" />
              <div className="space-y-2.5">
                <div className="h-6 w-48 rounded bg-gray-200" />
                <div className="h-4 w-32 rounded bg-gray-100" />
                <div className="h-3 w-40 rounded bg-gray-100" />
              </div>
            </div>
            <div className="h-10 w-32 rounded-lg bg-gray-100" />
          </div>
        </div>

        {/* Completion Skeleton */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex justify-between">
            <div className="h-4 w-36 rounded bg-gray-200" />
            <div className="h-4 w-12 rounded bg-gray-200" />
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100" />
        </div>

        {/* Tabs Bar Skeleton */}
        <div className="h-11 w-full rounded-lg bg-gray-100" />

        {/* Content Skeleton */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div className="h-5 w-40 rounded bg-gray-200" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="h-10 rounded bg-gray-100" />
            <div className="h-10 rounded bg-gray-100" />
            <div className="h-10 rounded bg-gray-100" />
            <div className="h-10 rounded bg-gray-100" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
