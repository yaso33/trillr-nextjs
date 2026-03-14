import { NextRequest, NextResponse } from 'next/server'
import { getEmailFromUsername } from '../../../server/api'

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json()
    if (!username) {
      return NextResponse.json({ error: 'Missing username' }, { status: 400 })
    }
    const email = await getEmailFromUsername(username)
    if (!email) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    return NextResponse.json({ email })
  } catch (error) {
    console.error('Error getting email from username:', error)
    return NextResponse.json({ error: 'Failed to get email from username' }, { status: 500 })
  }
}
