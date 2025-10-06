'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowRightIcon } from '@radix-ui/react-icons'

import { AnimatedShinyText } from '@/components/ui/animated-shiny-text'
import { useAuthCheck } from '@/hooks/use-auth-check'

/**
 * Subtle inline shiny text promoting Premium.
 * Appears below the chat input for signed-in, non-premium users.
 */
export default function PremiumUpgradeInline() {
  const { isAuthenticated } = useAuthCheck()
  const [isPremium, setIsPremium] = React.useState<boolean>(false)
  const [ready, setReady] = React.useState<boolean>(false)

  React.useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/billing/status', { cache: 'no-store' })
        const data = await res.json()
        setIsPremium(!!data?.premium)
      } catch {
        setIsPremium(false)
      } finally {
        setReady(true)
      }
    }
    check()
  }, [])

  // Show for both unauthenticated and authenticated non-premium users
  if (!ready || isPremium) return null

  return (
    <div className="z-10 flex items-center justify-center">
      <Link href="/pricing" className="group">
        <AnimatedShinyText className="inline-flex items-center justify-center px-0 py-0 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
          <span>✨ Upgrade to Premium — KES 500</span>
          <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
        </AnimatedShinyText>
      </Link>
    </div>
  )
}
