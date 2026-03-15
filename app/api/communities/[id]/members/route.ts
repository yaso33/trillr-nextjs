import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@server/storage'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const members = await storage.getCommunityMembers(params.id)
    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching community members:', error)
    return NextResponse.json({ error: 'Failed to fetch community members' }, { status: 500 })
  }
}
