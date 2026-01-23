'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Clock, Ban, Plus } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { generateTimeSlots, formatTime } from '@/lib/utils'

export default function AdminBlockSlotsPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [courts, setCourts] = useState<any[]>([])
  const [selectedCourt, setSelectedCourt] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [duration, setDuration] = useState<number>(1)
  const [reason, setReason] = useState<string>('Maintenance')
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [blocking, setBlocking] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push('/')
      return
    }
    if (profile === null) return
    if (profile && profile.role !== 'admin') {
      router.push('/')
      return
    }
    loadCourts()
  }, [user, profile, loading, router])

  useEffect(() => {
    if (selectedCourt && selectedDate) {
      loadBookedSlots()
    }
  }, [selectedCourt, selectedDate])

  useEffect(() => {
    const slots = generateTimeSlots(6, 22, 60)
    setAvailableSlots(slots)
  }, [])

  const loadCourts = async () => {
    try {
      const { data, error } = await supabase
        .from('courts')
        .select('id, name, type, is_active')
        .eq('is_active', true)
        .order('name')

      if (error) {
        console.error('Error loading courts:', error)
        toast.error('Failed to load courts')
        return
      }

      setCourts(data || [])
    } catch (error) {
      console.error('Exception loading courts:', error)
      toast.error('An error occurred')
    }
  }

  const loadBookedSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('start_time, duration_hours')
        .eq('court_id', selectedCourt)
        .eq('booking_date', selectedDate)
        .in('status', ['confirmed', 'pending'])

      if (error) {
        console.error('Error loading booked slots:', error)
        return
      }

      const slots: string[] = []
      data?.forEach((booking: any) => {
        const startHour = parseInt(booking.start_time.split(':')[0])
        const duration = booking.duration_hours
        for (let i = 0; i < duration; i++) {
          const hour = startHour + i
          slots.push(`${hour.toString().padStart(2, '0')}:00`)
        }
      })

      setBookedSlots(slots)
    } catch (error) {
      console.error('Exception loading booked slots:', error)
    }
  }

  const handleBlockSlot = async () => {
    if (!selectedCourt || !selectedDate || !selectedTime || !user) {
      toast.error('Please fill in all required fields')
      return
    }

    setBlocking(true)

    try {
      // Create a blocked booking with admin user
      const { data, error } = await (supabase as any)
        .from('bookings')
        .insert({
          user_id: user.id,
          court_id: selectedCourt,
          booking_date: selectedDate,
          start_time: selectedTime + ':00',
          duration_hours: duration,
          total_price: 0,
          status: 'confirmed',
          payment_status: 'paid'
        })
        .select()
        .single()

      if (error) {
        console.error('Error blocking slot:', error)
        toast.error(`Failed to block slot: ${error.message}`)
        return
      }

      toast.success('Time slot blocked successfully')

      // Reset form
      setSelectedTime('')
      setReason('Maintenance')

      // Reload booked slots
      await loadBookedSlots()

    } catch (error) {
      console.error('Exception blocking slot:', error)
      toast.error('An error occurred')
    } finally {
      setBlocking(false)
    }
  }

  const isSlotDisabled = (time: string) => {
    return bookedSlots.includes(time)
  }

  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  if (loading || !user || profile === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (profile && profile.role !== 'admin') {
    return null
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Block Time Slots</h1>
                <p className="text-gray-600 dark:text-gray-300">Reserve court time for maintenance or events</p>
              </div>
            </div>
          </motion.div>

          {/* Block Slot Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-200"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Ban className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Block a Time Slot</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">No payment required for admin bookings</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Court Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Court *
                </label>
                <select
                  value={selectedCourt}
                  onChange={(e) => setSelectedCourt(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Choose a court...</option>
                  {courts.map((court) => (
                    <option key={court.id} value={court.id}>
                      {court.name} ({court.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Date *
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getMinDate()}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Time Slot Selection */}
              {selectedCourt && selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Time Slot *
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {availableSlots.map((time) => {
                      const disabled = isSlotDisabled(time)
                      return (
                        <button
                          key={time}
                          onClick={() => !disabled && setSelectedTime(time)}
                          disabled={disabled}
                          className={`p-3 rounded-lg border text-center transition-all ${
                            selectedTime === time
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              : disabled
                              ? 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                          }`}
                        >
                          <div className="font-medium text-sm">{formatTime(time)}</div>
                          {disabled && <div className="text-xs mt-1">Booked</div>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Duration Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (hours) *
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={1}>1 hour</option>
                  <option value={2}>2 hours</option>
                  <option value={3}>3 hours</option>
                  <option value={4}>4 hours</option>
                  <option value={5}>5 hours</option>
                  <option value={6}>6 hours</option>
                </select>
              </div>

              {/* Reason (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason (Optional)
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Maintenance, Private Event"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => router.push('/admin')}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBlockSlot}
                  disabled={!selectedCourt || !selectedDate || !selectedTime || blocking}
                  loading={blocking}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Block Time Slot
                </Button>
              </div>
            </div>
          </motion.div>
        </main>

        <Footer />
      </div>
    </AdminLayout>
  )
}



