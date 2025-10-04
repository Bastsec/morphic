"use client"

import * as React from "react"
import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function PaystackCallbackContent() {
  const search = useSearchParams()
  const reference = search.get("reference")
  const router = useRouter()
  const [status, setStatus] = React.useState<string | null>(null)
  const [amountValid, setAmountValid] = React.useState<boolean | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [activating, setActivating] = React.useState(false)

  React.useEffect(() => {
    const verify = async () => {
      if (!reference) return
      try {
        const res = await fetch(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`)
        const data = await res.json()
        if (!res.ok || !data?.status) {
          throw new Error(data?.error || data?.message || "Verification failed")
        }
        setStatus(data?.data?.status ?? null)
        setAmountValid(Boolean(data?.amountValid))
      } catch (e: any) {
        setError(e?.message || "Unable to verify transaction")
      }
    }
    verify()
  }, [reference])

  // After verification success, poll billing status and redirect when premium is active
  React.useEffect(() => {
    let intervalId: any
    const pollAndRedirect = async () => {
      setActivating(true)
      const start = Date.now()
      while (Date.now() - start < 60000) {
        try {
          const res = await fetch('/api/billing/status', { cache: 'no-store' })
          const data = await res.json()
          if (data?.premium) {
            router.push('/')
            return
          }
        } catch {}
        await new Promise(r => setTimeout(r, 2000))
      }
      setActivating(false)
    }

    if (status === 'success' && amountValid) {
      pollAndRedirect()
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [status, amountValid, router])

  return (
    <div className="w-full flex justify-center p-6">
      <div className="w-full max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Payment status</CardTitle>
            <CardDescription>We’re validating your payment details.</CardDescription>
          </CardHeader>
          <CardContent>
            {!reference ? (
              <p className="text-sm text-muted-foreground">No reference provided.</p>
            ) : error ? (
              <p className="text-sm text-destructive" role="alert">{error}</p>
            ) : status ? (
              <div className="space-y-2">
                <p className="text-sm">Reference: {reference}</p>
                <p className="text-sm">Status: {status}</p>
                {amountValid === false ? (
                  <p className="text-sm text-destructive">Amount mismatch. Contact support.</p>
                ) : amountValid === true ? (
                  <p className="text-sm text-green-600 dark:text-green-500">Amount verified.</p>
                ) : null}
                {status === 'success' && amountValid ? (
                  <p className="text-sm text-muted-foreground">
                    {activating
                      ? 'Activating Premium on your account… You will be redirected shortly.'
                      : 'Premium activation pending. If not redirected automatically, continue below.'}
                  </p>
                ) : null}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => router.push('/')}
                    className="text-sm underline"
                  >
                    Continue to home
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Verifying reference {reference}...</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function PaystackCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex justify-center p-6">
          <div className="w-full max-w-lg">
            <Card>
              <CardHeader>
                <CardTitle>Payment status</CardTitle>
                <CardDescription>Loading payment details…</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Preparing verification…</p>
              </CardContent>
            </Card>
          </div>
        </div>
      }
    >
      <PaystackCallbackContent />
    </Suspense>
  )
}
