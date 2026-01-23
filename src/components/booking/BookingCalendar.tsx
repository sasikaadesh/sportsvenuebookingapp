'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Clock, Users, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatDate, formatTime, generateTimeSlots, isTimeSlotAvailable, calculateEndTime, isPeakHour } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface BookingCalendarProps {
  courtId: string
  courtType?: string
  pricing: Array<{
    duration: number
    offPeak: number
    peak: number
  }>
  onBookingSelect: (booking: {
    date: string
    startTime: string
    duration: number
    price: number
  }) => void
}

// Cricket-specific duration options (in hours)
const cricketDurations = [
  { duration: 4, label: 'Half Day', description: '4 hours' },
  { duration: 8, label: 'Full Day', description: '8 hours' }
]

export function BookingCalendar({ courtId, courtType, pricing, onBookingSelect }: BookingCalendarProps) {
  const isCricket = courtType?.toLowerCase() === 'cricket'

  // For cricket, default to first cricket duration (4 hours = Half Day)
  // For other sports, default to first pricing option duration or 1 hour
  const defaultDuration = isCricket ? cricketDurations[0].duration : (pricing[0]?.duration || 1)

  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [selectedDuration, setSelectedDuration] = useState<number>(defaultDuration)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [bookedSlots, setBookedSlots] = useState<string[]>([])

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const currentDate = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return days
  }

  // Fetch booked slots from database
  const getBookedSlots = useCallback(async (date: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('start_time, duration_hours')
        .eq('court_id', courtId)
        .eq('booking_date', date)
        .in('status', ['confirmed', 'pending'])

      if (error) {
        console.error('Error loading booked slots:', error)
        setBookedSlots([])
        return
      }

      const slots: string[] = []
      data?.forEach((booking: any) => {
        const startHour = parseInt(booking.start_time.split(':')[0])
        const startMinute = parseInt(booking.start_time.split(':')[1])
        const duration = booking.duration_hours
        for (let i = 0; i < duration; i++) {
          const hour = startHour + i
          slots.push(`${hour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`)
        }
      })

      setBookedSlots(slots)
    } catch (error) {
      console.error('Exception loading booked slots:', error)
      setBookedSlots([])
    }
  }, [courtId])

  useEffect(() => {
    if (selectedDate && courtId) {
      getBookedSlots(selectedDate)
    }
  }, [selectedDate, courtId, getBookedSlots])

  useEffect(() => {
    const slots = generateTimeSlots(6, 22, 60)
    setAvailableSlots(slots)
  }, [])

  const handleDateSelect = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (date >= today) {
      // Use local timezone-safe date formatting to avoid timezone offset issues
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const localDateString = `${year}-${month}-${day}`

      setSelectedDate(localDateString)
      setSelectedTime('')
    }
  }

  const handleTimeSelect = (time: string) => {
    if (isTimeSlotAvailable(time, bookedSlots, selectedDuration)) {
      setSelectedTime(time)
    }
  }

  const handleBooking = () => {
    if (selectedDate && selectedTime && selectedDuration) {
      const pricingRule = pricing.find(p => p.duration === selectedDuration)
      if (pricingRule) {
        const isPeak = isPeakHour(selectedTime)
        const price = isPeak ? pricingRule.peak : pricingRule.offPeak
        
        onBookingSelect({
          date: selectedDate,
          startTime: selectedTime,
          duration: selectedDuration,
          price
        })
      }
    }
  }

  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const isTimeDisabled = (time: string) => {
    return !isTimeSlotAvailable(time, bookedSlots, selectedDuration)
  }

  const getTimeSlotPrice = (time: string) => {
    if (isCricket) {
      // For cricket, calculate based on duration and hourly rate
      const matchingPrice = pricing.find(p => p.duration === selectedDuration)
      if (matchingPrice) {
        const isPeak = isPeakHour(time)
        return isPeak ? matchingPrice.peak : matchingPrice.offPeak
      }
      // Fallback: use first pricing rule and multiply by hours
      const baseHourlyRate = pricing[0]?.offPeak || 0
      const isPeak = isPeakHour(time)
      const hourlyRate = isPeak ? (pricing[0]?.peak || baseHourlyRate) : baseHourlyRate
      return hourlyRate * selectedDuration
    }

    const pricingRule = pricing.find(p => p.duration === selectedDuration)
    if (pricingRule) {
      const isPeak = isPeakHour(time)
      return isPeak ? pricingRule.peak : pricingRule.offPeak
    }
    return 0
  }

  // Helper to get duration label for display
  const getDurationLabel = () => {
    if (isCricket) {
      const cricketOption = cricketDurations.find(c => c.duration === selectedDuration)
      return cricketOption ? `${cricketOption.label} (${cricketOption.description})` : `${selectedDuration} hours`
    }
    return `${selectedDuration} hour${selectedDuration > 1 ? 's' : ''}`
  }

  const calendarDays = generateCalendarDays()
  const today = new Date()

  return (
    <div className="space-y-6">
      {/* Duration Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Duration</h3>
        <p className="text-sm text-gray-600 mb-4">
          {isCricket
            ? 'Cricket bookings are available for Half Day (4 hours) or Full Day (8 hours).'
            : 'Choose your booking duration. Time slots will show specific pricing based on peak/off-peak hours.'
          }
        </p>
        <div className={`grid gap-3 ${isCricket ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {isCricket ? (
            // Cricket-specific duration options
            cricketDurations.map((option) => {
              // Find matching pricing rule or calculate based on hourly rate
              const matchingPrice = pricing.find(p => p.duration === option.duration)
              const basePrice = matchingPrice?.offPeak || (pricing[0]?.offPeak || 0) * option.duration

              return (
                <motion.button
                  key={option.duration}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedDuration(option.duration)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedDuration === option.duration
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Clock className="w-5 h-5" />
                    <span className="font-semibold text-lg">{option.label}</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {option.description}
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    LKR {basePrice.toLocaleString()}
                  </div>
                </motion.button>
              )
            })
          ) : (
            // Standard hourly options for other sports
            pricing.map((price) => (
              <motion.button
                key={price.duration}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedDuration(price.duration)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedDuration === price.duration
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">{price.duration}h</span>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  LKR {price.offPeak.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  per hour
                </div>
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* Calendar */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Select Date</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-medium text-gray-900 min-w-[120px] text-center">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
            const isToday = date.toDateString() === today.toDateString()

            // Use timezone-safe date comparison
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            const localDateString = `${year}-${month}-${day}`
            const isSelected = selectedDate === localDateString

            const isDisabled = isDateDisabled(date)

            return (
              <motion.button
                key={index}
                whileHover={!isDisabled ? { scale: 1.05 } : {}}
                whileTap={!isDisabled ? { scale: 0.95 } : {}}
                onClick={() => handleDateSelect(date)}
                disabled={isDisabled}
                className={`p-2 text-sm rounded-lg transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : isToday
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : isCurrentMonth && !isDisabled
                    ? 'hover:bg-gray-100 text-gray-900'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                {date.getDate()}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Available Times for {formatDate(selectedDate, 'EEEE, MMMM do, yyyy')}
          </h3>
          
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {availableSlots.map((time) => {
              const isDisabled = isTimeDisabled(time)
              const price = getTimeSlotPrice(time)
              const isPeak = isPeakHour(time)
              const endTime = calculateEndTime(time, selectedDuration)

              return (
                <motion.button
                  key={time}
                  whileHover={!isDisabled ? { scale: 1.02 } : {}}
                  whileTap={!isDisabled ? { scale: 0.98 } : {}}
                  onClick={() => handleTimeSelect(time)}
                  disabled={isDisabled}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    selectedTime === time
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : isDisabled
                      ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-sm">
                    {formatTime(time)}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    to {formatTime(endTime)}
                  </div>
                  <div className={`text-sm mt-1 font-semibold ${
                    isPeak ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    LKR {price.toLocaleString()}
                  </div>
                  <div className={`text-xs ${
                    isPeak ? 'text-orange-500' : 'text-green-500'
                  }`}>
                    {isPeak ? 'Peak Rate' : 'Off-Peak'}
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Booking Summary */}
      {selectedDate && selectedTime && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-blue-50 rounded-lg p-4"
        >
          <h4 className="font-semibold text-gray-900 mb-3">Booking Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{formatDate(selectedDate, 'PPP')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">
                {formatTime(selectedTime)} - {formatTime(calculateEndTime(selectedTime, selectedDuration))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium">{getDurationLabel()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Price:</span>
              <span className="font-medium text-lg">${getTimeSlotPrice(selectedTime)}</span>
            </div>
          </div>
          
          <Button
            onClick={handleBooking}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
          >
            Continue to Booking
          </Button>
        </motion.div>
      )}
    </div>
  )
}
