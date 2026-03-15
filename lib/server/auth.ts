import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getAdminClient } from './supabase'

export interface AuthUser {
  id: string
  email?: string
}

/**
 * Extract and validate the JWT from the Authorization header.
 * Returns the authenticated user or null.
 */
export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.slice(7)
  if (!token) return null

  try {
    const supabase = getAdminClient()
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return null
    return { id: user.id, email: user.email }
  } catch {
    return null
  }
}

/**
 * Require auth in an API route. Returns a 401 response if not authenticated.
 * Usage:
 *   const authResult = await requireAuth(req)
 *   if (authResult instanceof NextResponse) return authResult
 *   const { user } = authResult
 */
export async function requireAuth(
  req: NextRequest
): Promise<{ user: AuthUser } | NextResponse> {
  const user = await getAuthUser(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return { user }
}
