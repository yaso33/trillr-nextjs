import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@server/storage'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const messages = await storage.getChannelMessages(params.id)
    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching channel messages:', error)
    return NextResponse.json({ error: 'Failed to fetch channel messages' }, { status: 500 })
  }
}
