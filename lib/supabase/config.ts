interface SupabaseServerConfig {
  supabaseUrl: string
  supabaseKey: string
}

export function getSupabaseServerConfig(): SupabaseServerConfig {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? ''
  const supabaseKey =
    process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables are not configured')
  }

  return { supabaseUrl, supabaseKey }
}

export function isSupabaseConfigured() {
  try {
    getSupabaseServerConfig()
    return true
  } catch {
    return false
  }
}

// Check for browser-side configuration (values are inlined at build time).
// Used by client components/hooks to avoid creating a Supabase client when
// NEXT_PUBLIC_* env vars were not provided at build time.
export function isSupabaseBrowserConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
