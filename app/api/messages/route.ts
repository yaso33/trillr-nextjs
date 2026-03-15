import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@server/storage'

export async function POST(req: NextRequest) {
  try {
    const { conversationId, senderId, content } = await req.json()
    if (!conversationId || !senderId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const message = await storage.sendMessage(conversationId, senderId, content)
    try {
      const { pusher } = await import('@server/pusher')
      const channel = `conversation-${conversationId}`
      await pusher.trigger(channel, 'new-message', { message })
    } catch (err) {
      console.error('[Pusher] Error broadcasting message:', err)
    }
    return NextResponse.json(message)
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
