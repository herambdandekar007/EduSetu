// frontend/src/features/profile/components/PersonalProfile.tsx
// Pure Minimalist White & Grayscale Personal Profile Form for SMART EDUCATION AI

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X, Loader2, Check } from "lucide-react";
import type { StudentPersonalProfile } from "../types/profile.types";
import { toast } from "sonner";

interface PersonalProfileProps {
  profile: StudentPersonalProfile;
  saving: boolean;
  onSave: (data: Partial<StudentPersonalProfile>) => Promise<void>;
  onNavigateToTab?: (tab: string) => void;
}

const GENDER_OPTIONS = ["Male", "Female", "Non-Binary", "Other", "Prefer not to say"];
const INDIAN_STATES = [
  "Maharashtra",
  "Delhi",
  "Karnataka",
  "Tamil Nadu",
  "Telangana",
  "Gujarat",
  "Uttar Pradesh",
  "West Bengal",
  "Rajasthan",
  "Kerala",
  "Madhya Pradesh",
  "Punjab",
  "Haryana",
  "Bihar",
  "Odisha",
  "Andhra Pradesh",
  "Assam",
  "Other State / UT",
];

export const PersonalProfile: React.FC<PersonalProfileProps> = ({
  profile,
  saving,
  onSave,
}) => {
  const [formData, setFormData] = useState<StudentPersonalProfile>({ ...profile });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setFormData({ ...profile });
  }, [profile]);

  const handleCancel = () => {
    setFormData({ ...profile });
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      toast.error("Full name is required.");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email address is required.");
      return;
    }

    await onSave(formData);
    setIsEditing(false);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8 text-black shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-lg font-bold text-black flex items-center gap-2">
            <User className="h-5 w-5 text-gray-700" />
            Personal Profile
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your personal identification, contact information, and location details.
          </p>
        </div>

        <div>
          {!isEditing ? (
            <Button
              type="button"
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
              className="h-9 rounded-lg border-gray-300 bg-white text-xs font-semibold text-black hover:bg-gray-50"
            >
              <Edit className="mr-1.5 h-3.5 w-3.5 text-gray-600" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="h-9 rounded-lg border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                <X className="mr-1.5 h-3.5 w-3.5" />
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                size="sm"
                className="h-9 rounded-lg bg-black text-xs font-semibold text-white hover:bg-gray-800"
              >
                {saving ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                )}
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Fields */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-900">Full Name</Label>
              <Input
                value={formData.fullName || ""}
                disabled={!isEditing}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Student Full Name"
                required
                className="h-10 rounded-lg border-gray-300 bg-white text-xs text-black disabled:bg-gray-50 disabled:text-gray-700"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-900">Permanent EduID</Label>
              <Input
                value={formData.eduId || "EDU-IND-XXXXXXXX"}
                disabled
                className="h-10 rounded-lg border-gray-200 bg-gray-50 text-xs font-mono text-gray-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-900">Email Address</Label>
              <Input
                type="email"
                value={formData.email || ""}
                disabled={!isEditing}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@example.com"
                required
                className="h-10 rounded-lg border-gray-300 bg-white text-xs text-black disabled:bg-gray-50 disabled:text-gray-700"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-900">Mobile Number</Label>
              <Input
                type="tel"
                value={formData.phone || ""}
                disabled={!isEditing}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="h-10 rounded-lg border-gray-300 bg-white text-xs text-black disabled:bg-gray-50 disabled:text-gray-700"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-900">Date of Birth</Label>
              <Input
                type="date"
                value={formData.dateOfBirth || ""}
                disabled={!isEditing}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="h-10 rounded-lg border-gray-300 bg-white text-xs text-black disabled:bg-gray-50 disabled:text-gray-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-900">Gender</Label>
              <Select
                value={formData.gender || "Prefer not to say"}
                disabled={!isEditing}
                onValueChange={(val) => setFormData({ ...formData, gender: val })}
              >
                <SelectTrigger className="h-10 rounded-lg border-gray-300 bg-white text-xs text-black disabled:bg-gray-50 disabled:text-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 text-black text-xs">
                  {GENDER_OPTIONS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-900">Nationality</Label>
              <Input
                value={formData.nationality || "Indian"}
                disabled={!isEditing}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                className="h-10 rounded-lg border-gray-300 bg-white text-xs text-black disabled:bg-gray-50 disabled:text-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Location Details */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Address & Location
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-900">State</Label>
              <Select
                value={formData.state || "Maharashtra"}
                disabled={!isEditing}
                onValueChange={(val) => setFormData({ ...formData, state: val })}
              >
                <SelectTrigger className="h-10 rounded-lg border-gray-300 bg-white text-xs text-black disabled:bg-gray-50 disabled:text-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 text-black text-xs max-h-52">
                  {INDIAN_STATES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-900">City / District</Label>
              <Input
                value={formData.city || ""}
                disabled={!isEditing}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Pune"
                className="h-10 rounded-lg border-gray-300 bg-white text-xs text-black disabled:bg-gray-50 disabled:text-gray-700"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-900">Pincode</Label>
              <Input
                value={formData.pincode || ""}
                disabled={!isEditing}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="411016"
                className="h-10 rounded-lg border-gray-300 bg-white text-xs text-black disabled:bg-gray-50 disabled:text-gray-700"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-900">Residential Address</Label>
            <Input
              value={formData.address || ""}
              disabled={!isEditing}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Address line"
              className="h-10 rounded-lg border-gray-300 bg-white text-xs text-black disabled:bg-gray-50 disabled:text-gray-700"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            About & Bio
          </h3>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-900">Biography</Label>
            <Textarea
              value={formData.bio || ""}
              disabled={!isEditing}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              placeholder="Brief summary about your educational background and career interests..."
              className="rounded-lg border-gray-300 bg-white text-xs text-black disabled:bg-gray-50 disabled:text-gray-700"
            />
          </div>
        </div>

        {/* Bottom Save bar when editing */}
        {isEditing && (
          <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="h-9 rounded-lg border-gray-300 bg-white text-xs text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              size="sm"
              className="h-9 rounded-lg bg-black text-xs font-semibold text-white hover:bg-gray-800"
            >
              {saving ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="mr-1.5 h-3.5 w-3.5" />
              )}
              Save Changes
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};
