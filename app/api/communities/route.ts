import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@server/storage'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const communities = await storage.searchPublicCommunities(q, page, limit)
    return NextResponse.json({ communities, page, limit })
  } catch (error) {
    console.error('Error searching communities:', error)
    return NextResponse.json({ error: 'Failed to search communities' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, description, visibility, ownerId } = await req.json()
    if (!ownerId || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const community = await storage.createCommunity(ownerId, name, description, visibility)
    return NextResponse.json(community)
  } catch (error) {
    console.error('Error creating community:', error)
    return NextResponse.json({ error: 'Failed to create community' }, { status: 500 })
  }
}
