import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@server/storage'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reactions = await storage.getPostReactions(params.id)
    return NextResponse.json(reactions)
  } catch (error) {
    console.error('Error fetching post reactions:', error)
    return NextResponse.json({ error: 'Failed to fetch reactions' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, reaction } = await req.json()
    if (!userId || !reaction) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const result = await storage.togglePostReaction(params.id, userId, reaction)
    return NextResponse.json({ success: true, reaction: result })
  } catch (error) {
    console.error('Error toggling post reaction:', error)
    return NextResponse.json({ error: 'Failed to toggle reaction' }, { status: 500 })
  }
}
