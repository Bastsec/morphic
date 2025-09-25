import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL
const PLAN_CODE = process.env.PAYSTACK_PLAN_CODE_KES_600

export async function POST(_req: NextRequest) {
  if (!PAYSTACK_SECRET_KEY) {
    return NextResponse.json(
      {
        status: false,
        error: 'Server not configured (missing PAYSTACK_SECRET_KEY).'
      },
      { status: 500 }
    )
  }

  try {
    // Prefer authenticated user email when available.
    let email: string | null = null
    let userId: string | null = null
    try {
      const supabase = await createClient()
      const { data } = await supabase.auth.getUser()
      email = data.user?.email ?? null
      userId = data.user?.id ?? null
    } catch {
      // No-op. We'll require email if not logged in in the future.
    }

    if (!email) {
      return NextResponse.json(
        { status: false, error: 'Please sign in to subscribe.' },
        { status: 401 }
      )
    }

    const amountKES = 600
    const amountSubunit = amountKES * 100 // KES uses 2dp subunit

    const callbackUrl = SITE_URL
      ? `${SITE_URL.replace(/\/$/, '')}/payments/callback`
      : undefined

    const initBody: Record<string, any> = {
      email,
      amount: String(amountSubunit),
      currency: 'KES',
      // Allow multiple channels including mobile money and bank transfer.
      channels: ['card', 'bank', 'mobile_money', 'bank_transfer'],
      metadata: {
        plan: 'premium_monthly_kes_600',
        product: 'Bastion Premium',
        cancel_action: SITE_URL ? `${SITE_URL}/pricing` : undefined,
        user_id: userId // used by webhook to associate payment to user
      }
    }

    // If a plan code is configured, attach it to create a subscription for card payments.
    if (PLAN_CODE) {
      initBody.plan = PLAN_CODE
    }
    if (callbackUrl) {
      initBody.callback_url = callbackUrl
    }

    const resp = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(initBody)
    })

    const json = await resp.json()
    if (!resp.ok || !json?.status) {
      return NextResponse.json(
        {
          status: false,
          error: json?.message || 'Failed to create transaction'
        },
        { status: 400 }
      )
    }

    return NextResponse.json(json)
  } catch (err: any) {
    return NextResponse.json(
      { status: false, error: err?.message || 'Unexpected server error' },
      { status: 500 }
    )
  }
}
