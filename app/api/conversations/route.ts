import { NextRequest, NextResponse } from 'next/server'
import { storage } from '../../../server/storage'

export async function POST(req: NextRequest) {
  try {
    const { userId1, userId2 } = await req.json()
    if (!userId1 || !userId2) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (userId1 === userId2) {
      return NextResponse.json({ error: 'Cannot create conversation with yourself' }, { status: 400 })
    }
    const conversationId = await storage.getOrCreateConversation(userId1, userId2)
    return NextResponse.json({ conversationId })
  } catch (error: any) {
    console.error('Error creating/getting conversation:', error)
    return NextResponse.json({ error: error?.message || 'Failed to create conversation' }, { status: 500 })
  }
}
