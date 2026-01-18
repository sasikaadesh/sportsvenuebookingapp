'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, User, DollarSign, MoreHorizontal, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getStatusColor, formatCurrency } from '@/lib/utils'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import toast from 'react-hot-toast'

interface Booking {
  id: string
  user: string
  phone: string
  court: string
  date: string
  time: string
  status: string
  amount: number
}

interface RecentBookingsProps {
  bookings: Booking[]
  onStatusChange?: () => void
}

export function RecentBookings({ bookings, onStatusChange }: RecentBookingsProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId)

      if (error) {
        toast.error('Failed to update booking status')
        console.error('Error updating status:', error)
        return
      }

      toast.success(`Booking ${newStatus === 'confirmed' ? 'approved' : 'rejected'} successfully`)
      setOpenDropdown(null)

      // Trigger refresh in parent component
      if (onStatusChange) {
        onStatusChange()
      }
    } catch (error) {
      console.error('Error updating booking status:', error)
      toast.error('Failed to update booking status')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-200"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Bookings</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/admin/bookings')}
        >
          View All
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Phone</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Court</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Date & Time</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, index) => (
              <motion.tr
                key={booking.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900">{booking.user}</span>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <span className="text-gray-600">{booking.phone}</span>
                </td>

                <td className="py-4 px-4">
                  <span className="text-gray-900">{booking.court}</span>
                </td>
                
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{booking.date}</span>
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{booking.time}</span>
                  </div>
                </td>
                
                <td className="py-4 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </td>
                
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-900">{formatCurrency(booking.amount)}</span>
                  </div>
                </td>
                
                <td className="py-4 px-4 relative">
                  <div ref={openDropdown === booking.id ? dropdownRef : null}>
                    <button
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={() => setOpenDropdown(openDropdown === booking.id ? null : booking.id)}
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-600" />
                    </button>

                    {openDropdown === booking.id && (
                      <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {bookings.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recent bookings</h3>
          <p className="text-gray-600">Bookings will appear here once customers start making reservations.</p>
        </div>
      )}
    </motion.div>
  )
}
