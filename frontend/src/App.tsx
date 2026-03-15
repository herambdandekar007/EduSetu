import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AIChatDialog from "@/components/AIChatDialog";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import JobsPage from "./pages/JobsPage";
import SchemesPage from "./pages/SchemesPage";
import EducationPage from "./pages/EducationPage";
import NearbyPage from "./pages/NearbyPage";
import SettingsPage from "./pages/SettingsPage";
import CommunityPage from "./pages/CommunityPage";
import MentorsPage from "./pages/MentorsPage";
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
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/jobs" element={<ProtectedRoute><JobsPage /></ProtectedRoute>} />
              <Route path="/schemes" element={<ProtectedRoute><SchemesPage /></ProtectedRoute>} />
              <Route path="/education" element={<ProtectedRoute><EducationPage /></ProtectedRoute>} />
              <Route path="/nearby" element={<ProtectedRoute><NearbyPage /></ProtectedRoute>} />
              <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
              <Route path="/mentors" element={<ProtectedRoute><MentorsPage /></ProtectedRoute>} />
              <Route path="/achievements" element={<ProtectedRoute><GamificationPage /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
              <Route path="/accessibility" element={<ProtectedRoute><AccessibilityPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <AIChatDialog />
          </BrowserRouter>
        </AuthProvider>
      </AccessibilityProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
