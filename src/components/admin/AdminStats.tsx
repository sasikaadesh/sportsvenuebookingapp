'use client'

import { motion } from 'framer-motion'
import { BarChart3, Users, Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

interface AdminStatsProps {
  stats: {
    totalBookings: number
    totalRevenue: number
    activeUsers: number
    courtsAvailable: number
  }
}

export function AdminStats({ stats }: AdminStatsProps) {
  const statCards = [
    {
      title: 'Total Bookings',
      value: stats.totalBookings.toLocaleString(),
      change: '+12%',
      changeType: 'increase',
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: '+18%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers.toLocaleString(),
      change: '+8%',
      changeType: 'increase',
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      title: 'Available Courts',
      value: stats.courtsAvailable.toString(),
      change: '0%',
      changeType: 'neutral',
      icon: BarChart3,
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              
              <div className={`flex items-center space-x-1 text-sm ${
                stat.changeType === 'increase'
                  ? 'text-green-600 dark:text-green-400'
                  : stat.changeType === 'decrease'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {stat.changeType === 'increase' && <TrendingUp className="w-4 h-4" />}
                {stat.changeType === 'decrease' && <TrendingDown className="w-4 h-4" />}
                <span className="font-medium">{stat.change}</span>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {stat.title}
              </p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
