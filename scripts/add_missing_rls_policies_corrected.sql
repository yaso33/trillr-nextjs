-- Add RLS policies for hashtags
ALTER TABLE public.hashtags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hashtags_select_all" ON public.hashtags FOR SELECT USING (true);

-- Add RLS policies for live_sessions
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "live_sessions_select_all" ON public.live_sessions FOR SELECT USING (true);
CREATE POLICY "live_sessions_manage_own" ON public.live_sessions FOR ALL USING (auth.uid() = host_id);

-- Add RLS policies for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_delete_own" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- Add RLS policies for post_hashtags
ALTER TABLE public.post_hashtags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "post_hashtags_select_all" ON public.post_hashtags FOR SELECT USING (true);

-- Add RLS policies for post_reactions
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "post_reactions_select_all" ON public.post_reactions FOR SELECT USING (true);
CREATE POLICY "post_reactions_manage_own" ON public.post_reactions FOR ALL USING (auth.uid() = user_id);

-- Add RLS policies for saves
ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saves_select_own" ON public.saves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saves_manage_own" ON public.saves FOR ALL USING (auth.uid() = user_id);

-- Add RLS policies for stories
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stories_select_all" ON public.stories FOR SELECT USING (true);
CREATE POLICY "stories_manage_own" ON public.stories FOR ALL USING (auth.uid() = user_id);

-- Add RLS policies for story_views
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "story_views_select" ON public.story_views FOR SELECT USING (
  auth.uid() = viewer_id OR
  auth.uid() = (SELECT user_id FROM public.stories WHERE id = story_id)
);

-- Add RLS policies for video_comments
ALTER TABLE public.video_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "video_comments_select_all" ON public.video_comments FOR SELECT USING (true);
CREATE POLICY "video_comments_manage_own" ON public.video_comments FOR ALL USING (auth.uid() = user_id);

-- Add RLS policies for video_likes
ALTER TABLE public.video_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "video_likes_select_all" ON public.video_likes FOR SELECT USING (true);
CREATE POLICY "video_likes_manage_own" ON public.video_likes FOR ALL USING (auth.uid() = user_id);
