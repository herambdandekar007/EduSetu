import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { MessageSquare, Plus, Heart, Clock, Pin, Filter, Users } from "lucide-react";

type ForumPost = {
  id: string; user_id: string; title: string; content: string;
  category: string; tags: string[]; likes_count: number;
  replies_count: number; is_pinned: boolean; created_at: string;
};

const categories = ["general", "jobs", "schemes", "education", "accessibility", "success-stories", "help"];

const CommunityPage = () => {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "general", tags: "" });
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => { fetchPosts(); }, [selectedCategory]);

  const fetchPosts = async () => {
    setLoading(true);
    let query = supabase.from("forum_posts").select("*").order("is_pinned", { ascending: false }).order("created_at", { ascending: false });
    if (selectedCategory !== "all") query = query.eq("category", selectedCategory);
    const { data } = await query;
    setPosts(data || []);
    setLoading(false);
  };

  const createPost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) { toast.error("Title and content required"); return; }
    const tags = newPost.tags.split(",").map(t => t.trim()).filter(Boolean);
    const { error } = await supabase.from("forum_posts").insert({
      user_id: user!.id, title: newPost.title, content: newPost.content,
      category: newPost.category, tags,
    });
    if (error) { toast.error("Failed to create post"); return; }
    toast.success("Post created!");
    setDialogOpen(false);
    setNewPost({ title: "", content: "", category: "general", tags: "" });
    fetchPosts();
  };

  const openPost = async (post: ForumPost) => {
    setSelectedPost(post);
    const { data } = await supabase.from("forum_replies").select("*").eq("post_id", post.id).order("created_at", { ascending: true });
    setReplies(data || []);
  };

  const submitReply = async () => {
    if (!replyContent.trim() || !selectedPost) return;
    const { error } = await supabase.from("forum_replies").insert({
      post_id: selectedPost.id, user_id: user!.id, content: replyContent,
    });
    if (error) { toast.error("Failed to post reply"); return; }
    toast.success("Reply posted!");
    setReplyContent("");
    openPost(selectedPost);
    fetchPosts();
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const categoryColors: Record<string, string> = {
    general: "bg-muted text-muted-foreground",
    jobs: "bg-accent/10 text-accent",
    schemes: "bg-warning/10 text-warning",
    education: "bg-info/10 text-info",
    accessibility: "bg-success/10 text-success",
    "success-stories": "bg-match/10 text-match",
    help: "bg-destructive/10 text-destructive",
  };

  if (selectedPost) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto space-y-4">
          <Button variant="ghost" onClick={() => setSelectedPost(null)} className="text-muted-foreground">
            ← Back to Community
          </Button>
          <Card className="border border-border">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <Avatar className="h-10 w-10"><AvatarFallback className="bg-accent text-accent-foreground text-sm">U</AvatarFallback></Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={categoryColors[selectedPost.category] || "bg-muted text-muted-foreground"}>
                      {selectedPost.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{timeAgo(selectedPost.created_at)}</span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{selectedPost.title}</h2>
                  <p className="text-foreground mt-3 whitespace-pre-wrap">{selectedPost.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <h3 className="font-semibold text-foreground">Replies ({replies.length})</h3>
          {replies.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border border-border">
                <CardContent className="p-4 flex gap-3">
                  <Avatar className="h-8 w-8"><AvatarFallback className="bg-muted text-muted-foreground text-xs">U</AvatarFallback></Avatar>
                  <div>
                    <p className="text-xs text-muted-foreground">{timeAgo(r.created_at)}</p>
                    <p className="text-sm text-foreground mt-1">{r.content}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          <Card className="border border-border">
            <CardContent className="p-4 flex gap-3">
              <Textarea placeholder="Write a reply..." value={replyContent} onChange={e => setReplyContent(e.target.value)} className="flex-1" />
              <Button onClick={submitReply} className="bg-accent text-accent-foreground self-end">Reply</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-accent" /> Community Forum
          </h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="h-4 w-4 mr-2" /> New Post
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create New Post</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Title</Label><Input value={newPost.title} onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))} placeholder="What's on your mind?" /></div>
                <div>
                  <Label>Category</Label>
                  <Select value={newPost.category} onValueChange={v => setNewPost(p => ({ ...p, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Content</Label><Textarea rows={5} value={newPost.content} onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))} /></div>
                <div><Label>Tags (comma-separated)</Label><Input value={newPost.tags} onChange={e => setNewPost(p => ({ ...p, tags: e.target.value }))} placeholder="e.g. jobs, react, help" /></div>
                <Button onClick={createPost} className="w-full bg-accent text-accent-foreground">Post</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <Badge
            className={`cursor-pointer ${selectedCategory === "all" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            onClick={() => setSelectedCategory("all")}
          >All</Badge>
          {categories.map(c => (
            <Badge
              key={c}
              className={`cursor-pointer capitalize ${selectedCategory === c ? "bg-accent text-accent-foreground" : categoryColors[c] + " hover:opacity-80"}`}
              onClick={() => setSelectedCategory(c)}
            >{c}</Badge>
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground animate-pulse-soft">Loading posts...</div>
        ) : posts.length === 0 ? (
          <Card className="border border-border"><CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No posts yet. Be the first to start a discussion!</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-3">
            {posts.map((post, i) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border border-border hover:shadow-md transition-shadow cursor-pointer" onClick={() => openPost(post)}>
                  <CardContent className="p-4 flex items-start gap-3">
                    <Avatar className="h-10 w-10"><AvatarFallback className="bg-accent/10 text-accent text-sm">U</AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {post.is_pinned && <Pin className="h-3 w-3 text-warning" />}
                        <Badge className={categoryColors[post.category] || "bg-muted text-muted-foreground"} variant="outline">
                          {post.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</span>
                      </div>
                      <h3 className="font-semibold text-foreground line-clamp-1">{post.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{post.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {post.likes_count}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {post.replies_count} replies</span>
                      </div>
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

export default CommunityPage;
