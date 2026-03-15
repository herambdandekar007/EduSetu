import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Star, Search, ExternalLink } from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const EducationPage = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      const q = query(collection(db, "courses"), where("isActive", "==", true));
      const snap = await getDocs(q);
      setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    fetchCourses();
  }, []);

  const filtered = courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          icon={<BookOpen className="h-5 w-5 text-white" />}
          title="Education & Courses"
          subtitle="Curated learning resources to close your skill gaps and advance your career"
        >
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <input
              aria-label="Search courses"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-xl border-0 pl-10 pr-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
              style={{ background: "rgba(255,255,255,0.1)" }}
            />
          </div>
        </PageHeader>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading courses...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filtered.map((course, i) => (
              <motion.div key={course.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border border-border hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 text-info">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <Badge className={course.is_free ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"}>
                        {course.is_free ? "FREE" : "PAID"}
                      </Badge>
                    </div>
                    <h3 className="text-base font-bold text-foreground">{course.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{course.provider} • {course.duration}</p>
                    <p className="text-sm text-muted-foreground">{course.lessons} Lessons</p>
                    <div className="flex items-center gap-1 mt-2 text-sm">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="font-medium text-foreground">{course.rating}</span>
                      <span className="text-muted-foreground">({course.reviews_count?.toLocaleString()} reviews)</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {course.skills_covered?.slice(0, 3).map((s: string) => (
                        <span key={s} className="text-xs bg-accent/5 text-accent px-2 py-0.5 rounded font-medium">{s}</span>
                      ))}
                    </div>
                    <div className="mt-auto pt-4">
                      <Button className="w-full bg-primary text-primary-foreground">Start Learning</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EducationPage;
