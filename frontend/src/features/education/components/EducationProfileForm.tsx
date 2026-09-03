// frontend/src/features/education/components/EducationProfileForm.tsx
import React, { useState, useEffect } from "react";
import type { EducationProfile, EducationLevel, InstitutionType } from "../types/education.types";
import { EducationLevelSelector } from "./EducationLevelSelector";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Save, Sparkles, Building, BookOpen, MapPin, Globe, Phone } from "lucide-react";

interface Props {
  initialProfile: EducationProfile | null;
  onSave: (profile: Partial<EducationProfile>) => Promise<void>;
  onCancel?: () => void;
  saving?: boolean;
}

const INDIAN_STATES = [
  "Maharashtra", "Karnataka", "Delhi", "Tamil Nadu", "Telangana",
  "Gujarat", "Uttar Pradesh", "West Bengal", "Kerala", "Rajasthan",
  "Madhya Pradesh", "Punjab", "Haryana", "Bihar", "Andhra Pradesh", "Other"
];

const SCHOOL_BOARDS = ["CBSE", "ICSE", "State Board (Maharashtra / Other)", "IB (International Baccalaureate)", "Cambridge (IGCSE)", "Other"];
const SCHOOL_CLASSES = ["Primary (Class 1-5)", "Middle School (Class 6-8)", "Class 9", "Class 10 (Secondary)", "Class 11 (Senior Secondary)", "Class 12 (HSC)"];
const SCHOOL_STREAMS = ["General / All Subjects", "Science (PCM / PCB / PCMB)", "Commerce", "Arts / Humanities", "Vocational"];
const COLLEGE_DEGREES = ["Bachelor of Engineering (B.E. / B.Tech)", "Bachelor of Science (B.Sc / BCA)", "Bachelor of Commerce (B.Com)", "Bachelor of Arts (B.A.)", "Bachelor of Business Administration (BBA)", "Master of Technology (M.Tech)", "Master of Science (M.Sc / MCA)", "Master of Business Administration (MBA)", "PhD / Doctorate", "Diploma / Polytechnic", "Other"];
const MEDIUMS = ["English", "Hindi", "Marathi", "Tamil", "Telugu", "Kannada", "Gujarati", "Bengali", "Other"];

