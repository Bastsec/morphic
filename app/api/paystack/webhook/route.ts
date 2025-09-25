import { NextRequest, NextResponse } from "next/server"

import crypto from "crypto"
import { eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { payments, userBilling } from "@/lib/db/schema"
import { withRLS } from "@/lib/db/with-rls"

export const runtime = "nodejs" // ensure Node runtime so we can verify HMAC

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

// Verify webhook signature — Paystack sends x-paystack-signature header.
function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!signature || !PAYSTACK_SECRET_KEY) return false
  const hash = crypto.createHmac("sha512", PAYSTACK_SECRET_KEY).update(rawBody).digest("hex")
  return hash === signature
}

export async function POST(req: NextRequest) {
  if (!PAYSTACK_SECRET_KEY) {
    return NextResponse.json({ ok: false, error: "Server not configured" }, { status: 500 })
  }

  const signature = req.headers.get("x-paystack-signature")
  const rawBody = await req.text()

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 })
  }

  const event = JSON.parse(rawBody)

  // Minimal handling — you should persist results and provision access here.
  // We intentionally don’t mutate app state in this patch to keep scope tight.
  // Recommended: validate amount == 60000 (KES 600) before granting benefits.
  switch (event?.event) {
    case "charge.success":
      try {
        const data = event.data || {}
        const amount = Number(data.amount)
        const currency = data.currency
        const reference = data.reference
        const channel = data.channel
        const metadata = data.metadata || {}
        const userId = metadata.user_id as string | undefined

        // Only proceed for our premium product and correct amount
        const expectedAmount = 600 * 100
        if (Number.isFinite(amount) && amount === expectedAmount && userId) {
          // Insert payment and upgrade user inside RLS context for that user
          await withRLS(userId, async tx => {
            await tx.insert(payments).values({
              userId,
              reference,
              amount,
              currency,
              status: 'success',
              channel,
              metadata: { provider: 'paystack', raw: { event: event.event } }
            })

            // Upsert billing status to premium
            const existing = await tx
              .select()
              .from(userBilling)
              .where(eq(userBilling.userId, userId))
              .limit(1)
            if (existing.length > 0) {
              await tx
                .update(userBilling)
                .set({ status: 'premium', provider: 'paystack', updatedAt: new Date() })
                .where(eq(userBilling.userId, userId))
            } else {
              await tx.insert(userBilling).values({
                userId,
                status: 'premium',
                provider: 'paystack'
              })
            }
          })
        }
      } catch (e) {
        // Swallow to avoid webhook retries storms; monitor logs instead
        console.error('Webhook charge.success handling error', e)
      }
      break
    case "subscription.create":
    case "invoice.create":
    case "invoice.update":
    case "invoice.payment_failed":
    case "subscription.disable":
    case "subscription.not_renew":
      // Optional: track subscription lifecycle for analytics or access control.
      break
    default:
      break
  }

  return NextResponse.json({ ok: true })
}
