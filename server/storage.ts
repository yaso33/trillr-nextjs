
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
} from '@shared/schema';
import { type SupabaseClient, createClient } from '@supabase/supabase-js';
import { decrypt, encrypt, isEncrypted } from './lib/encryption';

// Initialize Supabase client with service role key
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  console.log('✅ Supabase client initialized successfully');
  console.log(`Connected to: ${supabaseUrl.split('//')[1]?.split('.')[0]}`);
} else {
  console.error('❌ Supabase environment variables not configured!');
  console.error(`  - SUPABASE_URL: ${supabaseUrl ? '✓' : '✗'}`);
  console.error(`  - SUPABASE_SERVICE_KEY: ${supabaseServiceKey ? '✓' : '✗'}`);
}

export { supabase };

export class SupabaseStorage {
  private checkSupabase(): SupabaseClient {
    if (!supabase) {
      throw new Error(
        'Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.'
      );
    }
    return supabase;
  }

  async getUser(id: string): Promise<User | undefined> {
    try {
      const client = this.checkSupabase();
      const { data, error } = await client.from('users').select('*').eq('id', id).single();
      if (error) {
        console.error('Error fetching user:', error);
        return undefined;
      }
      return data as User;
    } catch (error) {
      console.error('Error in getUser:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const client = this.checkSupabase();
      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('username', username)
        .single();
      if (error) {
        console.error('Error fetching user by username:', error);
        return undefined;
      }
      return data as User;
    } catch (error) {
      console.error('Error in getUserByUsername:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const client = this.checkSupabase();
      const { data, error } = await client.from('users').insert([insertUser]).select().single();
      if (error) {
        throw new Error(`Failed to create user: ${error.message}`);
      }
      return data as User;
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const client = this.checkSupabase();
      const { data, error } = await client
        .from('messages')
        .select('*, author:author_id(username, name)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }
      return (data as any[]).map((msg) => ({
        ...msg,
        content: isEncrypted(msg.content) ? decrypt(msg.content) : msg.content,
      }));
    } catch (error) {
      console.error('Error in getMessages:', error);
      return [];
    }
  }

  async sendMessage(conversationId: string, authorId: string, content: string): Promise<Message> {
    try {
      const client = this.checkSupabase();
      const encryptedContent = encrypt(content);
      const { data, error } = await client
        .from('messages')
        .insert([
          {
            conversation_id: conversationId,
            author_id: authorId,
            content: encryptedContent,
          },
        ])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to send message: ${error.message}`);
      }
      return {
        ...data,
        content: content,
      } as Message;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw error;
    }
  }

  async getOrCreateConversation(userId1: string, userId2: string): Promise<string> {
    try {
      const client = this.checkSupabase();
      const { data: existingConversation, error: checkError } = await client
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', userId1);

      if (checkError) throw checkError;

      for (const { conversation_id } of existingConversation || []) {
        const { data: otherParticipant } = await client
          .from('conversation_participants')
          .select('*')
          .eq('conversation_id', conversation_id)
          .eq('user_id', userId2);

        if (otherParticipant && otherParticipant.length > 0) {
          return conversation_id;
        }
      }

      const { data: newConversation, error: createError } = await client
        .from('conversations')
        .insert([{}])
        .select()
        .single();

      if (createError) throw createError;

      await client.from('conversation_participants').insert([
        { conversation_id: newConversation.id, user_id: userId1 },
        { conversation_id: newConversation.id, user_id: userId2 },
      ]);

      return newConversation.id;
    } catch (error) {
      console.error('Error in getOrCreateConversation:', error);
      throw error;
    }
  }

  async createCommunity(
    name: string,
    description = '',
    imageUrl = '',
    slug: string,
  ): Promise<Community> {
    try {
      const client = this.checkSupabase();
      const { data: existing } = await client
        .from('communities')
        .select('*')
        .ilike('name', name)
        .limit(1);

      if (existing && existing.length > 0) {
        throw new Error('Community name already exists');
      }

      const { data, error } = await client
        .from('communities')
        .insert([{ name, description, image_url: imageUrl, slug }])
        .select()
        .single();

      if (error) throw error;
      
      return data as Community;
    } catch (error) {
      console.error('Error in createCommunity:', error);
      throw error;
    }
  }

  async getCommunity(id: string): Promise<Community | undefined> {
    try {
      const client = this.checkSupabase();
      const { data, error } = await client.from('communities').select('*').eq('id', id).single();
      if (error) {
        console.error('Error fetching community:', error);
        return undefined;
      }
      return data as Community;
    } catch (error) {
      console.error('Error in getCommunity:', error);
      return undefined;
    }
  }

  async listCommunitiesForUser(userId: string): Promise<Community[]> {
    try {
      const client = this.checkSupabase();
      const { data, error } = await client
        .from('community_members')
        .select('communities(*)')
        .eq('user_id', userId);
      if (error) {
        console.error('Error listing communities for user:', error);
        return [];
      }
      return (data || []).map((r: { communities: Community }) => r.communities) as Community[];
    } catch (error) {
      console.error('Error in listCommunitiesForUser:', error);
      return [];
    }
  }

  async joinCommunity(
    communityId: string,
    userId: string,
    role = 'member'
  ): Promise<CommunityMember> {
    try {
      const client = this.checkSupabase();
      const { data: existing, error: selectError } = await client
        .from('community_members')
        .select('*')
        .eq('community_id', communityId)
        .eq('user_id', userId)
        .limit(1);

      if (selectError) throw selectError;
      if (existing && existing.length > 0) {
        return existing[0] as CommunityMember;
      }

      const { data, error } = await client
        .from('community_members')
        .insert([{ community_id: communityId, user_id: userId, role }])
        .select()
        .single();
      if (error) throw error;
      return data as CommunityMember;
    } catch (error) {
      console.error('Error in joinCommunity:', error);
      throw error;
    }
  }

  async leaveCommunity(communityId: string, userId: string): Promise<void> {
    try {
      const client = this.checkSupabase();
      const { error } = await client
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', userId);
      if (error) throw error;
    } catch (error) {
      console.error('Error in leaveCommunity:', error);
      throw error;
    }
  }

  async searchPublicCommunities(q = '', page = 1, pageSize = 20): Promise<Community[]> {
    try {
      const client = this.checkSupabase();
      const offset = (page - 1) * pageSize;
      let query = client
        .from('communities')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (q && q.trim().length > 0) {
        const term = `%${q.trim()}%`;
        query = query.or(`name.ilike.${term},description.ilike.${term}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Community[];
    } catch (error) {
      console.error('Error in searchPublicCommunities:', error);
      return [];
    }
  }

  async createChannel(
    communityId: string,
    name: string,
    description = '',
    isPrivate = false
  ): Promise<Channel> {
    try {
      const client = this.checkSupabase();
      const { data, error } = await client
        .from('channels')
        .insert([{ community_id: communityId, name, description, is_private: isPrivate }])
        .select()
        .single();
      if (error) throw error;
      return data as Channel;
    } catch (error) {
      console.error('Error in createChannel:', error);
      throw error;
    }
  }

  async getChannelsForCommunity(communityId: string): Promise<Channel[]> {
    try {
      const client = this.checkSupabase();
      const { data, error } = await client
        .from('channels')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: true });
      if (error) {
        console.error('Error fetching channels:', error);
        return [];
      }
      return data as Channel[];
    } catch (error) {
      console.error('Error in getChannelsForCommunity:', error);
      return [];
    }
  }

  async getCommunityMembers(communityId: string): Promise<any[]> {
    try {
      const client = this.checkSupabase();
      const { data, error } = await client
        .from('community_members')
        .select('*, user:user_id(username, name)')
        .eq('community_id', communityId)
        .order('created_at', { ascending: true });
      if (error) {
        console.error('Error fetching community members:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error in getCommunityMembers:', error);
      return [];
    }
  }

  async getUserRoleInCommunity(communityId: string, userId: string): Promise<string | null> {
    try {
      const client = this.checkSupabase();
      const { data, error } = await client
        .from('community_members')
        .select('role')
        .eq('community_id', communityId)
        .eq('user_id', userId)
        .single();
      if (error) {
        return null;
      }
      return data ? data.role : null;
    } catch (error) {
      console.error('Error in getUserRoleInCommunity:', error);
      return null;
    }
  }

  async sendChannelMessage(
    channelId: string,
    authorId: string,
    content: string
  ): Promise<ChannelMessage> {
    try {
      const client = this.checkSupabase();
      const encryptedContent = encrypt(content);
      const { data, error } = await client
        .from('channel_messages')
        .insert([{ channel_id: channelId, author_id: authorId, content: encryptedContent }])
        .select()
        .single();
      if (error) throw error;
      return { ...data, content } as ChannelMessage;
    } catch (error) {
      console.error('Error in sendChannelMessage:', error);
      throw error;
    }
  }

  async getChannelMessages(channelId: string): Promise<ChannelMessage[]> {
    try {
      const client = this.checkSupabase();
      const { data, error } = await client
        .from('channel_messages')
        .select('*, author:author_id(username, name)')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });
      if (error) {
        console.error('Error fetching channel messages:', error);
        return [];
      }
      return (data as any[]).map((msg) => ({
        ...msg,
        content: isEncrypted(msg.content) ? decrypt(msg.content) : msg.content,
      }));
    } catch (error) {
      console.error('Error in getChannelMessages:', error);
      return [];
    }
  }

