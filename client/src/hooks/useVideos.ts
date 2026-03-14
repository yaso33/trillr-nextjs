import { useAuth } from '@/contexts/AuthContext'
import { logger } from '@/lib/logger'
import { supabase } from '@/lib/supabase'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from './use-toast'

export interface Video {
  id: string
  user_id: string
  title: string
  description: string | null
  video_url: string
  thumbnail_url: string | null
  likes_count: number
  comments_count: number
  views_count: number
  created_at: string
  profiles: {
    username: string
    full_name: string | null
    avatar_url: string | null
  }
  is_liked?: boolean
}

export function useVideos() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const { data: videos, error } = await supabase
        .from('videos')
        .select(`
          *,
          profiles:user_id (username, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (user) {
        const { data: likes } = await supabase
          .from('video_likes')
          .select('video_id')
          .eq('user_id', user.id)

        const likedVideoIds = new Set(likes?.map((l) => l.video_id) || [])

        return videos.map((video) => ({
          ...video,
          is_liked: likedVideoIds.has(video.id),
        }))
      }

      return videos
    },
    refetchInterval: 10000,
  })
}

export function useLikeVideo() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ videoId, isLiked }: { videoId: string; isLiked: boolean }) => {
      try {
        if (!user) throw new Error('Must be logged in to like videos')

        if (isLiked) {
          const { error } = await supabase
            .from('video_likes')
            .delete()
            .eq('video_id', videoId)
            .eq('user_id', user.id)

          if (error) throw new Error(`Failed to unlike video: ${error.message}`)
        } else {
          const { error } = await supabase
            .from('video_likes')
            .insert([{ video_id: videoId, user_id: user.id }])

          if (error) throw new Error(`Failed to like video: ${error.message}`)
        }
      } catch (error) {
        logger.error('Error in useLikeVideo:', error)
        throw error instanceof Error
          ? error
          : new Error('An unexpected error occurred while updating video like status')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] })
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
