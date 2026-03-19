
import { useAuth } from '@/contexts/AuthContext'
import { logger } from '@/lib/logger'
import { supabase } from '@/lib/supabase'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from './use-toast'

export interface Profile {
  id: string
  username: string
  name: string | null
  bio: string | null
  avatar_url: string | null
  website: string | null
  email: string | null
  twitter: string | null // Not in DB
  instagram: string | null // Not in DB
  followers_count: number
  following_count: number
  posts_count: number
  created_at: string
  updated_at: string
}

export function useProfile(userId?: string) {
  const { user } = useAuth()
  const targetUserId = userId || user?.id

  return useQuery<Profile>({ // Added type assertion
    queryKey: ['profile', targetUserId],
    queryFn: async () => {
      if (!targetUserId) throw new Error('No user ID provided')

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', targetUserId)
        .single()

      if (error) throw error
      return data as any
    },
    enabled: !!targetUserId,
  })
}

export function useProfileByUsername(username?: string) {
  return useQuery<Profile | null>({ // Added type assertion
    queryKey: ['profile', 'username', username],
    queryFn: async () => {
      if (!username) return null

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single()

      if (error && error.code === 'PGRST116') {
        return null
      }

      if (error) {
        logger.error('Error fetching profile by username:', error)
        throw error
      }

      return data as any
    },
    enabled: !!username,
  })
}

export function useSearchProfiles(searchQuery: string) {
  return useQuery<Partial<Profile>[]>({ // Added type assertion
    queryKey: ['profiles', 'search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return []

      const { data, error } = await supabase
        .from('users')
        .select('id, username, name, avatar_url')
        .or(`username.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%`)
        .limit(20)

      if (error) throw error
      return data || []
    },
    enabled: searchQuery.trim().length > 0,
  })
}

export function useSuggestedProfiles() {
  const { user } = useAuth()

  return useQuery<Partial<Profile>[]>({ // Added type assertion
    queryKey: ['profiles', 'suggested'],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('users')
        .select('id, username, name, avatar_url')
        .neq('id', user.id)
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
    mutationFn: async (updates: Partial<Profile> & { full_name?: string }) => {
      try {
        if (!user) throw new Error('Must be logged in to update profile')

        // The form uses 'full_name', but the DB uses 'name'. We handle this here.
        const { full_name, ...otherUpdates } = updates
        const updateData: any = { ...otherUpdates }

        if (full_name) {
          updateData.name = full_name
        }
        
        // Remove fields that are not in the database to prevent errors
        delete updateData.twitter;
        delete updateData.instagram;

        if (Object.keys(updateData).length === 0) {
           toast({ title: "No changes detected", description: "You haven't changed any information." });
           return null; // Return null to avoid calling onSuccess
        }

        const { data, error } = await supabase
          .from('users')
          .update(updateData)
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
        if (!data) return;
        
        // Invalidate queries to refetch fresh data
        queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
        queryClient.invalidateQueries({ queryKey: ['profile', 'username', (data as Profile).username] })
        queryClient.invalidateQueries({ queryKey: ['profiles'] })

        // Optimistically update the cache
        if (user?.id) {
            queryClient.setQueryData(['profile', user.id], data)
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

// NOTE: The follow/unfollow logic needs to be reviewed as the schema for 'followers' has changed.
// The below code is adapted but assumes the new schema is public.followers(user_id, target_user_id)

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
            .from('followers')
            .delete()
            .eq('user_id', user.id)
            .eq('target_user_id', userId)

          if (error) throw new Error(`Failed to unfollow user: ${error.message}`)
        } else {
          const { error } = await supabase.from('followers').insert([
            {
              user_id: user.id,
              target_user_id: userId,
              relationship_type: 'follow' // This is an assumption based on the schema
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
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      queryClient.invalidateQueries({ queryKey: ['followers', variables.userId] })
      queryClient.invalidateQueries({ queryKey: ['following', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['isFollowing', variables.userId] })

      toast({
        title: variables.isFollowing ? 'Unfollowed' : 'Followed',
        description: `You have ${variables.isFollowing ? 'unfollowed' : 'followed'} this user.`,
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

  return useQuery<boolean>({
    queryKey: ['isFollowing', userId],
    queryFn: async () => {
      if (!user || !userId) return false

      const { data, error } = await supabase
        .from('followers')
        .select('user_id')
        .eq('user_id', user.id)
        .eq('target_user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return !!data
    },
    enabled: !!user && !!userId,
  })
}

// The following hooks need to be adapted for the new 'followers' table and its relations to 'users'
// Assuming the relation is named 'users' in the foreign key definitions.

export function useFollowers(userId?: string) {
  return useQuery<Partial<Profile>[]>({ // Type assertion
    queryKey: ['followers', userId],
    queryFn: async () => {
      if (!userId) return []

      const { data, error } = await supabase
        .from('followers')
        .select('*, user:user_id(*)')
        .eq('target_user_id', userId)

      if (error) {
        logger.error('Error fetching followers:', error)
        throw error
      }

      return data?.map((item: any) => item.user).filter(Boolean) || []
    },
    enabled: !!userId,
  })
}

export function useFollowing(userId?: string) {
  return useQuery<Partial<Profile>[]>({ // Type assertion
    queryKey: ['following-list', userId],
    queryFn: async () => {
      if (!userId) return []

      const { data, error } = await supabase
        .from('followers')
        .select('*, user:target_user_id(*)')
        .eq('user_id', userId)

      if (error) {
        logger.error('Error fetching following:', error)
        throw error
      }
      
      return data?.map((item: any) => item.user).filter(Boolean) || []
    },
    enabled: !!userId,
  })
}