export const EducationProfileForm: React.FC<Props> = ({
  initialProfile,
  onSave,
  onCancel,
  saving = false,
}) => {
  const [level, setLevel] = useState<EducationLevel>(initialProfile?.educationLevel || "college");
  const [institutionName, setInstitutionName] = useState(initialProfile?.institutionName || "");
  const [institutionType, setInstitutionType] = useState<InstitutionType>(initialProfile?.institutionType || "College");
  const [boardOrUniversity, setBoardOrUniversity] = useState(initialProfile?.boardOrUniversity || "");
  const [medium, setMedium] = useState(initialProfile?.medium || "English");

  // School Specific
  const [classOrGrade, setClassOrGrade] = useState(initialProfile?.classOrGrade || "Class 12 (HSC)");
  const [stream, setStream] = useState(initialProfile?.stream || "Science (PCM / PCB / PCMB)");

  // College / University / Diploma Specific
  const [degree, setDegree] = useState(initialProfile?.degree || "Bachelor of Engineering (B.E. / B.Tech)");
  const [course, setCourse] = useState(initialProfile?.course || "Computer Engineering");
  const [branch, setBranch] = useState(initialProfile?.branch || "Computer Engineering");
  const [specialization, setSpecialization] = useState(initialProfile?.specialization || "AI & Software Systems");
  const [year, setYear] = useState(initialProfile?.year || "3");
  const [semester, setSemester] = useState(initialProfile?.semester || "6");
  const [academicYear, setAcademicYear] = useState(initialProfile?.academicYear || "2025-2026");

  // Location & Contact
  const [state, setState] = useState(initialProfile?.state || "Maharashtra");
  const [city, setCity] = useState(initialProfile?.city || "Pune");
  const [website, setWebsite] = useState(initialProfile?.website || "");
  const [contactInfo, setContactInfo] = useState(initialProfile?.contactInfo || "");

  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (initialProfile) {
      setLevel(initialProfile.educationLevel || "college");
      setInstitutionName(initialProfile.institutionName || "");
      setBoardOrUniversity(initialProfile.boardOrUniversity || "");
      setMedium(initialProfile.medium || "English");
      setClassOrGrade(initialProfile.classOrGrade || "");
      setStream(initialProfile.stream || "");
      setDegree(initialProfile.degree || "");
      setCourse(initialProfile.course || "");
      setBranch(initialProfile.branch || "");
      setSpecialization(initialProfile.specialization || "");
      setYear(initialProfile.year || "1");
      setSemester(initialProfile.semester || "1");
      setAcademicYear(initialProfile.academicYear || "2025-2026");
      setState(initialProfile.state || "Maharashtra");
      setCity(initialProfile.city || "Pune");
      setWebsite(initialProfile.website || "");
      setContactInfo(initialProfile.contactInfo || "");
    }
  }, [initialProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionName.trim()) {
      alert("Please enter your Institution Name");
      return;
    }

    const payload: Partial<EducationProfile> = {
      educationLevel: level,
      institutionName: institutionName.trim(),
      institutionType: level === "school" ? "School" : level === "university" ? "University" : level === "diploma" ? "Diploma Institute" : "College",
      boardOrUniversity: boardOrUniversity.trim() || (level === "school" ? "CBSE" : "State Technical University"),
      medium,
      state,
      city,
      website: website.trim(),
      contactInfo: contactInfo.trim(),
      academicYear,
    };

    if (level === "school") {
      payload.classOrGrade = classOrGrade;
      payload.stream = stream;
      payload.course = `Class ${classOrGrade}`;
      payload.branch = stream;
    } else {
      payload.degree = degree;
      payload.course = course.trim() || degree;
      payload.branch = branch.trim() || course.trim();
      payload.specialization = specialization.trim();
      payload.year = year;
      payload.semester = semester;
    }

    try {
      await onSave(payload);
      setFeedback("✓ Education profile saved & synced across Smart Education AI!");
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Level Selector */}
      <Card className="rounded-3xl border-border/70 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden">
        <CardHeader className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Step 1: Select Your Current Education Level
              </CardTitle>
              <CardDescription className="text-xs">
                Your academic tools, subjects, and AI tutor adapt dynamically to your selected level.
              </CardDescription>
            </div>
            {initialProfile?.eduId && (
              <Badge variant="outline" className="text-xs font-mono bg-primary/5 border-primary/20 text-primary">
                🆔 {initialProfile.eduId}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          <EducationLevelSelector value={level} onChange={setLevel} disabled={saving} />
        </CardContent>
      </Card>

      {/* 2. Institution & Academic Details */}
      <Card className="rounded-3xl border-border/70 bg-card/60 backdrop-blur-sm shadow-sm">
        <CardHeader className="p-6 pb-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Building className="h-4 w-4 text-primary" /> Step 2: Institution & Academic Details
          </CardTitle>
          <CardDescription className="text-xs">
            Enter your enrolled school, college, or university information.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Institution Name */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-foreground">
                {level === "school" ? "School Name *" : level === "university" ? "University Name *" : "College / Institute Name *"}
              </label>
              <Input
                placeholder={level === "school" ? "e.g. Kendriya Vidyalaya / Delhi Public School" : "e.g. Government College of Engineering"}
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                required
                className="rounded-xl text-xs font-medium"
              />
            </div>

            {/* Board / University */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                {level === "school" ? "School Board *" : "Affiliated University / Board *"}
              </label>
              {level === "school" ? (
                <select
                  value={boardOrUniversity}
                  onChange={(e) => setBoardOrUniversity(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-medium focus:ring-2 focus:ring-primary"
                >
                  {SCHOOL_BOARDS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              ) : (
                <Input
                  placeholder="e.g. Savitribai Phule Pune University / Mumbai University"
                  value={boardOrUniversity}
                  onChange={(e) => setBoardOrUniversity(e.target.value)}
                  className="rounded-xl text-xs font-medium"
                />
              )}
            </div>

            {/* Medium of Instruction */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Medium of Instruction</label>
              <select
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-medium focus:ring-2 focus:ring-primary"
              >
                {MEDIUMS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* DYNAMIC FIELDS FOR SCHOOL */}
            {level === "school" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Class / Grade *</label>
                  <select
                    value={classOrGrade}
                    onChange={(e) => setClassOrGrade(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-medium focus:ring-2 focus:ring-primary"
                  >
                    {SCHOOL_CLASSES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Stream (For Class 11-12)</label>
                  <select
                    value={stream}
                    onChange={(e) => setStream(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-medium focus:ring-2 focus:ring-primary"
                  >
                    {SCHOOL_STREAMS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* DYNAMIC FIELDS FOR COLLEGE / UNIVERSITY / DIPLOMA */}
            {level !== "school" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Degree / Award *</label>
                  <select
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-medium focus:ring-2 focus:ring-primary"
                  >
                    {COLLEGE_DEGREES.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Course / Major *</label>
                  <Input
                    placeholder="e.g. Computer Science / Mechanical Engineering / Economics"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="rounded-xl text-xs font-medium"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Branch / Specialization</label>
                  <Input
                    placeholder="e.g. Artificial Intelligence, Data Science, VLSI, Finance"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="rounded-xl text-xs font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Current Academic Year *</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-medium focus:ring-2 focus:ring-primary"
                  >
                    <option value="1">1st Year (Freshman)</option>
                    <option value="2">2nd Year (Sophomore)</option>
                    <option value="3">3rd Year (Junior)</option>
                    <option value="4">4th Year (Senior)</option>
                    <option value="5">5th Year (Integrated / Dual)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Current Semester *</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-medium focus:ring-2 focus:ring-primary"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sem) => (
                      <option key={sem} value={String(sem)}>Semester {sem}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Academic Session</label>
                  <Input
                    placeholder="e.g. 2025-2026"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="rounded-xl text-xs font-medium"
                  />
                </div>
              </>
            )}

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">State *</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-medium focus:ring-2 focus:ring-primary"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">City *</label>
              <Input
                placeholder="e.g. Pune / Mumbai / Bengaluru"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="rounded-xl text-xs font-medium"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Optional Institution Details */}
      <Card className="rounded-3xl border-border/70 bg-card/60 backdrop-blur-sm shadow-sm">
        <CardHeader className="p-6 pb-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" /> Step 3: Institution Web & Contact Details (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Institution Website</label>
              <Input
                placeholder="e.g. https://www.coep.org.in"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Department / Admin Contact Info</label>
              <Input
                placeholder="e.g. contact@college.edu / +91 20 25507000"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/70">
        <div>
          {feedback && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4" /> {feedback}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={saving}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={saving}
            className="rounded-xl gap-2 text-xs font-bold bg-primary text-primary-foreground shadow hover:shadow-md"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving Profile..." : "Save Education Profile"}
          </Button>
        </div>
      </div>
    </form>
  );
};
