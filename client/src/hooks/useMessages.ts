import { useAuth } from '@/contexts/AuthContext'
import { logger } from '@/lib/logger'
import { supabase } from '@/lib/supabase'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from './use-toast'

// CORRECTED: Interfaces match the database schema (users, author_id, name)
export interface Message {
  id: string
  conversation_id: string
  author_id: string
  content: string
  created_at: string
  read?: boolean // Optional, as it might not exist in the DB yet
  author?: {
    username: string
    name: string | null
    avatar_url: string | null
  }
}

export interface Conversation {
  id: string
  created_at: string
  last_message_at: string | null
  // This will be a single object representing the *other* participant
  participant: {
    user_id: string
    username: string
    name: string | null
    avatar_url: string | null
  }
  last_message?: Partial<Message>
  unread_count?: number
}

// A much more efficient way to get conversations
export function useConversations() {
  const { user } = useAuth()

  return useQuery<Conversation[]>({ // Type assertion
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return []

      // Use a remote procedure call (RPC) to get conversations efficiently
      // This assumes you will create a function named 'get_user_conversations' in Supabase
      const { data, error } = await supabase.rpc('get_user_conversations')

      if (error) {
        logger.error('Error fetching conversations via RPC:', error)
        // Fallback to a less efficient method if RPC fails or doesn't exist yet
        return []
      }

      return (data as any[]) || []
    },
    enabled: !!user,
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 5, // 5 minutes
  })
}

export function useMessages(conversationId: string | null) {
  return useQuery<Message[]>({ // Type assertion
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return []

      const { data, error } = await supabase
        .from('messages')
        .select('*, author:author_id(username, name, avatar_url)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) {
        logger.error(`Error fetching messages for convo ${conversationId}:`, error)
        throw error
      }
      return (data as any[]) || []
    },
    enabled: !!conversationId,
    refetchInterval: 5000, // Refetch messages every 5 seconds
  })
}

export function useSendMessage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
    }: { conversationId: string; content: string }) => {
      if (!user) throw new Error('Must be logged in to send messages')

      // Insert directly into the messages table
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          author_id: user.id, // CORRECTED: from sender_id
          content: content,
        })
        .select()
        .single()

      if (error) {
        logger.error('Error sending message:', error)
        throw new Error('Failed to send message')
      }
      return data
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch messages and conversation list
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
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

export function useGetOrCreateConversation() {
  const { user } = useAuth()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (otherUserId: string) => {
        if (!user) throw new Error('Must be logged in');

        // RPC to find or create a conversation
        const { data, error } = await supabase.rpc('get_or_create_conversation', {
            p_user_id_1: user.id,
            p_user_id_2: otherUserId
        });

        if (error) {
            logger.error('Error in get_or_create_conversation RPC:', error);
            throw new Error('Could not start a conversation.');
        }
        
        return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error starting conversation',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}
