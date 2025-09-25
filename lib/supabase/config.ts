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
