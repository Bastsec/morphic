import { NextRequest, NextResponse } from 'next/server'

import { buildRedirectUrl } from '@/lib/auth/redirect'
import { createRouteClient } from '@/lib/supabase/route-client'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const redirectUrl = buildRedirectUrl(request, origin, next)
    const response = NextResponse.redirect(redirectUrl)
    const supabase = createRouteClient(request, response)
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return response
    }
    const message =
      error instanceof Error ? error.message : 'OAuth exchange failed'
    return NextResponse.redirect(
      buildRedirectUrl(
        request,
        origin,
        `/auth/error?error=${encodeURIComponent(message)}`
      )
    )
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(
    buildRedirectUrl(request, origin, '/auth/error')
  )
}
