'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, Star, Clock, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

// Mock data - will be replaced with real data from Supabase
const mockFeaturedCourts = [
  {
    id: '1',
    name: 'Premium Tennis Court A',
    type: 'tennis',
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    location: 'Downtown Sports Complex',
    rating: 4.8,
    reviews: 124,
    price: 45,
    duration: '1 hour',
    amenities: ['Lighting', 'Equipment Rental', 'Parking'],
    availability: 'Available Today'
  },
  {
    id: '2',
    name: 'Basketball Court Pro',
    type: 'basketball',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    location: 'Athletic Center',
    rating: 4.9,
    reviews: 89,
    price: 35,
    duration: '1 hour',
    amenities: ['Indoor', 'Air Conditioning', 'Sound System'],
    availability: 'Available Today'
  },
  {
    id: '3',
    name: 'Cricket Ground Elite',
    type: 'cricket',
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    location: 'Sports Park',
    rating: 4.7,
    reviews: 156,
    price: 80,
    duration: '3 hours',
    amenities: ['Professional Pitch', 'Pavilion', 'Equipment'],
    availability: 'Available Tomorrow'
  }
]

export function FeaturedCourts() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [courts, setCourts] = useState<any[]>(mockFeaturedCourts)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeaturedCourts()
  }, [])

  const loadFeaturedCourts = async () => {
    try {
      console.log('Loading featured courts from database...')

      // Set timeout for faster fallback
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 3000)
      )

      const queryPromise = supabase
        .from('courts')
        .select('id, name, type, image_url, amenities')
        .eq('is_active', true)
        .limit(3)
        .order('name')

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any

      if (error || !data || data.length === 0) {
        console.log('Using mock data for featured courts')
        // Keep mock data as fallback
      } else {
        console.log(`Loaded ${data.length} featured courts from database`)
        // Fetch all pricing rules to get the minimum price for each court
        const courtIds = data.map((c: any) => c.id)
        const { data: pricing, error: pricingError } = await supabase
          .from('pricing_rules')
          .select('court_id, duration_hours, off_peak_price')
          .in('court_id', courtIds)
          .order('off_peak_price', { ascending: true })

        if (pricingError) {
          console.warn('Pricing lookup failed, falling back to mock prices', pricingError)
        }

        // Get minimum price for each court and its duration
        const priceMap = new Map<string, { price: number; duration: number }>()
        ;(pricing || []).forEach((row: any) => {
          const existing = priceMap.get(row.court_id)
          if (!existing || Number(row.off_peak_price) < existing.price) {
            priceMap.set(row.court_id, {
              price: Number(row.off_peak_price),
              duration: Number(row.duration_hours)
            })
          }
        })

        // Build courts with DB prices (LKR)
        const transformedCourts = data.map((court: any) => {
          const priceInfo = priceMap.get(court.id)
          const durationLabel = priceInfo?.duration === 1 ? 'hour' :
                               priceInfo?.duration === 4 ? 'half day' :
                               priceInfo?.duration === 8 ? 'full day' :
                               `${priceInfo?.duration || 1}h`
          return {
            id: court.id,
            name: court.name,
            type: court.type,
            image: court.image_url || (court.type === 'badminton' ? 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' : 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'),
            location: 'Sports Complex',
            rating: 4.8,
            reviews: 124,
            price: priceInfo?.price ?? 0,
            duration: durationLabel,
            amenities: court.amenities ? court.amenities.split(', ').slice(0, 3) : ['Professional Equipment'],
            availability: 'Available Today'
          }
        })
        setCourts(transformedCourts)
      }
    } catch (error) {
      console.log('Featured courts fallback to mock data')
      // Keep mock data as fallback
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-16 bg-white dark:bg-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Featured Courts
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          >
            Discover our most popular and highly-rated sports venues
          </motion.p>
        </div>

        {/* Courts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courts.map((court, index) => (
            <motion.div
              key={court.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onHoverStart={() => setHoveredCard(court.id)}
              onHoverEnd={() => setHoveredCard(null)}
              className="bg-white dark:bg-gray-700 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Court Image */}
              <div className="relative h-48 overflow-hidden">
                <motion.img
                  src={court.image}
                  alt={court.name}
                  className="w-full h-full object-cover"
                  animate={{
                    scale: hoveredCard === court.id ? 1.05 : 1
                  }}
                  transition={{ duration: 0.3 }}
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium capitalize">
                    {court.type}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {court.availability}
                  </span>
                </div>
              </div>

              {/* Court Info */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {court.name}
                </h3>

                <div className="flex items-center text-gray-600 dark:text-gray-300 mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{court.location}</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white ml-1">
                      {court.rating}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                      ({court.reviews} reviews)
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="text-sm">{court.duration}</span>
                  </div>
                </div>

                {/* Amenities */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {court.amenities.slice(0, 3).map((amenity: any, idx: number) => (
                      <span
                        key={idx}
                        className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price and Book Button */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(court.price || 0)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300 text-sm">/{court.duration || 'hour'}</span>
                  </div>
                  
                  <Link href={`/courts/${court.id}/book`}>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Book Now
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Link href="/courts">
            <Button size="lg" variant="outline" className="px-8">
              View All Courts
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
