'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  MapPin,
  Star,
  Settings,
  Power,
  PowerOff
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useAuth } from '@/components/providers/AuthProvider'
import { getCourtTypeIcon } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AdminCourtsPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [courts, setCourts] = useState<any[]>([])
  const [loadingCourts, setLoadingCourts] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    type: 'deactivate' | 'activate' | 'delete'
    courtId: string
    courtName: string
  }>({
    isOpen: false,
    type: 'delete',
    courtId: '',
    courtName: ''
  })
  const [actionLoading, setActionLoading] = useState(false)

  const loadCourts = useCallback(async () => {
    try {
      setLoadingCourts(true)
      console.log('Loading courts from database...')

      let { data, error } = await supabase
        .from('courts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading courts:', error)
        toast.error('Failed to load courts')
        return
      }

      // If no courts exist, create sample courts
      if (!data || data.length === 0) {
        console.log('No courts found in database, creating sample courts...')
        const created = await createSampleCourts()
        if (created) {
          // Reload courts after creating samples
          const { data: newData, error: newError } = await supabase
            .from('courts')
            .select('*')
            .order('created_at', { ascending: false })

          if (!newError && newData) {
            data = newData
          }
        }
      }

      // Transform data to match component expectations
      const transformedCourts = (data || []).map((court: any) => ({
        id: court.id,
        name: court.name,
        type: court.type,
        location: 'Sports Complex', // Default location
        status: court.is_active ? 'active' : 'inactive',
        bookings: 0, // Could be calculated from bookings table
        revenue: 0, // Could be calculated from bookings table
        rating: 4.5, // Default rating
        lastMaintenance: court.updated_at?.split('T')[0] || court.created_at?.split('T')[0],
        isActive: court.is_active,
        maintenanceMode: court.maintenance_mode || false,
        description: court.description,
        image_url: court.image_url,
        amenities: court.amenities
      }))

      console.log('Loaded courts:', transformedCourts)
      setCourts(transformedCourts)
    } catch (error) {
      console.error('Exception loading courts:', error)
      toast.error('An error occurred while loading courts')
    } finally {
      setLoadingCourts(false)
    }
  }, [])

  useEffect(() => {
    // Wait for loading to complete
    if (loading) return

    // If no user, redirect to home
    if (!user) {
      console.log('Admin courts: No user found, redirecting to home')
      router.push('/')
      return
    }

    // If profile is still loading (null), wait
    if (profile === null) {
      console.log('Admin courts: Profile still loading, waiting...')
      return
    }

    // If profile exists but no admin role, redirect
    if (profile && profile.role !== 'admin') {
      console.log('Admin courts: User is not admin, role:', profile.role, 'redirecting to home')
      router.push('/')
      return
    }

    // If we get here, user should be admin
    console.log('Admin courts: Loading courts for admin user')
    loadCourts()
  }, [user, profile, loading, router, loadCourts])

  const createSampleCourts = async () => {
    try {
      console.log('Creating sample courts...')

      const sampleCourts = [
        {
          name: 'Premium Tennis Court A',
          type: 'tennis',
          description: 'Professional-grade tennis court with synthetic grass surface.',
          image_url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          amenities: 'Professional Lighting, Equipment Rental, Parking Available',
          is_active: true
        },
        {
          name: 'Tennis Court B',
          type: 'tennis',
          description: 'Standard tennis court with hard surface.',
          image_url: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          amenities: 'Lighting, Parking Available',
          is_active: true
        },
        {
          name: 'Basketball Court Pro',
          type: 'basketball',
          description: 'Indoor basketball court with professional-grade flooring.',
          image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          amenities: 'Indoor, Air Conditioning, Sound System',
          is_active: true
        },
        {
          name: 'Outdoor Basketball Court',
          type: 'basketball',
          description: 'Outdoor basketball court with weather-resistant surface.',
          image_url: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          amenities: 'Outdoor Lighting, Parking Available',
          is_active: true
        },
        {
          name: 'Cricket Ground Elite',
          type: 'cricket',
          description: 'Full-size cricket ground with professionally maintained pitch.',
          image_url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          amenities: 'Professional Pitch, Pavilion, Equipment Rental',
          is_active: true
        },
        {
          name: 'Badminton Court',
          type: 'badminton',
          description: 'Indoor badminton court with wooden flooring.',
          image_url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          amenities: 'Indoor, Wooden Floor, Net Equipment',
          is_active: true
        },
        {
          name: 'Football Field Premium',
          type: 'football',
          description: 'Full-size football field with natural grass.',
          image_url: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          amenities: 'Natural Grass, Professional Goals, Changing Rooms',
          is_active: true
        }
      ]

      const { data, error } = await (supabase as any)
        .from('courts')
        .insert(sampleCourts)
        .select()

      if (error) {
        console.error('Error creating sample courts:', error)
        toast.error('Failed to create sample courts')
        return false
      }

      console.log('Sample courts created successfully:', data)
      toast.success(`Created ${data?.length || 0} sample courts`)
      return true
    } catch (error) {
      console.error('Exception creating sample courts:', error)
      toast.error('An error occurred while creating sample courts')
      return false
    }
  }

  const handleToggleStatus = async (courtId: string) => {
    const court = courts.find(c => c.id === courtId)
    if (!court) return

    setConfirmDialog({
      isOpen: true,
      type: court.isActive ? 'deactivate' : 'activate',
      courtId,
      courtName: court.name
    })
  }

  const confirmToggleStatus = async () => {
    setActionLoading(true)
    try {
      const court = courts.find(c => c.id === confirmDialog.courtId)
      if (!court) return

      const { error } = await (supabase as any)
        .from('courts')
        .update({ is_active: !court.isActive })
        .eq('id', confirmDialog.courtId)

      if (error) {
        console.error('Error updating court status:', error)
        toast.error('Failed to update court status')
        return
      }

      setCourts(courts.map(court =>
        court.id === confirmDialog.courtId
          ? { ...court, isActive: !court.isActive, status: !court.isActive ? 'active' : 'inactive' }
          : court
      ))
      toast.success(`Court ${confirmDialog.type === 'deactivate' ? 'deactivated' : 'activated'} successfully`)
      setConfirmDialog({ isOpen: false, type: 'delete', courtId: '', courtName: '' })
    } catch (error) {
      console.error('Exception updating court status:', error)
      toast.error('An error occurred')
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleMaintenance = async (courtId: string) => {
    try {
      const court = courts.find(c => c.id === courtId)
      if (!court) return

      const { error } = await (supabase as any)
        .from('courts')
        .update({ maintenance_mode: !court.maintenanceMode })
        .eq('id', courtId)

      if (error) {
        console.error('Error updating maintenance mode:', error)
        toast.error('Failed to update maintenance mode')
        return
      }

      setCourts(courts.map(court => 
        court.id === courtId 
          ? { ...court, maintenanceMode: !court.maintenanceMode }
          : court
      ))
      toast.success('Maintenance mode updated successfully')
    } catch (error) {
      console.error('Exception updating maintenance mode:', error)
      toast.error('An error occurred')
    }
  }

  const handleDeleteCourt = (courtId: string) => {
    const court = courts.find(c => c.id === courtId)
    if (!court) return

    setConfirmDialog({
      isOpen: true,
      type: 'delete',
      courtId: courtId,
      courtName: court.name
    })
  }

  const confirmDeleteCourt = async () => {
    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('courts')
        .delete()
        .eq('id', confirmDialog.courtId)

      if (error) {
        console.error('Error deleting court:', error)
        toast.error('Failed to delete court')
        return
      }

      setCourts(courts.filter(court => court.id !== confirmDialog.courtId))
      toast.success('Court deleted successfully')
      setConfirmDialog({ isOpen: false, type: 'delete', courtId: '', courtName: '' })
    } catch (error) {
      console.error('Exception deleting court:', error)
      toast.error('An error occurred')
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditCourt = (courtId: string) => {
    router.push(`/admin/courts/${courtId}/edit`)
  }

  const filteredCourts = courts.filter(court => {
    const matchesSearch = court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         court.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || court.type === filterType
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && court.isActive && !court.maintenanceMode) ||
                         (filterStatus === 'inactive' && !court.isActive) ||
                         (filterStatus === 'maintenance' && court.maintenanceMode)
    
    return matchesSearch && matchesType && matchesStatus
  })

  // Show loading while auth is loading or profile is null
  if (loading || loadingCourts || !user || profile === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loading ? 'Loading...' : loadingCourts ? 'Loading courts...' : 'Checking permissions...'}
          </p>
        </div>
      </div>
    )
  }

  // If profile exists but user is not admin, don't render anything (redirect will happen in useEffect)
  if (profile && profile.role !== 'admin') {
    return null
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Court Management
            </h1>
            <p className="text-gray-600">
              Manage your sports venues and track their performance
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button
              variant="outline"
              onClick={() => router.push('/admin')}
              className="flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Dashboard</span>
            </Button>
            
            <Button
              onClick={() => router.push('/admin/courts/new')}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Court</span>
            </Button>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courts by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="tennis">Tennis</option>
              <option value="basketball">Basketball</option>
              <option value="cricket">Cricket</option>
              <option value="badminton">Badminton</option>
              <option value="football">Football</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </motion.div>

        {/* Courts Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-600">Court</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600">Type</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600">Location</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600">Status</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600">Performance</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourts.map((court, index) => (
                  <motion.tr
                    key={court.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getCourtTypeIcon(court.type)}</span>
                        <div>
                          <div className="font-medium text-gray-900">{court.name}</div>
                          <div className="flex items-center space-x-1 mt-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">{court.rating}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium capitalize">
                        {court.type}
                      </span>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{court.location}</span>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex flex-col space-y-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          court.maintenanceMode 
                            ? 'bg-orange-100 text-orange-800'
                            : court.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {court.maintenanceMode ? 'Maintenance' : court.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <div className="text-gray-900 font-medium">{court.bookings} bookings</div>
                        <div className="text-gray-600">{formatCurrency(court.revenue)} revenue</div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/courts/${court.id}`)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Court"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        
                        <button
                          onClick={() => router.push(`/admin/courts/${court.id}/edit`)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit Court"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        
                        <button
                          onClick={() => handleToggleStatus(court.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title={court.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {court.isActive ? (
                            <PowerOff className="w-4 h-4 text-red-600" />
                          ) : (
                            <Power className="w-4 h-4 text-green-600" />
                          )}
                        </button>
                        
{/* Maintenance button temporarily hidden */}
                        {/* <button
                          onClick={() => handleToggleMaintenance(court.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title={court.maintenanceMode ? 'Exit Maintenance' : 'Enter Maintenance'}
                        >
                          <Settings className={`w-4 h-4 ${court.maintenanceMode ? 'text-orange-600' : 'text-gray-600'}`} />
                        </button> */}
                        
                        <button
                          onClick={() => handleDeleteCourt(court.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Delete Court"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCourts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏟️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courts found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your search criteria'
                  : 'Get started by adding your first court'
                }
              </p>
              {!searchTerm && filterType === 'all' && filterStatus === 'all' && (
                <Button onClick={() => router.push('/admin/courts/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Court
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </main>

        <Footer />
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, type: 'delete', courtId: '', courtName: '' })}
        onConfirm={confirmDialog.type === 'delete' ? confirmDeleteCourt : confirmToggleStatus}
        title={
          confirmDialog.type === 'delete'
            ? 'Delete Court'
            : confirmDialog.type === 'deactivate'
            ? 'Deactivate Court'
            : 'Activate Court'
        }
        message={
          confirmDialog.type === 'delete'
            ? `Are you sure you want to delete "${confirmDialog.courtName}"? This will permanently remove the court and all associated data.`
            : confirmDialog.type === 'deactivate'
            ? `Are you sure you want to deactivate "${confirmDialog.courtName}"? Users will not be able to book this court until it is reactivated.`
            : `Are you sure you want to activate "${confirmDialog.courtName}"? Users will be able to book this court.`
        }
        confirmText={
          confirmDialog.type === 'delete'
            ? 'Delete Court'
            : confirmDialog.type === 'deactivate'
            ? 'Deactivate'
            : 'Activate'
        }
        variant={confirmDialog.type === 'delete' ? 'danger' : 'warning'}
        loading={actionLoading}
      />
    </AdminLayout>
  )
}
