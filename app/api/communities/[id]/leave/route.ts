import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@server/storage'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await req.json().catch(() => ({}))
    const searchParams = new URL(req.url).searchParams
    const uid = userId || searchParams.get('userId')
    if (!uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await storage.leaveCommunity(params.id, uid)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error leaving community:', error)
    return NextResponse.json({ error: 'Failed to leave community' }, { status: 500 })
  }
}
