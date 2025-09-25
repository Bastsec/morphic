import { type NextRequest, NextResponse } from 'next/server'

import { getRequestBaseUrl } from '@/lib/auth/redirect'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const baseUrlString = getRequestBaseUrl(request, request.nextUrl.origin)
  const normalizedBaseUrl = new URL(baseUrlString)
  const protocol = normalizedBaseUrl.protocol.replace(':', '')
  const host = normalizedBaseUrl.host
  const baseUrl = normalizedBaseUrl.origin

  // Create a response
  let response: NextResponse

  // Handle Supabase session if configured
  if (isSupabaseConfigured()) {
    response = await updateSession(request)
  } else {
    // If Supabase is not configured, just pass the request through
    response = NextResponse.next({
      request
    })
  }

  // Add request information to response headers
  response.headers.set('x-url', request.url)
  response.headers.set('x-host', host)
  response.headers.set('x-protocol', protocol)
  response.headers.set('x-base-url', baseUrl)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}
