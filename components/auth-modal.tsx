'use client'

import { useState } from 'react'

import { createClient } from '@/lib/supabase/client'
import { isSupabaseBrowserConfigured } from '@/lib/supabase/config'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { IconGoogle, IconLogo } from '@/components/ui/icons'

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleAuth = async () => {
    if (!isSupabaseBrowserConfigured()) {
      setError('Sign-in is not configured. Please contact support.')
      return
    }
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/auth/oauth`
        }
      })
      if (error) throw error
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : 'An OAuth error occurred'
      )
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-muted">
            <IconLogo className="size-14" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            Create a Free Account with Us
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Sign in or create your account using Google.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 space-y-3">
          <Button
            className="w-full"
            size="lg"
            variant="outline"
            onClick={handleGoogleAuth}
            disabled={isLoading}
          >
            <IconGoogle className="mr-2 h-4 w-4" />
            {isLoading ? 'Redirecting...' : 'Continue with Google'}
          </Button>
          {error ? (
            <p className="text-center text-sm text-red-500">{error}</p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
