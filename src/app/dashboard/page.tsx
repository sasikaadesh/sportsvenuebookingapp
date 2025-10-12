'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, Star, Filter, Search } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { HeaderApp } from '@/components/layout/HeaderApp'
import { FooterSimple } from '@/components/layout/FooterSimple'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

// Mock data - will be replaced with real data from Supabase
const mockBookings = [
  {
    id: '1',
    court: {
      name: 'Tennis Court A',
      type: 'tennis',
      location: 'Downtown Sports Complex'
    },
    date: '2024-01-15',
    startTime: '14:00',
    duration: 1.5,
    status: 'confirmed',
    totalPrice: 67.50
  },
  {
    id: '2',
    court: {
      name: 'Basketball Court Pro',
      type: 'basketball',
      location: 'Athletic Center'
    },
    date: '2024-01-18',
    startTime: '18:00',
    duration: 2,
    status: 'pending',
    totalPrice: 70.00
  },
  {
    id: '3',
    court: {
      name: 'Cricket Ground Elite',
      type: 'cricket',
      location: 'Sports Park'
    },
    date: '2024-01-12',
    startTime: '10:00',
    duration: 3,
    status: 'completed',
    totalPrice: 240.00
  }
]

export default function DashboardPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [authTimeout, setAuthTimeout] = useState(false)

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Auth loading timeout, forcing completion')
        setAuthTimeout(true)
      }
    }, 10000) // 10 second timeout

    return () => clearTimeout(timeout)
  }, [loading])

  const loadUserBookings = useCallback(async () => {
    if (!user) {
      console.log('No user available, skipping booking load')
      setLoadingBookings(false)
      return
    }

    try {
      setLoadingBookings(true)
      console.log('Loading bookings for user:', user.id)

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          courts (
            name,
            type,
            image_url
          )
        `)
        .eq('user_id', user.id)
        .order('booking_date', { ascending: false })

      if (error) {
        console.error('Error loading bookings:', error)
        setBookings([])
        return
      }

      console.log('Raw bookings data:', data)

      // Transform the data to match component expectations
      const transformedBookings = (data || []).map((booking: any) => ({
        id: booking.id,
        courtName: booking.courts?.name || 'Unknown Court',
        courtType: booking.courts?.type || 'unknown',
        date: booking.booking_date,
        time: booking.start_time,
        duration: booking.duration_hours,
        status: booking.status || 'confirmed',
        price: booking.total_price || 0,
        image: booking.courts?.image_url || 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      }))

      console.log('Transformed bookings:', transformedBookings)
      setBookings(transformedBookings)
    } catch (error) {
      console.error('Exception loading bookings:', error)
      console.log('Bookings loading timeout/error, showing empty state')
      setBookings([])
    } finally {
      setLoadingBookings(false)
    }
  }, [user])

  useEffect(() => {
    // Handle auth timeout or completed loading
    if (authTimeout || !loading) {
      if (!user) {
        console.log('No user found, redirecting to signin')
        // Store current path for redirect after auth
        localStorage.setItem('auth_return_to', '/dashboard')
        router.push('/auth/signin?returnTo=/dashboard')
        return
      }

      // Load bookings when user is available
      console.log('User found, loading bookings...')
      loadUserBookings()
    }
  }, [user, loading, authTimeout, router, loadUserBookings])



  if (loading && !authTimeout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'all' || booking.status === filter

    // Handle both court object and court name scenarios
    const courtName = booking.courts?.name || booking.court?.name || 'Unknown Court'
    const courtLocation = booking.courts?.location || booking.court?.location || ''

    const matchesSearch = searchTerm === '' ||
                         courtName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         courtLocation.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300'
      case 'completed':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300'
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
    }
  }

  const getCourtIcon = (type: string) => {
    switch (type) {
      case 'tennis':
        return '🎾'
      case 'basketball':
        return '🏀'
      case 'cricket':
        return '🏏'
      case 'badminton':
        return '🏸'
      case 'football':
        return '⚽'
      default:
        return '🏟️'
    }
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <HeaderApp />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {profile?.full_name || user?.email || 'Guest'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your bookings and discover new courts
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{bookings.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {bookings.filter(b => b.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bookings Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-200"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-0">
              My Bookings
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="all">All Bookings</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          <div className="space-y-4">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No bookings found</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {searchTerm || filter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Start by booking your first court'
                  }
                </p>
                <Button onClick={() => router.push('/courts')}>
                  Browse Courts
                </Button>
              </div>
            ) : (
              filteredBookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start space-x-4 mb-4 sm:mb-0">
                      <div className="text-2xl">
                        {getCourtIcon(booking.courts?.type || 'tennis')}
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {booking.courts?.name || 'Court'}
                        </h3>
                        <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          Sports Complex
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm mt-1">
                          <Calendar className="w-4 h-4 mr-1" />
                          {booking.booking_date} at {booking.start_time} ({booking.duration_hours}h)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:flex-col sm:items-end">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                      <div className="text-right mt-2">
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          ${booking.total_price?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
        </main>

        <FooterSimple />
      </div>
    </AppLayout>
  )
}
