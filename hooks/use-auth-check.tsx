'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseBrowserConfigured } from '@/lib/supabase/config'
import { User } from '@supabase/supabase-js'

export function useAuthCheck() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If Supabase isn't configured for the browser bundle, skip without error.
    if (!isSupabaseBrowserConfigured()) {
      setLoading(false)
      setUser(null)
      return
    }
    // Create a single Supabase client instance for this effect
    const supabase = createClient()

    const checkAuth = async () => {
      try {
        const {
          data: { session }
        } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Error checking auth:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Subscribe to auth changes using the same client instance
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading, isAuthenticated: !!user }
}
