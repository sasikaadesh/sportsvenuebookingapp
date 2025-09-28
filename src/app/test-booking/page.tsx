'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

export default function TestBookingPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [bookings, setBookings] = useState<any[]>([])

  const createTestBooking = async () => {
    if (!user) {
      toast.error('Please sign in first')
      return
    }

    setLoading(true)
    try {
      // First, get a court to book
      const { data: courts, error: courtsError } = await supabase
        .from('courts')
        .select('id, name, type')
        .limit(1)
        .single()

      if (courtsError || !courts) {
        toast.error('No courts available for booking')
        return
      }

      // Create a test booking
      const bookingData = {
        user_id: user.id,
        court_id: courts.id,
        booking_date: new Date().toISOString().split('T')[0], // Today
        start_time: '14:00',
        duration_hours: 2,
        total_price: 85.00,
        status: 'confirmed',
        payment_status: 'paid',
        created_at: new Date().toISOString()
      }

      console.log('Creating test booking:', bookingData)

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single()

      if (error) {
        console.error('Booking creation error:', error)
        toast.error(`Failed to create booking: ${error.message}`)
      } else {
        console.log('Booking created:', data)
        toast.success('Test booking created successfully!')
        loadBookings()
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const loadBookings = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          courts (
            name,
            type
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading bookings:', error)
        toast.error(`Error loading bookings: ${error.message}`)
      } else {
        console.log('Bookings loaded:', data)
        setBookings(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteAllBookings = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        toast.error(`Error deleting bookings: ${error.message}`)
      } else {
        toast.success('All bookings deleted')
        setBookings([])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-gray-600">You need to be signed in to test bookings</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Booking System</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Booking Actions</h2>
          <div className="space-x-4">
            <Button onClick={createTestBooking} disabled={loading}>
              {loading ? 'Creating...' : 'Create Test Booking'}
            </Button>
            <Button onClick={loadBookings} disabled={loading} variant="outline">
              {loading ? 'Loading...' : 'Load My Bookings'}
            </Button>
            <Button onClick={deleteAllBookings} disabled={loading} variant="outline">
              Delete All My Bookings
            </Button>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>
        </div>

        {bookings.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">My Bookings ({bookings.length})</h2>
            <div className="space-y-4">
              {bookings.map((booking, index) => (
                <div key={booking.id} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h3 className="font-semibold">{booking.courts?.name || 'Unknown Court'}</h3>
                      <p className="text-sm text-gray-600">Type: {booking.courts?.type || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">ID: {booking.id}</p>
                    </div>
                    <div>
                      <p className="text-sm"><strong>Date:</strong> {booking.booking_date}</p>
                      <p className="text-sm"><strong>Time:</strong> {booking.start_time}</p>
                      <p className="text-sm"><strong>Duration:</strong> {booking.duration_hours}h</p>
                    </div>
                    <div>
                      <p className="text-sm"><strong>Price:</strong> ${booking.total_price}</p>
                      <p className="text-sm"><strong>Status:</strong> {booking.status}</p>
                      <p className="text-sm"><strong>Payment:</strong> {booking.payment_status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-blue-800 mb-2">Testing Instructions:</h3>
          <ol className="text-blue-700 text-sm space-y-1">
            <li>1. Click "Create Test Booking" to create a sample booking</li>
            <li>2. Click "Load My Bookings" to see your bookings</li>
            <li>3. Go to <a href="/dashboard" className="underline">Dashboard</a> to see if bookings appear there</li>
            <li>4. Try booking a real court from <a href="/courts" className="underline">Courts Page</a></li>
          </ol>
        </div>
      </div>
    </div>
  )
}
