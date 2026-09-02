// frontend/src/features/education/components/SubjectManager.tsx
import React, { useState } from "react";
import type { EducationSubject } from "../types/education.types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Plus,
  Star,
  Trash2,
  Edit2,
  Search,
  ExternalLink,
  GraduationCap,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  subjects: EducationSubject[];
  onAddSubject: (subject: Omit<EducationSubject, "id" | "userId" | "eduId">) => Promise<any>;
  onUpdateSubject: (id: string, updates: Partial<EducationSubject>) => Promise<void>;
  onDeleteSubject: (id: string) => Promise<void>;
}

export const SubjectManager: React.FC<Props> = ({
  subjects,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [teacher, setTeacher] = useState("");
  const [semester, setSemester] = useState("6");
  const [credits, setCredits] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.subjectCode || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddSubject({
        name: name.trim(),
        subjectCode: code.trim() || `CS-${Math.floor(100 + Math.random() * 900)}`,
        teacher: teacher.trim() || "Course Faculty",
        educationLevel: "college",
        semester,
        credits: Number(credits) || 3,
        status: "Active",
        isFavorite: false,
        progress: 0,
      });
      setName("");
      setCode("");
      setTeacher("");
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-600" /> My Academic Subjects ({subjects.length})
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Subjects automatically synchronized with your current Education Profile and connected to the 📚 Learn section.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="rounded-2xl gap-1.5 text-xs font-bold bg-primary text-primary-foreground shadow"
          >
            <Plus className="h-4 w-4" /> Add Subject
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/learn")}
            className="rounded-2xl gap-1.5 text-xs border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
          >
            Open Learn LMS <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search subjects by name or course code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 rounded-2xl text-xs bg-card/60"
        />
      </div>

      {/* Subject Cards Grid */}
      {filtered.length === 0 ? (
        <Card className="rounded-3xl border-dashed border-2 border-border/80 bg-muted/20 text-center p-8">
          <CardContent className="space-y-3 p-0">
            <BookOpen className="h-10 w-10 text-muted-foreground mx-auto opacity-50" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-foreground">No subjects found</h4>
              <p className="text-xs text-muted-foreground">Add your currently enrolled semester subjects to start tracking progress.</p>
            </div>
            <Button size="sm" onClick={() => setShowAddModal(true)} className="rounded-xl text-xs">
              <Plus className="h-4 w-4 mr-1" /> Add Your First Subject
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((subject) => (
            <Card
              key={subject.id}
              className="rounded-3xl border-border/70 bg-card/60 backdrop-blur-sm hover:border-indigo-500/40 hover:shadow-md transition-all group"
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-bold bg-muted/40 text-foreground">
                        {subject.subjectCode || "CORE"}
                      </Badge>
                      {subject.semester && (
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          Semester {subject.semester}
                        </span>
                      )}
                      {subject.credits && (
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          • {subject.credits} Credits
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                      {subject.name}
                    </h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5" />
                      {subject.teacher || "Course Faculty"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onUpdateSubject(subject.id, { isFavorite: !subject.isFavorite })}
                    className={`p-2 rounded-xl border transition-all ${
                      subject.isFavorite
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                        : "border-border/60 text-muted-foreground/50 hover:text-amber-500"
                    }`}
                    title="Toggle Favorite Subject"
                  >
                    <Star className="h-4 w-4 fill-current" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted-foreground">Syllabus Progress</span>
                    <span className="font-bold text-foreground">{subject.progress ?? 70}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                      style={{ width: `${subject.progress ?? 70}%` }}
                    />
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteSubject(subject.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-500 rounded-lg"
                      title="Remove Subject"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => navigate("/learn")}
                    className="gap-1.5 rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                  >
                    <BookOpen className="h-3.5 w-3.5" /> Study in Learn
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-md rounded-3xl border-border bg-card shadow-2xl overflow-hidden">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" /> Add Enrolled Subject
              </CardTitle>
              <CardDescription className="text-xs">
                Add a new subject from your curriculum to sync with your AI tutor and notes.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleAdd} className="p-6 pt-3 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Subject Name *</label>
                <Input
                  placeholder="e.g. Distributed Operating Systems / Linear Algebra"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Course Code</label>
                  <Input
                    placeholder="e.g. CS-304"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Credits</label>
                  <Input
                    type="number"
                    min="1"
                    max="8"
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Teacher / Professor</label>
                  <Input
                    placeholder="e.g. Dr. A. K. Sharma"
                    value={teacher}
                    onChange={(e) => setTeacher(e.target.value)}
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-medium"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={String(s)}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl text-xs font-bold bg-primary text-primary-foreground"
                >
                  {isSubmitting ? "Adding..." : "Add Subject"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
