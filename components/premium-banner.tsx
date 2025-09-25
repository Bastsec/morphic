'use client'

import * as React from 'react'
import Link from 'next/link'

import { Crown, X } from 'lucide-react'

const DISMISS_KEY = 'premium_banner_v1_dismissed'

/**
 * Small floating banner to promote Premium. We keep it subtle and dismissible,
 * and hide it for premium users by checking a lightweight status API.
 */
export default function PremiumBanner() {
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const isDismissed =
      typeof window !== 'undefined' && localStorage.getItem(DISMISS_KEY)
    if (isDismissed) return

    const check = async () => {
      try {
        const res = await fetch('/api/billing/status', { cache: 'no-store' })
        if (!res.ok) throw new Error('status failed')
        const data = await res.json()
        if (!data?.premium) {
          // Delay slightly to avoid popping during first contentful paint
          setTimeout(() => setVisible(true), 1200)
        }
      } catch {
        // Assume not premium on failure; still keep conservative UX
        setTimeout(() => setVisible(true), 1500)
      }
    }
    check()
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-4 z-40 animate-in slide-in-from-bottom-5 duration-300">
      <div className="relative bg-background/95 backdrop-blur border rounded-lg shadow-sm p-3 pr-6 max-w-[320px]">
        <button
          onClick={() => {
            localStorage.setItem(DISMISS_KEY, 'true')
            setVisible(false)
          }}
          className="absolute -top-2 -right-2 bg-background border rounded-full p-1 text-muted-foreground hover:text-foreground transition-colors shadow-sm"
          aria-label="Close"
        >
          <X className="h-3 w-3" />
        </button>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-primary">
            <Crown className="h-4 w-4" />
          </div>
          <div className="text-sm leading-tight">
            <p className="font-medium">Upgrade to Premium</p>
            <p className="text-muted-foreground">
              KES 600/mo • Higher limits & Premium Models
            </p>
            <div className="mt-2">
              <Link
                href="/pricing"
                className="inline-flex items-center text-xs px-2 py-1 rounded-md border hover:bg-accent transition-colors"
              >
                View pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
