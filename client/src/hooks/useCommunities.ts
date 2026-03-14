import { useAuth } from '@/contexts/AuthContext'
import { ErrorLogger } from '@/lib/errorHandler'
import { logger } from '@/lib/logger'
import { supabase } from '@/lib/supabase'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from './use-toast'

export function useCommunities() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['communities', user?.id],
    queryFn: async () => {
      try {
        if (!user) {
          // If no user, show public communities for discovery
          const res = await fetch('/api/communities')
          if (!res.ok) throw new Error('Failed to fetch communities')
          const body = await res.json()
          return body.communities || []
        }

        // Fetch communities the user is a member of
        const res = await fetch(`/api/users/${user.id}/communities`)
        if (!res.ok) throw new Error('Failed to fetch user communities')
        return res.json()
      } catch (error: any) {
        ErrorLogger.log('Error in useCommunities:', error)
        throw new Error(error?.message || 'Failed to fetch communities')
      }
    },
    refetchInterval: 5000,
    staleTime: 0,
    retry: 2,
  })
}

export function useDiscoverCommunities(q = '', page = 1, limit = 20) {
  return useQuery({
    queryKey: ['discover-communities', q, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      params.set('page', String(page))
      params.set('limit', String(limit))
      const res = await fetch(`/api/communities?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch discover communities')
      const body = await res.json()
      return body.communities || []
    },
    enabled: true,
  })
}

export function useCreateCommunity() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      name,
      description,
      visibility,
    }: { name: string; description?: string; visibility?: string }) => {
      if (!user) throw new Error('Must be logged in to create a community')
      const res = await fetch('/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, visibility }),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to create community')
      }
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['communities'] })
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['communities'] })
      }, 100)
      toast({
        title: 'Community created!',
        description: `"${data.name}" was created successfully.`,
      })
    },
    onError: (error: any) => {
      ErrorLogger.log('Create community error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to create community',
        variant: 'destructive',
      })
    },
  })
}

export function useJoinCommunity() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ communityId }: { communityId: string }) => {
      if (!user) throw new Error('Must be logged in to join communities')
      const res = await fetch(`/api/communities/${communityId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('Failed to join community')
      return res.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['communities'] })
      queryClient.invalidateQueries({ queryKey: ['community-members', variables.communityId] })
      queryClient.invalidateQueries({ queryKey: ['community', variables.communityId] })
      queryClient.invalidateQueries({ queryKey: ['community-role', variables.communityId, user?.id] })
      toast({ title: 'Joined community', description: 'You joined the community.' })
    },
  })
}

export function useLeaveCommunity() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ communityId }: { communityId: string }) => {
      if (!user) throw new Error('Must be logged in to leave communities')
      const res = await fetch(`/api/communities/${communityId}/leave`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        throw new Error('Failed to leave community')
      }
      return res.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['communities'] })
      queryClient.invalidateQueries({ queryKey: ['community-members', variables.communityId] })
      queryClient.invalidateQueries({ queryKey: ['community', variables.communityId] })
      queryClient.invalidateQueries({ queryKey: ['community-role', variables.communityId, user?.id] })
      toast({ title: 'Left community', description: 'You have left the community.' })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to leave community',
        variant: 'destructive',
      })
    },
  })
}

export function useChannelsForCommunity(communityId?: string) {
  return useQuery({
    queryKey: ['channels', communityId],
    queryFn: async () => {
      if (!communityId) return []
      const res = await fetch(`/api/communities/${communityId}/channels`)
      if (!res.ok) throw new Error('Failed to fetch channels')
      return res.json()
    },
    enabled: !!communityId,
  })
}

export function useCreateChannel(communityId?: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async ({
      name,
      type,
      isPrivate,
    }: { name: string; type?: string; isPrivate?: boolean }) => {
      if (!communityId) throw new Error('Missing community id')
      const res = await fetch(`/api/communities/${communityId}/channels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, isPrivate }),
      })
      if (!res.ok) throw new Error('Failed to create channel')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels', communityId] })
      toast({ title: 'Channel created', description: 'Channel created successfully.' })
    },
  })
}

export function useChannelMessages(channelId?: string) {
  return useQuery({
    queryKey: ['channel-messages', channelId],
    queryFn: async () => {
      if (!channelId) return []
      const res = await fetch(`/api/channel/${channelId}/messages`)
      if (!res.ok) throw new Error('Failed to fetch channel messages')
      return res.json()
    },
    enabled: !!channelId,
    refetchInterval: 5000,
  })
}

export function useSendChannelMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      channelId,
      senderId,
      content,
    }: { channelId: string; senderId: string; content: string }) => {
      const res = await fetch('/api/channel/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId, senderId, content }),
      })
      if (!res.ok) throw new Error('Failed to send channel message')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channel-messages'] })
    },
  })
}

export function useCommunityMembers(communityId?: string) {
  return useQuery({
    queryKey: ['community-members', communityId],
    queryFn: async () => {
      if (!communityId) return []
      const res = await fetch(`/api/communities/${communityId}/members`)
      if (!res.ok) throw new Error('Failed to fetch community members')
      return res.json()
    },
    enabled: !!communityId,
  })
}

export function useCommunity(communityId?: string) {
  return useQuery({
    queryKey: ['community', communityId],
    queryFn: async () => {
      if (!communityId) return null
      const res = await fetch(`/api/communities/${communityId}`)
      if (!res.ok) throw new Error('Failed to fetch community')
      return res.json()
    },
    enabled: !!communityId,
  })
}
