'use server'

import { getAdminClient } from '@lib/server/supabase'
import { encrypt } from '@server/lib/encryption'
import { pusher } from '@server/pusher'

/**
 * Server Action: Send a direct message.
 * Encrypts the content server-side and broadcasts via Pusher.
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string
): Promise<{ data: any; error: string | null }> {
  if (!conversationId || !senderId || !content?.trim()) {
    return { data: null, error: 'Missing required fields' }
  }

  try {
    const supabase = getAdminClient()
    const encryptedContent = encrypt(content.trim())

    const { data, error } = await supabase
      .from('messages')
      .insert([{ conversation_id: conversationId, sender_id: senderId, content: encryptedContent }])
      .select()
      .single()

    if (error) throw error

    const message = { ...data, content: content.trim() }

    try {
      await pusher.trigger(`conversation-${conversationId}`, 'new-message', { message })
    } catch (pusherErr) {
      console.warn('[Pusher] Failed to broadcast message:', pusherErr)
    }

    return { data: message, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to send message' }
  }
}

/**
 * Server Action: Get or create a DM conversation.
 */
export async function getOrCreateConversation(
  userId1: string,
  userId2: string
): Promise<{ conversationId: string | null; error: string | null }> {
  if (!userId1 || !userId2) return { conversationId: null, error: 'Missing user IDs' }
  if (userId1 === userId2) return { conversationId: null, error: 'Cannot chat with yourself' }

  try {
    const supabase = getAdminClient()

    const { data: participants } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId1)

    for (const { conversation_id } of participants || []) {
      const { data: other } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conversation_id)
        .eq('user_id', userId2)

      if (other && other.length > 0) return { conversationId: conversation_id, error: null }
    }

    const { data: convo, error: convoError } = await supabase
      .from('conversations')
      .insert([{}])
      .select()
      .single()

    if (convoError) throw convoError

    await supabase.from('conversation_participants').insert([
      { conversation_id: convo.id, user_id: userId1 },
      { conversation_id: convo.id, user_id: userId2 },
    ])

    return { conversationId: convo.id, error: null }
  } catch (err) {
    return { conversationId: null, error: err instanceof Error ? err.message : 'Failed' }
  }
}
