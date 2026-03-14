import { useToast } from '@/hooks/use-toast'
import { logger } from '@/lib/logger'
import { supabase } from '@/lib/supabase'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

interface CommentProfile {
  username: string
  full_name: string | null
  avatar_url: string | null
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  profiles: CommentProfile
}

export function useComments(postId: string) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          post_id,
          user_id,
          content,
          created_at,
          profiles (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return (data || []) as unknown as Comment[]
    },
    enabled: !!postId,
  })
}

export function useAddComment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      try {
        if (!supabase) {
          throw new Error('Supabase is not configured')
        }

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          throw new Error('You must be logged in to comment')
        }

        const { data, error } = await supabase
          .from('comments')
          .insert({
            post_id: postId,
            user_id: user.id,
            content: content.trim(),
          })
          .select()
          .single()

        if (error) throw new Error(`Failed to post comment: ${error.message}`)
        return data
      } catch (error) {
        logger.error('Error in useAddComment:', error)
        throw error instanceof Error
          ? error
          : new Error('An unexpected error occurred while posting the comment')
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })

      toast({
        title: 'Comment posted!',
        description: 'Your comment has been added.',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to post comment',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}
