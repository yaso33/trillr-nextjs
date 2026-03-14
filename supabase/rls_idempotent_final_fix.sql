
-- ----------------------------------------------------------------------
-- RLS Idempotent & Final Comprehensive Fix Script (v2)
-- ----------------------------------------------------------------------
-- This script performs a complete, final, and IDEMPOTENT reset of all RLS policies.
--
-- v2: Adds missing policies for the `message_reactions` table.
-- ----------------------------------------------------------------------

-- ----------------------------------------------------------------------
-- Part 1: Ultra-Comprehensive & Idempotent Cleanup
-- ----------------------------------------------------------------------

-- Drop all policies identified in the original screenshot (old names)
DROP POLICY IF EXISTS "channel_members_delete_own" ON public.channel_members;
DROP POLICY IF EXISTS "channel_members_insert_own" ON public.channel_members;
DROP POLICY IF EXISTS "channel_members_select_auth" ON public.channel_members;
DROP POLICY IF EXISTS "channel_members_select_members_of_own_channels" ON public.channel_members;
DROP POLICY IF EXISTS "channel_messages_delete_own" ON public.channel_messages;
DROP POLICY IF EXISTS "channel_messages_insert_members" ON public.channel_messages;
DROP POLICY IF EXISTS "channel_messages_insert_own" ON public.channel_messages;
DROP POLICY IF EXISTS "channel_messages_select_auth" ON public.channel_messages;
DROP POLICY IF EXISTS "channel_messages_select_members" ON public.channel_messages;
DROP POLICY IF EXISTS "channel_messages_update_own" ON public.channel_messages;
DROP POLICY IF EXISTS "channels_insert" ON public.channels;
DROP POLICY IF EXISTS "channels_manage_owner" ON public.channels;
DROP POLICY IF EXISTS "channels_select" ON public.channels;
DROP POLICY IF EXISTS "channels_select_auth" ON public.channels;
DROP POLICY IF EXISTS "channels_select_members_and_public" ON public.channels;
DROP POLICY IF EXISTS "comments_delete_own" ON public.comments;
DROP POLICY IF EXISTS "comments_insert_authenticated" ON public.comments;
DROP POLICY IF EXISTS "comments_update_own" ON public.comments;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.comments;
DROP POLICY IF EXISTS "communities_owner_all" ON public.communities;
DROP POLICY IF EXISTS "private_communities_members_select" ON public.communities;
DROP POLICY IF EXISTS "public_communities_select" ON public.communities;
DROP POLICY IF EXISTS "community_members_delete" ON public.community_members;
DROP POLICY IF EXISTS "community_members_insert" ON public.community_members;
DROP POLICY IF EXISTS "community_members_select" ON public.community_members;
DROP POLICY IF EXISTS "conversations_select_participant" ON public.conversations;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.follows;
DROP POLICY IF EXISTS "follows_delete_own" ON public.follows;
DROP POLICY IF EXISTS "follows_insert_own" ON public.follows;
DROP POLICY IF EXISTS "hashtags_select_auth" ON public.hashtags;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.likes;
DROP POLICY IF EXISTS "likes_delete_own" ON public.likes;
DROP POLICY IF EXISTS "likes_insert_own" ON public.likes;
DROP POLICY IF EXISTS "live_sessions_manage_own" ON public.live_sessions;
DROP POLICY IF EXISTS "live_sessions_select_auth" ON public.live_sessions;
DROP POLICY IF EXISTS "message_reactions_manage_own" ON public.message_reactions;
DROP POLICY IF EXISTS "message_reactions_select_auth" ON public.message_reactions;
DROP POLICY IF EXISTS "messages_insert_sender" ON public.messages;
DROP POLICY IF EXISTS "messages_select_participant" ON public.messages;
DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_authenticated" ON public.notifications;
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
DROP POLICY IF EXISTS "post_hashtags_select_auth" ON public.post_hashtags;
DROP POLICY IF EXISTS "post_reactions_delete_own" ON public.post_reactions;
DROP POLICY IF EXISTS "post_reactions_insert_own" ON public.post_reactions;
DROP POLICY IF EXISTS "post_reactions_select_auth" ON public.post_reactions;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.posts;
DROP POLICY IF EXISTS "posts_delete_own" ON public.posts;
DROP POLICY IF EXISTS "posts_insert_own" ON public.posts;
DROP POLICY IF EXISTS "posts_update_own" ON public.posts;
DROP POLICY IF EXISTS "Enable insert for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "saves_delete_own" ON public.saves;
DROP POLICY IF EXISTS "saves_insert_own" ON public.saves;
DROP POLICY IF EXISTS "saves_select_own" ON public.saves;
DROP POLICY IF EXISTS "stories_delete_own" ON public.stories;
DROP POLICY IF EXISTS "stories_insert_own" ON public.stories;
DROP POLICY IF EXISTS "stories_select_auth" ON public.stories;
DROP POLICY IF EXISTS "story_views_insert_own" ON public.story_views;
DROP POLICY IF EXISTS "story_views_select_auth" ON public.story_views;
DROP POLICY IF EXISTS "video_comments_delete_own" ON public.video_comments;
DROP POLICY IF EXISTS "video_comments_insert_own" ON public.video_comments;
DROP POLICY IF EXISTS "video_comments_select_auth" ON public.video_comments;
DROP POLICY IF EXISTS "video_comments_update_own" ON public.video_comments;
DROP POLICY IF EXISTS "video_likes_delete_own" ON public.video_likes;
DROP POLICY IF EXISTS "video_likes_insert_own" ON public.video_likes;
DROP POLICY IF EXISTS "video_likes_select_auth" ON public.video_likes;
DROP POLICY IF EXISTS "videos_delete_own" ON public.videos;
DROP POLICY IF EXISTS "videos_insert_own" ON public.videos;
DROP POLICY IF EXISTS "videos_select_auth" ON public.videos;
DROP POLICY IF EXISTS "videos_update_own" ON public.videos;
DROP POLICY IF EXISTS "conversations_update_participant" ON public.conversations;
DROP POLICY IF EXISTS "conversations_insert_authenticated" ON public.conversations;
DROP POLICY IF EXISTS "conversation_participants_select" ON public.conversation_participants;
DROP POLICY IF EXISTS "conversation_participants_insert" ON public.conversation_participants;
DROP POLICY IF EXISTS "community_members_owner_manage" ON public.community_members;

