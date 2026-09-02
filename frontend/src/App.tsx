import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { DashboardLanguageProvider } from "@/contexts/DashboardLanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AIChatDialog from "@/components/AIChatDialog";
import HandGestureController from "@/components/HandGestureController";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import JobsPage from "./pages/JobsPage";
import SchemesPage from "./pages/SchemesPage";
import EducationPage from "./pages/EducationPage";
import LearnPage from "./features/learn/pages/LearnPage";
import EduSpeakPage from "./features/eduspeak/pages/EduSpeakPage";
import EduVaultPage from "./features/eduvault/pages/EduVaultPage";
import EduMentorPage from "./features/edumentor/pages/EduMentorPage";
import EduRoadmapPage from "./features/eduroadmap/pages/EduRoadmapPage";
import SharedDocumentViewer from "./features/eduvault/pages/SharedDocumentViewer";
import NearbyPage from "./pages/NearbyPage";
import SettingsPage from "./pages/SettingsPage";
import CommunityPage from "./pages/CommunityPage";
import MentorsPage from "./pages/MentorsPage";
import PerformancePage from "./features/performance/pages/PerformancePage";
import GamificationPage from "./pages/GamificationPage";
import AdminPage from "./pages/AdminPage";
import AccessibilityPage from "./pages/AccessibilityPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AccessibilityProvider>
        <AuthProvider>
          <DashboardLanguageProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/vault/share/:token" element={<SharedDocumentViewer />} />
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/jobs" element={<ProtectedRoute><JobsPage /></ProtectedRoute>} />
                <Route path="/schemes" element={<ProtectedRoute><SchemesPage /></ProtectedRoute>} />
                <Route path="/education" element={<ProtectedRoute><EducationPage /></ProtectedRoute>} />
                <Route path="/learn" element={<ProtectedRoute><LearnPage /></ProtectedRoute>} />
                <Route path="/eduspeak" element={<ProtectedRoute><EduSpeakPage /></ProtectedRoute>} />
                <Route path="/eduvault" element={<ProtectedRoute><EduVaultPage /></ProtectedRoute>} />
                <Route path="/edumentor" element={<ProtectedRoute><EduMentorPage /></ProtectedRoute>} />
                <Route path="/eduroadmap" element={<ProtectedRoute><EduRoadmapPage /></ProtectedRoute>} />
                <Route path="/nearby" element={<ProtectedRoute><NearbyPage /></ProtectedRoute>} />
                <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
                <Route path="/mentors" element={<ProtectedRoute><MentorsPage /></ProtectedRoute>} />
                <Route path="/performance" element={<ProtectedRoute><PerformancePage /></ProtectedRoute>} />
                <Route path="/achievements" element={<ProtectedRoute><PerformancePage /></ProtectedRoute>} />
                <Route path="/gamification" element={<ProtectedRoute><GamificationPage /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
                <Route path="/accessibility" element={<ProtectedRoute><AccessibilityPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <AIChatDialog />
              <HandGestureController />
            </BrowserRouter>
          </DashboardLanguageProvider>
        </AuthProvider>
      </AccessibilityProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;