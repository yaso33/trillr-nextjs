import { NextRequest, NextResponse } from 'next/server'
import { storage } from '../../../server/storage'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const startTime = Date.now()
    const fileName = `${Date.now()}-${file.name}`
    const bucketName = 'uploads'
    const buffer = Buffer.from(await file.arrayBuffer())

    const { data, error } = await storage.supabase.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Error uploading to Supabase:', error)
      return NextResponse.json({ error: 'Failed to upload file to Supabase' }, { status: 500 })
    }

    const { data: publicUrlData } = storage.supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path)

    const uploadTime = Date.now() - startTime
    console.log(`✅ File uploaded to Supabase (${uploadTime}ms)`)

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      public_id: data.path,
      size: file.size,
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
