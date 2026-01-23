'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, MessageSquare, Mail } from 'lucide-react'
import { HeaderApp } from '@/components/layout/HeaderApp'
import { FooterSimple } from '@/components/layout/FooterSimple'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/components/providers/AuthProvider'

export default function AdminMessagesPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  // Show loading while auth is loading or profile is null
  if (loading || !user || profile === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loading ? 'Loading...' : 'Checking permissions...'}
          </p>
        </div>
      </div>
    )
  }

  // If profile exists but user is not admin, redirect and don't render
  if (profile && profile.role !== 'admin') {
    router.push('/')
    return null
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
        <HeaderApp />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push('/admin')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>

              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
                <p className="text-gray-600 dark:text-gray-300">Customer inquiries and support messages</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center transition-colors duration-200"
          >
            <MessageSquare className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Messages Coming Soon</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Customer message management functionality will be available in a future update.
            </p>
            <Button onClick={() => router.push('/admin')}>
              Return to Dashboard
            </Button>
          </motion.div>
        </main>

        <FooterSimple />
      </div>
    </AdminLayout>
  )
}
