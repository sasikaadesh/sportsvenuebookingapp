'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, User, DollarSign, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getStatusColor } from '@/lib/utils'

interface Booking {
  id: string
  user: string
  court: string
  date: string
  time: string
  status: string
  amount: number
}

interface RecentBookingsProps {
  bookings: Booking[]
}

export function RecentBookings({ bookings }: RecentBookingsProps) {
  const router = useRouter()

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
                    <span className="font-medium text-gray-900">{booking.amount}</span>
                  </div>
                </td>
                
                <td className="py-4 px-4">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreHorizontal className="w-4 h-4 text-gray-600" />
                  </button>
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
