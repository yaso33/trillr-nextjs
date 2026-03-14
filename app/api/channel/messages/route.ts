import { NextRequest, NextResponse } from 'next/server'
import { storage } from '../../../../server/storage'

export async function POST(req: NextRequest) {
  try {
    const { channelId, senderId, content, communityId } = await req.json()
    if (!channelId || !senderId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const message = await storage.sendChannelMessage(channelId, senderId, content)
    try {
      const { pusher } = await import('../../../../server/pusher')
      const channel = `community-${communityId || 'unknown'}-channel-${channelId}`
      await pusher.trigger(channel, 'new-channel-message', { message })
    } catch (err) {
      console.error('[Pusher] Error broadcasting channel message:', err)
    }
    return NextResponse.json(message)
  } catch (error) {
    console.error('Error sending channel message:', error)
    return NextResponse.json({ error: 'Failed to send channel message' }, { status: 500 })
  }
}
