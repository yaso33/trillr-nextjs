import { useAuth } from '@/contexts/AuthContext'
import { logger } from '@/lib/logger'
import { supabase } from '@/lib/supabase'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from './use-toast'

export interface Notification {
  id: string
  user_id: string
  type: string
  content: string
  read: boolean
  created_at: string
  sender_id: string | null
  post_id: string | null
  profiles?: {
    username: string
    full_name: string | null
    avatar_url: string | null
  }
}

export function useNotifications() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!user) throw new Error('Must be logged in')

      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          profiles:sender_id (username, full_name, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    refetchInterval: 5000,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', notificationId)

        if (error) throw new Error(`Failed to mark notification as read: ${error.message}`)
      } catch (error) {
        logger.error('Error in useMarkNotificationRead:', error)
        throw error instanceof Error
          ? error
          : new Error('An unexpected error occurred while marking notification as read')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
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

export function useMarkAllNotificationsRead() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async () => {
      try {
        if (!user) throw new Error('Must be logged in')

        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('user_id', user.id)
          .eq('read', false)

        if (error) throw new Error(`Failed to mark all notifications as read: ${error.message}`)
      } catch (error) {
        logger.error('Error in useMarkAllNotificationsRead:', error)
        throw error instanceof Error
          ? error
          : new Error('An unexpected error occurred while marking notifications as read')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast({
        title: 'All notifications marked as read',
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

export function useCreateNotification() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      recipientId,
      type,
      content,
      postId,
    }: {
      recipientId: string
      type: 'like' | 'comment' | 'follow' | 'mention' | 'video' | 'message' | 'call'
      content: string
      postId?: string
    }) => {
      try {
        if (!user) throw new Error('Must be logged in')
        if (recipientId === user.id) return null

        const { data, error } = await supabase
          .from('notifications')
          .insert([
            {
              user_id: recipientId,
              sender_id: user.id,
              type,
              content,
              post_id: postId || null,
              read: false,
            },
          ])
          .select()
          .single()

        if (error) throw new Error(`Failed to create notification: ${error.message}`)
        return data
      } catch (error) {
        logger.error('Error in useCreateNotification:', error)
        throw error instanceof Error
          ? error
          : new Error('An unexpected error occurred while creating notification')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useUnreadNotificationCount() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      if (!user) return 0

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) throw error
      return count || 0
    },
    enabled: !!user,
    refetchInterval: 10000,
  })
}
