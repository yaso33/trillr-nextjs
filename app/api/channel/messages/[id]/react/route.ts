import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@server/storage'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, reaction, channelId, communityId } = await req.json()
    if (!userId || !reaction) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    const result = await storage.toggleMessageReaction(params.id, userId, reaction, true)
    try {
      const { pusher } = await import('@server/pusher')
      const channel = `community-${communityId}-channel-${channelId}`
      await pusher.trigger(channel, 'message-reaction', {
        messageId: params.id, userId, reaction,
        action: result ? 'added' : 'removed',
      })
    } catch (err) {
      console.error('[Pusher] Error broadcasting channel message reaction:', err)
    }
    return NextResponse.json({ ok: true, reaction: result })
  } catch (error) {
    console.error('Error toggling channel message reaction:', error)
    return NextResponse.json({ error: 'Failed to toggle reaction' }, { status: 500 })
  }
}
