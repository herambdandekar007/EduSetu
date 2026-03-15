import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";
import TopBar from "./TopBar";
import ReadingGuide from "./ReadingGuide";
import { useAccessibility } from "@/contexts/AccessibilityContext";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { settings } = useAccessibility();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Skip-to-main-content link — visible on keyboard focus for screen reader / keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Reading guide overlay — follows mouse when enabled */}
      {settings.readingGuide && <ReadingGuide />}

      <AppSidebar />
      <div className="ml-64 flex flex-1 flex-col">
        <TopBar />
        <main id="main-content" className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
