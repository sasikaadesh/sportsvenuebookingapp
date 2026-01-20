'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { Shield, Lock } from 'lucide-react'
import Link from 'next/link'

interface AdminOnlyPageProps {
  children: React.ReactNode
  pageName?: string
}

/**
 * Wrapper component that restricts access to admin users only.
 * Use this for test/debug pages that should not be publicly accessible.
 */
export function AdminOnlyPage({ children, pageName = 'This page' }: AdminOnlyPageProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (loading) return

    // No user - not authorized
    if (!user) {
      setIsAuthorized(false)
      setChecking(false)
      return
    }

    // Wait for profile to load
    if (profile === null) {
      return
    }

    // Check if user is admin
    const isAdmin = profile?.role === 'admin'
    setIsAuthorized(isAdmin)
    setChecking(false)
  }, [user, profile, loading])

  // Loading state
  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authorization...</p>
        </div>
      </div>
    )
  }

  // Not authorized - show access denied
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            {pageName} is restricted to administrators only.
            {!user && ' Please sign in with an admin account.'}
          </p>
          <div className="flex flex-col gap-3">
            {!user ? (
              <Link
                href="/auth/signin"
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            ) : (
              <p className="text-sm text-gray-500">
                Signed in as: {user.email}
              </p>
            )}
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Authorized - show admin badge and content
  return (
    <div>
      {/* Admin indicator banner */}
      <div className="bg-amber-500 text-white text-center py-1 px-4 text-sm">
        <Shield className="w-4 h-4 inline-block mr-1" />
        Admin/Debug Page - Not visible to regular users
      </div>
      {children}
    </div>
  )
}