  async toggleMessageReaction(
    messageId: string,
    userId: string,
    reaction: string,
  ): Promise<MessageReaction | null> {
    try {
      const client = this.checkSupabase();
      const { data: existing, error: selectError } = await client
        .from('message_reactions')
        .select('*')
        .eq('user_id', userId)
        .eq('reaction', reaction)
        .eq('message_id', messageId)
        .single();

      if (selectError && selectError.code !== 'PGRST116') throw selectError;

      if (existing) {
        const { error: delError } = await client
          .from('message_reactions')
          .delete()
          .eq('message_id', messageId)
          .eq('user_id', userId)
          .eq('reaction', reaction);
        if (delError) throw delError;
        return null;
      }

      const { data, error } = await client
        .from('message_reactions')
        .insert([{ message_id: messageId, user_id: userId, reaction }])
        .select()
        .single();
      if (error) throw error;
      return data as MessageReaction;
    } catch (error) {
      console.error('Error in toggleMessageReaction:', error);
      throw error;
    }
  }

  async createLiveSession(channelId: string, created_by: string, title = ''): Promise<LiveSession> {
    try {
      const client = this.checkSupabase();
      const { data, error } = await client
        .from('live_sessions')
        .insert([{ channel_id: channelId, created_by, title, active: true }])
        .select()
        .single();
      if (error) throw error;
      return data as LiveSession;
    } catch (error) {
      console.error('Error in createLiveSession:', error);
      throw error;
    }
  }

