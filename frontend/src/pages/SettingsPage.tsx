import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, Bell, Eye, LogOut, Accessibility, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const SettingsPage = () => {
  const { signOut } = useAuth();
  const { settings, update } = useAccessibility();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);

  const handleLogout = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <PageHeader
          icon={<Settings className="h-5 w-5 text-white" />}
          title="Settings"
          subtitle="Manage your account preferences, accessibility options, and notifications"
        />

        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-accent" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Push Notifications</Label>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
          </CardContent>
        </Card>

        {/* Quick Accessibility Toggles */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-accent" /> Accessibility (Quick Toggles)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>High Contrast Mode</Label>
                <p className="text-xs text-muted-foreground">Black &amp; white high-contrast theme</p>
              </div>
              <Switch
                checked={settings.highContrast}
                onCheckedChange={(v) => update({ highContrast: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Large Text</Label>
                <p className="text-xs text-muted-foreground">Increase font size to 112%</p>
              </div>
              <Switch
                checked={settings.textSize !== "normal"}
                onCheckedChange={(v) => update({ textSize: v ? "large" : "normal" })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Text-to-Speech</Label>
                <p className="text-xs text-muted-foreground">Auto-read selected text aloud</p>
              </div>
              <Switch
                checked={settings.ttsEnabled}
                onCheckedChange={(v) => update({ ttsEnabled: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Reduce Motion</Label>
                <p className="text-xs text-muted-foreground">Disable all animations</p>
              </div>
              <Switch
                checked={settings.reducedMotion}
                onCheckedChange={(v) => update({ reducedMotion: v })}
              />
            </div>

            {/* Link to full accessibility page */}
            <div
              className="mt-2 flex items-center justify-between rounded-xl border border-accent/30 bg-accent/5 p-3 cursor-pointer hover:bg-accent/10 transition-colors"
              onClick={() => navigate("/accessibility")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate("/accessibility"); }}
            >
              <div className="flex items-center gap-2">
                <Accessibility className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Full Accessibility Tools</p>
                  <p className="text-xs text-muted-foreground">Colour blind modes, dyslexia font, reading guide &amp; more</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-accent flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-destructive/20">
          <CardContent className="p-5">
            <Button variant="destructive" onClick={handleLogout} className="w-full">
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
