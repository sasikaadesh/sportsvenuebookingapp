import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'

function md5Upper(input: string) {
  return crypto.createHash('md5').update(input).digest('hex').toUpperCase()
}

function mapStatus(statusCode: string) {
  switch (Number(statusCode)) {
    case 2:
      return { status: 'confirmed', payment_status: 'paid' as const }
    case 0:
      return { status: 'pending', payment_status: 'pending' as const }
    case -1:
      return { status: 'cancelled', payment_status: 'failed' as const }
    case -2:
      return { status: 'cancelled', payment_status: 'failed' as const }
    case -3:
      return { status: 'cancelled', payment_status: 'failed' as const }
    default:
      return { status: 'pending', payment_status: 'pending' as const }
  }
}

export async function POST(req: Request) {
  // PayHere sends application/x-www-form-urlencoded
  const raw = await req.text()
  const params = new URLSearchParams(raw)

  const merchant_id = params.get('merchant_id') || ''
  const order_id = params.get('order_id') || ''
  const payhere_amount = params.get('payhere_amount') || ''
  const payhere_currency = params.get('payhere_currency') || ''
  const status_code = params.get('status_code') || ''
  const md5sig = params.get('md5sig') || ''

  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || ''
  const localSig = md5Upper(
    `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${md5Upper(merchantSecret)}`
  )

  const verified = md5sig && localSig === md5sig

  // Try to update a booking if order_id looks like UUID
  let updateResult: any = null
  if (verified && order_id && /[0-9a-fA-F-]{36}/.test(order_id)) {
    const mapped = mapStatus(status_code)
    updateResult = await (supabaseAdmin as any)
      .from('bookings')
      .update({ status: mapped.status, payment_status: mapped.payment_status })
      .eq('id', order_id)
      .select('id')
      .single()
  }

  // Always respond 200 so PayHere does not retry endlessly
  return NextResponse.json({ verified, order_id, status_code, updated: !!updateResult })
}

