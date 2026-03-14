import { useToast } from '@/hooks/use-toast'
import { logger } from '@/lib/logger'
import { supabase } from '@/lib/supabase'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

interface StoryProfile {
  username: string
  full_name: string | null
  avatar_url: string | null
}

export interface Story {
  id: string
  user_id: string
  media_url: string
  media_type: 'image' | 'video'
  created_at: string
  expires_at: string
  profiles: StoryProfile
}

export function useStories() {
  return useQuery({
    queryKey: ['stories'],
    queryFn: async () => {
      const now = new Date().toISOString()

      const { data, error } = await supabase
        .from('stories')
        .select(`
          id,
          user_id,
          media_url,
          media_type,
          created_at,
          expires_at,
          profiles (
            username,
            full_name,
            avatar_url
          )
        `)
        .gte('expires_at', now)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []) as unknown as Story[]
    },
    refetchInterval: 60000, // Refetch every minute
  })
}

export function useCreateStory() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ file, mediaType }: { file: File; mediaType: 'image' | 'video' }) => {
      try {
        if (!supabase) {
          throw new Error('Supabase is not configured')
        }

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          throw new Error('You must be logged in to create a story')
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('stories')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) throw new Error(`Failed to upload story media: ${uploadError.message}`)

        const {
          data: { publicUrl },
        } = supabase.storage.from('stories').getPublicUrl(fileName)

        // Add cache busting parameter to force fresh image load
        const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`

        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + 24)

        const { data, error } = await supabase
          .from('stories')
          .insert({
            user_id: user.id,
            media_url: urlWithCacheBust,
            media_type: mediaType,
            expires_at: expiresAt.toISOString(),
          })
          .select()
          .single()

        if (error) throw new Error(`Failed to create story: ${error.message}`)
        return data
      } catch (error) {
        logger.error('Error in useCreateStory:', error)
        throw error instanceof Error
          ? error
          : new Error('An unexpected error occurred while creating the story')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] })

      toast({
        title: 'Story created!',
        description: 'Your story has been posted.',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create story',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}
