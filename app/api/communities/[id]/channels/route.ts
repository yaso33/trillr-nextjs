import { NextRequest, NextResponse } from 'next/server'
import { storage } from '../../../../../server/storage'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, type, isPrivate } = await req.json()
    if (!name) {
      return NextResponse.json({ error: 'Missing channel name' }, { status: 400 })
    }
    const channel = await storage.createChannel(params.id, name, type, isPrivate)
    return NextResponse.json(channel)
  } catch (error) {
    console.error('Error creating channel:', error)
    return NextResponse.json({ error: 'Failed to create channel' }, { status: 500 })
  }
}
