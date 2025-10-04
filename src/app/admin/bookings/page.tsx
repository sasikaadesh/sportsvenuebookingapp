'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  User, 
  DollarSign, 
  Filter,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  ArrowLeft
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { getStatusColor } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AdminBookingsPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [filteredBookings, setFilteredBookings] = useState<any[]>([])
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  useEffect(() => {
    // Wait for loading to complete
    if (loading) return

    // If no user, redirect to home
    if (!user) {
      console.log('Admin bookings: No user found, redirecting to home')
      router.push('/')
      return
    }

    // If profile is still loading (null), wait
    if (profile === null) {
      console.log('Admin bookings: Profile still loading, waiting...')
      return
    }

    // If profile exists but no admin role, redirect
    if (profile && profile.role !== 'admin') {
      console.log('Admin bookings: User is not admin, role:', profile.role, 'redirecting to home')
      router.push('/')
      return
    }

    // If we get here, user should be admin
    console.log('Admin bookings: Loading bookings for admin user')
    loadAllBookings()
  }, [user, profile, loading, router])

  useEffect(() => {
    filterBookings()
  }, [bookings, searchTerm, statusFilter, dateFilter])

  const loadAllBookings = async () => {
    try {
      console.log('Loading all bookings for admin...')
      setLoadingBookings(true)

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          start_time,
          duration_hours,
          total_price,
          status,
          payment_status,
          created_at,
          users (
            id,
            email,
            full_name
          ),
          courts (
            id,
            name,
            type
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading bookings:', error)
        toast.error('Failed to load bookings')
        return
      }

      console.log(`Loaded ${data?.length || 0} bookings`)
      setBookings(data || [])
      setFilteredBookings(data || [])

    } catch (error) {
      console.error('Exception loading bookings:', error)
      toast.error('Failed to load bookings')
    } finally {
      setLoadingBookings(false)
    }
  }

  const filterBookings = () => {
    let filtered = [...bookings]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.courts?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date()
      const filterDate = new Date()
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          filtered = filtered.filter(booking => 
            new Date(booking.booking_date).toDateString() === filterDate.toDateString()
          )
          break
        case 'week':
          filterDate.setDate(today.getDate() - 7)
          filtered = filtered.filter(booking => 
            new Date(booking.booking_date) >= filterDate
          )
          break
        case 'month':
          filterDate.setMonth(today.getMonth() - 1)
          filtered = filtered.filter(booking => 
            new Date(booking.booking_date) >= filterDate
          )
          break
      }
    }

    setFilteredBookings(filtered)
  }

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await (supabase as any)
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId)

      if (error) {
        toast.error('Failed to update booking status')
        return
      }

      toast.success('Booking status updated')
      loadAllBookings() // Reload data
    } catch (error) {
      toast.error('Failed to update booking status')
    }
  }

  const exportBookings = () => {
    const csvContent = [
      ['ID', 'Customer', 'Email', 'Court', 'Date', 'Time', 'Duration', 'Price', 'Status', 'Payment Status'],
      ...filteredBookings.map(booking => [
        booking.id,
        booking.users?.full_name || 'N/A',
        booking.users?.email || 'N/A',
        booking.courts?.name || 'N/A',
        booking.booking_date,
        booking.start_time,
        `${booking.duration_hours}h`,
        `$${booking.total_price}`,
        booking.status,
        booking.payment_status
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Show loading while auth is loading or profile is null
  if (loading || loadingBookings || !user || profile === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loading ? 'Loading...' : loadingBookings ? 'Loading bookings...' : 'Checking permissions...'}
          </p>
        </div>
      </div>
    )
  }

  // If profile exists but user is not admin, don't render anything (redirect will happen in useEffect)
  if (profile && profile.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                All Bookings
              </h1>
              <p className="text-gray-600">
                Manage and view all venue bookings
              </p>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button
              variant="outline"
              onClick={exportBookings}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </Button>
            
            <Button
              onClick={loadAllBookings}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <Calendar className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                <strong>{filteredBookings.length}</strong> of <strong>{bookings.length}</strong> bookings
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bookings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {loadingBookings ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No bookings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-gray-600">Customer</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-600">Court</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-600">Date & Time</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-600">Duration</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-600">Amount</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking, index) => (
                    <tr key={booking.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-gray-900">
                            {booking.users?.full_name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {booking.users?.email}
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-gray-900">
                            {booking.courts?.name || 'Unknown Court'}
                          </div>
                          <div className="text-sm text-gray-600 capitalize">
                            {booking.courts?.type}
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-gray-900">
                            {new Date(booking.booking_date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            {booking.start_time}
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <span className="text-gray-900">
                          {booking.duration_hours}h
                        </span>
                      </td>
                      
                      <td className="py-4 px-6">
                        <span className="font-medium text-gray-900">
                          ${booking.total_price}
                        </span>
                      </td>
                      
                      <td className="py-4 px-6">
                        <select
                          value={booking.status}
                          onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(booking.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(booking.id)
                              toast.success('Booking ID copied!')
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Copy Booking ID"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </main>
      
      <Footer />
    </div>
  )
}
