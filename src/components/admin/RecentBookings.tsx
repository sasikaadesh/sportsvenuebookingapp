'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, User, DollarSign, MoreHorizontal, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
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
  duration: number
  status: string
  amount: number
  createdAt?: string
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
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    type: 'approve' | 'reject'
    bookingId: string
    userName: string
  }>({
    isOpen: false,
    type: 'approve',
    bookingId: '',
    userName: ''
  })
  const [actionLoading, setActionLoading] = useState(false)

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

  const handleStatusChange = (bookingId: string, newStatus: string, userName: string) => {
    setOpenDropdown(null)
    setConfirmDialog({
      isOpen: true,
      type: newStatus === 'confirmed' ? 'approve' : 'reject',
      bookingId,
      userName
    })
  }

  const confirmStatusChange = async () => {
    setActionLoading(true)
    try {
      const newStatus = confirmDialog.type === 'approve' ? 'confirmed' : 'cancelled'

      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', confirmDialog.bookingId)

      if (error) {
        toast.error('Failed to update booking status')
        console.error('Error updating status:', error)
        return
      }

      toast.success(`Booking ${confirmDialog.type === 'approve' ? 'approved' : 'rejected'} successfully`)
      setConfirmDialog({ isOpen: false, type: 'approve', bookingId: '', userName: '' })

      // Trigger refresh in parent component
      if (onStatusChange) {
        onStatusChange()
      }
    } catch (error) {
      console.error('Error updating booking status:', error)
      toast.error('Failed to update booking status')
    } finally {
      setActionLoading(false)
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
        <table className="w-full" style={{fontSize: "80%"}}>
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Customer</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Phone</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Court</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Date & Time</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Booked On</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Amount</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, index) => (
              <motion.tr
                key={booking.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{booking.user}</span>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <span className="text-gray-600 dark:text-gray-300">{booking.phone}</span>
                </td>

                <td className="py-4 px-4">
                  <span className="text-gray-900 dark:text-white">{booking.court}</span>
                </td>

                <td className="py-4 px-4">
                  <div className="text-gray-600 dark:text-gray-300">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">{booking.date} at {booking.time} ({booking.duration}h)</span>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <div>{booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {booking.createdAt ? new Date(booking.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </td>

                <td className="py-4 px-4">
                  <div className="flex items-center space-x-1">
                    {/* <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" /> */}
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(booking.amount)}</span>
                  </div>
                </td>

                <td className="py-4 px-4 relative">
                  <div ref={openDropdown === booking.id ? dropdownRef : null}>
                    <button
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      onClick={() => setOpenDropdown(openDropdown === booking.id ? null : booking.id)}
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>

                    {openDropdown === booking.id && (
                      <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                        <button
                          onClick={() => booking.status !== 'confirmed' && handleStatusChange(booking.id, 'confirmed', booking.user)}
                          disabled={booking.status === 'confirmed'}
                          className={`w-full flex items-center space-x-2 px-4 py-2 text-sm transition-colors ${
                            booking.status === 'confirmed'
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => booking.status !== 'cancelled' && handleStatusChange(booking.id, 'cancelled', booking.user)}
                          disabled={booking.status === 'cancelled'}
                          className={`w-full flex items-center space-x-2 px-4 py-2 text-sm transition-colors ${
                            booking.status === 'cancelled'
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30'
                          }`}
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
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No recent bookings</h3>
          <p className="text-gray-600 dark:text-gray-300">Bookings will appear here once customers start making reservations.</p>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, type: 'approve', bookingId: '', userName: '' })}
        onConfirm={confirmStatusChange}
        title={confirmDialog.type === 'approve' ? 'Approve Booking' : 'Reject Booking'}
        message={
          confirmDialog.type === 'approve'
            ? `Are you sure you want to approve the booking for ${confirmDialog.userName}? This will confirm their reservation.`
            : `Are you sure you want to reject the booking for ${confirmDialog.userName}? This action will cancel their reservation.`
        }
        confirmText={confirmDialog.type === 'approve' ? 'Approve' : 'Reject'}
        variant={confirmDialog.type === 'approve' ? 'info' : 'danger'}
        loading={actionLoading}
      />
    </motion.div>
  )
}
