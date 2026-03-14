-- Add RLS policies for hashtags
ALTER TABLE hashtags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hashtags_select_all" ON hashtags FOR SELECT USING (true);

-- Add RLS policies for live_sessions
ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "live_sessions_select_all" ON live_sessions FOR SELECT USING (true);
CREATE POLICY "live_sessions_manage_own" ON live_sessions FOR ALL USING (auth.uid() = host_id);

-- Add RLS policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- Add RLS policies for post_hashtags
ALTER TABLE post_hashtags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "post_hashtags_select_all" ON post_hashtags FOR SELECT USING (true);

-- Add RLS policies for post_reactions
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "post_reactions_select_all" ON post_reactions FOR SELECT USING (true);
CREATE POLICY "post_reactions_manage_own" ON post_reactions FOR ALL USING (auth.uid() = user_id);

-- Add RLS policies for saves
ALTER TABLE saves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saves_select_own" ON saves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saves_manage_own" ON saves FOR ALL USING (auth.uid() = user_id);

-- Add RLS policies for stories
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stories_select_all" ON stories FOR SELECT USING (true);
CREATE POLICY "stories_manage_own" ON stories FOR ALL USING (auth.uid() = user_id);

-- Add RLS policies for story_views
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "story_views_select_own" ON story_views FOR SELECT USING (auth.uid() = user_id);

-- Add RLS policies for video_comments
ALTER TABLE video_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "video_comments_select_all" ON video_comments FOR SELECT USING (true);
CREATE POLICY "video_comments_manage_own" ON video_comments FOR ALL USING (auth.uid() = user_id);

-- Add RLS policies for video_likes
ALTER TABLE video_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "video_likes_select_all" ON video_likes FOR SELECT USING (true);
CREATE POLICY "video_likes_manage_own" ON video_likes FOR ALL USING (auth.uid() = user_id);