'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Star, 
  Clock, 
  Users, 
  Wifi, 
  Car, 
  Shield, 
  Calendar,
  ArrowLeft,
  Heart,
  Share2,
  Phone,
  Mail
} from 'lucide-react'
import { HeaderApp } from '@/components/layout/HeaderApp'
import { FooterSimple } from '@/components/layout/FooterSimple'
import { Button } from '@/components/ui/Button'
import { getCourtTypeIcon, formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

// Mock data - will be replaced with real data from Supabase
const mockCourtDetails = {
  'court-tennis-1': {
    id: 'court-tennis-1',
    name: 'Premium Tennis Court A',
    type: 'tennis',
    images: [
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    ],
    location: 'Downtown Sports Complex',
    address: '123 Sports Avenue, Downtown District, City 12345',
    rating: 4.8,
    reviews: 124,
    description: 'Professional-grade tennis court with synthetic grass surface. Perfect for competitive matches and training sessions. Our premium court features state-of-the-art lighting systems and professional-grade equipment.',
    amenities: [
      'Professional Lighting',
      'Equipment Rental',
      'Parking Available',
      'Changing Rooms',
      'Water Fountain',
      'First Aid Kit',
      'Security Cameras',
      'Wi-Fi Access'
    ],
    pricing: [
      { duration: 1, offPeak: 45, peak: 65 },
      { duration: 1.5, offPeak: 67.5, peak: 97.5 },
      { duration: 2, offPeak: 90, peak: 130 }
    ],
    availability: 'Available Today',
    operatingHours: {
      weekdays: '6:00 AM - 10:00 PM',
      weekends: '7:00 AM - 9:00 PM'
    },
    contact: {
      phone: '+1 (555) 123-4567',
      email: 'tennis@sportscomplex.com'
    },
    rules: [
      'Proper tennis attire required',
      'Non-marking shoes only',
      'Maximum 4 players per court',
      'Equipment must be returned after use',
      'No food or drinks on court'
    ]
  }
}

export default function CourtDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [court, setCourt] = useState<any>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadCourtDetails = useCallback(async () => {
    const courtId = params.id as string
    setLoading(true)

    try {
      // First try to load from database
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
        // Fallback to mock data
        const mockCourt = mockCourtDetails[courtId as keyof typeof mockCourtDetails]
        if (mockCourt) {
          setCourt(mockCourt)
        } else {
          setCourt(null)
        }
        return
      }

      if (courtData) {
        // Transform database data to match expected format
        const typedCourtData = courtData as { id: string; name: string; type: string; image_url: string; pricing_rules: any[]; amenities: string; description: string }
        const transformedCourt = {
          id: typedCourtData.id,
          name: typedCourtData.name,
          type: typedCourtData.type,
          images: [
            typedCourtData.image_url || 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
          ],
          location: 'Sports Complex',
          rating: 4.8,
          reviews: 124,
          pricing: typedCourtData.pricing_rules && typedCourtData.pricing_rules.length > 0
            ? typedCourtData.pricing_rules.map((rule: any) => ({
                duration: rule.duration_hours,
                offPeak: rule.off_peak_price,
                peak: rule.peak_price
              }))
            : [
                { duration: 1, offPeak: 45, peak: 65 },
                { duration: 2, offPeak: 85, peak: 120 }
              ],
          amenities: typedCourtData.amenities ? typedCourtData.amenities.split(', ') : [],
          description: typedCourtData.description || 'Professional court with premium facilities',
          availability: {
            today: 'Available',
            tomorrow: 'Available',
            thisWeek: 'Good availability'
          }
        }
        setCourt(transformedCourt)
      } else {
        setCourt(null)
      }
    } catch (error) {
      console.error('Exception loading court details:', error)
      // Fallback to mock data
      const mockCourt = mockCourtDetails[params.id as keyof typeof mockCourtDetails]
      if (mockCourt) {
        setCourt(mockCourt)
      } else {
        setCourt(null)
      }
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    loadCourtDetails()
  }, [loadCourtDetails])



  const handleShare = async () => {
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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Courts</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="relative h-96">
                <Image
                  src={court.images[currentImageIndex]}
                  alt={court.name}
                  width={800}
                  height={384}
                  className="w-full h-full object-cover"
                />
                
                {/* Image Navigation */}
                {court.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {court.images.map((_: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                      isLiked 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white/80 text-gray-700 hover:bg-white'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full bg-white/80 text-gray-700 hover:bg-white backdrop-blur-sm transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Court Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-2xl">{getCourtTypeIcon(court.type)}</span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
                      {court.type}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{court.name}</h1>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{court.address}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-lg font-semibold text-gray-900 ml-1">
                      {court.rating}
                    </span>
                    <span className="text-gray-600 ml-1">
                      ({court.reviews} reviews)
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed mb-6">
                {court.description}
              </p>

              {/* Amenities */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {court.amenities.map((amenity: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2 text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Operating Hours */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Operating Hours</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">Weekdays</div>
                      <div className="text-gray-600">{court.operatingHours.weekdays}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">Weekends</div>
                      <div className="text-gray-600">{court.operatingHours.weekends}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">{court.contact.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">{court.contact.email}</span>
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
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6 sticky top-8"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Book This Court</h3>
              
              {/* Pricing */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Pricing</h4>
                <div className="space-y-2">
                  {court.pricing.map((price: any, index: number) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-gray-700">{price.duration}h session</span>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {formatCurrency(price.offPeak)} - {formatCurrency(price.peak)}
                        </div>
                        <div className="text-xs text-gray-500">off-peak - peak</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Book Button */}
              <Button 
                className="w-full mb-4 bg-blue-600 hover:bg-blue-700"
                onClick={() => router.push(`/courts/${court.id}/book`)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book Now
              </Button>

              {/* Quick Info */}
              <div className="text-center text-sm text-gray-600">
                <div className="mb-2">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  {court.availability}
                </div>
                <div>
                  Free cancellation up to 24 hours before
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
