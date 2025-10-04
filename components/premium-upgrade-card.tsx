'use client'

import * as React from 'react'
import Link from 'next/link'
import { Crown } from 'lucide-react'

/**
 * Minimal gradient card to promote Premium. Renders inline beneath the chat input.
 * Shows a discounted price (KES 500) from the original (KES 900).
 * Only appears for non‑premium users.
 */
export default function PremiumUpgradeCard() {
  const [show, setShow] = React.useState(false)

  React.useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/billing/status', { cache: 'no-store' })
        if (!res.ok) throw new Error('status failed')
        const data = await res.json()
        if (!data?.premium) setShow(true)
      } catch {
        // Assume not premium on failure to keep promotion visible
        setShow(true)
      }
    }
    check()
  }, [])

  if (!show) return null

  return (
    <div
      className="relative mx-auto max-w-[320px] overflow-hidden rounded-xl border bg-gradient-to-r from-primary/10 to-background p-3"
      aria-label="Upgrade to Premium"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-primary" />
          <div className="leading-tight">
            <p className="text-sm font-medium">Upgrade to Premium</p>
            <div className="mt-0.5">
              <span className="text-sm font-semibold">KES 500</span>
              <span className="ml-2 text-xs text-muted-foreground line-through">KES 900</span>
            </div>
          </div>
        </div>
        <Link
          href="/pricing"
          className="shrink-0 rounded-full px-3 py-1 text-xs font-medium border hover:bg-accent transition-colors"
        >
          Upgrade
        </Link>
      </div>
    </div>
  )
}
