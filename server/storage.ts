import type {
  Channel,
  ChannelMessage,
  Community,
  CommunityMember,
  InsertUser,
  LiveSession,
  Message,
  MessageReaction,
  Post,
  PostReaction,
  User,
} from '@shared/schema'
import { type SupabaseClient, createClient } from '@supabase/supabase-js'
import { decrypt, encrypt, isEncrypted } from './lib/encryption'

export interface IStorage {
  getUser(id: string): Promise<User | undefined>
  getUserByUsername(username: string): Promise<User | undefined>
  createUser(user: InsertUser): Promise<User>
  getMessages(conversationId: string): Promise<Message[]>
  sendMessage(conversationId: string, senderId: string, content: string): Promise<Message>
  getOrCreateConversation(userId1: string, userId2: string): Promise<string>
  // Communities and channels
  createCommunity(
    ownerId: string,
    name: string,
    description?: string,
    visibility?: string
  ): Promise<Community>
  getCommunity(id: string): Promise<Community | undefined>
  listCommunitiesForUser(userId: string): Promise<Community[]>
  joinCommunity(communityId: string, userId: string, role?: string): Promise<CommunityMember>
  leaveCommunity(communityId: string, userId: string): Promise<void>
  createChannel(
    communityId: string,
    name: string,
    type?: string,
    isPrivate?: boolean
  ): Promise<Channel>
  getChannelsForCommunity(communityId: string): Promise<Channel[]>
  sendChannelMessage(channelId: string, senderId: string, content: string): Promise<ChannelMessage>
  getChannelMessages(channelId: string): Promise<ChannelMessage[]>
  getCommunityMembers(communityId: string): Promise<CommunityMember[]>
  getUserRoleInCommunity(communityId: string, userId: string): Promise<string | null>
  // Message reactions and status
  setMessageRead(messageId: string): Promise<void>
  toggleMessageReaction(
    messageId: string,
    userId: string,
    reaction: string,
    isChannelMessage?: boolean
  ): Promise<MessageReaction | null>
  createLiveSession(channelId: string, hostId: string, title?: string): Promise<LiveSession>
  endLiveSession(sessionId: string): Promise<void>
  // Search
  searchPublicCommunities(q?: string, page?: number, pageSize?: number): Promise<Community[]>
  // Posts
  getPosts(userId?: string, limit?: number): Promise<Post[]>
  createPost(userId: string, content: string, imageUrl?: string): Promise<Post>
  togglePostReaction(postId: string, userId: string, reaction: string): Promise<PostReaction | null>
  getPostReactions(postId: string): Promise<PostReaction[]>
}

// Initialize Supabase client with service role key
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || ''

let supabase: SupabaseClient | null = null

if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  console.log('✅ Supabase client initialized successfully')
  console.log(`Connected to: ${supabaseUrl.split('//')[1]?.split('.')[0]}`)
} else {
  console.error('❌ Supabase environment variables not configured!')
  console.error(`  - SUPABASE_URL: ${supabaseUrl ? '✓' : '✗'}`)
  console.error(`  - SUPABASE_SERVICE_KEY: ${supabaseServiceKey ? '✓' : '✗'}`)
}

export { supabase }

export class SupabaseStorage implements IStorage {
  public get supabase(): SupabaseClient {
    return this.checkSupabase()
  }

  private checkSupabase(): SupabaseClient {
    if (!supabase) {
      throw new Error(
        'Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.'
      )
    }
    return supabase
  }

