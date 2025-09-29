'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Star, Clock, CreditCard, Shield } from 'lucide-react'
import { HeaderApp } from '@/components/layout/HeaderApp'
import { FooterSimple } from '@/components/layout/FooterSimple'
import { Button } from '@/components/ui/Button'
import { BookingCalendar } from '@/components/booking/BookingCalendar'
import { useAuth } from '@/components/providers/AuthProvider'
import { getCourtTypeIcon, formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { sendContactEmails, isEmailJSConfigured } from '@/lib/emailjs'
import Image from 'next/image'
import toast from 'react-hot-toast'

// Mock court data - same as court detail page
const mockCourtDetails = {
  'court-tennis-1': {
    id: 'court-tennis-1',
    name: 'Premium Tennis Court A',
    type: 'tennis',
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    location: 'Downtown Sports Complex',
    rating: 4.8,
    reviews: 124,
    pricing: [
      { duration: 1, offPeak: 45, peak: 65 },
      { duration: 1.5, offPeak: 67.5, peak: 97.5 },
      { duration: 2, offPeak: 90, peak: 130 }
    ]
  }
}

export default function BookCourtPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [court, setCourt] = useState<any>(null)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [step, setStep] = useState(1) // 1: Calendar, 2: Confirmation, 3: Payment
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    loadCourt()

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Court loading timeout')
        setLoading(false)
      }
    }, 10000) // 10 second timeout

    return () => clearTimeout(timeout)
  }, [params.id])

  const loadCourt = async () => {
    try {
      const courtId = params.id as string
      console.log('Loading court with ID:', courtId)

      // Try to load from database first
      console.log('Querying court with ID:', courtId)
      let { data, error } = await supabase
        .from('courts')
        .select('*')
        .eq('id', courtId)
        .eq('is_active', true)
        .single()

      console.log('Database query result:', { data, error })

      // If not found by ID, try to find by name (for mock data compatibility)
      if (error && error.code === 'PGRST116') {
        console.log('Court not found by ID, trying by name...')
        const { data: nameData, error: nameError } = await supabase
          .from('courts')
          .select('*')
          .ilike('name', `%${courtId.replace('-', ' ')}%`)
          .eq('is_active', true)
          .limit(1)
          .single()

        data = nameData
        error = nameError
      }

      if (error) {
        console.log('Database error:', error.message)
        // If not found in database, try mock data
        const courtData = mockCourtDetails[courtId as keyof typeof mockCourtDetails]
        if (courtData) {
          console.log('Using mock data for court:', courtId)
          setCourt(courtData)
        } else {
          console.log('Court not found in mock data either')
          setCourt(null)
        }
      } else if (data) {
        const courtData = data as any
        console.log('Found court in database:', courtData.name)
        // Transform database data
        const transformedCourt = {
          id: courtData.id,
          name: courtData.name,
          type: courtData.type,
          image: courtData.image_url || 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          location: 'Sports Complex',
          rating: 4.8,
          reviews: 124,
          pricing: [
            { duration: 1, offPeak: 45, peak: 65 },
            { duration: 2, offPeak: 85, peak: 120 }
          ]
        }
        setCourt(transformedCourt)
      } else {
        console.log('No data returned from database')
        setCourt(null)
      }
    } catch (error) {
      console.error('Error loading court:', error)
      // Fallback to mock data
      const courtId = params.id as string
      const courtData = mockCourtDetails[courtId as keyof typeof mockCourtDetails]
      if (courtData) {
        setCourt(courtData)
      } else {
        setCourt(null)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please sign in to book a court')
      // Store current path for redirect after auth
      const currentPath = window.location.pathname
      localStorage.setItem('auth_return_to', currentPath)
      router.push(`/auth/signin?returnTo=${encodeURIComponent(currentPath)}`)
    }
  }, [user, authLoading, router])

  const handleBookingSelect = (booking: any) => {
    setSelectedBooking(booking)
    setStep(2)
  }

  const handleConfirmBooking = async () => {
    if (!user || !selectedBooking || !court) {
      toast.error('Missing booking information')
      return
    }

    setBookingLoading(true)

    try {
      // Fix property name mismatch: BookingCalendar passes 'startTime' but we're looking for 'time'
      const startTime = selectedBooking.startTime || selectedBooking.time

      console.log('Creating booking:', {
        user_id: user.id,
        court_id: court.id,
        booking_date: selectedBooking.date,
        start_time: startTime,
        duration_hours: selectedBooking.duration,
        total_price: selectedBooking.price
      })

      // Validate required fields
      if (!startTime) {
        toast.error('Start time is required')
        return
      }

      // Create booking in database
      const { data, error } = await (supabase as any)
        .from('bookings')
        .insert({
          user_id: user.id,
          court_id: court.id,
          booking_date: selectedBooking.date,
          start_time: startTime + ':00', // Ensure HH:MM:SS format
          duration_hours: selectedBooking.duration,
          total_price: selectedBooking.price,
          status: 'confirmed',
          payment_status: 'paid'
        })
        .select()
        .single()

      if (error) {
        console.error('Booking creation error:', error)
        toast.error(`Failed to create booking: ${error.message}`)
        return
      }

      console.log('Booking created successfully:', data)
      
      // Send booking confirmation email
      if (isEmailJSConfigured() && user?.email) {
        try {
          console.log('Sending booking confirmation email...')
          
          const bookingDetails = `🎾 BOOKING CONFIRMATION

Dear ${user.user_metadata?.full_name || user.email},

Your court booking has been confirmed!

📍 Court: ${court.name}
🏆 Type: ${court.type?.charAt(0).toUpperCase() + court.type?.slice(1)}
📅 Date: ${new Date(selectedBooking.date).toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}
⏰ Time: ${startTime}
⏱️ Duration: ${selectedBooking.duration} hour${selectedBooking.duration > 1 ? 's' : ''}
💰 Total: $${selectedBooking.price}
🎫 Booking ID: ${data.id}

IMPORTANT REMINDERS:
✅ Please arrive 15 minutes before your booking time
✅ Bring your own equipment or rent on-site  
✅ Free cancellation up to 24 hours before your booking
✅ Contact us at (555) 123-4567 for any changes

Thank you for choosing Sports Venue!

Best regards,
The Sports Venue Team`

          await sendContactEmails({
            name: user.user_metadata?.full_name || user.email || 'Customer',
            email: user.email,
            phone: user.user_metadata?.phone || '',
            subject: `Booking Confirmed - ${court.name}`,
            message: bookingDetails,
            inquiryType: 'booking'
          })
          
          console.log('Booking confirmation email sent successfully')
          toast.success('Booking confirmed! Check your email for details.')
        } catch (emailError) {
          console.error('Email sending failed:', emailError)
          toast.success('Booking confirmed! Redirecting to dashboard...')
        }
      } else {
        console.log('EmailJS not configured or no user email, skipping email')
        toast.success('Booking confirmed! Redirecting to dashboard...')
      }

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000) // Slightly longer delay to show email success message

    } catch (error) {
      console.error('Booking error:', error)
      toast.error('Failed to create booking. Please try again.')
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading court details...</p>
          <p className="text-sm text-gray-500 mt-2">Court ID: {params.id}</p>
          <p className="text-xs text-gray-400 mt-1">
            Auth: {authLoading ? 'Loading...' : user ? 'Signed in' : 'Not signed in'} |
            Court: {loading ? 'Loading...' : court ? 'Found' : 'Not found'}
          </p>
        </div>
      </div>
    )
  }

  if (!court) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <HeaderApp />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12 max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Court Not Found</h1>
            <p className="text-gray-600 mb-4">The court you&apos;re trying to book doesn&apos;t exist.</p>
            <p className="text-sm text-gray-500 mb-6">Court ID: {params.id}</p>
            <div className="space-x-4">
              <Button onClick={() => router.push('/courts')}>
                Back to Courts
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/debug-courts')}
              >
                Debug Courts
              </Button>
            </div>
          </div>
        </main>
        <FooterSimple />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <HeaderApp />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => step > 1 ? setStep(step - 1) : router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{step > 1 ? 'Back' : 'Back to Court Details'}</span>
        </motion.button>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2">
            <div className="text-sm text-gray-600">
              {step === 1 && 'Select Date & Time'}
              {step === 2 && 'Confirm Booking'}
              {step === 3 && 'Payment'}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Select Your Booking Time
                </h2>
                <BookingCalendar
                  courtId={court.id}
                  pricing={court.pricing}
                  onBookingSelect={handleBookingSelect}
                />
              </motion.div>
            )}

            {step === 2 && selectedBooking && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Confirm Your Booking
                </h2>
                
                <div className="space-y-6">
                  {/* Booking Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Booking Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Date:</span>
                        <div className="font-medium">{selectedBooking.date}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Time:</span>
                        <div className="font-medium">{selectedBooking.startTime}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <div className="font-medium">{selectedBooking.duration} hour(s)</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Price:</span>
                        <div className="font-medium text-lg">{formatCurrency(selectedBooking.price)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Terms & Conditions</h3>
                    <div className="text-sm text-gray-600 space-y-2">
                      <div className="flex items-start space-x-2">
                        <Shield className="w-4 h-4 mt-0.5 text-green-600" />
                        <span>Free cancellation up to 24 hours before booking time</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Shield className="w-4 h-4 mt-0.5 text-green-600" />
                        <span>Proper sports attire and non-marking shoes required</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Shield className="w-4 h-4 mt-0.5 text-green-600" />
                        <span>Equipment rental available on-site</span>
                      </div>
                    </div>
                  </div>

                  {/* Confirm Button */}
                  <Button
                    onClick={handleConfirmBooking}
                    loading={bookingLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 py-3"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Confirm Booking & Pay {formatCurrency(selectedBooking.price)}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Court Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 sticky top-8"
            >
              <div className="flex items-center space-x-3 mb-4">
                <Image
                  src={court.image}
                  alt={court.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <div className="flex items-center space-x-1 mb-1">
                    <span className="text-lg">{getCourtTypeIcon(court.type)}</span>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full capitalize">
                      {court.type}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{court.name}</h3>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{court.location}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Star className="w-4 h-4 mr-2 text-yellow-400 fill-current" />
                  <span>{court.rating} ({court.reviews} reviews)</span>
                </div>
              </div>

              {selectedBooking && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Your Selection</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{selectedBooking.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{selectedBooking.startTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{selectedBooking.duration}h</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="font-semibold text-lg text-blue-600">
                        {formatCurrency(selectedBooking.price)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <FooterSimple />
    </div>
  )
}
