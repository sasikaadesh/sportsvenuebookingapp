'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          toast.error('Authentication failed')
          router.push('/auth/signin')
          return
        }

        if (data.session) {
          toast.success('Successfully signed in!')

          // Check if user came from demo app context
          const returnTo = localStorage.getItem('auth_return_to') || '/'
          localStorage.removeItem('auth_return_to')

          // If return path is app-related, redirect to app, otherwise marketing site
          if (returnTo.startsWith('/app') || returnTo.includes('/courts') || returnTo.includes('/dashboard') || returnTo.includes('/profile')) {
            router.push('/app')
          } else {
            router.push('/')
          }
        } else {
          router.push('/auth/signin')
        }
      } catch (error) {
        console.error('Unexpected error:', error)
        toast.error('An unexpected error occurred')
        router.push('/auth/signin')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
}