  async initialize(): Promise<void> {
    try {
      const client = this.checkSupabase()

      // Create posts table if it doesn't exist
      const { error: postsError } = await client.from('posts').select('id').limit(1)
      if (postsError?.message?.includes('does not exist')) {
        console.log('Creating posts table...')
        const { error: createError } = await client.rpc('exec_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS public.posts (
              id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id uuid NOT NULL,
              content text NOT NULL,
              image_url text,
              likes_count integer DEFAULT 0,
              comments_count integer DEFAULT 0,
              created_at timestamptz DEFAULT now(),
              updated_at timestamptz DEFAULT now()
            );
            
            CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
            
            ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY IF NOT EXISTS "Posts are viewable by everyone" ON public.posts
              FOR SELECT USING (true);
            
            CREATE POLICY IF NOT EXISTS "Users can create posts" ON public.posts
              FOR INSERT WITH CHECK (true);
          `,
        })
        if (createError) {
          console.warn('Could not auto-create posts table:', createError)
        } else {
          console.log('✅ Posts table created successfully')
        }
      }
    } catch (error) {
      console.warn(
        'Database initialization warning:',
        error instanceof Error ? error.message : error
      )
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    try {
      const client = this.checkSupabase()
      const { data, error } = await client.from('profiles').select('*').eq('id', id).single()

      if (error) {
        console.error('Error fetching user:', error)
        return undefined
      }

      return data as User
    } catch (error) {
      console.error('Error in getUser:', error)
      return undefined
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const client = this.checkSupabase()
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (error) {
        console.error('Error fetching user by username:', error)
        return undefined
      }

      return data as User
    } catch (error) {
      console.error('Error in getUserByUsername:', error)
      return undefined
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const client = this.checkSupabase()
      const { data, error } = await client.from('profiles').insert([insertUser]).select().single()

      if (error) {
        throw new Error(`Failed to create user: ${error.message}`)
      }

      return data as User
    } catch (error) {
      console.error('Error in createUser:', error)
      throw error
    }
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const client = this.checkSupabase()
      const { data, error } = await client
        .from('messages')
        .select('*, profiles(username, full_name, avatar_url, is_verified)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching messages:', error)
        return []
      }

      const messages = (data as Message[]).map((msg) => ({
        ...msg,
        content: isEncrypted(msg.content) ? decrypt(msg.content) : msg.content,
      }))

      return messages
    } catch (error) {
      console.error('Error in getMessages:', error)
      return []
    }
  }

  async sendMessage(conversationId: string, senderId: string, content: string): Promise<Message> {
    try {
      const client = this.checkSupabase()
      const encryptedContent = encrypt(content)

      const { data, error } = await client
        .from('messages')
        .insert([
          {
            conversation_id: conversationId,
            sender_id: senderId,
            content: encryptedContent,
          },
        ])
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to send message: ${error.message}`)
      }

      return {
        ...data,
        content: content,
      } as Message
    } catch (error) {
      console.error('Error in sendMessage:', error)
      throw error
    }
  }

  async getOrCreateConversation(userId1: string, userId2: string): Promise<string> {
    try {
      const client = this.checkSupabase()

      // Check if conversation already exists
      const { data: existingConversation, error: checkError } = await client
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', userId1)

      if (checkError) throw checkError

      // Check if any of these conversations include userId2
      for (const { conversation_id } of existingConversation || []) {
        const { data: otherParticipant } = await client
          .from('conversation_participants')
          .select('*')
          .eq('conversation_id', conversation_id)
          .eq('user_id', userId2)

        if (otherParticipant && otherParticipant.length > 0) {
          return conversation_id
        }
      }

      // Create new conversation
      const { data: newConversation, error: createError } = await client
        .from('conversations')
        .insert([{}])
        .select()
        .single()

      if (createError) throw createError

      // Add participants
      await client.from('conversation_participants').insert([
        { conversation_id: newConversation.id, user_id: userId1 },
        { conversation_id: newConversation.id, user_id: userId2 },
      ])

      return newConversation.id
    } catch (error) {
      console.error('Error in getOrCreateConversation:', error)
      throw error
    }
  }

  // Communities and channels
  async createCommunity(
    ownerId: string,
    name: string,
    description = '',
    visibility = 'public'
  ): Promise<Community> {
    try {
      const client = this.checkSupabase()
      // Ensure unique community name (case-insensitive)
      const { data: existing } = await client
        .from('communities')
        .select('*')
        .ilike('name', name)
        .limit(1)

      if (existing && existing.length > 0) {
        throw new Error('Community name already exists')
      }

      const { data, error } = await client
        .from('communities')
        .insert([{ owner_id: ownerId, name, description, visibility }])
        .select()
        .single()

      if (error) throw error
      // Add owner as first member with role 'owner'
      try {
        await client
          .from('community_members')
          .insert([{ community_id: data.id, user_id: ownerId, role: 'owner' }])
      } catch (e) {
        console.warn('Failed to insert owner as community member:', e)
      }

      return data as Community
    } catch (error) {
      console.error('Error in createCommunity:', error)
      throw error
    }
  }

  async getCommunity(id: string): Promise<Community | undefined> {
    try {
      const client = this.checkSupabase()
      const { data, error } = await client.from('communities').select('*').eq('id', id).single()
      if (error) {
        console.error('Error fetching community:', error)
        return undefined
      }
      return data as Community
    } catch (error) {
      console.error('Error in getCommunity:', error)
      return undefined
    }
  }

  async listCommunitiesForUser(userId: string): Promise<Community[]> {
    try {
      const client = this.checkSupabase()
      const { data, error } = await client
        .from('community_members')
        .select('communities(*)')
        .eq('user_id', userId)
      if (error) {
        console.error('Error listing communities for user:', error)
        return []
      }
      return (data || []).map((r: { communities: Community }) => r.communities) as Community[]
    } catch (error) {
      console.error('Error in listCommunitiesForUser:', error)
      return []
    }
  }

  async joinCommunity(
    communityId: string,
    userId: string,
    role = 'member'
  ): Promise<CommunityMember> {
    try {
      const client = this.checkSupabase()
      // Prevent duplicate joins
      const { data: existing, error: selectError } = await client
        .from('community_members')
        .select('*')
        .eq('community_id', communityId)
        .eq('user_id', userId)
        .limit(1)

      if (selectError) throw selectError

      if (existing && existing.length > 0) {
        return existing[0] as CommunityMember
      }

      const { data, error } = await client
        .from('community_members')
        .insert([{ community_id: communityId, user_id: userId, role }])
        .select()
        .single()
      if (error) throw error
      return data as CommunityMember
    } catch (error) {
      console.error('Error in joinCommunity:', error)
      throw error
    }
  }

  async leaveCommunity(communityId: string, userId: string): Promise<void> {
    try {
      const client = this.checkSupabase()
      // First, check if the user is the owner
      const { data: community, error: fetchError } = await client
        .from('communities')
        .select('owner_id')
        .eq('id', communityId)
        .single()

      if (fetchError) throw fetchError

      if (community && community.owner_id === userId) {
        throw new Error('Community owner cannot leave the community.')
      }

      // If not the owner, proceed to delete the membership
      const { error: deleteError } = await client
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', userId)

      if (deleteError) throw deleteError
    } catch (error) {
      console.error('Error in leaveCommunity:', error)
      throw error
    }
  }

  async searchPublicCommunities(q = '', page = 1, pageSize = 20): Promise<Community[]> {
    try {
      const client = this.checkSupabase()
      const offset = (page - 1) * pageSize

      let query = client
        .from('communities')
        .select('*')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1)

      if (q && q.trim().length > 0) {
        const term = `%${q.trim()}%`
        query = client
          .from('communities')
          .select('*')
          .eq('visibility', 'public')
          .or(`name.ilike.${term},description.ilike.${term}`)
          .order('created_at', { ascending: false })
          .range(offset, offset + pageSize - 1)
      }

      const { data, error } = await query
      if (error) throw error
      return (data || []) as Community[]
    } catch (error) {
      console.error('Error in searchPublicCommunities:', error)
      return []
    }
  }

  async createChannel(
    communityId: string,
    name: string,
    type = 'text',
    isPrivate = false
  ): Promise<Channel> {
    try {
      const client = this.checkSupabase()
      const { data, error } = await client
        .from('channels')
        .insert([{ community_id: communityId, name, type, is_private: isPrivate }])
        .select()
        .single()
      if (error) throw error
      return data as Channel
    } catch (error) {
      console.error('Error in createChannel:', error)
      throw error
    }
  }

  async getChannelsForCommunity(communityId: string): Promise<Channel[]> {
    try {
      const client = this.checkSupabase()
      const { data, error } = await client
        .from('channels')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: true })
      if (error) {
        console.error('Error fetching channels:', error)
        return []
      }
      return data as Channel[]
    } catch (error) {
      console.error('Error in getChannelsForCommunity:', error)
      return []
    }
  }

  async getCommunityMembers(communityId: string): Promise<CommunityMember[]> {
    try {
      const client = this.checkSupabase()
      const { data, error } = await client
        .from('community_members')
        .select('*, profiles(username, full_name, avatar_url)')
        .eq('community_id', communityId)
        .order('joined_at', { ascending: true })
      if (error) {
        console.error('Error fetching community members:', error)
        return []
      }
      return data || []
    } catch (error) {
      console.error('Error in getCommunityMembers:', error)
      return []
    }
  }

  async getUserRoleInCommunity(communityId: string, userId: string): Promise<string | null> {
    try {
      const client = this.checkSupabase()
      const { data, error } = await client
        .from('community_members')
        .select('role')
        .eq('community_id', communityId)
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error fetching user role:', error)
        return null
      }

      return data ? data.role : null
    } catch (error) {
      console.error('Error in getUserRoleInCommunity:', error)
      return null
    }
  }

  async sendChannelMessage(
    channelId: string,
    senderId: string,
    content: string
  ): Promise<ChannelMessage> {
    try {
      const client = this.checkSupabase()
      const encryptedContent = encrypt(content)
      const { data, error } = await client
        .from('channel_messages')
        .insert([{ channel_id: channelId, sender_id: senderId, content: encryptedContent }])
        .select()
        .single()
      if (error) throw error
      return { ...data, content } as ChannelMessage
    } catch (error) {
      console.error('Error in sendChannelMessage:', error)
      throw error
    }
  }

  async getChannelMessages(channelId: string): Promise<ChannelMessage[]> {
    try {
      const client = this.checkSupabase()
      const { data, error } = await client
        .from('channel_messages')
        .select('*, profiles(username, full_name, avatar_url)')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })
      if (error) {
        console.error('Error fetching channel messages:', error)
        return []
      }
      const messages = (data as ChannelMessage[]).map((msg) => ({
        ...msg,
        content: isEncrypted(msg.content) ? decrypt(msg.content) : msg.content,
      }))
      return messages
    } catch (error) {
      console.error('Error in getChannelMessages:', error)
      return []
    }
  }

  async setMessageRead(messageId: string): Promise<void> {
    try {
      const client = this.checkSupabase()
      const { error } = await client.from('messages').update({ read: true }).eq('id', messageId)
      if (error) throw error
    } catch (error) {
      console.error('Error in setMessageRead:', error)
      throw error
    }
  }

  async markConversationRead(conversationId: string, userId: string): Promise<void> {
    try {
      const client = this.checkSupabase()
      const { error } = await client
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .eq('read', false)
      if (error) throw error
    } catch (error) {
      console.error('Error in markConversationRead:', error)
      throw error
    }
  }

  async toggleMessageReaction(
    messageId: string,
    userId: string,
    reaction: string,
    isChannelMessage = false
  ): Promise<MessageReaction | null> {
    try {
      const client = this.checkSupabase()
      // Check existing - support both message types
      const query = client
        .from('message_reactions')
        .select('*')
        .eq('user_id', userId)
        .eq('reaction', reaction)

      if (isChannelMessage) {
        query.eq('channel_message_id', messageId)
      } else {
        query.eq('message_id', messageId)
      }

      const { data: existing, error: selectError } = await query

      if (selectError) throw selectError

      if (existing && existing.length > 0) {
        // Remove
        const { error: delError } = await client
          .from('message_reactions')
          .delete()
          .eq('id', existing[0].id)
        if (delError) throw delError
        return null
      }

      // Insert - support both message types
      const reactionData: {
        user_id: string
        reaction: string
        channel_message_id?: string
        message_id?: string
      } = {
        user_id: userId,
        reaction,
      }
      if (isChannelMessage) {
        reactionData.channel_message_id = messageId
      } else {
        reactionData.message_id = messageId
      }

      const { data, error } = await client
        .from('message_reactions')
        .insert([reactionData])
        .select()
        .single()
      if (error) throw error
      return data as MessageReaction
    } catch (error) {
      console.error('Error in toggleMessageReaction:', error)
      throw error
    }
  }

  async createLiveSession(channelId: string, hostId: string, title = ''): Promise<LiveSession> {
    try {
      const client = this.checkSupabase()
      const { data, error } = await client
        .from('live_sessions')
        .insert([{ channel_id: channelId, host_id: hostId, title, is_live: true }])
        .select()
        .single()
      if (error) throw error
      return data as LiveSession
    } catch (error) {
      console.error('Error in createLiveSession:', error)
      throw error
    }
  }

  async endLiveSession(sessionId: string): Promise<void> {
    try {
      const client = this.checkSupabase()
      const { error } = await client
        .from('live_sessions')
        .update({ is_live: false, ended_at: new Date().toISOString() })
        .eq('id', sessionId)
      if (error) throw error
    } catch (error) {
      console.error('Error in endLiveSession:', error)
      throw error
    }
  }

  // Posts methods
  async getPosts(userId?: string, limit = 50): Promise<Post[]> {
    try {
      const client = this.checkSupabase()
      let query = client
        .from('posts')
        .select(
          `
          id,
          user_id,
          content,
          image_url,
          likes_count,
          comments_count,
          created_at,
          updated_at,
          profiles:user_id(
            id,
            username,
            full_name,
            avatar_url
          )
          `
        )
        .order('created_at', { ascending: false })
        .limit(limit)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query
      if (error) {
        console.log('Error fetching posts:', error.message)
        if (error.message?.includes('does not exist')) {
          console.log('Posts table does not exist yet, returning empty array')
          return []
        }
        throw error
      }
      return data as Post[]
    } catch (error) {
      console.error('Error in getPosts:', error)
      if (error instanceof Error && error.message.includes('does not exist')) {
        return []
      }
      throw error
    }
  }

  async createPost(userId: string, content: string, imageUrl?: string): Promise<Post> {
    try {
      const client = this.checkSupabase()

      if (!userId || !content?.trim()) {
        throw new Error('userId and content are required')
      }

      // Validate: user exists
      const { data: userExists, error: userCheckError } = await client
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single()

      if (userCheckError || !userExists) {
        console.warn(`Warning: Profile not found for user ${userId}`)
        // Create profile if needed
        const { error: createProfileError } = await client.from('profiles').insert([
          {
            id: userId,
            username: `user_${userId.slice(0, 8)}`,
            full_name: 'Anonymous User',
          },
        ])

        if (createProfileError) {
          console.warn('Could not create profile:', createProfileError.message)
        }
      }

      // Insert post
      const { data, error } = await client
        .from('posts')
        .insert([
          {
            user_id: userId,
            content: content.trim(),
            image_url: imageUrl || null,
            likes_count: 0,
            comments_count: 0,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error('Error creating post:', error)
        throw error
      }

      console.log('✅ Post created:', data?.id)
      return data as Post
    } catch (error) {
      console.error('Error in createPost:', error)
      throw error
    }
  }

  async togglePostReaction(
    postId: string,
    userId: string,
    reaction: string
  ): Promise<PostReaction | null> {
    try {
      const client = this.checkSupabase()

      // Check if reaction already exists
      const { data: existing, error: fetchError } = await client
        .from('post_reactions')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .eq('reaction', reaction)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        // If table doesn't exist, throw helpful error
        if (fetchError.message?.includes('relation "public.post_reactions" does not exist')) {
          throw new Error(
            'Post reactions table does not exist. Please create the post_reactions table in your database first.'
          )
        }
        throw fetchError
      }

      if (existing) {
        // Remove existing reaction
        const { error: deleteError } = await client
          .from('post_reactions')
          .delete()
          .eq('id', existing.id)
        if (deleteError) throw deleteError
        return null
      }
      // Add new reaction
      const { data, error } = await client
        .from('post_reactions')
        .insert([{ post_id: postId, user_id: userId, reaction }])
        .select()
        .single()
      if (error) {
        // If table doesn't exist, throw helpful error
        if (error.message?.includes('relation "public.post_reactions" does not exist')) {
          throw new Error(
            'Post reactions table does not exist. Please create the post_reactions table in your database first.'
          )
        }
        throw error
      }
      return data as PostReaction
    } catch (error) {
      console.error('Error in togglePostReaction:', error)
      throw error
    }
  }

  async getPostReactions(postId: string): Promise<PostReaction[]> {
    try {
      const client = this.checkSupabase()
      const { data, error } = await client
        .from('post_reactions')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false })
      if (error) {
        // If table doesn't exist, return empty array
        if (error.message?.includes('relation "public.post_reactions" does not exist')) {
          console.log('Post reactions table does not exist yet, returning empty array')
          return []
        }
        throw error
      }
      return data as PostReaction[]
    } catch (error) {
      console.error('Error in getPostReactions:', error)
      // If it's a table not found error, return empty array
      if (error instanceof Error && error.message?.includes('does not exist')) {
        return []
      }
      throw error
    }
  }
}

export const storage = new SupabaseStorage()

// Buzly Web App
// Owner: YA SO
// Date: 11-12-2025
