import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@server/storage'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const community = await storage.getCommunity(params.id)
    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 })
    }
    return NextResponse.json(community)
  } catch (error) {
    console.error('Error fetching community:', error)
    return NextResponse.json({ error: 'Failed to fetch community' }, { status: 500 })
  }
}
