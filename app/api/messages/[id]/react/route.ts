import { NextRequest, NextResponse } from 'next/server'
import { storage } from '../../../../../server/storage'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, reaction } = await req.json()
    if (!userId || !reaction) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    const result = await storage.toggleMessageReaction(params.id, userId, reaction)
    try {
      const { pusher } = await import('../../../../../server/pusher')
      const channel = `conversation-${params.id}`
      await pusher.trigger(channel, 'message-reaction', {
        messageId: params.id, userId, reaction,
        action: result ? 'added' : 'removed',
      })
    } catch (err) {
      console.error('[Pusher] Error broadcasting message reaction:', err)
    }
    return NextResponse.json({ ok: true, reaction: result })
  } catch (error) {
    console.error('Error toggling reaction:', error)
    return NextResponse.json({ error: 'Failed to toggle reaction' }, { status: 500 })
  }
}
