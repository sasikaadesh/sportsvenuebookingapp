'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AppLayout } from '@/components/layout/AppLayout'
import toast from 'react-hot-toast'
import emailjs from '@emailjs/browser'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      console.log('🔍 Attempting to send password reset email to:', email)

      // Call our custom API to generate reset token
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      console.log('📧 API response:', result)

      if (!response.ok || !result.success) {
        console.error('❌ Password reset error:', result.error)
        toast.error(result.error || 'Failed to send reset email')
        setLoading(false)
        return
      }

      // Send email using EmailJS
      if (result.data && result.data.resetLink) {
        console.log('📧 Sending email via EmailJS...')

        const emailParams = {
          user_name: email.split('@')[0], // Use email prefix as name
          user_email: email,
          from_name: 'SportsVenueBookings',
          reply_to: 'noreply@sportsvenuebookings.com',
          subject: 'Reset Your Password - SportsVenueBookings',
          message: `Hi there,

We received a request to reset your password for your SportsVenueBookings account.

Click the link below to reset your password:

${result.data.resetLink}

This link will expire in 1 hour.

If you didn't request this password reset, you can safely ignore this email.

Best regards,
The SportsVenueBookings Team

---
This is an automated email. Please do not reply to this email.`
        }

        console.log('📧 EmailJS parameters:', {
          ...emailParams,
          message: emailParams.message.substring(0, 100) + '...'
        })

        // Initialize EmailJS
        emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!)

        // Send email
        const emailResult = await emailjs.send(
          process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
          process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
          emailParams
        )

        console.log('✅ Email sent successfully:', emailResult)
      }

      // Success - show confirmation
      setEmailSent(true)
      console.log('✅ Password reset email sent successfully')
      toast.success('If an account exists with this email, you will receive a password reset link.')

    } catch (error) {
      console.error('❌ Unexpected error:', error)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Check Your Email
            </h1>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              If an account exists with <strong>{email}</strong>, you will receive a password reset link shortly.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-left">
              <p className="text-sm text-yellow-800 mb-2">
                <strong>⚠️ Not receiving emails?</strong>
              </p>
              <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                <li>Check your spam/junk folder</li>
                <li>Make sure you entered the correct email</li>
                <li>Email delivery may take a few minutes</li>
                <li>Contact support if the issue persists</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Next steps:</strong>
              </p>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Check your email inbox (and spam folder)</li>
                <li>Click the password reset link</li>
                <li>Enter your new password</li>
                <li>Sign in with your new password</li>
              </ol>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => router.push('/auth/signin')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Back to Sign In
              </Button>

              <button
                onClick={() => setEmailSent(false)}
                className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Didn&apos;t receive the email? Try again
              </button>
            </div>
          </div>
        </motion.div>
      </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Back Button */}
        <Link
          href="/auth/signin"
          className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sign In
        </Link>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Forgot Password?
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              No worries! Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              loading={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            >
              Send Reset Link
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
    </AppLayout>
  )
}

