import { useAuth } from '@/contexts/AuthContext'
import { logger } from '@/lib/logger'
import { supabase } from '@/lib/supabase'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from './use-toast'

// ============================================================
// Interfaces — matched to the actual Supabase schema
// ============================================================

export interface Community {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  created_at: string
}

export interface CommunityMember {
  user_id: string
  community_id: string
  role: 'admin' | 'moderator' | 'member'
  user: {
    username: string
    name: string | null
    avatar_url: string | null
  }
}

export interface Channel {
  id: string
  community_id: string
  name: string
  description: string | null
  is_private: boolean
  created_at: string
  type?: 'text' | 'voice' // kept for UI compatibility; not in DB
}

export interface ChannelMessage {
  id: string
  channel_id: string
  author_id: string
  content: string | null
  image_url: string | null
  created_at: string
  sender?: { username: string; avatar_url: string | null }
}

// ============================================================
// Community Hooks
// ============================================================

export function useCommunities() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['communities', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('community_members')
        .select('community:communities!inner(*)')
        .eq('user_id', user.id)
      if (error) {
        logger.error('Error fetching user communities:', error)
        throw error
      }
      return data.map((item: any) => item.community) as Community[]
    },
    enabled: !!user,
  })
}

export function useDiscoverCommunities(q = '') {
  return useQuery<Community[]>({
    queryKey: ['discover-communities', q],
    queryFn: async () => {
      let query = supabase.from('communities').select('*')
      if (q) query = query.ilike('name', `%${q}%`)
      const { data, error } = await query.limit(50)
      if (error) {
        logger.error('Error discovering communities:', error)
        throw error
      }
      return (data as Community[]) || []
    },
  })
}

export function useCommunity(communityId?: string) {
  return useQuery<Community | null>({
    queryKey: ['community', communityId],
    queryFn: async () => {
      if (!communityId) return null
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('id', communityId)
        .single()
      if (error) {
        logger.error(`Error fetching community ${communityId}:`, error)
        throw error
      }
      return data as Community
    },
    enabled: !!communityId,
  })
}

export function useCommunityMembers(communityId?: string) {
  return useQuery<CommunityMember[]>({
    queryKey: ['community-members', communityId],
    queryFn: async () => {
      if (!communityId) return []
      const { data, error } = await supabase
        .from('community_members')
        .select('*, user:users(username, name, avatar_url)')
        .eq('community_id', communityId)
      if (error) {
        logger.error(`Error fetching members for community ${communityId}:`, error)
        throw error
      }
      return (data as any[]) || []
    },
    enabled: !!communityId,
  })
}

export function useCreateCommunity() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      if (!user) throw new Error('User must be logged in.')
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now()
      const { data, error } = await supabase
        .from('communities')
        .insert([{ name, slug, description: description || null }])
        .select()
        .single()
      if (error) {
        logger.error('Error creating community:', error)
        throw new Error(error.message)
      }
      await supabase.from('community_members').insert([{
        community_id: data.id,
        user_id: user.id,
        role: 'admin',
      }])
      return data as Community
    },
    onSuccess: () => {
      toast({ title: 'Community Created', description: 'Your new community is ready.' })
      queryClient.invalidateQueries({ queryKey: ['communities'] })
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    },
  })
}

export function useJoinCommunity() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ communityId }: { communityId: string }) => {
      if (!user) throw new Error('User must be logged in.')
      const { error } = await supabase.from('community_members').insert({
        community_id: communityId,
        user_id: user.id,
        role: 'member',
      })
      if (error) {
        logger.error(`Error joining community ${communityId}:`, error)
        if (error.code === '23505') throw new Error('You are already a member of this community.')
        throw new Error('Failed to join community.')
      }
    },
    onSuccess: (_, { communityId }) => {
      toast({ title: 'Community Joined', description: 'Welcome!' })
      queryClient.invalidateQueries({ queryKey: ['communities'] })
      queryClient.invalidateQueries({ queryKey: ['community-members', communityId] })
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    },
  })
}

export function useLeaveCommunity() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ communityId }: { communityId: string }) => {
      if (!user) throw new Error('User must be logged in.')
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', user.id)
      if (error) {
        logger.error(`Error leaving community ${communityId}:`, error)
        throw new Error('Failed to leave community.')
      }
    },
    onSuccess: (_, { communityId }) => {
      toast({ title: 'Community Left', description: 'You have left the community.' })
      queryClient.invalidateQueries({ queryKey: ['communities'] })
      queryClient.invalidateQueries({ queryKey: ['community-members', communityId] })
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    },
  })
}

// ============================================================
// Channel Hooks
// ============================================================

export function useChannelsForCommunity(communityId?: string) {
  return useQuery<Channel[]>({
    queryKey: ['channels', communityId],
    queryFn: async () => {
      if (!communityId) return []
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: true })
      if (error) {
        logger.error(`Error fetching channels for community ${communityId}:`, error)
        throw error
      }
      // Assign default type='text' since it's not in the DB schema
      return (data || []).map((ch: any) => ({ ...ch, type: ch.type ?? 'text' })) as Channel[]
    },
    enabled: !!communityId,
  })
}

export function useChannelMessages(channelId?: string) {
  return useQuery<ChannelMessage[]>({
    queryKey: ['channel-messages', channelId],
    queryFn: async () => {
      if (!channelId) return []
      const res = await fetch(`/api/channel/${channelId}/messages`)
      if (!res.ok) throw new Error('Failed to fetch channel messages')
      return res.json() as Promise<ChannelMessage[]>
    },
    enabled: !!channelId,
    refetchInterval: 5000,
  })
}

export function useSendChannelMessage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      channelId,
      senderId,
      content,
      communityId,
    }: {
      channelId: string
      senderId: string
      content: string
      communityId?: string
    }) => {
      const res = await fetch('/api/channel/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId, senderId: senderId || user?.id, content, communityId }),
      })
      if (!res.ok) throw new Error('Failed to send message')
      return res.json() as Promise<ChannelMessage>
    },
    onSuccess: (_, { channelId }) => {
      queryClient.invalidateQueries({ queryKey: ['channel-messages', channelId] })
    },
  })
}

export function useCreateChannel(communityId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({
      name,
      type,
      isPrivate,
    }: {
      name: string
      type?: 'text' | 'voice'
      isPrivate?: boolean
    }) => {
      const res = await fetch(`/api/communities/${communityId}/channels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, isPrivate: isPrivate ?? false }),
      })
      if (!res.ok) throw new Error('Failed to create channel')
      return res.json() as Promise<Channel>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels', communityId] })
      toast({ title: 'Channel Created', description: 'New channel is ready.' })
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    },
  })
}
