'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Save,
  Upload,
  Plus,
  X
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
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

export default function AddCourtPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'tennis',
    description: '',
    location: 'Sports Complex',
    image_url: defaultImages.tennis,
    amenities: '',
    price_1hr: 45,
    price_2hr: 80,
    is_active: true
  })
  const [amenityList, setAmenityList] = useState<string[]>([])
  const [newAmenity, setNewAmenity] = useState('')

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      setFormData(prev => ({
        ...prev,
        image_url: urlData.publicUrl
      }))
      toast.success('Image uploaded successfully!')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  // Redirect if not admin
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || profile?.role !== 'admin') {
    router.push('/')
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))

    // Auto-update image when type changes
    if (name === 'type') {
      setFormData(prev => ({
        ...prev,
        image_url: defaultImages[value as keyof typeof defaultImages]
      }))
    }
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

      // Prepare data for database
      const courtData = {
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description.trim(),
        image_url: formData.image_url,
        amenities: formData.amenities,
        is_active: formData.is_active
      }

      console.log('Creating court with data:', courtData)

      const { data, error } = await (supabase as any)
        .from('courts')
        .insert([courtData])
        .select()
        .single()

      if (error) {
        console.error('Error creating court:', error)
        toast.error(`Failed to create court: ${error.message}`)
        return
      }

      console.log('Court created successfully:', data)

      // Create pricing rules for 1 hour and 2 hour durations
      const pricingRules = [
        {
          court_id: data.id,
          duration_hours: 1,
          off_peak_price: formData.price_1hr,
          peak_price: formData.price_1hr * 1.3 // Peak price is 30% higher
        },
        {
          court_id: data.id,
          duration_hours: 2,
          off_peak_price: formData.price_2hr,
          peak_price: formData.price_2hr * 1.3 // Peak price is 30% higher
        }
      ]

      const { error: pricingError } = await (supabase as any)
        .from('pricing_rules')
        .insert(pricingRules)

      if (pricingError) {
        console.error('Error creating pricing rules:', pricingError)
        // Don't fail the entire operation if pricing rules fail
        toast.error('Court created but pricing rules failed. You can update pricing later.')
      } else {
        console.log('Pricing rules created successfully')
      }

      toast.success('Court created successfully with pricing!')
      
      // Redirect to courts management page
      router.push('/admin/courts')
    } catch (error) {
      console.error('Exception creating court:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
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
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Court</h1>
              <p className="text-gray-600">Create a new sports venue</p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg"
        >
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Court Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter court name"
                  required
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Court Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter court description"
                required
              />
            </div>

            {/* Pricing */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="price_1hr" className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter 1 hour rate"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="price_2hr" className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter 2 hour rate"
                    required
                  />
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Set competitive rates for your court bookings. 2-hour rate is typically discounted.
              </p>
            </div>

            {/* Court Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Court Image
              </label>

              {/* Upload Option */}
              <div className="mb-3">
                <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  <div className="flex items-center space-x-2">
                    <Upload className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {uploading ? 'Uploading...' : 'Click to upload image'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                <p className="mt-1 text-xs text-gray-500">Max 5MB. PNG, JPG, or WebP</p>
              </div>

              {/* Or use URL */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or enter URL</span>
                </div>
              </div>

              <input
                type="url"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter image URL"
              />

              {/* Image Preview */}
              {formData.image_url && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Preview:</p>
                  <Image
                    src={formData.image_url}
                    alt="Preview"
                    width={200}
                    height={150}
                    className="w-48 h-36 object-cover rounded-lg border border-gray-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = defaultImages[formData.type as keyof typeof defaultImages]
                    }}
                  />
                </div>
              )}
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amenities
              </label>
              
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {amenityList.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {amenityList.map((amenity, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {amenity}
                      <button
                        type="button"
                        onClick={() => removeAmenity(index)}
                        className="ml-2 text-gray-500 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                Court is active and available for booking
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Create Court</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
