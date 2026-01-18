'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Star, Clock, CreditCard, Shield, CheckCircle, Calendar } from 'lucide-react'
import { HeaderApp } from '@/components/layout/HeaderApp'
import { FooterSimple } from '@/components/layout/FooterSimple'
import { Button } from '@/components/ui/Button'
import { BookingCalendar } from '@/components/booking/BookingCalendar'
import { useAuth } from '@/components/providers/AuthProvider'
import { getCourtTypeIcon, formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { sendContactEmails, isEmailJSConfigured } from '@/lib/emailjs'
import Script from 'next/script'
import Image from 'next/image'
import toast from 'react-hot-toast'

// Extend Window interface for PayHere
declare global {
  interface Window {
    payhere?: any
  }
}

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
  const [payhereReady, setPayhereReady] = useState(false)

  // Check if PayHere SDK is loaded
  const handlePayhereScriptLoad = useCallback(() => {
    if (typeof window !== 'undefined' && window.payhere) {
      setPayhereReady(true)
      console.log('PayHere SDK loaded successfully')
    }
  }, [])

  const loadCourt = useCallback(async () => {
    try {
      const courtId = params.id as string
      console.log('Loading court with ID:', courtId)

      // Try to load from database first
      const { data: courtData, error } = await supabase
        .from('courts')
        .select(`
          *,
          pricing_rules (
            duration_hours,
            off_peak_price,
            peak_price
          )
        `)
        .eq('id', courtId)
        .single()

      if (error) {
        console.error('Error loading court:', error)
        // Fallback to sample data
        const sampleCourt = {
          id: courtId,
          name: 'Sample Tennis Court',
          type: 'tennis',
          image_url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          description: 'Professional tennis court with premium facilities',
          amenities: 'Lighting, Seating, Equipment Rental'
        }

        const transformedSampleCourt = {
          id: sampleCourt.id,
          name: sampleCourt.name,
          type: sampleCourt.type,
          image: sampleCourt.image_url,
          location: 'Sports Complex',
          rating: 4.8,
          reviews: 124,
          pricing: [
            { duration: 1, price: 45 },
            { duration: 2, price: 80 }
          ],
          amenities: sampleCourt.amenities?.split(', ') || [],
          description: sampleCourt.description
        }

        console.log('Using sample court data:', transformedSampleCourt)
        setCourt(transformedSampleCourt)
        return
      }

      if (courtData) {
        console.log('Court data loaded from database:', courtData)

        // Transform the data to match the expected format
        const typedCourtData = courtData as { id: string; name: string; type: string; image_url: string; pricing_rules: any[] }
        const transformedCourt = {
          id: typedCourtData.id,
          name: typedCourtData.name,
          type: typedCourtData.type,
          image: typedCourtData.image_url || 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          location: 'Sports Complex',
          rating: 4.8,
          reviews: 124,
          pricing: typedCourtData.pricing_rules && typedCourtData.pricing_rules.length > 0
            ? typedCourtData.pricing_rules.map((rule: any) => ({
                duration: rule.duration_hours,
                offPeak: rule.off_peak_price,
                peak: rule.peak_price
              }))
            : [
                { duration: 1, offPeak: 45, peak: 65 },
                { duration: 2, offPeak: 85, peak: 120 }
              ],
          amenities: (typedCourtData as any).amenities ? (typedCourtData as any).amenities.split(', ') : [],
          description: (typedCourtData as any).description || 'Professional court with premium facilities'
        }

        console.log('Transformed court data:', transformedCourt)
        setCourt(transformedCourt)
      } else {
        console.log('No court data found')
        setCourt(null)
      }
    } catch (error) {
      console.error('Exception loading court:', error)
      setCourt(null)
    } finally {
      setLoading(false)
    }
  }, [params.id])

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
  }, [loadCourt, loading])

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

      // 1) Create booking in database as pending until payment completes
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
          payment_status: 'pending'
        })
        .select()
        .single()

      if (error) {
        console.error('Booking creation error:', error)
        toast.error(`Failed to create booking: ${error.message}`)
        return
      }

      console.log('Booking created successfully (pending payment):', data)

      // 2) Start PayHere payment popup for this booking
      try {
        // Check if PayHere SDK is loaded
        if (typeof window === 'undefined' || !window.payhere) {
          console.error('PayHere SDK not loaded')
          toast.error('Payment system is loading. Please try again in a moment.')
          return
        }

        const orderId = data.id as string // Use booking ID so webhook can update this record
        const amount = Number(selectedBooking.price).toFixed(2)
        const currency = 'LKR'

        // Get hash from our server
        const res = await fetch('/api/payments/payhere/hash', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, amount, currency })
        })
        const payload = await res.json()
        if (!res.ok) {
          console.error('PayHere hash error:', payload)
          toast.error(payload.error || 'Failed to initialize payment')
          return
        }

        const origin = window.location.origin
        const notifyBase = process.env.NEXT_PUBLIC_APP_URL || origin

        // Event handlers
        window.payhere.onCompleted = async function (_orderId: string) {
          toast.success('Payment completed! Redirecting...')

          // Optionally send confirmation email now that payment completed (sandbox flow)
          if (isEmailJSConfigured() && user?.email) {
            try {
              const bookingDetails = `🎾 BOOKING CONFIRMATION\n\nDear ${user.user_metadata?.full_name || user.email},\n\nYour court booking has been confirmed!\n\n📍 Court: ${court.name}\n🏆 Type: ${court.type?.charAt(0).toUpperCase() + court.type?.slice(1)}\n📅 Date: ${new Date(selectedBooking.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n⏰ Time: ${startTime}\n⏱️ Duration: ${selectedBooking.duration} hour${selectedBooking.duration > 1 ? 's' : ''}\n  💰 Total: ${formatCurrency(selectedBooking.price)}\n🎫 Booking ID: ${orderId}`

              await sendContactEmails({
                name: user.user_metadata?.full_name || user.email || 'Customer',
                email: user.email,
                phone: user.user_metadata?.phone || '',
                subject: `Booking Confirmed - ${court.name}`,
                message: bookingDetails,
                inquiryType: 'booking'
              })
            } catch (e) {
              console.warn('Email sending after payment failed:', e)
            }
          }

          // Navigate after short delay; the webhook will update booking status
          setTimeout(() => router.push('/dashboard'), 1500)
        }
        window.payhere.onDismissed = function () {
          toast('Payment window closed')
        }
        window.payhere.onError = function (err: string) {
          console.error('PayHere error:', err)
          toast.error('Payment error: ' + err)
        }

        const payment = {
          sandbox: process.env.NEXT_PUBLIC_PAYHERE_SANDBOX === 'true',
          merchant_id: payload.merchantId,
          return_url: `${origin}/test-payhere/return?order_id=${encodeURIComponent(orderId)}`,
          cancel_url: `${origin}/test-payhere/cancel?order_id=${encodeURIComponent(orderId)}`,
          notify_url: `${notifyBase}/api/payments/payhere/notify`,
          order_id: orderId,
          items: `Court Booking - ${court.name}`,
          amount: payload.amount,
          currency,
          hash: payload.hash,
          first_name: user.user_metadata?.full_name?.split(' ')?.[0] || 'User',
          last_name: user.user_metadata?.full_name?.split(' ')?.slice(1).join(' ') || ' ',
          email: user.email || 'user@example.com',
          phone: user.user_metadata?.phone || '0700000000',
          address: 'N/A',
          city: 'Colombo',
          country: 'Sri Lanka'
        }

        setStep(3)
        window.payhere.startPayment(payment)
      } catch (phErr) {
        console.error('Failed to start PayHere payment:', phErr)
        toast.error('Failed to start payment')
      }

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
      <Script
        src="https://www.payhere.lk/lib/payhere.js"
        strategy="afterInteractive"
        onLoad={handlePayhereScriptLoad}
        onReady={handlePayhereScriptLoad}
      />
      <HeaderApp />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => {
            if (step === 3) {
              router.push('/courts')
            } else if (step > 1) {
              setStep(step - 1)
            } else {
              router.back()
            }
          }}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>
            {step === 3 ? 'Browse Courts' : step > 1 ? 'Back' : 'Back to Court Details'}
          </span>
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

            {step === 3 && selectedBooking && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-8"
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    Payment Processing
                  </h2>
                  <p className="text-lg text-gray-600 mb-6">
                    Your booking is being confirmed. The PayHere payment window should open shortly.
                  </p>

                  <div className="bg-blue-50 rounded-lg p-6 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-center">
                      <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                      Booking Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm max-w-md mx-auto">
                      <div className="text-left">
                        <span className="text-gray-600">Court:</span>
                        <div className="font-medium">{court?.name}</div>
                      </div>
                      <div className="text-left">
                        <span className="text-gray-600">Date:</span>
                        <div className="font-medium">{selectedBooking.date}</div>
                      </div>
                      <div className="text-left">
                        <span className="text-gray-600">Time:</span>
                        <div className="font-medium">{selectedBooking.startTime}</div>
                      </div>
                      <div className="text-left">
                        <span className="text-gray-600">Duration:</span>
                        <div className="font-medium">{selectedBooking.duration} hour(s)</div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <span className="text-gray-600">Total Amount:</span>
                      <div className="font-bold text-2xl text-blue-600">
                        {formatCurrency(selectedBooking.price)}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 mb-6">
                    If the payment window doesn&apos;t open, please refresh the page and try again.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => router.push('/courts')}
                    >
                      Browse More Courts
                    </Button>
                    <Button
                      onClick={() => router.push('/dashboard')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Go to My Bookings
                    </Button>
                  </div>
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
