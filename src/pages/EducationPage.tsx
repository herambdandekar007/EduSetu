import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Star, Search, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const EducationPage = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("courses" as any).select("*").eq("is_active", true);
      setCourses((data as any[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Education & Courses</h1>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>
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
