import { NextRequest, NextResponse } from 'next/server'
import { storage } from '../../../../../server/storage'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await req.json()
    if (!userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    await storage.markConversationRead(params.id, userId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking conversation as read:', error)
    return NextResponse.json({ error: 'Failed to mark conversation as read' }, { status: 500 })
  }
}
