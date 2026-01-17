import { NextResponse } from 'next/server'
import crypto from 'crypto'

function formatAmount(amount: number | string) {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount
  if (!isFinite(n)) throw new Error('Invalid amount')
  return n.toFixed(2)
}

function md5Upper(input: string) {
  return crypto.createHash('md5').update(input).digest('hex').toUpperCase()
}

export async function POST(req: Request) {
  try {
    const { orderId, amount, currency = 'LKR' } = await req.json()

    if (!orderId) return NextResponse.json({ error: 'orderId is required' }, { status: 400 })

    const merchantId = process.env.PAYHERE_MERCHANT_ID
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET

    if (!merchantId || !merchantSecret) {
      return NextResponse.json({ error: 'PAYHERE env vars missing' }, { status: 500 })
    }

    const amt = formatAmount(amount)
    const secretHash = md5Upper(merchantSecret)
    const hash = md5Upper(`${merchantId}${orderId}${amt}${currency}${secretHash}`)

    return NextResponse.json({
      hash,
      merchantId,
      amount: amt,
      currency,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unexpected error' }, { status: 400 })
  }
}

