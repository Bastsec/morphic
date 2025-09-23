import { Metadata } from "next"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import SubscribeButton from "@/components/payments/subscribe-button"

export const metadata: Metadata = {
  title: "Pricing • Morphic",
  description: "Upgrade to Premium and support Morphic."
}

export default function PricingPage() {
  return (
    <div className="w-full flex justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Pricing</h1>
          <p className="text-muted-foreground mt-2">Simple, transparent pricing. Cancel anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free plan for context */}
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>Get started with core features.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-semibold">KES 0</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <ul className="text-sm space-y-2 list-disc pl-5">
                <li>Answer engine access</li>
                <li>Standard rate limits</li>
              </ul>
            </CardContent>
          </Card>

          {/* Premium plan */}
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle>Premium</CardTitle>
              <CardDescription>Support Morphic and unlock more.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-semibold">KES 600</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <ul className="text-sm space-y-2 list-disc pl-5 mb-6">
                <li>Higher rate limits</li>
                <li>Priority processing</li>
                <li>Helps fund development</li>
              </ul>
              <SubscribeButton />
              <p className="text-xs text-muted-foreground mt-2">
                Payments via card, bank details, or mobile money (M‑PESA).
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

