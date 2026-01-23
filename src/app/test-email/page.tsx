'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function TestEmailPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    details?: any
  } | null>(null)

  const handleTest = async () => {
    if (!email) {
      toast.error('Please enter an email address')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      console.log('Testing password reset email for:', email)
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      console.log('Response:', { data, error })

      if (error) {
        setResult({
          success: false,
          message: error.message,
          details: error
        })
        toast.error('Email test failed')
      } else {
        setResult({
          success: true,
          message: 'Password reset email request sent successfully!',
          details: data
        })
        toast.success('Check your email and browser console')
      }
    } catch (error: any) {
      console.error('Exception:', error)
      setResult({
        success: false,
        message: error.message || 'Unexpected error occurred',
        details: error
      })
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const checkSupabaseConfig = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    return {
      configured: url && url !== 'https://placeholder.supabase.co',
      url: url || 'Not configured',
      keyLength: key?.length || 0
    }
  }

  const config = checkSupabaseConfig()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Email Configuration Test</h1>
              <p className="text-gray-600">Test Supabase password reset email delivery</p>
            </div>
          </div>

          {/* Supabase Config Status */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Supabase Configuration</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${config.configured ? 'text-green-600' : 'text-red-600'}`}>
                  {config.configured ? '✓ Configured' : '✗ Not Configured'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">URL:</span>
                <span className="font-mono text-xs text-gray-900">{config.url}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">API Key Length:</span>
                <span className="font-medium text-gray-900">{config.keyLength} characters</span>
              </div>
            </div>
          </div>

          {/* Test Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email to test"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use an email address that exists in your Supabase Auth users
              </p>
            </div>

            <Button
              onClick={handleTest}
              loading={loading}
              disabled={!email || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Send Test Email
            </Button>
          </div>
        </motion.div>

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-xl shadow-lg p-8 ${
              result.success ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
            }`}
          >
            <div className="flex items-start space-x-3">
              {result.success ? (
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              )}
              <div className="flex-1">
                <h3 className={`font-semibold mb-2 ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                  {result.success ? 'Success!' : 'Error'}
                </h3>
                <p className="text-gray-700 mb-4">{result.message}</p>
                
                {result.details && (
                  <details className="bg-gray-50 rounded p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 mb-2">
                      Technical Details
                    </summary>
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mt-6"
        >
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">Important Notes</h3>
              <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                <li>Check browser console (F12) for detailed logs</li>
                <li>Check your email inbox AND spam folder</li>
                <li>Supabase default email has rate limits (4 emails/hour)</li>
                <li>For production, configure custom SMTP in Supabase Dashboard</li>
                <li>See SUPABASE-EMAIL-SETUP.md for detailed configuration guide</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

