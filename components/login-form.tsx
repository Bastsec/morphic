'use client'

import { useState } from 'react'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/client'
import { isSupabaseBrowserConfigured } from '@/lib/supabase/config'
import { cn } from '@/lib/utils/index'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { IconGoogle, IconLogo } from '@/components/ui/icons'
import PremiumUpgradeInline from './premium-upgrade-inline'
import { WhatsAppLoginForm } from './whatsapp-login-form'

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleLogin = async () => {
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
    <div
      className={cn('flex flex-col items-center gap-6', className)}
      {...props}
    >
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex flex-col items-center justify-center gap-4">
            <IconLogo className="size-12" />
            Sign in to Bastion
          </CardTitle>
          <CardDescription>
            Use Google or WhatsApp credentials to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Button
              variant="outline"
              type="button"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <IconGoogle className="mr-2 h-4 w-4" />
              {isLoading ? 'Redirecting...' : 'Continue with Google'}
            </Button>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="relative my-1 text-center text-xs uppercase tracking-wide text-muted-foreground">
              <span className="relative z-10 bg-card px-2">Or</span>
              <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
            </div>
            <WhatsAppLoginForm />
          </div>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            New to Bastion? Pick a method above to get started.
          </div>
        </CardContent>
      </Card>
      <PremiumUpgradeInline />
      <div className="text-center text-xs text-muted-foreground">
        <Link href="/" className="hover:underline">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  )
}
