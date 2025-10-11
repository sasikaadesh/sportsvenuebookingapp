'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function TestEmailConfigPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testBuiltInEmail = async () => {
    if (!email) {
      toast.error('Please enter an email')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      console.log('Testing built-in email with:', email)
      
      // Test signup with built-in Supabase email
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: 'TestPassword123!',
        options: {
          data: {
            name: 'Test User'
          }
          // No custom emailRedirectTo - use Supabase default
        }
      })

      console.log('Signup result:', { data, error })

      setResult({
        success: !error,
        error: error?.message,
        user_created: !!data.user,
        user_confirmed: !!data.user?.email_confirmed_at,
        session_created: !!data.session,
        email_sent: !error && !data.user?.email_confirmed_at ? 'Likely sent (check email)' : 'Not needed or failed',
        user_id: data.user?.id,
        timestamp: new Date().toISOString()
      })

      if (error) {
        toast.error(error.message)
      } else if (data.user?.email_confirmed_at) {
        toast.success('User created and auto-confirmed (no email needed)')
      } else {
        toast.success('User created - check your email for confirmation link!')
      }

    } catch (error) {
      console.error('Test error:', error)
      setResult({
        success: false,
        error: error.message
      })
      toast.error('Test failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Email Configuration Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Built-in Email Service</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Test Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your-email@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              onClick={testBuiltInEmail}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Built-in Email'}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Test Result</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">🎯 Quick Email Setup</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-green-600">✅ For Testing (No SMTP needed):</h3>
              <ol className="list-decimal list-inside text-sm space-y-1 ml-4">
                <li>Go to Supabase Dashboard → Settings → Authentication</li>
                <li>Make sure "Enable email confirmations" is ✅ checked</li>
                <li>Go to SMTP Settings and DISABLE "Enable custom SMTP"</li>
                <li>Test signup above - should get email from noreply@mail.app.supabase.io</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-semibold text-orange-600">⚠️ For Production (SMTP recommended):</h3>
              <ol className="list-decimal list-inside text-sm space-y-1 ml-4">
                <li>Set up Gmail SMTP (see EMAIL-SETUP-COMPLETE-GUIDE.md)</li>
                <li>Enable custom SMTP in Supabase</li>
                <li>Configure Gmail app password</li>
                <li>Test with professional branded emails</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">📧 What to Expect</h2>
          
          <div className="space-y-3 text-sm">
            <div>
              <strong>Built-in Email:</strong>
              <ul className="list-disc list-inside ml-4">
                <li>From: Supabase Auth &lt;noreply@mail.app.supabase.io&gt;</li>
                <li>Subject: Confirm your signup</li>
                <li>Basic text with confirmation link</li>
                <li>May go to spam folder</li>
              </ul>
            </div>
            
            <div>
              <strong>Custom SMTP Email:</strong>
              <ul className="list-disc list-inside ml-4">
                <li>From: SportsVenueBookings &lt;your-email@gmail.com&gt;</li>
                <li>Subject: Welcome to SportsVenueBookings - Confirm Your Account</li>
                <li>Professional HTML design with branding</li>
                <li>More reliable delivery</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
