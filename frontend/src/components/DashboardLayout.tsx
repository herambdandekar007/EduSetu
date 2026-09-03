import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";
import TopBar from "./TopBar";
import ReadingGuide from "./ReadingGuide";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useScreenReader } from "@/contexts/ScreenReaderContext";
import ScreenReader from "@/components/ScreenReader";

interface DashboardLayoutProps {
  children: ReactNode;
  hideTopBar?: boolean;
  noPadding?: boolean;
}

const DashboardLayout = ({ children, hideTopBar = false, noPadding = false }: DashboardLayoutProps) => {
  const { settings } = useAccessibility();
  const { isActive, isCommandBoardOpen, commandBoardWidth, isDragging } = useScreenReader();

  return (
    <div className="flex min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lg"
      >
        Skip to main content
      </a>

      {settings.readingGuide && <ReadingGuide />}

      <AppSidebar />

      <div
        className="ml-64 flex flex-1 flex-col min-w-0"
        style={{
          marginRight: isActive && isCommandBoardOpen ? `${commandBoardWidth}px` : 0,
          transition: isDragging ? "none" : "margin-right 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {!hideTopBar && <TopBar />}
        <main id="main-content" role="main" className={`flex-1 min-w-0 ${noPadding ? "" : "p-6"}`}>
          {children}
        </main>
      </div>

      <ScreenReader />
    </div>
  );
};

export default DashboardLayout;
