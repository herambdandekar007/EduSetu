import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";
import TopBar from "./TopBar";
import ReadingGuide from "./ReadingGuide";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import ScreenReader from "@/components/ScreenReader";

interface DashboardLayoutProps {
  children: ReactNode;
  hideTopBar?: boolean;
  noPadding?: boolean;
}

const DashboardLayout = ({ children, hideTopBar = false, noPadding = false }: DashboardLayoutProps) => {
  const { settings } = useAccessibility();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Skip-to-main-content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Reading guide */}
      {settings.readingGuide && <ReadingGuide />}

      <AppSidebar />

      <div className="ml-64 flex flex-1 flex-col">
        {!hideTopBar && <TopBar />}
        <main id="main-content" role="main" className={`flex-1 ${noPadding ? "" : "p-6"}`}>
          {children}
        </main>
      </div>

      {/* ✅ Added ScreenReader here */}
      <ScreenReader />
    </div>
  );
};

export default DashboardLayout;