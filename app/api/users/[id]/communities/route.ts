import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@server/storage'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const communities = await storage.listCommunitiesForUser(params.id)
    return NextResponse.json(communities)
  } catch (error) {
    console.error('Error fetching user communities:', error)
    return NextResponse.json({ error: 'Failed to fetch communities' }, { status: 500 })
  }
}
