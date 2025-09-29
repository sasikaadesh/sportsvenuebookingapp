'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Settings, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Calendar,
  FileText,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export function QuickActions() {
  const router = useRouter()

  const handleExportData = async () => {
    try {
      toast.loading('Generating PDF report...')
      
      // Dynamically import jsPDF and autoTable to avoid SSR issues
      const jsPDFModule = await import('jspdf')
      const autoTableModule = await import('jspdf-autotable')
      
      const jsPDF = jsPDFModule.default
      const autoTable = autoTableModule.default
      
      // Fetch all data in parallel
      const [courtsResult, usersResult, bookingsResult] = await Promise.all([
        supabase.from('courts').select('*'),
        supabase.from('users').select('*'),
        supabase.from('bookings').select(`
          *,
          users(full_name, email),
          courts(name, type)
        `)
      ])

      // Calculate statistics
      const totalBookings = bookingsResult.data?.length || 0
      const totalRevenue = bookingsResult.data?.reduce((sum, booking: any) => sum + (booking.total_price || 0), 0) || 0
      const activeUsers = usersResult.data?.length || 0
      const availableCourts = courtsResult.data?.filter((court: any) => court.is_active).length || 0

      // Prepare bookings data for table
      const bookingsData = (bookingsResult.data || []).map((booking: any) => [
        booking.users?.full_name || 'Unknown',
        booking.courts?.name || 'Unknown',
        booking.courts?.type || 'Unknown',
        booking.booking_date,
        booking.start_time,
        `${booking.duration_hours}h`,
        `$${booking.total_price || 0}`,
        booking.status || 'pending',
        booking.payment_status || 'pending'
      ])

      // Generate PDF
      generatePDFReport(jsPDF, autoTable, {
        totalBookings,
        totalRevenue,
        activeUsers,
        availableCourts,
        bookingsData
      })

      toast.dismiss()
      toast.success('PDF report generated successfully! Check your downloads.')
    } catch (error) {
      console.error('Export error:', error)
      toast.dismiss()
      toast.error('Failed to generate PDF report. Please try again.')
    }
  }

  const generatePDFReport = (jsPDF: any, autoTable: any, data: {
    totalBookings: number,
    totalRevenue: number,
    activeUsers: number,
    availableCourts: number,
    bookingsData: any[][]
  }) => {
    const doc = new jsPDF()
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Title
    doc.setFontSize(20)
    doc.setTextColor(40, 40, 40)
    doc.text('Sports Venue Booking Report', 20, 25)
    
    // Date
    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated on: ${currentDate}`, 20, 35)

    // Statistics Section
    doc.setFontSize(16)
    doc.setTextColor(40, 40, 40)
    doc.text('Key Statistics', 20, 55)
    
    // Statistics boxes
    const stats = [
      { label: 'Total Bookings', value: data.totalBookings.toLocaleString() },
      { label: 'Total Revenue', value: `$${data.totalRevenue.toLocaleString()}` },
      { label: 'Active Users', value: data.activeUsers.toLocaleString() },
      { label: 'Available Courts', value: data.availableCourts.toString() }
    ]

    let yPosition = 70
    stats.forEach((stat, index) => {
      const xPosition = 20 + (index % 2) * 90
      if (index % 2 === 0 && index > 0) yPosition += 25

      // Draw stat box
      doc.setDrawColor(200, 200, 200)
      doc.setFillColor(245, 245, 245)
      doc.rect(xPosition, yPosition, 80, 20, 'FD')
      
      // Stat value
      doc.setFontSize(14)
      doc.setTextColor(40, 40, 40)
      doc.text(stat.value, xPosition + 5, yPosition + 8)
      
      // Stat label
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(stat.label, xPosition + 5, yPosition + 16)
    })

    // Bookings Table
    yPosition += 40
    doc.setFontSize(16)
    doc.setTextColor(40, 40, 40)
    doc.text('Recent Bookings', 20, yPosition)

    // Table headers
    const headers = [
      'Customer', 'Court', 'Type', 'Date', 'Time', 'Duration', 'Price', 'Status', 'Payment'
    ]

    // Generate table
    autoTable(doc, {
      startY: yPosition + 10,
      head: [headers],
      body: data.bookingsData.slice(0, 50), // Limit to 50 bookings for PDF
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Customer
        1: { cellWidth: 25 }, // Court
        2: { cellWidth: 15 }, // Type
        3: { cellWidth: 20 }, // Date
        4: { cellWidth: 15 }, // Time
        5: { cellWidth: 15 }, // Duration
        6: { cellWidth: 15 }, // Price
        7: { cellWidth: 18 }, // Status
        8: { cellWidth: 18 }  // Payment
      }
    })

    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10)
      doc.text('Sports Venue Booking System', 20, doc.internal.pageSize.height - 10)
    }

    // Save the PDF
    const filename = `sports-venue-report-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(filename)
  }

  const actions = [
    {
      title: 'Add New Court',
      description: 'Create a new sports venue',
      icon: Plus,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => router.push('/admin/courts/new')
    },
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: Users,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => router.push('/admin/users')
    },
    {
      title: 'View Messages',
      description: 'Check customer inquiries',
      icon: MessageSquare,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => router.push('/admin/messages')
    },
    {
      title: 'Analytics',
      description: 'Detailed reports and insights',
      icon: BarChart3,
      color: 'bg-orange-500 hover:bg-orange-600',
      onClick: () => router.push('/admin/analytics')
    },
    {
      title: 'Booking Calendar',
      description: 'View all bookings in calendar',
      icon: Calendar,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      onClick: () => router.push('/admin/calendar')
    },
    {
      title: 'Export Data',
      description: 'Download reports and data',
      icon: Download,
      color: 'bg-gray-500 hover:bg-gray-600',
      onClick: () => handleExportData()
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-200"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
        <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </div>

      <div className="space-y-3">
        {actions.map((action, index) => {
          const IconComponent = action.icon
          return (
            <motion.button
              key={action.title}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              onClick={action.onClick}
              className="w-full flex items-center space-x-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all group"
            >
              <div className={`p-3 rounded-lg ${action.color} transition-colors`}>
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              
              <div className="flex-1 text-left">
                <h3 className="font-medium text-gray-900 group-hover:text-gray-700">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {action.description}
                </p>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Recent Activity Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-medium text-gray-900 mb-3">Today&apos;s Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">New Bookings</span>
            <span className="font-medium text-green-600">+12</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Pending Approvals</span>
            <span className="font-medium text-orange-600">3</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">New Messages</span>
            <span className="font-medium text-blue-600">5</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Revenue Today</span>
            <span className="font-medium text-gray-900">$1,240</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
