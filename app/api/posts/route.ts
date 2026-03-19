import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@server/storage'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId') || undefined
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const posts = await storage.getPosts(userId, limit)
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const postData = await req.json()
    if (!postData.author_id || !postData.content || !postData.community_id || !postData.title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const post = await storage.createPost(postData)
    return NextResponse.json(post)
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
