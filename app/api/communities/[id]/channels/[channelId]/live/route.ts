import { NextRequest, NextResponse } from 'next/server'
import { storage } from '../../../../../../server/storage'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; channelId: string } }
) {
  try {
    const { hostId, title } = await req.json()
    if (!hostId) {
      return NextResponse.json({ error: 'Missing hostId' }, { status: 400 })
    }
    const session = await storage.createLiveSession(params.channelId, hostId, title)
    try {
      const { pusher } = await import('../../../../../../server/pusher')
      const channel = `community-${params.id}-channel-${params.channelId}`
      await pusher.trigger(channel, 'live-start', { session })
    } catch (err) {
      console.error('[Pusher] Error broadcasting live start:', err)
    }
    return NextResponse.json(session)
  } catch (error) {
    console.error('Error starting live session:', error)
    return NextResponse.json({ error: 'Failed to start live session' }, { status: 500 })
  }
}
