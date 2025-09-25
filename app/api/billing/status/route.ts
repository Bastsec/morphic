import { NextResponse } from "next/server"

import { eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { userBilling } from "@/lib/db/schema"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    const userId = data.user?.id
    if (!userId) {
      // Not signed in — return not premium to promote signup
      return NextResponse.json({ premium: false })
    }
    const row = await db.query.userBilling.findFirst({
      where: eq(userBilling.userId, userId)
    })
    const premium = row?.status === 'premium'
    return NextResponse.json({ premium, plan: row?.planCode ?? null })
  } catch (e: any) {
    return NextResponse.json({ premium: false, error: e?.message }, { status: 200 })
  }
}

