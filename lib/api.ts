import { NextResponse } from 'next/server'

type ApiHandler<T = unknown> = () => Promise<T>

/**
 * Wraps an API route handler with consistent error handling.
 * Usage:
 *   return withErrorHandling(async () => {
 *     const data = await storage.getPosts()
 *     return NextResponse.json(data)
 *   })
 */
export async function withErrorHandling(
  handler: ApiHandler<NextResponse>
): Promise<NextResponse> {
  try {
    return await handler()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('[API Error]', message, error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * Standard success response.
 */
export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status })
}

/**
 * Standard error responses.
 */
export const ApiError = {
  badRequest: (msg = 'Bad request') =>
    NextResponse.json({ error: msg }, { status: 400 }),
  unauthorized: (msg = 'Unauthorized') =>
    NextResponse.json({ error: msg }, { status: 401 }),
  notFound: (msg = 'Not found') =>
    NextResponse.json({ error: msg }, { status: 404 }),
  internal: (msg = 'Internal server error') =>
    NextResponse.json({ error: msg }, { status: 500 }),
}
