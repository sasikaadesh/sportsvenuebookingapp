'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Clock,
  Calendar,
  ArrowLeft,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Check,
  Info
} from 'lucide-react'
import { HeaderApp } from '@/components/layout/HeaderApp'
import { FooterSimple } from '@/components/layout/FooterSimple'
import { Button } from '@/components/ui/Button'
import { getCourtTypeIcon, formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

// Default images for each court type
const defaultImages = {
  tennis: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  cricket: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  badminton: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  football: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
}

interface Court {
  id: string
  name: string
  type: string
  images: string[]
  location: string
  description: string
  amenities: string[]
  pricing: { duration: number; offPeak: number; peak: number }[]
  is_active: boolean
}

export default function CourtDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [court, setCourt] = useState<Court | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)

  const loadCourtDetails = useCallback(async () => {
    const courtId = params.id as string
    setLoading(true)

    try {
      // Load court data from database
      const { data: courtData, error } = await supabase
        .from('courts')
        .select(`
          *,
          pricing_rules (
            duration_hours,
            off_peak_price,
            peak_price
          )
        `)
        .eq('id', courtId)
        .single()

      if (error) {
        console.error('Error loading court:', error)
        setCourt(null)
        return
      }

      if (courtData) {
        // Transform database data to match expected format
        const typedCourtData = courtData as {
          id: string
          name: string
          type: string
          image_url?: string
          pricing_rules?: { duration_hours: number; off_peak_price: number; peak_price: number }[]
          amenities?: string
          description?: string
          is_active: boolean
          location?: string
        }

        // Parse amenities - could be a string or array
        let amenitiesArray: string[] = []
        if (typedCourtData.amenities) {
          if (typeof typedCourtData.amenities === 'string') {
            amenitiesArray = typedCourtData.amenities.split(', ').filter(a => a.trim())
          } else if (Array.isArray(typedCourtData.amenities)) {
            amenitiesArray = typedCourtData.amenities
          }
        }

        // Get court image - use uploaded image or default based on court type
        const courtImage = typedCourtData.image_url ||
          defaultImages[typedCourtData.type as keyof typeof defaultImages] ||
          defaultImages.tennis

        const transformedCourt: Court = {
          id: typedCourtData.id,
          name: typedCourtData.name,
          type: typedCourtData.type,
          images: [courtImage],
          location: typedCourtData.location || 'Sports Complex',
          pricing: typedCourtData.pricing_rules && typedCourtData.pricing_rules.length > 0
            ? typedCourtData.pricing_rules.map((rule) => ({
                duration: rule.duration_hours,
                offPeak: rule.off_peak_price,
                peak: rule.peak_price
              }))
            : [
                { duration: 1, offPeak: 45, peak: 65 },
                { duration: 2, offPeak: 80, peak: 110 }
              ],
          amenities: amenitiesArray,
          description: typedCourtData.description || 'Professional court with premium facilities.',
          is_active: typedCourtData.is_active
        }
        setCourt(transformedCourt)
      } else {
        setCourt(null)
      }
    } catch (error) {
      console.error('Exception loading court details:', error)
      setCourt(null)
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    loadCourtDetails()
  }, [loadCourtDetails])

  // Navigate through images
  const nextImage = () => {
    if (court && court.images.length > 1) {
      setImageLoaded(false)
      setCurrentImageIndex((prev) => (prev + 1) % court.images.length)
    }
  }

  const prevImage = () => {
    if (court && court.images.length > 1) {
      setImageLoaded(false)
      setCurrentImageIndex((prev) => (prev - 1 + court.images.length) % court.images.length)
    }
  }



  const handleShare = async () => {
    if (!court) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: court.name,
          text: court.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading court details...</p>
        </div>
      </div>
    )
  }

  if (!court) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <HeaderApp />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Court Not Found</h1>
            <p className="text-gray-600 mb-6">The court you&apos;re looking for doesn&apos;t exist.</p>
            <Button onClick={() => router.push('/courts')}>
              Back to Courts
            </Button>
          </div>
        </main>
        <FooterSimple />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <HeaderApp />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="outline"
            onClick={() => router.push('/courts')}
            className="flex items-center space-x-2 border-gray-300 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Courts</span>
          </Button>
        </motion.div>

        {/* Hero Image Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
        >
          {/* Main Image Display */}
          <div className="relative h-[400px] md:h-[500px] w-full bg-gray-100">
            {/* Loading placeholder */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <Image
                  src={court.images[currentImageIndex]}
                  alt={court.name}
                  fill
                  className={`object-cover transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  priority
                />
              </motion.div>
            </AnimatePresence>

            {/* Gradient overlay for better text visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {/* Navigation arrows for multiple images */}
            {court.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-800" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all"
                >
                  <ChevronRight className="w-6 h-6 text-gray-800" />
                </button>
              </>
            )}

            {/* Image indicators */}
            {court.images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
                {court.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setImageLoaded(false)
                      setCurrentImageIndex(index)
                    }}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentImageIndex
                        ? 'bg-white scale-110'
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-3 rounded-full backdrop-blur-md transition-all shadow-lg ${
                  isLiked
                    ? 'bg-red-500 text-white'
                    : 'bg-white/90 text-gray-700 hover:bg-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={handleShare}
                className="p-3 rounded-full bg-white/90 text-gray-700 hover:bg-white backdrop-blur-md transition-all shadow-lg"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Court type badge */}
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/90 backdrop-blur-md shadow-lg">
                <span className="text-xl mr-2">{getCourtTypeIcon(court.type)}</span>
                <span className="font-medium text-gray-800 capitalize">{court.type}</span>
              </span>
            </div>

            {/* Court name overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                {court.name}
              </h1>
              <div className="flex items-center text-white/90">
                <MapPin className="w-5 h-5 mr-2" />
                <span className="text-lg">{court.location}</span>
              </div>
            </div>
          </div>

          {/* Thumbnail strip for multiple images (future use) */}
          {court.images.length > 1 && (
            <div className="p-4 bg-gray-50 border-t">
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {court.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setImageLoaded(false)
                      setCurrentImageIndex(index)
                    }}
                    className={`relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden transition-all ${
                      index === currentImageIndex
                        ? 'ring-2 ring-blue-500 ring-offset-2'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${court.name} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Info className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">About This Court</h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">
                {court.description}
              </p>
            </motion.div>

            {/* Amenities Section */}
            {court.amenities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities & Features</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {court.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-gray-800 font-medium">{amenity}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Operating Hours */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Operating Hours</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Weekdays</div>
                    <div className="text-gray-600">6:00 AM - 10:00 PM</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Weekends</div>
                    <div className="text-gray-600">7:00 AM - 9:00 PM</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-xl shadow-lg p-6 sticky top-8"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Book This Court</h3>

              {/* Status Badge */}
              <div className="mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  court.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    court.is_active ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  {court.is_active ? 'Available for Booking' : 'Currently Unavailable'}
                </span>
              </div>

              {/* Pricing */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Pricing</h4>
                <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                  {court.pricing.map((price, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-700">{price.duration}h session</span>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {formatCurrency(price.offPeak)}
                          {price.peak !== price.offPeak && (
                            <span className="text-gray-500 font-normal"> - {formatCurrency(price.peak)}</span>
                          )}
                        </div>
                        {price.peak !== price.offPeak && (
                          <div className="text-xs text-gray-500">off-peak - peak</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Book Button */}
              <Button
                className="w-full mb-4 bg-blue-600 hover:bg-blue-700 py-3 text-lg"
                onClick={() => router.push(`/courts/${court.id}/book`)}
                disabled={!court.is_active}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book Now
              </Button>

              {/* Quick Info */}
              <div className="text-center text-sm text-gray-600 space-y-2">
                <div className="flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span>Free cancellation up to 24 hours before</span>
                </div>
                <div className="flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span>Instant confirmation</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <FooterSimple />
    </div>
  )
}
