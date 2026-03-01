
-- ============================================
-- FORUM POSTS TABLE
-- ============================================
CREATE TABLE public.forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view posts" ON public.forum_posts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create posts" ON public.forum_posts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON public.forum_posts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON public.forum_posts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_forum_posts_updated_at
  BEFORE UPDATE ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- FORUM REPLIES TABLE
-- ============================================
CREATE TABLE public.forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view replies" ON public.forum_replies
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create replies" ON public.forum_replies
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own replies" ON public.forum_replies
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own replies" ON public.forum_replies
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_forum_replies_updated_at
  BEFORE UPDATE ON public.forum_replies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- GAMIFICATION TABLE
-- ============================================
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT DEFAULT '',
  points INTEGER DEFAULT 0,
  icon TEXT DEFAULT 'trophy',
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_type)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements" ON public.user_achievements
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "System can insert achievements" ON public.user_achievements
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Skill points table
CREATE TABLE public.user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  last_activity TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own points" ON public.user_points
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own points" ON public.user_points
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own points" ON public.user_points
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_user_points_updated_at
  BEFORE UPDATE ON public.user_points
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- MENTOR PROFILES TABLE
-- ============================================
CREATE TABLE public.mentor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  expertise TEXT[] DEFAULT '{}',
  bio TEXT DEFAULT '',
  company TEXT DEFAULT '',
  role TEXT DEFAULT '',
  availability TEXT DEFAULT 'available',
  rating NUMERIC DEFAULT 0,
  sessions_count INTEGER DEFAULT 0,
  avatar_url TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view mentors" ON public.mentor_profiles
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Mentors can update own profile" ON public.mentor_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ============================================
-- MENTOR REQUESTS TABLE
-- ============================================
CREATE TABLE public.mentor_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentee_id UUID NOT NULL,
  mentor_id UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  message TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  career_goal TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mentor_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own requests" ON public.mentor_requests
  FOR SELECT TO authenticated USING (auth.uid() = mentee_id OR auth.uid() = (SELECT user_id FROM public.mentor_profiles WHERE id = mentor_id));

CREATE POLICY "Users can create requests" ON public.mentor_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = mentee_id);

CREATE POLICY "Users can update own requests" ON public.mentor_requests
  FOR UPDATE TO authenticated USING (auth.uid() = mentee_id OR auth.uid() = (SELECT user_id FROM public.mentor_profiles WHERE id = mentor_id));

CREATE TRIGGER update_mentor_requests_updated_at
  BEFORE UPDATE ON public.mentor_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- UPDATE FORUM POST REPLY COUNT FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION public.increment_reply_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.forum_posts SET replies_count = replies_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_reply_insert
  AFTER INSERT ON public.forum_replies
  FOR EACH ROW EXECUTE FUNCTION public.increment_reply_count();

-- Admin policies for forum moderation
CREATE POLICY "Admins can delete any post" ON public.forum_posts
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update any post" ON public.forum_posts
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for managing content
CREATE POLICY "Admins can insert jobs" ON public.jobs
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update jobs" ON public.jobs
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete jobs" ON public.jobs
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert schemes" ON public.schemes
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update schemes" ON public.schemes
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete schemes" ON public.schemes
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert courses" ON public.courses
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update courses" ON public.courses
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete courses" ON public.courses
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Leaderboard: allow viewing all points
CREATE POLICY "Anyone can view leaderboard" ON public.user_points
  FOR SELECT TO authenticated USING (true);
