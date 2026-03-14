-- NEW TABLES ONLY FOR COMMUNITIES, CHANNELS, AND REACTIONS
-- Add these tables to your existing Supabase database

-- Communities
CREATE TABLE IF NOT EXISTS public.communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  visibility varchar DEFAULT 'public',
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_communities_owner_id ON public.communities(owner_id);

-- Community members
CREATE TABLE IF NOT EXISTS public.community_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role varchar DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  UNIQUE (community_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_community_members_user_id ON public.community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_community_id ON public.community_members(community_id);

-- Channels
CREATE TABLE IF NOT EXISTS public.channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  name text NOT NULL,
  type varchar DEFAULT 'text',
  created_at timestamptz DEFAULT now(),
  is_private boolean DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_channels_community_id ON public.channels(community_id);

-- Channel members
CREATE TABLE IF NOT EXISTS public.channel_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE (channel_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_channel_members_channel_id ON public.channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_user_id ON public.channel_members(user_id);

-- Channel messages
CREATE TABLE IF NOT EXISTS public.channel_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  read boolean DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_channel_messages_channel_id ON public.channel_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_messages_sender_id ON public.channel_messages(sender_id);

-- Message reactions (for both messages and channel_messages)
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES public.messages(id) ON DELETE CASCADE,
  channel_message_id uuid REFERENCES public.channel_messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction varchar NOT NULL,
  created_at timestamptz DEFAULT now(),
  CHECK (message_id IS NOT NULL OR channel_message_id IS NOT NULL),
  UNIQUE (message_id, channel_message_id, user_id, reaction)
);
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_channel_message_id ON public.message_reactions(channel_message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON public.message_reactions(user_id);

-- Live sessions for channels
CREATE TABLE IF NOT EXISTS public.live_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  host_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text,
  is_live boolean DEFAULT true,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_live_sessions_channel_id ON public.live_sessions(channel_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_host_id ON public.live_sessions(host_id);

-- End of new tables script
