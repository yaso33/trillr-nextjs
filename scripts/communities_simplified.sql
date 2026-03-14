-- SIMPLIFIED COMMUNITY TABLES (No complex FK references)
-- Use this if you're having issues with the full schema

-- Create basic communities table
CREATE TABLE IF NOT EXISTS public.communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  visibility varchar DEFAULT 'public',
  owner_id text NOT NULL,  -- Changed from FK to simple text
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create channels table
CREATE TABLE IF NOT EXISTS public.channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL,
  name text NOT NULL,
  type varchar DEFAULT 'text',
  is_private boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create channel messages table
CREATE TABLE IF NOT EXISTS public.channel_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL,
  sender_id text NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create community members table
CREATE TABLE IF NOT EXISTS public.community_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL,
  user_id text NOT NULL,
  role varchar DEFAULT 'member',
  joined_at timestamptz DEFAULT now()
);

-- Create channel members table
CREATE TABLE IF NOT EXISTS public.channel_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL,
  user_id text NOT NULL,
  joined_at timestamptz DEFAULT now()
);

-- Create message reactions table
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid,
  channel_message_id uuid,
  user_id text NOT NULL,
  reaction varchar NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create live sessions table
CREATE TABLE IF NOT EXISTS public.live_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL,
  host_id text NOT NULL,
  title text,
  is_live boolean DEFAULT true,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_communities_owner_id ON public.communities(owner_id);
CREATE INDEX IF NOT EXISTS idx_communities_visibility ON public.communities(visibility);
CREATE INDEX IF NOT EXISTS idx_communities_created_at ON public.communities(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_channels_community_id ON public.channels(community_id);
CREATE INDEX IF NOT EXISTS idx_channels_created_at ON public.channels(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_channel_messages_channel_id ON public.channel_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_messages_sender_id ON public.channel_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_channel_messages_created_at ON public.channel_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_members_community_id ON public.community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user_id ON public.community_members(user_id);

CREATE INDEX IF NOT EXISTS idx_channel_members_channel_id ON public.channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_user_id ON public.channel_members(user_id);

CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_channel_message_id ON public.message_reactions(channel_message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON public.message_reactions(user_id);

CREATE INDEX IF NOT EXISTS idx_live_sessions_channel_id ON public.live_sessions(channel_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_host_id ON public.live_sessions(host_id);

-- Enable RLS for security
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;

-- Simple permissive policies for authenticated users
CREATE POLICY "all_authenticated" ON public.communities FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "all_authenticated" ON public.channels FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "all_authenticated" ON public.channel_messages FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "all_authenticated" ON public.community_members FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "all_authenticated" ON public.channel_members FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "all_authenticated" ON public.message_reactions FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "all_authenticated" ON public.live_sessions FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Grant permissions to authenticated users
GRANT ALL ON public.communities TO authenticated;
GRANT ALL ON public.channels TO authenticated;
GRANT ALL ON public.channel_messages TO authenticated;
GRANT ALL ON public.community_members TO authenticated;
GRANT ALL ON public.channel_members TO authenticated;
GRANT ALL ON public.message_reactions TO authenticated;
GRANT ALL ON public.live_sessions TO authenticated;

-- End of script
