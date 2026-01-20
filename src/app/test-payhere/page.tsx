"use client"

import { useState } from 'react'
import Script from 'next/script'
import { HeaderMarketing } from '@/components/layout/HeaderMarketing'
import { FooterSimple } from '@/components/layout/FooterSimple'
import { Button } from '@/components/ui/Button'
import { AdminOnlyPage } from '@/components/admin/AdminOnlyPage'

// payhere is injected via external script
declare const payhere: any

function TestPayHerePageContent() {
  const [amount, setAmount] = useState('1000.00')
  const [message, setMessage] = useState<string>('')

  const onPay = async () => {
    setMessage('Preparing payment...')
    const orderId = `TEST-${Date.now()}`
    const currency = 'LKR'

    const res = await fetch('/api/payments/payhere/hash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, amount, currency }),
    })

    const data = await res.json()
    if (!res.ok) {
      setMessage(`Error: ${data.error || 'Failed to get hash'}`)
      return
    }

    setMessage('Opening PayHere popup...')

    // Event handlers
    payhere.onCompleted = function (id: string) {
      setMessage(`Payment completed. OrderID: ${id}. You will be redirected shortly.`)
    }
    payhere.onDismissed = function () {
      setMessage('Payment window closed by user.')
    }
    payhere.onError = function (err: string) {
      setMessage(`Payment error: ${err}`)
    }

    const origin = window.location.origin
    const notifyBase = process.env.NEXT_PUBLIC_APP_URL || origin

    const payment = {
      sandbox: true,
      merchant_id: data.merchantId,
      return_url: `${origin}/test-payhere/return?order_id=${encodeURIComponent(orderId)}`,
      cancel_url: `${origin}/test-payhere/cancel?order_id=${encodeURIComponent(orderId)}`,
      notify_url: `${notifyBase}/api/payments/payhere/notify`,
      order_id: orderId,
      items: 'Test Payment',
      amount: data.amount,
      currency,
      hash: data.hash,
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      phone: '0712345678',
      address: 'No. 1, Example Road',
      city: 'Colombo',
      country: 'Sri Lanka',
    }

    payhere.startPayment(payment)
  }

  return (
    <>
      <Script src="https://www.payhere.lk/lib/payhere.js" strategy="beforeInteractive" />
      <HeaderMarketing />
      <main className="min-h-[60vh] w-full max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-4">PayHere Sandbox Test</h1>
        <p className="text-gray-600 mb-6">Use this page to verify the PayHere sandbox flow (hash generated server-side).</p>
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm text-gray-700">Amount (LKR)</span>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value || 0).toFixed(2))}
              className="mt-1 w-48 rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
          <Button onClick={onPay} className="bg-blue-600 hover:bg-blue-700 text-white">
            Pay with PayHere (Sandbox)
          </Button>
          {message && <p className="text-sm text-gray-700">{message}</p>}
          <div className="text-xs text-gray-500 mt-6">
            Note: PayHere does not send status to the return URL. The server receives it at notify_url and verifies via md5sig.
          </div>
        </div>
      </main>
      <FooterSimple />
    </>
  )
}

export default function TestPayHerePage() {
  return (
    <AdminOnlyPage pageName="Test PayHere">
      <TestPayHerePageContent />
    </AdminOnlyPage>
  )
}

