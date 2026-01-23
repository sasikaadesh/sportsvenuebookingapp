'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  Upload
} from 'lucide-react'
import { HeaderApp } from '@/components/layout/HeaderApp'
import { FooterSimple } from '@/components/layout/FooterSimple'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import toast from 'react-hot-toast'

const courtTypes = [
  { value: 'tennis', label: 'Tennis' },
  { value: 'basketball', label: 'Basketball' },
  { value: 'cricket', label: 'Cricket' },
  { value: 'badminton', label: 'Badminton' },
  { value: 'football', label: 'Football' }
]

const defaultImages = {
  tennis: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  cricket: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  badminton: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  football: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
}

export default function EditCourtPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [loadingCourt, setLoadingCourt] = useState(true)
  const [hasMaintenanceMode, setHasMaintenanceMode] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    type: 'tennis',
    description: '',
    images: [''],
    amenities: '',
    price_1hr: 45,
    price_2hr: 80,
    is_active: true,
    maintenance_mode: false
  })
  const [amenityList, setAmenityList] = useState<string[]>([])
  const [newAmenity, setNewAmenity] = useState('')

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `court-${Date.now()}.${fileExt}`
      const filePath = `courts/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('court-images')
        .upload(filePath, file)

      if (uploadError) {
        // If bucket doesn't exist, show helpful message
        if (uploadError.message.includes('bucket') || uploadError.message.includes('not found')) {
          toast.error('Image storage not configured. Please use URL instead.')
        } else {
          toast.error('Failed to upload image: ' + uploadError.message)
        }
        return
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('court-images')
        .getPublicUrl(filePath)

      // Update the specific image in the array
      const newImages = [...formData.images]
      newImages[index] = urlData.publicUrl
      setFormData(prev => ({
        ...prev,
        images: newImages
      }))
      toast.success('Image uploaded successfully!')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleImageUrlChange = (index: number, url: string) => {
    const newImages = [...formData.images]
    newImages[index] = url
    setFormData(prev => ({
      ...prev,
      images: newImages
    }))
  }

  const addImageSlot = () => {
    if (formData.images.length < 3) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, '']
      }))
    }
  }

  const removeImageSlot = (index: number) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        images: newImages
      }))
    }
  }

  const loadCourt = useCallback(async () => {
    try {
      setLoadingCourt(true)

      // First check if maintenance_mode column exists
      const { error: testError } = await supabase
        .from('courts')
        .select('maintenance_mode')
        .limit(1)

      setHasMaintenanceMode(!testError)

      // Load court data
      const { data, error } = await supabase
        .from('courts')
        .select('*')
        .eq('id', params.id as string)
        .single()

      if (error) {
        console.error('Error loading court:', error)
        toast.error('Failed to load court')
        router.push('/admin/courts')
        return
      }

      // Load pricing rules (with fallback for missing table or wrong schema)
      let price1hr = 45
      let price2hr = 80

      try {
        // First check if table has correct schema
        const { data: schemaCheck } = await supabase
          .from('pricing_rules')
          .select('court_id, duration_hours, off_peak_price')
          .limit(1)

        if (schemaCheck !== null) {
          // Table exists with correct schema, load pricing
          const { data: pricingData, error: pricingError } = await supabase
            .from('pricing_rules')
            .select('duration_hours, off_peak_price')
            .eq('court_id', params.id as string)

          if (!pricingError && pricingData && pricingData.length > 0) {
            // Type assertion for pricing data
            const typedPricingData = pricingData as Array<{ duration_hours: number; off_peak_price: number }>
            const pricing1hr = typedPricingData.find(p => p.duration_hours === 1)
            const pricing2hr = typedPricingData.find(p => p.duration_hours === 2)

            if (pricing1hr) price1hr = pricing1hr.off_peak_price
            if (pricing2hr) price2hr = pricing2hr.off_peak_price

            console.log('Loaded pricing from database:', { price1hr, price2hr })
          }
        }
      } catch (pricingError) {
        console.log('Pricing rules table not available, using defaults:', { price1hr, price2hr })
      }

      const courtData = data as any

      // Handle images - support both old image_url and new images array
      let images: string[] = []
      if (courtData.images && Array.isArray(courtData.images) && courtData.images.length > 0) {
        images = courtData.images
      } else if (courtData.image_url) {
        images = [courtData.image_url]
      } else {
        images = [defaultImages[courtData.type as keyof typeof defaultImages] || '']
      }

      setFormData({
        name: courtData.name || '',
        type: courtData.type || 'tennis',
        description: courtData.description || '',
        images: images,
        amenities: courtData.amenities || '',
        price_1hr: price1hr,
        price_2hr: price2hr,
        is_active: courtData.is_active !== false,
        maintenance_mode: courtData.maintenance_mode !== undefined ? courtData.maintenance_mode : false
      })

      // Parse amenities if it's a string
      if (courtData.amenities) {
        const amenities = typeof courtData.amenities === 'string'
          ? courtData.amenities.split(', ').filter((a: string) => a.trim())
          : []
        setAmenityList(amenities)
      }
    } catch (error) {
      console.error('Exception loading court:', error)
      toast.error('An error occurred while loading court')
      router.push('/admin/courts')
    } finally {
      setLoadingCourt(false)
    }
  }, [params.id, router])

  // Redirect if not admin
  useEffect(() => {
    // Wait for loading to complete
    if (loading) return

    // If no user, redirect to home
    if (!user) {
      console.log('Admin edit court: No user found, redirecting to home')
      router.push('/')
      return
    }

    // If profile is still loading (null), wait
    if (profile === null) {
      console.log('Admin edit court: Profile still loading, waiting...')
      return
    }

    // If profile exists but no admin role, redirect
    if (profile && profile.role !== 'admin') {
      console.log('Admin edit court: User is not admin, role:', profile.role, 'redirecting to home')
      router.push('/')
      return
    }

    // If we get here, user should be admin
    if (params.id) {
      console.log('Admin edit court: Loading court for admin user')
      loadCourt()
    }
  }, [user, profile, loading, router, params.id, loadCourt])

  if (loading || loadingCourt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading court...</p>
        </div>
      </div>
    )
  }

  if (!user || profile?.role !== 'admin') {
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const addAmenity = () => {
    if (newAmenity.trim() && !amenityList.includes(newAmenity.trim())) {
      const updatedAmenities = [...amenityList, newAmenity.trim()]
      setAmenityList(updatedAmenities)
      setFormData(prev => ({
        ...prev,
        amenities: updatedAmenities.join(', ')
      }))
      setNewAmenity('')
    }
  }

  const removeAmenity = (index: number) => {
    const updatedAmenities = amenityList.filter((_, i) => i !== index)
    setAmenityList(updatedAmenities)
    setFormData(prev => ({
      ...prev,
      amenities: updatedAmenities.join(', ')
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Validate required fields
      if (!formData.name.trim() || !formData.type || !formData.description.trim() || !formData.price_1hr || !formData.price_2hr) {
        toast.error('Please fill in all required fields including pricing')
        setSaving(false)
        return
      }

      // Validate pricing
      if (formData.price_1hr <= 0 || formData.price_2hr <= 0) {
        toast.error('Prices must be greater than 0')
        setSaving(false)
        return
      }

      // Filter out empty image URLs
      const validImages = formData.images.filter(img => img && img.trim() !== '')

      if (validImages.length === 0) {
        toast.error('Please add at least one court image')
        setSaving(false)
        return
      }

      // Prepare data for database
      const courtData = {
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description.trim(),
        images: validImages,
        amenities: formData.amenities,
        is_active: formData.is_active,
        updated_at: new Date().toISOString()
      }

      // Only include maintenance_mode if the column exists in the database
      // This prevents errors when the column is missing
      try {
        // Test if maintenance_mode column exists by doing a simple select
        const { error: testError } = await supabase
          .from('courts')
          .select('maintenance_mode')
          .limit(1)

        if (!testError) {
          // Column exists, include it in the update
          (courtData as any).maintenance_mode = formData.maintenance_mode
        }
      } catch (e) {
        console.log('maintenance_mode column not available, skipping...')
      }

      console.log('Updating court with data:', courtData)

      const { error } = await (supabase as any)
        .from('courts')
        .update(courtData)
        .eq('id', params.id as string)

      if (error) {
        console.error('Error updating court:', error)
        toast.error(`Failed to update court: ${error.message}`)
        return
      }

      console.log('Court updated successfully')

      // Update or create pricing rules
      try {
        // First check if pricing_rules table exists and has correct schema
        const { data: schemaCheck, error: schemaError } = await supabase
          .from('pricing_rules')
          .select('off_peak_price, peak_price')
          .limit(1)

        if (schemaError) {
          console.log('Pricing rules table not available or wrong schema:', schemaError.message)
          if (schemaError.message.includes('off_peak_price')) {
            toast.error('Pricing system needs to be set up. Please run the database setup script.')
            toast('Court updated successfully, but pricing system requires database migration.', {
              icon: '⚠️',
              duration: 8000,
            })
          } else {
            toast.success('Court updated successfully! (Pricing rules table not configured)')
          }
        } else {
          // Table exists with correct schema, proceed with pricing updates
          const pricingRules = [
            {
              court_id: params.id,
              duration_hours: 1,
              off_peak_price: formData.price_1hr,
              peak_price: Math.round(formData.price_1hr * 1.3 * 100) / 100 // Peak price is 30% higher, rounded
            },
            {
              court_id: params.id,
              duration_hours: 2,
              off_peak_price: formData.price_2hr,
              peak_price: Math.round(formData.price_2hr * 1.3 * 100) / 100 // Peak price is 30% higher, rounded
            }
          ]

          console.log('Updating pricing rules:', pricingRules)

          // Use upsert to handle both insert and update
          const { error: pricingError } = await (supabase as any)
            .from('pricing_rules')
            .upsert(pricingRules, {
              onConflict: 'court_id,duration_hours'
            })

          if (pricingError) {
            console.error('Error updating pricing rules:', pricingError)
            toast.error(`Court updated but pricing failed: ${pricingError.message}`)
          } else {
            console.log('Pricing rules updated successfully')
            toast.success('Court and pricing updated successfully!')
          }
        }
      } catch (pricingException) {
        console.error('Exception updating pricing rules:', pricingException)
        toast.success('Court updated successfully! (Pricing system not available)')
      }

      // Refresh the court data to show updated prices
      setTimeout(() => {
        loadCourt()
      }, 1000)

      toast.success('Court updated successfully with pricing!')
      
      // Redirect to courts management page
      router.push('/admin/courts')
    } catch (error) {
      console.error('Exception updating court:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  // Show loading while auth is loading or profile is null
  if (loading || loadingCourt || !user || profile === null) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              {loading ? 'Loading...' : loadingCourt ? 'Loading court...' : 'Checking permissions...'}
            </p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  // If profile exists but user is not admin, don't render anything (redirect will happen in useEffect)
  if (profile && profile.role !== 'admin') {
    return null
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <HeaderApp />
      
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
              onClick={() => router.push('/admin/courts')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Courts</span>
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Court</h1>
              <p className="text-gray-600 dark:text-gray-300">Update court information</p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg"
        >
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Court Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter court name"
                  required
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Court Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {courtTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter court description"
                required
              />
            </div>

            {/* Pricing */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="price_1hr" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    1 Hour Rate ($) *
                  </label>
                  <input
                    type="number"
                    id="price_1hr"
                    name="price_1hr"
                    value={formData.price_1hr}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter 1 hour rate"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="price_2hr" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    2 Hour Rate ($) *
                  </label>
                  <input
                    type="number"
                    id="price_2hr"
                    name="price_2hr"
                    value={formData.price_2hr}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter 2 hour rate"
                    required
                  />
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Set competitive rates for your court bookings. 2-hour rate is typically discounted.
              </p>
            </div>

            {/* Court Images (1-3) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Court Images (1-3 images) *
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Add 1 to 3 high-quality images of your court. These will be displayed in a carousel on the court details page.
              </p>

              {formData.images.map((image, index) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Image {index + 1}
                    </span>
                    {formData.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageSlot(index)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Image Preview */}
                  {image && (
                    <div className="mb-3 relative h-32 rounded-lg overflow-hidden">
                      <Image
                        src={image}
                        alt={`Court preview ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Upload Option */}
                  <div className="mb-3">
                    <label className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors">
                      <div className="flex items-center space-x-2">
                        <Upload className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          {uploading ? 'Uploading...' : 'Upload image'}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, index)}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>

                  {/* Or use URL */}
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400">or enter URL</span>
                    </div>
                  </div>

                  <input
                    type="url"
                    value={image}
                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter image URL"
                  />
                </div>
              ))}

              {/* Add Image Button */}
              {formData.images.length < 3 && (
                <button
                  type="button"
                  onClick={addImageSlot}
                  className="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add another image ({formData.images.length}/3)</span>
                </button>
              )}
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Max 5MB per image. PNG, JPG, or WebP</p>
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amenities
              </label>

              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter amenity"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addAmenity()
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={addAmenity}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {amenityList.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {amenityList.map((amenity, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm"
                    >
                      {amenity}
                      <button
                        type="button"
                        onClick={() => removeAmenity(index)}
                        className="ml-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Status toggles */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Court is active and available for booking
                </label>
              </div>

              {hasMaintenanceMode && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="maintenance_mode"
                    name="maintenance_mode"
                    checked={formData.maintenance_mode}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <label htmlFor="maintenance_mode" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Court is in maintenance mode
                  </label>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/courts')}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </main>

      <FooterSimple />
      </div>
    </AdminLayout>
  )
}
