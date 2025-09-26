import { type NextRequest, NextResponse } from 'next/server'

import { buildRedirectUrl } from '@/lib/auth/redirect'

// Edge-safe session gate for middleware.
// Avoids importing Supabase client (which pulls in Node APIs disallowed on Edge).
export async function updateSession(request: NextRequest) {
  // Start with a pass-through response
  const response = NextResponse.next({ request })

  // Public paths that never require auth
  const publicPaths = [
    '/',
    '/auth',
    '/share',
    '/api'
  ]

  const pathname = request.nextUrl.pathname
  const isPublic = publicPaths.some(path => pathname.startsWith(path))

  // Heuristic: consider user authenticated if a Supabase auth cookie exists.
  // Default cookie key is `sb-<project-ref>-auth-token` (possibly chunked).
  const hasSupabaseAuthCookie = request.cookies
    .getAll()
    .some(c => /\bsb-.*-auth-token(\.|$)/.test(c.name) && !!c.value)

  if (!isPublic && !hasSupabaseAuthCookie) {
    const redirectUrl = buildRedirectUrl(request, request.nextUrl.origin, '/auth/login')
    return NextResponse.redirect(redirectUrl)
  }

  return response
}
