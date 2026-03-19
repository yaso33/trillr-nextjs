import { useAuth } from '@/contexts/AuthContext'
import { logger } from '@/lib/logger'
import { supabase } from '@/lib/supabase'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from './use-toast'

// ============================================================
// Interface — matched to the actual Supabase schema
// videos: id, author_id, video_url, thumbnail_url, description, created_at
// ============================================================
export interface Video {
  id: string
  author_id: string
  video_url: string
  thumbnail_url: string | null
  description: string | null
  title?: string | null          // kept for UI compatibility; not in DB
  likes_count?: number           // kept for UI compatibility; not in DB
  comments_count?: number        // kept for UI compatibility; not in DB
  views_count?: number           // kept for UI compatibility; not in DB
  created_at: string
  author: {
    username: string
    name: string | null
    avatar_url: string | null
  }
  is_liked?: boolean
}

// ============================================================
// Hooks
// ============================================================

export function useVideos() {
  const { user } = useAuth()

  return useQuery<Video[]>({
    queryKey: ['videos'],
    queryFn: async () => {
      const { data: videos, error } = await supabase
        .from('videos')
        .select('*, author:author_id (username, name, avatar_url)')
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
          logger.warn('Could not fetch video likes.', likeError)
          return videos as Video[]
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
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['videos'] })
      const previousVideos = queryClient.getQueryData<Video[]>(['videos'])
      queryClient.setQueryData<Video[]>(['videos'], (old) =>
        (old || []).map((video) =>
          video.id === variables.videoId ? { ...video, is_liked: !variables.isLiked } : video
        )
      )
      return { previousVideos }
    },
    onError: (err, _variables, context) => {
      if (context?.previousVideos) {
        queryClient.setQueryData(['videos'], context.previousVideos)
      }
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] })
    },
  })
}

export function useCreateVideo() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({
      title,
      description,
      videoFile,
    }: {
      title?: string
      description?: string
      videoFile: File
    }) => {
      if (!user) throw new Error('Must be logged in to upload a video')

      // Step 1: Upload the video file
      const formData = new FormData()
      formData.append('video', videoFile)

      const uploadRes = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({ error: 'Upload failed' }))
        throw new Error(err.error || 'Failed to upload video')
      }

      const { url: video_url } = await uploadRes.json()

      // Step 2: Save the video record to Supabase
      // description field stores both title and description for schema compatibility
      const finalDescription = title
        ? `${title}${description ? '\n' + description : ''}`
        : description || null

      const { data, error } = await supabase
        .from('videos')
        .insert([{
          author_id: user.id,
          video_url,
          description: finalDescription,
        }])
        .select()
        .single()

      if (error) {
        logger.error('Error saving video record:', error)
        throw new Error(error.message)
      }

      return data as Video
    },
    onSuccess: () => {
      toast({ title: 'Video Uploaded', description: 'Your video has been published.' })
      queryClient.invalidateQueries({ queryKey: ['videos'] })
    },
    onError: (error: Error) => {
      logger.error('Error in useCreateVideo:', error)
      toast({ title: 'Upload Failed', description: error.message, variant: 'destructive' })
    },
  })
}
