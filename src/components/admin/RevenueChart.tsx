'use client'

import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'
import { BarChart3, TrendingUp } from 'lucide-react'

interface RevenueData {
  month: string
  revenue: number
  bookings: number
}

interface RevenueChartProps {
  data: RevenueData[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  // Handle empty data gracefully
  const hasData = data && data.length > 0
  const maxRevenue = hasData ? Math.max(...data.map(d => d.revenue)) : 1000
  const safeMaxRevenue = maxRevenue > 0 ? maxRevenue : 1000
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Revenue Overview</h2>
          <p className="text-gray-600">Monthly revenue and booking trends</p>
        </div>
        <div className="flex items-center space-x-2 text-green-600">
          <TrendingUp className="w-5 h-5" />
          <span className="font-medium">+23% vs last period</span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-64 mb-6">
        {hasData ? (
          <div className="absolute inset-0 flex items-end justify-between space-x-2">
            {data.map((item, index) => {
              const height = (item.revenue / safeMaxRevenue) * 100
              return (
                <motion.div
                  key={item.month}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg relative group cursor-pointer hover:from-blue-700 hover:to-blue-500 transition-colors"
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap">
                      <div className="font-medium">{item.month}</div>
                      <div>Revenue: {formatCurrency(item.revenue)}</div>
                      <div>Bookings: {item.bookings}</div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No Revenue Data Available</p>
              <p className="text-sm">Data will appear here once bookings are made</p>
            </div>
          </div>
        )}
        
        {/* Y-axis labels */}
        {hasData && (
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-12">
            <span>${(safeMaxRevenue / 1000).toFixed(0)}k</span>
            <span>${(safeMaxRevenue * 0.75 / 1000).toFixed(0)}k</span>
            <span>${(safeMaxRevenue * 0.5 / 1000).toFixed(0)}k</span>
            <span>${(safeMaxRevenue * 0.25 / 1000).toFixed(0)}k</span>
            <span>$0</span>
          </div>
        )}
      </div>

      {/* X-axis labels */}
      {hasData && (
        <div className="flex justify-between text-sm text-gray-600">
          {data.map((item) => (
            <span key={item.month} className="flex-1 text-center">
              {item.month}
            </span>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {hasData ? formatCurrency(data.reduce((sum, item) => sum + item.revenue, 0)) : formatCurrency(0)}
          </div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {hasData ? data.reduce((sum, item) => sum + item.bookings, 0).toLocaleString() : '0'}
          </div>
          <div className="text-sm text-gray-600">Total Bookings</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {(() => {
              if (!hasData) return formatCurrency(0)
              const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)
              const totalBookings = data.reduce((sum, item) => sum + item.bookings, 0)
              if (totalBookings === 0) return formatCurrency(0)
              return formatCurrency(Math.round(totalRevenue / totalBookings))
            })()}
          </div>
          <div className="text-sm text-gray-600">Avg. Booking Value</div>
        </div>
      </div>
    </motion.div>
  )
}
