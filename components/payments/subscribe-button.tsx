"use client"

import * as React from "react"
import Script from "next/script"

import { Button } from "@/components/ui/button"

type InitResponse = {
  status: boolean
  message: string
  data?: {
    access_code: string
    authorization_url: string
    reference: string
  }
  error?: string
}

/**
 * SubscribeButton
 * Renders a button that initializes a Paystack transaction on click and
 * launches the Paystack Popup to complete payment. We load the Inline JS
 * via CDN to avoid adding a new dependency and to keep client bundles lean.
 */
export default function SubscribeButton({
  label = "Subscribe for KES 600",
  className
}: {
  label?: string
  className?: string
}) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const onSubscribe = async () => {
    setError(null)
    setLoading(true)
    try {
      // Initialize transaction on our backend — never call Paystack directly here.
      const res = await fetch("/api/paystack/initialize", {
        method: "POST"
      })
      const data: InitResponse = await res.json()
      if (!res.ok || !data?.status || !data.data?.access_code) {
        throw new Error(data?.message || data?.error || "Failed to initialize payment")
      }

      // Popup v2 — resume with access_code from backend init.
      const paystackPop = (window as any).PaystackPop
      if (!paystackPop) {
        throw new Error("Payment library not loaded. Please retry.")
      }

      const popup = new paystackPop()
      popup.resumeTransaction(data.data.access_code)
    } catch (e: any) {
      setError(e?.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Load Paystack Popup v2 from CDN. Keep it lazy to avoid blocking. */}
      <Script src="https://js.paystack.co/v2/inline.js" strategy="afterInteractive" />
      <div className="flex flex-col items-stretch gap-2">
        <Button onClick={onSubscribe} disabled={loading} className={className}>
          {loading ? "Preparing checkout..." : label}
        </Button>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </>
  )
}

