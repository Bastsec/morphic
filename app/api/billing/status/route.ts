import { NextResponse } from "next/server"

import { eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { userBilling, type UserBilling } from "@/lib/db/schema"
import { createClient } from "@/lib/supabase/server"
import { withRLS } from "@/lib/db/with-rls"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    const userId = data.user?.id
    if (!userId) {
      // Not signed in — return not premium to promote signup
      return NextResponse.json({ premium: false })
    }
    const row = await withRLS<UserBilling | undefined>(userId, tx =>
      tx.query.userBilling.findFirst({
        where: eq(userBilling.userId, userId)
      })
    )
    const premium = row?.status === 'premium'
    return NextResponse.json({ premium, plan: row?.planCode ?? null })
  } catch (e: any) {
    return NextResponse.json({ premium: false, error: e?.message }, { status: 200 })
  }
}

// Ensure this route runs on Node.js runtime and is always dynamic
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