-- Drop all policies being created in Part 3 (new names) to ensure idempotency
DROP POLICY IF EXISTS "profiles_read_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "conversation_participants_access_own" ON public.conversation_participants;
DROP POLICY IF EXISTS "conversations_select_as_participant" ON public.conversations;
DROP POLICY IF EXISTS "messages_access_as_participant" ON public.messages;
DROP POLICY IF EXISTS "communities_select_public_or_member" ON public.communities;
DROP POLICY IF EXISTS "communities_manage_as_owner" ON public.communities;
DROP POLICY IF EXISTS "community_members_select_all" ON public.community_members;
DROP POLICY IF EXISTS "community_members_insert_self" ON public.community_members;
DROP POLICY IF EXISTS "community_members_delete_self" ON public.community_members;
DROP POLICY IF EXISTS "channels_select_for_public_or_members" ON public.channels;
DROP POLICY IF EXISTS "channels_manage_as_owner" ON public.channels;
DROP POLICY IF EXISTS "channel_members_select_if_member" ON public.channel_members;
DROP POLICY IF EXISTS "channel_members_insert_self" ON public.channel_members;
DROP POLICY IF EXISTS "channel_members_delete_self" ON public.channel_members;
DROP POLICY IF EXISTS "channel_messages_select_if_member" ON public.channel_messages;
DROP POLICY IF EXISTS "channel_messages_insert_if_member" ON public.channel_messages;
DROP POLICY IF EXISTS "channel_messages_update_own" ON public.channel_messages;
DROP POLICY IF EXISTS "channel_messages_delete_own" ON public.channel_messages;
DROP POLICY IF EXISTS "follows_select_all" ON public.follows;
DROP POLICY IF EXISTS "follows_insert_own" ON public.follows;
DROP POLICY IF EXISTS "follows_delete_own" ON public.follows;
DROP POLICY IF EXISTS "posts_select_all" ON public.posts;
DROP POLICY IF EXISTS "posts_insert_own" ON public.posts;
DROP POLICY IF EXISTS "posts_update_own" ON public.posts;
DROP POLICY IF EXISTS "posts_delete_own" ON public.posts;
DROP POLICY IF EXISTS "videos_select_all" ON public.videos;
DROP POLICY IF EXISTS "videos_insert_own" ON public.videos;
DROP POLICY IF EXISTS "videos_update_own" ON public.videos;
DROP POLICY IF EXISTS "videos_delete_own" ON public.videos;
DROP POLICY IF EXISTS "likes_select_all" ON public.likes;
DROP POLICY IF EXISTS "likes_manage_own" ON public.likes;
DROP POLICY IF EXISTS "comments_select_all" ON public.comments;
DROP POLICY IF EXISTS "comments_manage_own" ON public.comments;
DROP POLICY IF EXISTS "message_reactions_select_all" ON public.message_reactions;
DROP POLICY IF EXISTS "message_reactions_manage_own" ON public.message_reactions;

