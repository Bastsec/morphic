import { NextRequest, NextResponse } from "next/server"

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

export async function GET(req: NextRequest) {
  if (!PAYSTACK_SECRET_KEY) {
    return NextResponse.json({ status: false, error: "Server not configured (missing PAYSTACK_SECRET_KEY)." }, { status: 500 })
  }
  const reference = req.nextUrl.searchParams.get("reference")
  if (!reference) {
    return NextResponse.json({ status: false, error: "Missing reference" }, { status: 400 })
  }
  try {
    const resp = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }
    })
    const json = await resp.json()
    if (!resp.ok) {
      return NextResponse.json({ status: false, error: json?.message || "Verification failed" }, { status: 400 })
    }

    // Optionally validate amount equals 600 KES (in subunit) before delivering value.
    const expectedAmount = 600 * 100
    const paidAmount = json?.data?.amount
    const amountValid = typeof paidAmount === "number" ? paidAmount === expectedAmount : true

    return NextResponse.json({ ...json, amountValid })
  } catch (err: any) {
    return NextResponse.json({ status: false, error: err?.message || "Unexpected server error" }, { status: 500 })
  }
}

