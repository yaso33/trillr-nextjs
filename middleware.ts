import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * Next.js Middleware – runs on the Edge before every matched request.
 *
 * Responsibilities:
 * 1. Protect private API routes: reject unauthenticated calls to
 *    mutation endpoints (POST/PATCH/DELETE) that require a user session.
 * 2. Add security headers to every response.
 * 3. Leave public routes (health, config, GET reads) untouched.
 */

const PUBLIC_API_PATTERNS = [
  /^\/api\/health$/,
  /^\/api\/config$/,
  /^\/api\/communities(\?.*)?$/,
  /^\/api\/communities\/[^/]+$/,
  /^\/api\/users\/[^/]+$/,
]

const REQUIRES_AUTH_METHODS = ['POST', 'PATCH', 'PUT', 'DELETE']

export function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl
  const method = request.method

  const response = NextResponse.next()

  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  if (pathname.startsWith('/api/') && REQUIRES_AUTH_METHODS.includes(method)) {
    const isPublic = PUBLIC_API_PATTERNS.some((p) => p.test(pathname))
    if (!isPublic) {
      const authHeader = request.headers.get('Authorization')
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
