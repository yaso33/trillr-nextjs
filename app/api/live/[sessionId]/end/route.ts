import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@server/storage'

export async function POST(
  _req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    await storage.endLiveSession(params.sessionId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error ending live session:', error)
    return NextResponse.json({ error: 'Failed to end live session' }, { status: 500 })
  }
}
