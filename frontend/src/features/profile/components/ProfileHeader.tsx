// frontend/src/features/profile/components/ProfileHeader.tsx
// Pure Minimalist White & Grayscale Profile Header for SMART EDUCATION AI

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Copy,
  Check,
  Camera,
  Edit,
  Mail,
  Phone,
  MapPin,
  Building2,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import type { StudentPersonalProfile, EducationDetails } from "../types/profile.types";
import { toast } from "sonner";

interface ProfileHeaderProps {
  profile: StudentPersonalProfile;
  education?: EducationDetails | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onUpdateAvatar?: (url: string) => Promise<void>;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  education,
  activeTab,
  onTabChange,
  onUpdateAvatar,
}) => {
  const [copied, setCopied] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [avatarUrlInput, setAvatarUrlInput] = useState(profile.avatarUrl || profile.photoURL || "");
  const [savingAvatar, setSavingAvatar] = useState(false);

  const handleCopyEduId = async () => {
    if (!profile.eduId) return;
    try {
      await navigator.clipboard.writeText(profile.eduId);
      setCopied(true);
      toast.success("EduID copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy EduID");
    }
  };

  const handleSaveAvatar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateAvatar) return;
    setSavingAvatar(true);
    try {
      await onUpdateAvatar(avatarUrlInput);
      setAvatarModalOpen(false);
    } finally {
      setSavingAvatar(false);
    }
  };

  const initials = profile.fullName
    ? profile.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "ST";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8 text-black shadow-sm">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        {/* Left: Avatar & Identity */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative shrink-0">
            <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full border border-gray-300 bg-gray-50 overflow-hidden text-gray-900 font-bold text-xl">
              {profile.avatarUrl || profile.photoURL ? (
                <img
                  src={profile.avatarUrl || profile.photoURL}
                  alt={profile.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            {/* Photo update button */}
            <button
              type="button"
              onClick={() => setAvatarModalOpen(true)}
              title="Update profile photo"
              className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:text-black hover:bg-gray-100 shadow-sm transition-colors"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-black">
                {profile.fullName || "Student Name"}
              </h1>
              {profile.verifiedStatus ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Unverified
                </span>
              )}
            </div>

            {/* EduID line */}
            <div className="flex items-center gap-2 font-mono text-xs text-gray-700 font-semibold">
              <span>{profile.eduId || "EDU-IND-XXXXXXXX"}</span>
              <button
                type="button"
                onClick={handleCopyEduId}
                title="Copy EduID"
                className="text-gray-500 hover:text-black transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-black" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Metadata Row */}
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-gray-600 pt-1">
              {profile.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-gray-500" />
                  {profile.email}
                </span>
              )}
              {profile.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-gray-500" />
                  {profile.phone}
                </span>
              )}
              {(profile.city || profile.state) && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-gray-500" />
                  {[profile.city, profile.state].filter(Boolean).join(", ")}
                </span>
              )}
            </div>

            {/* Institution / Academic */}
            {(education?.institutionName || education?.collegeName) && (
              <div className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
                <Building2 className="h-3.5 w-3.5 text-gray-500" />
                <span>{education.institutionName || education.collegeName}</span>
                {education.degree && (
                  <span className="text-gray-500">· {education.degree}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          <Button
            type="button"
            onClick={() => onTabChange("personal")}
            className="h-9 rounded-lg border border-black bg-black px-4 text-xs font-semibold text-white hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Edit className="mr-1.5 h-3.5 w-3.5" />
            <span>Edit Profile</span>
          </Button>
        </div>
      </div>

      {/* Avatar Change Dialog with File Upload, Presets & URL */}
      <Dialog open={avatarModalOpen} onOpenChange={setAvatarModalOpen}>
        <DialogContent className="rounded-2xl border border-gray-200 bg-white p-6 text-black sm:max-w-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-black flex items-center gap-2">
              <Camera className="h-5 w-5 text-gray-700" />
              Update Profile Photo
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Upload an image from your device, choose an avatar, or enter a photo URL.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            {/* Live Circular Preview */}
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 border border-gray-200">
              <div className="h-24 w-24 rounded-full border-2 border-gray-300 overflow-hidden shadow-inner flex items-center justify-center bg-white">
                {avatarUrlInput ? (
                  <img src={avatarUrlInput} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-gray-400" />
                )}
              </div>
              <span className="text-[11px] font-medium text-gray-500 mt-2">Live Photo Preview</span>
            </div>

            {/* 1. Device File Upload Zone */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-900">Upload from Device</Label>
              <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/70 p-4 hover:border-black hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (!file.type.startsWith("image/")) {
                      toast.error("Please upload an image file (JPG, PNG, WebP).");
                      return;
                    }
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error("File size must be under 5MB.");
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                      const dataUrl = evt.target?.result as string;
                      if (dataUrl) {
                        setAvatarUrlInput(dataUrl);
                        toast.success("Image selected! Click Save to apply.");
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="hidden"
                />
                <Camera className="h-6 w-6 text-gray-500 mb-1" />
                <span className="text-xs font-semibold text-gray-800">
                  Click to browse from your computer or phone
                </span>
                <span className="text-[10px] text-gray-500 mt-0.5">PNG, JPG, WebP up to 5MB</span>
              </label>
            </div>

            {/* 2. Choose from Preset Student Avatars */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-900">Or Choose a Student Avatar</Label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
                  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
                  "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80",
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrlInput(preset)}
                    className={`h-11 w-11 shrink-0 rounded-full border-2 overflow-hidden transition-all ${
                      avatarUrlInput === preset
                        ? "border-black scale-105 shadow-sm"
                        : "border-gray-200 opacity-70 hover:opacity-100 hover:border-gray-400"
                    }`}
                  >
                    <img src={preset} alt={`Avatar ${idx + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Image URL Input */}
            <div className="space-y-1.5 pt-1 border-t border-gray-100">
              <Label className="text-xs font-semibold text-gray-700">Or Image URL</Label>
              <Input
                type="url"
                value={avatarUrlInput.startsWith("data:") ? "" : avatarUrlInput}
                onChange={(e) => setAvatarUrlInput(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="h-9 rounded-lg border-gray-300 bg-white text-xs text-black focus-visible:border-black"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            {avatarUrlInput && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setAvatarUrlInput("")}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              >
                Remove Photo
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAvatarModalOpen(false)}
                className="border-gray-300 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={savingAvatar}
                onClick={handleSaveAvatar}
                size="sm"
                className="bg-black text-white hover:bg-gray-800 text-xs font-semibold px-4"
              >
                {savingAvatar ? "Saving..." : "Save Photo"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
