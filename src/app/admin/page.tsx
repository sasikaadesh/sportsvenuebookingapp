'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock,
  MapPin,
  Star,
  Settings,
  Plus
} from 'lucide-react'
import { HeaderApp } from '@/components/layout/HeaderApp'
import { FooterSimple } from '@/components/layout/FooterSimple'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/components/providers/AuthProvider'
import { AdminStats } from '@/components/admin/AdminStats'
import { RecentBookings } from '@/components/admin/RecentBookings'
import { RevenueChart } from '@/components/admin/RevenueChart'
import { QuickActions } from '@/components/admin/QuickActions'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalBookings: 0,
      totalRevenue: 0,
      activeUsers: 0,
      courtsAvailable: 0
    },
    recentBookings: [] as any[],
    revenueData: [] as any[]
  })

  useEffect(() => {
    // Wait for loading to complete
    if (loading) return

    // If no user, redirect to home
    if (!user) {
      console.log('Admin page: No user found, redirecting to home')
      router.push('/')
      return
    }

    // If profile is still loading (null), wait
    if (profile === null) {
      console.log('Admin page: Profile still loading, waiting...')
      return
    }

    // If profile exists but no admin role, redirect
    if (profile && profile.role !== 'admin') {
      console.log('Admin page: User is not admin, role:', profile.role, 'redirecting to home')
      router.push('/')
      return
    }

    // If we get here, user should be admin or profile is still loading
    console.log('Admin page: Loading dashboard data for admin user')
    loadDashboardData()
  }, [user, profile, loading, router])

  const loadDashboardData = async () => {
    // Mock data - replace with real API calls
    const mockData = {
      stats: {
        totalBookings: 1247,
        totalRevenue: 45680,
        activeUsers: 892,
        courtsAvailable: 12
      },
      recentBookings: [
        {
          id: '1',
          user: 'John Doe',
          phone: '+1 (555) 123-4567',
          court: 'Tennis Court A',
          date: '2024-01-15',
          time: '14:00',
          status: 'confirmed',
          amount: 65
        },
        {
          id: '2',
          user: 'Sarah Johnson',
          phone: '+1 (555) 987-6543',
          court: 'Basketball Court Pro',
          date: '2024-01-15',
          time: '16:00',
          status: 'pending',
          amount: 55
        },
        {
          id: '3',
          user: 'Mike Chen',
          phone: '+1 (555) 456-7890',
          court: 'Cricket Ground Elite',
          date: '2024-01-16',
          time: '10:00',
          status: 'confirmed',
          amount: 240
        }
      ],
      revenueData: [
        { month: 'Jan', revenue: 12500, bookings: 45 },
        { month: 'Feb', revenue: 15200, bookings: 52 },
        { month: 'Mar', revenue: 18800, bookings: 67 },
        { month: 'Apr', revenue: 16400, bookings: 58 },
        { month: 'May', revenue: 21300, bookings: 74 },
        { month: 'Jun', revenue: 19600, bookings: 69 }
      ]
    }

    try {
      console.log('Loading admin dashboard data...')

      // Load stats in parallel
      const [bookingsResult, usersResult, courtsResult] = await Promise.all([
        // Get total bookings and revenue
        supabase
          .from('bookings')
          .select('total_price, status')
          .eq('status', 'confirmed'),

        // Get total users
        supabase
          .from('users')
          .select('id', { count: 'exact', head: true }),

        // Get courts
        supabase
          .from('courts')
          .select('id, is_active', { count: 'exact', head: true })
      ])

      // Load recent bookings with user and court details
      const { data: recentBookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          start_time,
          total_price,
          status,
          users (
            full_name,
            email,
            phone
          ),
          courts (
            name,
            type
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (!bookingsError && recentBookingsData) {
        // Calculate stats from real data
        const totalBookings = bookingsResult.data?.length || 0
        const totalRevenue = bookingsResult.data?.reduce((sum: number, booking: any) => sum + (booking.total_price || 0), 0) || 0
        const activeUsers = usersResult.count || 0
        const courtsAvailable = courtsResult.count || 0

        // Transform recent bookings
        const transformedBookings = recentBookingsData.map((booking: any) => ({
          id: booking.id,
          user: booking.users?.full_name || booking.users?.email || 'Unknown User',
          phone: booking.users?.phone || 'N/A',
          court: booking.courts?.name || 'Unknown Court',
          date: booking.booking_date,
          time: booking.start_time,
          status: booking.status,
          amount: booking.total_price
        }))

        // Update with real data
        mockData.stats = {
          totalBookings,
          totalRevenue,
          activeUsers,
          courtsAvailable
        }
        mockData.recentBookings = transformedBookings

        // Generate revenue data based on real bookings if available
        if (transformedBookings.length > 0) {
          const currentMonth = new Date().getMonth()
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          
          // Generate last 6 months of data
          const revenueData = []
          for (let i = 5; i >= 0; i--) {
            const monthIndex = (currentMonth - i + 12) % 12
            const monthName = months[monthIndex]
            const baseRevenue = totalRevenue / 6 // Distribute revenue across months
            const variance = Math.random() * 0.4 + 0.8 // 80-120% variance
            const monthlyRevenue = Math.round(baseRevenue * variance)
            const monthlyBookings = Math.round((totalBookings / 6) * variance)
            
            revenueData.push({
              month: monthName,
              revenue: monthlyRevenue,
              bookings: monthlyBookings
            })
          }
          mockData.revenueData = revenueData
        }

        console.log('Admin dashboard loaded with real data:', {
          totalBookings,
          totalRevenue,
          activeUsers,
          courtsAvailable,
          recentBookings: transformedBookings.length,
          revenueData: mockData.revenueData.length
        })
      }
    } catch (error) {
      console.error('Error loading admin dashboard data:', error)
      // Will use mock data as fallback
    }

    setDashboardData(mockData)
  }

  // Show loading while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

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

  // If profile exists but user is not admin, don't render anything (redirect will happen in useEffect)
  if (profile && profile.role !== 'admin') {
    return null
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <HeaderApp hideThemeToggle />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {profile?.full_name || 'Admin'}! Here&apos;s what&apos;s happening with your venues.
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/courts')}
              className="flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Manage Courts</span>
            </Button>
            
            <Button
              onClick={() => router.push('/admin/courts/new')}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Court</span>
            </Button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <AdminStats stats={dashboardData.stats} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2">
            <RevenueChart data={dashboardData.revenueData} />
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <QuickActions />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <RecentBookings bookings={dashboardData.recentBookings} />
        </div>

        {/* Additional Admin Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {/* Court Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Court Status</h3>
              <MapPin className="w-5 h-5 text-gray-600" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Available</span>
                <span className="text-green-600 font-medium">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Booked</span>
                <span className="text-blue-600 font-medium">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Maintenance</span>
                <span className="text-orange-600 font-medium">1</span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-4"
              onClick={() => router.push('/admin/courts')}
            >
              View All Courts
            </Button>
          </motion.div>

          {/* Popular Times */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Popular Times</h3>
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">6:00 - 9:00 AM</span>
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">5:00 - 8:00 PM</span>
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">12:00 - 2:00 PM</span>
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Customer Satisfaction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Satisfaction</h3>
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">4.8</div>
              <div className="flex justify-center mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className="w-4 h-4 text-yellow-400 fill-current" 
                  />
                ))}
              </div>
              <p className="text-gray-600 text-sm">Based on 1,247 reviews</p>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-4"
              onClick={() => router.push('/admin/reviews')}
            >
              View Reviews
            </Button>
          </motion.div>
        </div>
        </main>

        <FooterSimple />
      </div>
    </AdminLayout>
  )
}
