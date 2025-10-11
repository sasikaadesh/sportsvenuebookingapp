'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Phone } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/components/providers/AuthProvider'
import toast from 'react-hot-toast'

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    match: false
  })
  const router = useRouter()
  const { user } = useAuth()

  // Set default return path based on URL params or referrer
  useEffect(() => {
    // Check if there's already a stored return path
    const existingReturnTo = localStorage.getItem('auth_return_to')
    if (existingReturnTo) return

    // Check URL parameters for return path
    const urlParams = new URLSearchParams(window.location.search)
    const returnTo = urlParams.get('returnTo')
    if (returnTo) {
      localStorage.setItem('auth_return_to', returnTo)
      return
    }

    // Check referrer to determine context
    const referrer = document.referrer
    if (referrer) {
      const referrerUrl = new URL(referrer)
      const referrerPath = referrerUrl.pathname

      // If coming from app context, set return to app
      if (referrerPath.startsWith('/app') ||
          referrerPath.includes('/courts') ||
          referrerPath.includes('/dashboard') ||
          referrerPath.includes('/profile')) {
        localStorage.setItem('auth_return_to', '/app')
      }
    }
  }, [])

  // Password validation function
  const validatePassword = (password: string, confirmPassword: string = formData.confirmPassword) => {
    const validation = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      match: password === confirmPassword && password.length > 0
    }
    setPasswordValidation(validation)
    return validation
  }

  const getPasswordStrength = () => {
    const { length, uppercase, lowercase, number, special } = passwordValidation
    const score = [length, uppercase, lowercase, number, special].filter(Boolean).length

    if (score === 0) return { strength: 'none', color: 'gray', text: '' }
    if (score <= 2) return { strength: 'weak', color: 'red', text: 'Weak' }
    if (score <= 3) return { strength: 'fair', color: 'yellow', text: 'Fair' }
    if (score <= 4) return { strength: 'good', color: 'blue', text: 'Good' }
    return { strength: 'strong', color: 'green', text: 'Strong' }
  }

  const isPasswordValid = () => {
    const { length, uppercase, lowercase, number, special, match } = passwordValidation
    return length && uppercase && lowercase && number && special && match
  }

  // Redirect if already authenticated
  if (user) {
    router.push('/dashboard')
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const newFormData = {
      ...formData,
      [name]: value
    }
    setFormData(newFormData)

    // Trigger password validation when password or confirmPassword changes
    if (name === 'password') {
      validatePassword(value, newFormData.confirmPassword)
    } else if (name === 'confirmPassword') {
      validatePassword(newFormData.password, value)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Comprehensive password validation
    const validation = validatePassword(formData.password, formData.confirmPassword)

    if (!validation.length) {
      toast.error('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    if (!validation.uppercase) {
      toast.error('Password must contain at least one uppercase letter')
      setLoading(false)
      return
    }

    if (!validation.lowercase) {
      toast.error('Password must contain at least one lowercase letter')
      setLoading(false)
      return
    }

    if (!validation.number) {
      toast.error('Password must contain at least one number')
      setLoading(false)
      return
    }

    if (!validation.special) {
      toast.error('Password must contain at least one special character (!@#$%^&*)')
      setLoading(false)
      return
    }

    if (!validation.match) {
      toast.error('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            name: formData.name, // Keep both for compatibility
            phone: formData.phone,
          },
          // Enable email confirmation for production
          emailRedirectTo: `https://sportsvenuebookings.com/auth/signin?returnTo=/app`
        }
      })

      if (error) {
        console.error('Signup error:', error)
        toast.error(error.message || 'Failed to create account')
        setLoading(false)
        return
      }

      if (data.user) {
        console.log('User created successfully:', data.user.email)
        console.log('User confirmation status:', {
          email_confirmed_at: data.user.email_confirmed_at,
          confirmed_at: data.user.confirmed_at
        })

        // Profile creation is handled by database trigger or AuthProvider
        // No need to manually create profile here

        // Check if email confirmation is required
        if (data.user.email_confirmed_at || data.user.confirmed_at) {
          // User is already confirmed (instant confirmation enabled)
          toast.success('Account created and verified successfully!')

          // Small delay to allow AuthProvider to process the new user
          setTimeout(() => {
            // Check if user came from demo app context
            const returnTo = localStorage.getItem('auth_return_to') || '/'
            localStorage.removeItem('auth_return_to')

            // If return path is app-related, redirect to app, otherwise dashboard
            if (returnTo.startsWith('/app') || returnTo.includes('/courts') || returnTo.includes('/dashboard') || returnTo.includes('/profile')) {
              router.push('/app')
            } else {
              router.push('/dashboard')
            }
          }, 1000)
        } else {
          // Email confirmation required
          console.log('Email confirmation required for user')
          toast.success('Account created successfully!')

          // Always show the email confirmation message for unconfirmed users
          toast('Please check your email and click the confirmation link to verify your account.', {
            icon: '📧',
            duration: 8000,
          })

          toast('After confirming your email, you can sign in with your credentials.', {
            icon: 'ℹ️',
            duration: 6000,
          })

          // Always redirect to signin page
          setTimeout(() => {
            router.push('/auth/signin')
          }, 2000)
        }
      }
    } catch (error) {
      console.error('Unexpected signup error:', error)
      toast.error('An unexpected error occurred during signup')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      // Store current context for redirect after OAuth
      const currentPath = window.location.pathname
      if (currentPath.startsWith('/app') || currentPath.includes('/courts') || currentPath.includes('/dashboard') || currentPath.includes('/profile')) {
        localStorage.setItem('auth_return_to', '/app')
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        toast.error(error.message)
      }
    } catch (error) {
      toast.error('Failed to sign up with Google')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">SV</span>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Create your account
          </h2>
          <p className="text-gray-600">
            Join SportVenue and start booking your favorite courts
          </p>
        </div>

        {/* Sign Up Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <form onSubmit={handleSignUp} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Password Strength:</span>
                    <span className={`text-sm font-medium ${
                      getPasswordStrength().color === 'green' ? 'text-green-600' :
                      getPasswordStrength().color === 'blue' ? 'text-blue-600' :
                      getPasswordStrength().color === 'yellow' ? 'text-yellow-600' :
                      getPasswordStrength().color === 'red' ? 'text-red-600' : 'text-gray-400'
                    }`}>
                      {getPasswordStrength().text}
                    </span>
                  </div>

                  {/* Strength Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        getPasswordStrength().color === 'green' ? 'bg-green-500 w-full' :
                        getPasswordStrength().color === 'blue' ? 'bg-blue-500 w-4/5' :
                        getPasswordStrength().color === 'yellow' ? 'bg-yellow-500 w-3/5' :
                        getPasswordStrength().color === 'red' ? 'bg-red-500 w-2/5' : 'bg-gray-300 w-1/5'
                      }`}
                    ></div>
                  </div>

                  {/* Password Requirements */}
                  <div className="space-y-1">
                    <div className={`flex items-center text-xs ${passwordValidation.length ? 'text-green-600' : 'text-gray-500'}`}>
                      <div className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${passwordValidation.length ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {passwordValidation.length ? '✓' : '○'}
                      </div>
                      At least 8 characters
                    </div>
                    <div className={`flex items-center text-xs ${passwordValidation.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                      <div className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${passwordValidation.uppercase ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {passwordValidation.uppercase ? '✓' : '○'}
                      </div>
                      One uppercase letter (A-Z)
                    </div>
                    <div className={`flex items-center text-xs ${passwordValidation.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                      <div className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${passwordValidation.lowercase ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {passwordValidation.lowercase ? '✓' : '○'}
                      </div>
                      One lowercase letter (a-z)
                    </div>
                    <div className={`flex items-center text-xs ${passwordValidation.number ? 'text-green-600' : 'text-gray-500'}`}>
                      <div className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${passwordValidation.number ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {passwordValidation.number ? '✓' : '○'}
                      </div>
                      One number (0-9)
                    </div>
                    <div className={`flex items-center text-xs ${passwordValidation.special ? 'text-green-600' : 'text-gray-500'}`}>
                      <div className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${passwordValidation.special ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {passwordValidation.special ? '✓' : '○'}
                      </div>
                      One special character (!@#$%^&*)
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className="mt-2">
                  <div className={`flex items-center text-sm ${
                    passwordValidation.match ? 'text-green-600' : 'text-red-500'
                  }`}>
                    <div className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${
                      passwordValidation.match ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {passwordValidation.match ? '✓' : '✗'}
                    </div>
                    {passwordValidation.match ? 'Passwords match' : 'Passwords do not match'}
                  </div>
                </div>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the{' '}
                <Link href="/terms" className="text-blue-600 hover:text-blue-700">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Sign Up Button */}
            <Button
              type="submit"
              loading={loading}
              disabled={loading || !isPasswordValid() || !formData.name || !formData.email}
              className={`w-full py-3 text-white transition-all ${
                loading || !isPasswordValid() || !formData.name || !formData.email
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Create account
            </Button>

            {/* Validation Summary */}
            {(formData.password || formData.confirmPassword) && !isPasswordValid() && (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Please complete all password requirements to continue
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google Sign Up */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignUp}
              className="w-full py-3"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
