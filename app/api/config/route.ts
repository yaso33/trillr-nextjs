import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY,
    },
    agora: {
      appId: process.env.NEXT_PUBLIC_AGORA_APP_ID || process.env.VITE_AGORA_APP_ID,
    },
  })
}
