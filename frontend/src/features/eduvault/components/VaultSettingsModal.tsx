import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Shield, Bell, HardDrive, Sparkles, Lock } from "lucide-react";
import type { VaultSettings } from "../types/eduvault.types";
import { getVaultSettings, updateVaultSettings } from "../services/settingsService";
import { toast } from "sonner";

export const VaultSettingsModal = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<VaultSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.uid && open) {
      getVaultSettings(user.uid).then(setSettings);
    }
  }, [user?.uid, open]);

  const handleToggle = (key: keyof VaultSettings, val: boolean) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: val });
  };

  const handleSave = async () => {
    if (!user?.uid || !settings) return;
    try {
      setSaving(true);
      await updateVaultSettings(user.uid, settings);
      toast.success("Vault preferences saved!");
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Settings className="h-5 w-5 text-primary" /> EduVault Settings & Security
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* AI Intelligence setting */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-card/60 border border-border/70">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Auto AI OCR & Metadata Extraction
              </div>
              <p className="text-[10px] text-muted-foreground">
                Automatically analyze new uploads with AI models
              </p>
            </div>
            <Switch
              checked={settings.autoAiIntelligence}
              onCheckedChange={(v) => handleToggle("autoAiIntelligence", v)}
            />
          </div>

          {/* Require Password by default */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-card/60 border border-border/70">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-primary" /> Default Password on Shared Links
              </div>
              <p className="text-[10px] text-muted-foreground">
                Enforce passcodes for all generated share URLs
              </p>
            </div>
            <Switch
              checked={settings.requirePasswordByDefault}
              onCheckedChange={(v) => handleToggle("requirePasswordByDefault", v)}
            />
          </div>

          {/* Activity audit logging */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-card/60 border border-border/70">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-primary" /> Audit Activity Recording
              </div>
              <p className="text-[10px] text-muted-foreground">
                Maintain immutable audit trail of document access
              </p>
            </div>
            <Switch
              checked={settings.activityLogging}
              onCheckedChange={(v) => handleToggle("activityLogging", v)}
            />
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-card/60 border border-border/70">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Bell className="h-3.5 w-3.5 text-primary" /> Vault Event Notifications
              </div>
              <p className="text-[10px] text-muted-foreground">
                Receive notifications on share access and verifications
              </p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(v) => handleToggle("emailNotifications", v)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="rounded-xl">
              {saving ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
