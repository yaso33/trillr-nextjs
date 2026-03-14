-- POLICIES, INDEXES, AND SECURITY FOR NEW TABLES
-- Apply this AFTER new_tables_only.sql

-- ============================================================================
-- 1. ENABLE RLS (Row Level Security) for all new tables
-- ============================================================================

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. POLICIES FOR COMMUNITIES
-- ============================================================================

-- Allow all authenticated users to select communities (basic RLS)
-- More granular control via application logic
CREATE POLICY "communities_select_authenticated"
  ON public.communities
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Community owner can create/update/delete their community
CREATE POLICY "communities_owner_all"
  ON public.communities
  FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Allow creation of communities by any authenticated user
CREATE POLICY "communities_insert_authenticated"
  ON public.communities
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id AND auth.role() = 'authenticated');

-- ============================================================================
-- 3. POLICIES FOR COMMUNITY MEMBERS
-- ============================================================================

-- Members can view their own community members list
CREATE POLICY "community_members_select"
  ON public.community_members
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can join communities (insert)
CREATE POLICY "community_members_insert"
  ON public.community_members
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.role() = 'authenticated');

-- Users can leave communities (delete own membership)
CREATE POLICY "community_members_delete"
  ON public.community_members
  FOR DELETE
  USING (auth.uid() = user_id);

-- Community owner can manage members
CREATE POLICY "community_members_owner_manage"
  ON public.community_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.communities c 
      WHERE c.id = community_members.community_id 
      AND c.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.communities c 
      WHERE c.id = community_members.community_id 
      AND c.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- 4. POLICIES FOR CHANNELS
-- ============================================================================

-- Allow authenticated users to view and create channels
CREATE POLICY "channels_select"
  ON public.channels
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Community members can create channels in their community
CREATE POLICY "channels_insert"
  ON public.channels
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- 5. POLICIES FOR CHANNEL MEMBERS
-- ============================================================================

-- Channel members can see other members in the channel
CREATE POLICY "channel_members_select"
  ON public.channel_members
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can join channels in their community
CREATE POLICY "channel_members_insert"
  ON public.channel_members
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.role() = 'authenticated');

-- Users can leave channels
CREATE POLICY "channel_members_delete"
  ON public.channel_members
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 6. POLICIES FOR CHANNEL MESSAGES
-- ============================================================================

-- Channel members can read messages
CREATE POLICY "channel_messages_select"
  ON public.channel_messages
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Channel members can send messages
CREATE POLICY "channel_messages_insert"
  ON public.channel_messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id 
    AND auth.role() = 'authenticated'
  );

-- Users can update their own messages
CREATE POLICY "channel_messages_update"
  ON public.channel_messages
  FOR UPDATE
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

-- Users can delete their own messages
CREATE POLICY "channel_messages_delete"
  ON public.channel_messages
  FOR DELETE
  USING (auth.uid() = sender_id);

-- ============================================================================
-- 7. POLICIES FOR MESSAGE REACTIONS
-- ============================================================================

-- Users can see and add reactions to messages they can see
CREATE POLICY "message_reactions_select"
  ON public.message_reactions
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can add reactions to messages they can see
CREATE POLICY "message_reactions_insert"
  ON public.message_reactions
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND auth.role() = 'authenticated'
  );

-- Users can delete their own reactions
CREATE POLICY "message_reactions_delete"
  ON public.message_reactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 8. POLICIES FOR LIVE SESSIONS
-- ============================================================================

-- Channel members can view live sessions in their channels
CREATE POLICY "live_sessions_select"
  ON public.live_sessions
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Channel members can start live sessions
CREATE POLICY "live_sessions_insert"
  ON public.live_sessions
  FOR INSERT
  WITH CHECK (
    auth.uid() = host_id 
    AND auth.role() = 'authenticated'
  );

-- Live session hosts can update their sessions
CREATE POLICY "live_sessions_update"
  ON public.live_sessions
  FOR UPDATE
  USING (auth.uid() = host_id)
  WITH CHECK (auth.uid() = host_id);

-- ============================================================================
-- 9. ADDITIONAL INDEXES FOR PERFORMANCE
-- ============================================================================

-- Communities indexes
CREATE INDEX IF NOT EXISTS idx_communities_visibility ON public.communities(visibility);
CREATE INDEX IF NOT EXISTS idx_communities_created_at ON public.communities(created_at DESC);

-- Community members indexes
CREATE INDEX IF NOT EXISTS idx_community_members_created_at ON public.community_members(joined_at DESC);

-- Channels indexes
CREATE INDEX IF NOT EXISTS idx_channels_name ON public.channels(name);
CREATE INDEX IF NOT EXISTS idx_channels_type ON public.channels(type);
CREATE INDEX IF NOT EXISTS idx_channels_created_at ON public.channels(created_at DESC);

-- Channel members indexes
CREATE INDEX IF NOT EXISTS idx_channel_members_created_at ON public.channel_members(joined_at DESC);

-- Channel messages indexes
CREATE INDEX IF NOT EXISTS idx_channel_messages_created_at ON public.channel_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_channel_messages_read ON public.channel_messages(read) WHERE read = false;

-- Message reactions indexes
CREATE INDEX IF NOT EXISTS idx_message_reactions_created_at ON public.message_reactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_reactions_reaction ON public.message_reactions(reaction);

-- Live sessions indexes
CREATE INDEX IF NOT EXISTS idx_live_sessions_is_live ON public.live_sessions(is_live) WHERE is_live = true;
CREATE INDEX IF NOT EXISTS idx_live_sessions_started_at ON public.live_sessions(started_at DESC);

-- ============================================================================
-- 10. VIEWS FOR COMMON QUERIES (Optional)
-- ============================================================================

-- View: Community statistics
CREATE OR REPLACE VIEW public.community_stats AS
SELECT 
  c.id,
  c.name,
  COUNT(DISTINCT cm.user_id) as member_count,
  COUNT(DISTINCT ch.id) as channel_count,
  c.created_at
FROM public.communities c
LEFT JOIN public.community_members cm ON c.id = cm.community_id
LEFT JOIN public.channels ch ON c.id = ch.community_id
GROUP BY c.id, c.name, c.created_at;

-- View: Channel activity
CREATE OR REPLACE VIEW public.channel_activity AS
SELECT 
  ch.id,
  ch.name,
  ch.community_id,
  COUNT(DISTINCT cmsg.id) as message_count,
  COUNT(DISTINCT cmsg.sender_id) as unique_senders,
  MAX(cmsg.created_at) as last_message_at
FROM public.channels ch
LEFT JOIN public.channel_messages cmsg ON ch.id = cmsg.channel_id
GROUP BY ch.id, ch.name, ch.community_id;

-- ============================================================================
-- 11. GRANTS (if using Supabase Auth)
-- ============================================================================

-- Grant read access to authenticated users (RLS will handle row-level access)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.communities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.channels TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.channel_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.channel_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.message_reactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.live_sessions TO authenticated;

-- End of policies and security script
