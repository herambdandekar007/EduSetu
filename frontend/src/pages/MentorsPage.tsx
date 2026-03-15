import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Star, Users, Calendar, MessageSquare, Sparkles, UserCheck } from "lucide-react";

type Mentor = {
  id: string; user_id: string; name: string; expertise: string[];
  bio: string; company: string; role: string; availability: string;
  rating: number; sessions_count: number;
};

const MentorsPage = () => {
  const { user, profile } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [requestForm, setRequestForm] = useState({ message: "", career_goal: "" });

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    const q = query(collection(db, "mentor_profiles"), where("is_active", "==", true));
    const snap = await getDocs(q);
    setMentors(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Mentor[]);
    setLoading(false);
  };

  const sendRequest = async () => {
    if (!selectedMentor || !user) return;
    try {
      await addDoc(collection(db, "mentor_requests"), {
        mentee_id: user.uid,
        mentor_id: selectedMentor.id,
        message: requestForm.message,
        career_goal: requestForm.career_goal,
        created_at: new Date().toISOString(),
      });
      toast.success("Mentor request sent! They'll respond soon.");
    } catch {
      toast.error("Failed to send request");
      return;
    }
    setRequestDialogOpen(false);
    setRequestForm({ message: "", career_goal: "" });
  };

  const openRequest = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setRequestDialogOpen(true);
  };

  const availabilityColors: Record<string, string> = {
    available: "bg-success/10 text-success border-success/20",
    busy: "bg-warning/10 text-warning border-warning/20",
    unavailable: "bg-destructive/10 text-destructive border-destructive/20",
  };

  // Simple match score based on user skills vs mentor expertise
  const matchScore = (mentor: Mentor) => {
    if (!profile?.skills?.length || !mentor.expertise?.length) return 0;
    const userSkills = (profile.skills as string[]).map(s => s.toLowerCase());
    const matched = mentor.expertise.filter(e => userSkills.some(s => e.toLowerCase().includes(s) || s.includes(e.toLowerCase())));
    return Math.round((matched.length / Math.max(mentor.expertise.length, 1)) * 100);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          icon={<UserCheck className="h-5 w-5 text-white" />}
          title="AI Mentor Matching"
          subtitle="Connect with experienced mentors who understand your journey and can guide your career"
        >
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-2"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <Sparkles className="h-4 w-4 text-white/80" />
            <span className="text-sm font-medium text-white">AI-Powered</span>
          </div>
        </PageHeader>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground animate-pulse-soft">Finding mentors...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mentors.map((mentor, i) => {
              const score = matchScore(mentor);
              return (
                <motion.div key={mentor.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card className="border border-border hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-14 w-14 border-2 border-accent">
                          <AvatarFallback className="bg-accent text-accent-foreground font-bold text-lg">
                            {mentor.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-foreground">{mentor.name}</h3>
                            <Badge variant="outline" className={availabilityColors[mentor.availability] || ""}>
                              {mentor.availability}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{mentor.role} at {mentor.company}</p>
                          
                          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-warning text-warning" /> {mentor.rating}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" /> {mentor.sessions_count} sessions
                            </span>
                          </div>

                          {score > 0 && (
                            <div className="mt-2">
                              <Badge className="bg-match/10 text-match border-match/20" variant="outline">
                                {score}% Match
                              </Badge>
                            </div>
                          )}

                          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{mentor.bio}</p>

                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {mentor.expertise.map(e => (
                              <span key={e} className="text-xs bg-accent/5 text-accent px-2 py-0.5 rounded font-medium">{e}</span>
                            ))}
                          </div>

                          <Button
                            className="w-full mt-4 bg-accent text-accent-foreground hover:bg-accent/90"
                            onClick={() => openRequest(mentor)}
                            disabled={mentor.availability === "unavailable"}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" /> Request Mentorship
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Request Dialog */}
        <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Mentorship from {selectedMentor?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Your Career Goal</Label>
                <Input value={requestForm.career_goal} onChange={e => setRequestForm(p => ({ ...p, career_goal: e.target.value }))} placeholder="e.g. Become a Full Stack Developer" />
              </div>
              <div>
                <Label>Message to Mentor</Label>
                <Textarea rows={4} value={requestForm.message} onChange={e => setRequestForm(p => ({ ...p, message: e.target.value }))} placeholder="Tell them about yourself and why you'd like their guidance..." />
              </div>
              <Button onClick={sendRequest} className="w-full bg-accent text-accent-foreground">Send Request</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default MentorsPage;
