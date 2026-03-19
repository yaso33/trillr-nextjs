import { useAuth } from '@/contexts/AuthContext'
import { logger } from '@/lib/logger'
import { supabase } from '@/lib/supabase'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from './use-toast'

// Updated interface to match the 'users' table schema and the query alias
export interface Video {
  id: string
  author_id: string // The foreign key is author_id, not user_id
  title: string
  description: string | null
  video_url: string
  thumbnail_url: string | null
  likes_count: number
  comments_count: number
  views_count: number
  created_at: string
  author: { // Changed from 'profiles' to 'author' for clarity
    username: string
    name: string | null // Changed from 'full_name'
    avatar_url: string | null
  }
  is_liked?: boolean
}

export function useVideos() {
  const { user } = useAuth()

  return useQuery<Video[]>({ // Added type assertion
    queryKey: ['videos'],
    queryFn: async () => {
      // Corrected the query to use the right foreign key (author_id) and table (users)
      const { data: videos, error } = await supabase
        .from('videos')
        .select(`
          *,
          author:author_id (username, name, avatar_url)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        logger.error('Error fetching videos:', error)
        throw error
      }

      if (user) {
        try {
          const { data: likes } = await supabase
            .from('video_likes')
            .select('video_id')
            .eq('user_id', user.id)

          const likedVideoIds = new Set(likes?.map((l) => l.video_id) || [])

          return videos.map((video) => ({
            ...video,
            is_liked: likedVideoIds.has(video.id),
          })) as Video[]
        } catch (likeError) {
            // If the video_likes table doesn't exist, this will fail.
            // We'll log the error and return the videos without like information.
            logger.warn('Could not fetch video likes. The table might be missing.', likeError)
            return videos as Video[];
        }
      }

      return videos as Video[]
    },
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
    onMutate: async (variables) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['videos'] })
      const previousVideos = queryClient.getQueryData<Video[]>(['videos'])

      queryClient.setQueryData<Video[]>(['videos'], (old) =>
        (old || []).map((video) =>
          video.id === variables.videoId
            ? { ...video, is_liked: !variables.isLiked }
            : video
        )
      )

      return { previousVideos }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousVideos) {
        queryClient.setQueryData(['videos'], context.previousVideos)
      }
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] })
    },
  })
}
