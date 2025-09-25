import { NextRequest, NextResponse } from 'next/server'

import { type EmailOtpType } from '@supabase/supabase-js'

import { buildRedirectUrl } from '@/lib/auth/redirect'
import { createRouteClient } from '@/lib/supabase/route-client'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const redirectUrl = buildRedirectUrl(request, origin, next)
    const response = NextResponse.redirect(redirectUrl)
    const supabase = createRouteClient(request, response)
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash
    })
    if (!error) {
      // redirect user to specified redirect URL or root of app
      return response
    }

    const errorMessage = error?.message ?? 'Verification failed'
    return NextResponse.redirect(
      buildRedirectUrl(
        request,
        origin,
        `/auth/error?error=${encodeURIComponent(errorMessage)}`
      )
    )
  }

  // redirect the user to an error page with some instructions
  const error = token_hash && type ? 'Unknown error' : 'No token hash or type'
  return NextResponse.redirect(
    buildRedirectUrl(
      request,
      origin,
      `/auth/error?error=${encodeURIComponent(error)}`
    )
  )
}
