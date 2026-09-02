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
    : "AW";

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
              <span className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-800">
                <ShieldCheck className="h-3.5 w-3.5 text-gray-700" />
                Verified
              </span>
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

      {/* Avatar Change Dialog */}
      <Dialog open={avatarModalOpen} onOpenChange={setAvatarModalOpen}>
        <DialogContent className="rounded-xl border border-gray-200 bg-white p-6 text-black sm:max-w-md shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-black">Update Profile Photo</DialogTitle>
            <DialogDescription className="text-xs text-gray-600">
              Provide an image URL to update your educational identity avatar.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveAvatar} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-900">Image URL</Label>
              <Input
                type="url"
                value={avatarUrlInput}
                onChange={(e) => setAvatarUrlInput(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="h-10 rounded-lg border-gray-300 bg-white text-xs text-black focus-visible:border-black focus-visible:ring-black"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAvatarModalOpen(false)}
                className="border-gray-300 bg-white text-black hover:bg-gray-50 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={savingAvatar}
                size="sm"
                className="bg-black text-white hover:bg-gray-800 text-xs font-semibold"
              >
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
