import { type NextRequest, NextResponse } from 'next/server'

import { createServerClient } from '@supabase/ssr'

import { buildRedirectUrl } from '@/lib/auth/redirect'

import { getSupabaseServerConfig } from './config'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request
  })

  const { supabaseUrl, supabaseKey } = getSupabaseServerConfig()

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        }
      }
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  // Define public paths that don't require authentication
  const publicPaths = [
    '/', // Root path
    '/auth', // Auth-related pages
    '/share', // Share pages
    '/api' // API routes
    // Add other public paths here if needed
  ]

  const pathname = request.nextUrl.pathname

  // Redirect to login if the user is not authenticated and the path is not public
  if (!user && !publicPaths.some(path => pathname.startsWith(path))) {
    const redirectUrl = buildRedirectUrl(
      request,
      request.nextUrl.origin,
      '/auth/login'
    )

    return NextResponse.redirect(redirectUrl)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
