import { NextRequest, NextResponse } from 'next/server'
import { storage } from '../../../../../server/storage'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await storage.setMessageRead(params.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error marking message read:', error)
    return NextResponse.json({ error: 'Failed to mark message read' }, { status: 500 })
  }
}
