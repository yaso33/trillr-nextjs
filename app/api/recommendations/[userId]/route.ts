import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { recommendationEngine } = await import('../../../../server/lib/recommendations')
    const recommendations = await recommendationEngine.getRecommendedPosts(params.userId, 20)
    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error('Error getting recommendations:', error)
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 })
  }
}
