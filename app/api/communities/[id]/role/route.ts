import { NextRequest, NextResponse } from 'next/server'
import { storage } from '../../../../../server/storage'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }
    const role = await storage.getUserRoleInCommunity(params.id, userId)
    return NextResponse.json({ role })
  } catch (error) {
    console.error('Error fetching user role:', error)
    return NextResponse.json({ error: 'Failed to fetch user role' }, { status: 500 })
  }
}
