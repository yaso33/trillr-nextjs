import { NextRequest, NextResponse } from 'next/server'
import { storage } from '../../../../server/storage'

export async function POST(req: NextRequest) {
  try {
    const { publicId, transformation } = await req.json()
    if (!publicId || !transformation) {
      return NextResponse.json({ error: 'Missing publicId or transformation' }, { status: 400 })
    }
    const transformedUrl = await storage.applyCloudinaryTransformation(publicId, transformation)
    return NextResponse.json({ url: transformedUrl })
  } catch (error) {
    console.error('Error transforming image:', error)
    return NextResponse.json({ error: 'Failed to transform image' }, { status: 500 })
  }
}
