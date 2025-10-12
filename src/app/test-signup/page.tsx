'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function TestSignupPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testSignup = async () => {
    if (!email) {
      toast.error('Please enter an email')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      console.log('Testing signup with email:', email)
      
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: 'TestPassword123!',
        options: {
          data: {
            name: 'Test User',
            phone: '' // Phone is optional
          },
          emailRedirectTo: `https://sportsvenuebookings.com/auth/signin?returnTo=/app`
        }
      })

      console.log('Signup result:', { data, error })

      setResult({
        success: !error,
        error: error?.message,
        user: data.user ? {
          id: data.user.id,
          email: data.user.email,
          email_confirmed_at: data.user.email_confirmed_at,
          created_at: data.user.created_at
        } : null,
        session: data.session ? 'Session created' : 'No session'
      })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Signup test completed - check result below')
      }

    } catch (error) {
      console.error('Signup test error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setResult({
        success: false,
        error: errorMessage,
        user: null
      })
      toast.error('Test failed')
    } finally {
      setLoading(false)
    }
  }

  const checkEmailSettings = async () => {
    try {
      // Test if we can access the auth settings
      const response = await fetch('/api/test-admin-permissions')
      const data = await response.json()
      
      setResult({
        admin_test: data,
        timestamp: new Date().toISOString()
      })
      
      toast.success('Admin permissions checked')
    } catch (error) {
      toast.error('Failed to check admin permissions')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Signup & Email Test Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Test User Signup</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Test Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="space-x-4">
              <button
                onClick={testSignup}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Signup'}
              </button>
              
              <button
                onClick={checkEmailSettings}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Check Admin Permissions
              </button>
            </div>
          </div>
        </div>

        {result && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Result</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Email Configuration Checklist</h2>
          <ul className="space-y-2 text-sm">
            <li>✅ <strong>SMTP Settings:</strong> Go to Supabase Dashboard → Settings → Authentication → SMTP Settings</li>
            <li>✅ <strong>Enable custom SMTP:</strong> Should be enabled with Gmail or Resend settings</li>
            <li>✅ <strong>Email confirmations:</strong> Should be enabled in Authentication Settings</li>
            <li>✅ <strong>Site URL:</strong> Should be set to https://sportsvenuebookings.com</li>
            <li>✅ <strong>Redirect URLs:</strong> Should include https://sportsvenuebookings.com/**</li>
            <li>✅ <strong>Email template:</strong> Should be updated with SportsVenueBookings branding</li>
          </ul>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Testing Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Enter a test email address above</li>
            <li>Click &quot;Test Signup&quot; to create a test account</li>
            <li>Check the result below for success/failure</li>
            <li>Check your email inbox (and spam folder) for confirmation email</li>
            <li>If no email arrives, check SMTP settings in Supabase dashboard</li>
            <li>Try the actual signup form at /auth/signup</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
