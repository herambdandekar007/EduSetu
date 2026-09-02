// frontend/src/features/profile/components/EduPortfolio.tsx
// Pure Minimalist White & Grayscale EduPortfolio Section for SMART EDUCATION AI

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Briefcase,
  ExternalLink,
  Github,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Building,
  FileText,
  Layers,
} from "lucide-react";
import type { PortfolioItem, PortfolioItemType } from "../types/profile.types";
import { toast } from "sonner";

interface EduPortfolioProps {
  portfolio: PortfolioItem[];
  saving: boolean;
  onAddOrUpdatePortfolio: (item: Omit<PortfolioItem, "id"> & { id?: string }) => Promise<void>;
  onRemovePortfolio: (id: string) => Promise<void>;
}

const CATEGORY_TABS: { key: PortfolioItemType | "all"; label: string }[] = [
  { key: "all", label: "All Items" },
  { key: "project", label: "Projects" },
  { key: "hackathon", label: "Hackathons & Competitions" },
  { key: "internship", label: "Internships" },
  { key: "certificate", label: "Certificates" },
  { key: "research", label: "Research" },
  { key: "activity", label: "Activities" },
];

export const EduPortfolio: React.FC<EduPortfolioProps> = ({
  portfolio,
  onAddOrUpdatePortfolio,
  onRemovePortfolio,
}) => {
  const [activeFilter, setActiveFilter] = useState<PortfolioItemType | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

  const [formState, setFormState] = useState<{
    type: PortfolioItemType;
    title: string;
    description: string;
    organization: string;
    rankOrPosition: string;
    technologies: string;
    skillsUsed: string;
    githubUrl: string;
    liveDemoUrl: string;
    documentUrl: string;
    startDate: string;
    completionDate: string;
  }>({
    type: "project",
    title: "",
    description: "",
    organization: "",
    rankOrPosition: "",
    technologies: "",
    skillsUsed: "",
    githubUrl: "",
    liveDemoUrl: "",
    documentUrl: "",
    startDate: "",
    completionDate: "",
  });

  const handleOpenAdd = (defaultType: PortfolioItemType = "project") => {
    setEditingItem(null);
    setFormState({
      type: defaultType,
      title: "",
      description: "",
      organization: "",
      rankOrPosition: "",
      technologies: "",
      skillsUsed: "",
      githubUrl: "",
      liveDemoUrl: "",
      documentUrl: "",
      startDate: "",
      completionDate: "",
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormState({
      type: item.type,
      title: item.title,
      description: item.description,
      organization: item.organization || "",
      rankOrPosition: item.rankOrPosition || "",
      technologies: (item.technologies || []).join(", "),
      skillsUsed: (item.skillsUsed || []).join(", "),
      githubUrl: item.githubUrl || "",
      liveDemoUrl: item.liveDemoUrl || "",
      documentUrl: item.documentUrl || "",
      startDate: item.startDate || "",
      completionDate: item.completionDate || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title.trim()) {
      toast.error("Title is required.");
      return;
    }

    const techArray = formState.technologies
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const skillsArray = formState.skillsUsed
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    await onAddOrUpdatePortfolio({
      id: editingItem?.id,
      userId: editingItem?.userId || "",
      type: formState.type,
      title: formState.title.trim(),
      description: formState.description.trim(),
      organization: formState.organization.trim(),
      rankOrPosition: formState.rankOrPosition.trim(),
      technologies: techArray,
      skillsUsed: skillsArray,
      githubUrl: formState.githubUrl.trim(),
      liveDemoUrl: formState.liveDemoUrl.trim(),
      documentUrl: formState.documentUrl.trim(),
      startDate: formState.startDate,
      completionDate: formState.completionDate,
    });

    setDialogOpen(false);
  };

  const filteredItems = portfolio.filter((item) =>
    activeFilter === "all" ? true : item.type === activeFilter
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8 text-black shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-lg font-bold text-black flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-gray-700" />
            EduPortfolio
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Verified academic projects, hackathons, research publications, and certificates.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => handleOpenAdd(activeFilter === "all" ? "project" : activeFilter)}
          className="h-9 rounded-lg bg-black px-4 text-xs font-semibold text-white hover:bg-gray-800"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add Item
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-gray-100 pb-3">
        {CATEGORY_TABS.map((tab) => {
          const count =
            tab.key === "all"
              ? portfolio.length
              : portfolio.filter((p) => p.type === tab.key).length;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveFilter(tab.key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                activeFilter === tab.key
                  ? "bg-black text-white"
                  : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                  activeFilter === tab.key ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Portfolio Items List */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-lg border border-gray-200 bg-gray-50 p-5 transition-colors hover:border-gray-300 space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded border border-gray-300 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-700">
                      {item.type}
                    </span>
                    {item.rankOrPosition && (
                      <span className="text-xs font-semibold text-gray-900">
                        {item.rankOrPosition}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="text-gray-400 hover:text-black transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemovePortfolio(item.id)}
                      className="text-gray-400 hover:text-black transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-black">{item.title}</h3>

                {item.organization && (
                  <p className="text-xs text-gray-600 flex items-center gap-1.5">
                    <Building className="h-3 w-3 text-gray-500" />
                    {item.organization}
                  </p>
                )}

                <p className="text-xs text-gray-600 leading-relaxed">{item.description}</p>

                {/* Tech Chips */}
                {item.technologies && item.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.technologies.map((t, i) => (
                      <span
                        key={i}
                        className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Metadata & Links */}
              <div className="flex items-center justify-between border-t border-gray-200 pt-3 text-xs text-gray-500">
                <div className="flex items-center gap-3">
                  {item.githubUrl && (
                    <a
                      href={item.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-gray-700 hover:text-black font-medium"
                    >
                      <Github className="h-3.5 w-3.5" />
                      <span>Code</span>
                    </a>
                  )}
                  {item.liveDemoUrl && (
                    <a
                      href={item.liveDemoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-black hover:underline font-medium"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Live Demo</span>
                    </a>
                  )}
                  {item.documentUrl && (
                    <a
                      href={item.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-gray-700 hover:text-black font-medium"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Doc</span>
                    </a>
                  )}
                </div>

                {item.completionDate && (
                  <span className="text-[11px] font-mono">{item.completionDate}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-gray-500 space-y-2">
          <p className="text-xs">No portfolio entries added under this category.</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleOpenAdd(activeFilter === "all" ? "project" : activeFilter)}
            className="h-8 rounded-lg border-gray-300 bg-white text-xs text-black hover:bg-gray-100"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Entry
          </Button>
        </div>
      )}

      {/* Add / Edit Portfolio Item Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-xl border border-gray-200 bg-white p-6 text-black sm:max-w-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-black">
              {editingItem ? "Edit Portfolio Item" : "Add Portfolio Item"}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-600">
              Provide project, competition, or certificate details.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-3.5 mt-2 max-h-[75vh] overflow-y-auto pr-1">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-900">Item Type</Label>
              <Select
                value={formState.type}
                onValueChange={(val: PortfolioItemType) => setFormState({ ...formState, type: val })}
              >
                <SelectTrigger className="h-9 rounded-lg border-gray-300 bg-white text-xs text-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 text-black text-xs">
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="hackathon">Hackathon / Competition</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="activity">Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-900">Title</Label>
              <Input
                value={formState.title}
                onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                placeholder="Title or project name"
                required
                className="h-9 rounded-lg border-gray-300 bg-white text-xs text-black"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-900">Organization / Issuer</Label>
                <Input
                  value={formState.organization}
                  onChange={(e) => setFormState({ ...formState, organization: e.target.value })}
                  placeholder="AICTE / Ministry of Education"
                  className="h-9 rounded-lg border-gray-300 bg-white text-xs text-black"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-900">Role / Position</Label>
                <Input
                  value={formState.rankOrPosition}
                  onChange={(e) => setFormState({ ...formState, rankOrPosition: e.target.value })}
                  placeholder="Lead Developer / Finalist"
                  className="h-9 rounded-lg border-gray-300 bg-white text-xs text-black"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-900">Description</Label>
              <Textarea
                value={formState.description}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                rows={3}
                placeholder="Description of work, objectives, and achievements..."
                className="rounded-lg border-gray-300 bg-white text-xs text-black"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-900">Technologies / Skills (comma separated)</Label>
              <Input
                value={formState.technologies}
                onChange={(e) => setFormState({ ...formState, technologies: e.target.value })}
                placeholder="React, TypeScript, Python"
                className="h-9 rounded-lg border-gray-300 bg-white text-xs text-black"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-900">GitHub / Repository URL</Label>
                <Input
                  type="url"
                  value={formState.githubUrl}
                  onChange={(e) => setFormState({ ...formState, githubUrl: e.target.value })}
                  placeholder="https://github.com/..."
                  className="h-9 rounded-lg border-gray-300 bg-white text-xs text-black"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-900">Live Demo / Document URL</Label>
                <Input
                  type="url"
                  value={formState.liveDemoUrl}
                  onChange={(e) => setFormState({ ...formState, liveDemoUrl: e.target.value })}
                  placeholder="https://..."
                  className="h-9 rounded-lg border-gray-300 bg-white text-xs text-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-900">Start Date</Label>
                <Input
                  type="date"
                  value={formState.startDate}
                  onChange={(e) => setFormState({ ...formState, startDate: e.target.value })}
                  className="h-9 rounded-lg border-gray-300 bg-white text-xs text-black"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-900">Completion Date</Label>
                <Input
                  type="date"
                  value={formState.completionDate}
                  onChange={(e) => setFormState({ ...formState, completionDate: e.target.value })}
                  className="h-9 rounded-lg border-gray-300 bg-white text-xs text-black"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(false)}
                className="border-gray-300 bg-white text-black text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-black text-white text-xs font-semibold">
                {editingItem ? "Save" : "Add Item"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