-- ----------------------------------------------------------------------
-- Part 2: Drop the now-unlocked helper functions
-- ----------------------------------------------------------------------

DROP FUNCTION IF EXISTS get_user_conversation_ids_array(uuid);
DROP FUNCTION IF EXISTS get_user_community_ids_array(uuid);

-- ----------------------------------------------------------------------
-- Part 3: Rebuild a Clean, Correct, and Comprehensive Set of Policies
-- ----------------------------------------------------------------------

-- --- Enable RLS on all tables ---
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- --- Table: profiles ---
CREATE POLICY "profiles_read_all" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- --- Table: conversations & messages (Direct Messages) ---
CREATE POLICY "conversation_participants_access_own" ON public.conversation_participants FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "conversations_select_as_participant" ON public.conversations FOR SELECT USING (id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()));
CREATE POLICY "messages_access_as_participant" ON public.messages FOR ALL USING (conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid())) WITH CHECK (sender_id = auth.uid());

-- --- Table: communities & community_members ---
CREATE POLICY "communities_select_public_or_member" ON public.communities FOR SELECT USING ((visibility = 'public') OR (id IN (SELECT community_id FROM public.community_members WHERE user_id = auth.uid())));
CREATE POLICY "communities_manage_as_owner" ON public.communities FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "community_members_select_all" ON public.community_members FOR SELECT USING (true);
CREATE POLICY "community_members_insert_self" ON public.community_members FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "community_members_delete_self" ON public.community_members FOR DELETE USING (user_id = auth.uid());

-- --- Table: channels & channel_messages (Community Messages) ---
CREATE POLICY "channels_select_for_public_or_members" ON public.channels FOR SELECT USING ((EXISTS (SELECT 1 FROM public.communities c WHERE c.id = channels.community_id AND c.visibility = 'public')) OR (community_id IN (SELECT cm.community_id FROM public.community_members cm WHERE cm.user_id = auth.uid())));
CREATE POLICY "channels_manage_as_owner" ON public.channels FOR ALL USING (community_id IN (SELECT id FROM public.communities WHERE owner_id = auth.uid()));
CREATE POLICY "channel_members_select_if_member" ON public.channel_members FOR SELECT USING (channel_id IN (SELECT channel_id FROM public.channel_members WHERE user_id = auth.uid()));
CREATE POLICY "channel_members_insert_self" ON public.channel_members FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "channel_members_delete_self" ON public.channel_members FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "channel_messages_select_if_member" ON public.channel_messages FOR SELECT USING (channel_id IN (SELECT channel_id FROM public.channel_members WHERE user_id = auth.uid()));
CREATE POLICY "channel_messages_insert_if_member" ON public.channel_messages FOR INSERT WITH CHECK (sender_id = auth.uid() AND channel_id IN (SELECT channel_id FROM public.channel_members WHERE user_id = auth.uid()));
CREATE POLICY "channel_messages_update_own" ON public.channel_messages FOR UPDATE USING (sender_id = auth.uid());
CREATE POLICY "channel_messages_delete_own" ON public.channel_messages FOR DELETE USING (sender_id = auth.uid());

-- --- Table: follows ---
CREATE POLICY "follows_select_all" ON public.follows FOR SELECT TO authenticated USING (true);
CREATE POLICY "follows_insert_own" ON public.follows FOR INSERT WITH CHECK (follower_id = auth.uid());
CREATE POLICY "follows_delete_own" ON public.follows FOR DELETE USING (follower_id = auth.uid());

-- --- Table: posts ---
CREATE POLICY "posts_select_all" ON public.posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "posts_insert_own" ON public.posts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "posts_update_own" ON public.posts FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "posts_delete_own" ON public.posts FOR DELETE USING (user_id = auth.uid());

-- --- Table: videos ---
CREATE POLICY "videos_select_all" ON public.videos FOR SELECT TO authenticated USING (true);
CREATE POLICY "videos_insert_own" ON public.videos FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "videos_update_own" ON public.videos FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "videos_delete_own" ON public.videos FOR DELETE USING (user_id = auth.uid());

-- --- Table: General Content (Likes, Comments, etc) ---
CREATE POLICY "likes_select_all" ON public.likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "likes_manage_own" ON public.likes FOR ALL USING (user_id = auth.uid());

CREATE POLICY "comments_select_all" ON public.comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "comments_manage_own" ON public.comments FOR ALL USING (user_id = auth.uid());

CREATE POLICY "message_reactions_select_all" ON public.message_reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "message_reactions_manage_own" ON public.message_reactions FOR ALL USING (user_id = auth.uid());

