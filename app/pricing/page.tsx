import { Metadata } from 'next'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

import SubscribeButton from '@/components/payments/subscribe-button'

export const metadata: Metadata = {
  title: 'Pricing • Bastion',
  description: 'Upgrade to Premium and support Bastion.'
}

export default function PricingPage() {
  return (
    <div className="w-full flex justify-center px-6 py-12 pb-28 sm:pb-12">
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Pricing</h1>
          <p className="text-muted-foreground mt-2">
            Pick the plan that fits your workflow. Upgrade or cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:justify-center sm:justify-items-center">
          {/* Free plan for context */}
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>
                Explore Bastion with essential tools for everyday questions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-semibold">KES 0</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <ul className="text-sm space-y-2 list-disc pl-5">
                <li>Access to GPT-5-mini</li>
                <li>Access to basic web search</li>
              </ul>
            </CardContent>
          </Card>

          {/* Premium plan */}
          <Card className="w-full max-w-sm border-primary/50">
            <CardHeader>
              <CardTitle>Premium</CardTitle>
              <CardDescription>
                Unlock deeper research, richer answers, and dedicated support.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-semibold">KES 600</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <ul className="text-sm space-y-2 list-disc pl-5 mb-6">
                <li>500 requests to GPT-5 (high) daily</li>
                <li>Access to deep research</li>
                <li>Access to adaptive research and planning</li>
                <li>Priority support</li>
              </ul>
              <SubscribeButton />
              <p className="text-xs text-muted-foreground mt-2">
                Payments via card, bank details, or mobile money (M‑PESA).
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Mobile sticky subscribe CTA */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-20 border-t bg-background/80 backdrop-blur px-4 py-3 pb-safe">
        <div className="w-full max-w-4xl mx-auto">
          <SubscribeButton className="w-full" label="Subscribe for KES 600" />
        </div>
      </div>
    </div>
  )
}
