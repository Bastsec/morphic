import { type NextRequest, type NextResponse } from 'next/server'

import { createServerClient } from '@supabase/ssr'

import { getSupabaseServerConfig } from './config'

export function createRouteClient(
  request: NextRequest,
  response: NextResponse
) {
  const { supabaseUrl, supabaseKey } = getSupabaseServerConfig()

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      }
    }
  })
}
