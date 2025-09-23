"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PaystackCallbackPage() {
  const search = useSearchParams()
  const reference = search.get("reference")
  const [status, setStatus] = React.useState<string | null>(null)
  const [amountValid, setAmountValid] = React.useState<boolean | null>(null)
  const [error, setError] = React.useState<string | null>(null)

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