  async endLiveSession(sessionId: string): Promise<void> {
    try {
      const client = this.checkSupabase();
      const { error } = await client
        .from('live_sessions')
        .update({ active: false, ended_at: new Date().toISOString() })
        .eq('id', sessionId);
      if (error) throw error;
    } catch (error) {
      console.error('Error in endLiveSession:', error);
      throw error;
    }
  }

  async getPosts(userId?: string, limit = 50): Promise<any[]> {
    try {
      let query = this.checkSupabase()
        .from('posts')
        .select(
          `
          *,
          author:author_id (
            id,
            username,
            name
          )
          `
        )
        .order('created_at', { ascending: false })
        .limit(limit);

      if (userId) {
        query = query.eq('author_id', userId);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching posts:', error.message);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Error in getPosts:', error);
      if (error instanceof Error && error.message.includes('does not exist')) {
        return [];
      }
      throw error;
    }
  }

  async createPost(postData: {
    community_id: string;
    author_id: string;
    title: string;
    content?: string;
    image_url?: string;
  }): Promise<Post> {
    try {
      if (!postData.author_id || !postData.content?.trim() || !postData.community_id || !postData.title?.trim()) {
        throw new Error('author_id, content, community_id, and title are required');
      }
      const { data, error } = await this.checkSupabase()
        .from('posts')
        .insert([postData])
        .select()
        .single();

      if (error) {
        console.error('Error creating post:', error);
        throw error;
      }
      console.log('✅ Post created:', data?.id);
      return data as Post;
    } catch (error) {
      console.error('Error in createPost:', error);
      throw error;
    }
  }

  async togglePostReaction(
    postId: string,
    userId: string,
    reaction: string
  ): Promise<PostReaction | null> {
    try {
      const client = this.checkSupabase();
      const { data: existing, error: fetchError } = await client
        .from('post_reactions')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .eq('reaction', reaction)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (existing) {
        const { error: deleteError } = await client
          .from('post_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId)
          .eq('reaction', reaction);
        if (deleteError) throw deleteError;
        return null;
      }
      const { data, error } = await client
        .from('post_reactions')
        .insert([{ post_id: postId, user_id: userId, reaction }])
        .select()
        .single();
      if (error) throw error;
      return data as PostReaction;
    } catch (error) {
      console.error('Error in togglePostReaction:', error);
      throw error;
    }
  }

  async getPostReactions(postId: string): Promise<PostReaction[]> {
    try {
      const client = this.checkSupabase();
      const { data, error } = await client
        .from('post_reactions')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });
      if (error) {
        if (error.message?.includes('does not exist')) {
          return [];
        }
        throw error;
      }
      return data as PostReaction[];
    } catch (error) {
      console.error('Error in getPostReactions:', error);
      if (error instanceof Error && error.message?.includes('does not exist')) {
        return [];
      }
      throw error;
    }
  }
}

export const storage = new SupabaseStorage();
