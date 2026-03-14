import { useAuth } from '@/contexts/AuthContext'
import { logger } from '@/lib/logger'
import { supabase } from '@/lib/supabase'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from './use-toast'

export interface Profile {
  id: string
  username: string
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  website: string | null
  // new contact fields
  email: string | null
  twitter: string | null
  instagram: string | null
  followers_count: number
  following_count: number
  posts_count: number
  created_at: string
  updated_at: string
}

export function useProfile(userId?: string) {
  const { user } = useAuth()
  const targetUserId = userId || user?.id

  return useQuery({
    queryKey: ['profile', targetUserId],
    queryFn: async () => {
      if (!targetUserId) throw new Error('No user ID provided')

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!targetUserId,
  })
}

export function useProfileByUsername(username?: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['profile', 'username', username],
    queryFn: async () => {
      if (!username) return null

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      // PGRST116 means no rows found - return null to show "User not found"
      if (error && error.code === 'PGRST116') {
        return null
      }

      if (error) {
        logger.error('Error fetching profile by username:', error)
        throw error
      }

      return data
    },
    enabled: !!username,
  })
}

export function useSearchProfiles(searchQuery: string) {
  return useQuery({
    queryKey: ['profiles', 'search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return []

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
        .limit(20)

      if (error) throw error
      return data || []
    },
    enabled: searchQuery.trim().length > 0,
  })
}

export function useSuggestedProfiles() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['profiles', 'suggested'],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .order('followers_count', { ascending: false })
        .limit(5)

      if (error) throw error
      return data || []
    },
    enabled: !!user,
  })
}

export function useUpdateProfile() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      try {
        if (!user) throw new Error('Must be logged in to update profile')

        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single()

        if (error) throw new Error(`Failed to update profile: ${error.message}`)
        return data
      } catch (error) {
        logger.error('Error in useUpdateProfile:', error)
        throw error instanceof Error
          ? error
          : new Error('An unexpected error occurred while updating your profile')
      }
    },
    onSuccess: (data) => {
      // Invalidate all profile-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['profile', 'username'] })
      queryClient.invalidateQueries({ queryKey: ['profiles'] })

      // Optionally set data directly for immediate UI update
      if (user?.id) {
        queryClient.setQueryData({ queryKey: ['profile', user.id], data })
      }

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating profile',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

export function useFollowUser() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ userId, isFollowing }: { userId: string; isFollowing: boolean }) => {
      try {
        if (!user) throw new Error('Must be logged in to follow users')

        if (isFollowing) {
          const { error } = await supabase
            .from('follows')
            .delete()
            .eq('follower_id', user.id)
            .eq('following_id', userId)

          if (error) throw new Error(`Failed to unfollow user: ${error.message}`)
        } else {
          const { error } = await supabase.from('follows').insert([
            {
              follower_id: user.id,
              following_id: userId,
            },
          ])

          if (error) throw new Error(`Failed to follow user: ${error.message}`)
        }
      } catch (error) {
        logger.error('Error in useFollowUser:', error)
        throw error instanceof Error
          ? error
          : new Error('An unexpected error occurred while updating follow status')
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['following'] })

      toast({
        title: variables.isFollowing ? 'Unfollowed' : 'Following',
        description: variables.isFollowing
          ? 'You unfollowed this user'
          : 'You are now following this user',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

export function useIsFollowing(userId: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['following', userId],
    queryFn: async () => {
      if (!user || !userId) return false

      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return !!data
    },
    enabled: !!user && !!userId,
  })
}

export function useFollowers(userId?: string) {
  return useQuery({
    queryKey: ['followers', userId],
    queryFn: async () => {
      if (!userId) return []

      const { data, error } = await supabase
        .from('follows')
        .select(`
          follower_id,
          profiles:follower_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('following_id', userId)

      if (error) {
        logger.error('Error fetching followers:', error)
        throw error
      }

      return data?.map((item) => item.profiles).filter(Boolean) || []
    },
    enabled: !!userId,
  })
}

export function useFollowing(userId?: string) {
  return useQuery({
    queryKey: ['following-list', userId],
    queryFn: async () => {
      if (!userId) return []

      const { data, error } = await supabase
        .from('follows')
        .select(`
          following_id,
          profiles:following_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('follower_id', userId)

      if (error) {
        logger.error('Error fetching following:', error)
        throw error
      }

      return data?.map((item) => item.profiles).filter(Boolean) || []
    },
    enabled: !!userId,
  })
}
