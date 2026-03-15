import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await req.json()
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }
    try {
      const { pusher } = await import('@server/pusher')
      const channel = `conversation-${params.id}`
      await pusher.trigger(channel, 'typing', { userId })
    } catch (err) {
      console.error('[Pusher] Error broadcasting typing:', err)
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error sending typing:', error)
    return NextResponse.json({ error: 'Failed to send typing' }, { status: 500 })
  }
}
