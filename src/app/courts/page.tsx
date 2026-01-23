'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, MapPin, Star, Clock, Users, ChevronDown } from 'lucide-react'
import { HeaderApp } from '@/components/layout/HeaderApp'
import { FooterSimple } from '@/components/layout/FooterSimple'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { CourtCard } from '@/components/courts/CourtCard'
import { CourtFilters } from '@/components/courts/CourtFilters'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

// Helper functions for court data
const getDefaultImageForType = (type: string) => {
  const imageMap: { [key: string]: string } = {
    'tennis': 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'basketball': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'cricket': 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'badminton': 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'football': 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
  return imageMap[type] || imageMap['tennis']
}

const getPriceForType = (type: string) => {
  const priceMap: { [key: string]: number } = {
    'tennis': 45,
    'basketball': 35,
    'cricket': 240,
    'badminton': 30,
    'football': 120
  }
  return priceMap[type] || 45
}

const getDefaultAmenitiesForType = (type: string) => {
  const amenitiesMap: { [key: string]: string[] } = {
    'tennis': ['Professional Lighting', 'Equipment Rental', 'Parking Available'],
    'basketball': ['Indoor', 'Air Conditioning', 'Sound System'],
    'cricket': ['Professional Pitch', 'Pavilion', 'Equipment Rental'],
    'badminton': ['Indoor', 'Wooden Floor', 'Net Equipment'],
    'football': ['Natural Grass', 'Professional Goals', 'Changing Rooms']
  }
  return amenitiesMap[type] || ['Professional Lighting', 'Parking Available']
}

// Mock data - will be replaced with real data from Supabase
const mockCourts = [
  {
    id: 'court-tennis-1',
    name: 'Premium Tennis Court A',
    type: 'tennis',
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    location: 'Downtown Sports Complex',
    rating: 4.8,
    reviews: 124,
    priceFrom: 45,
    amenities: ['Professional Lighting', 'Equipment Rental', 'Parking Available'],
    availability: 'Available Today',
    description: 'Professional-grade tennis court with synthetic grass surface.'
  },
  {
    id: 'court-tennis-2',
    name: 'Tennis Court B',
    type: 'tennis',
    image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    location: 'Sports Center North',
    rating: 4.5,
    reviews: 89,
    priceFrom: 35,
    amenities: ['Lighting', 'Parking Available'],
    availability: 'Available Today',
    description: 'Standard tennis court with hard surface.'
  },
  {
    id: 'court-basketball-1',
    name: 'Basketball Court Pro',
    type: 'basketball',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    location: 'Athletic Center',
    rating: 4.9,
    reviews: 156,
    priceFrom: 35,
    amenities: ['Indoor', 'Air Conditioning', 'Sound System'],
    availability: 'Available Today',
    description: 'Indoor basketball court with professional-grade flooring.'
  },
  {
    id: 'court-basketball-2',
    name: 'Outdoor Basketball Court',
    type: 'basketball',
    image: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    location: 'Community Park',
    rating: 4.3,
    reviews: 67,
    priceFrom: 25,
    amenities: ['Outdoor Lighting', 'Parking Available'],
    availability: 'Available Tomorrow',
    description: 'Outdoor basketball court with weather-resistant surface.'
  },
  {
    id: 'court-cricket-1',
    name: 'Cricket Ground Elite',
    type: 'cricket',
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    location: 'Sports Park',
    rating: 4.7,
    reviews: 203,
    priceFrom: 240,
    amenities: ['Professional Pitch', 'Pavilion', 'Equipment Rental'],
    availability: 'Available Today',
    description: 'Full-size cricket ground with professionally maintained pitch.'
  },
  {
    id: 'court-badminton-1',
          name: 'Badminton Court',
      type: 'badminton',
      image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      location: 'Indoor Sports Complex',
    rating: 4.6,
    reviews: 92,
    priceFrom: 30,
    amenities: ['Indoor', 'Wooden Floor', 'Net Equipment'],
    availability: 'Available Today',
    description: 'Indoor badminton court with wooden flooring.'
  },
  {
    id: 'court-football-1',
    name: 'Football Field Premium',
    type: 'football',
    image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    location: 'Sports Complex West',
    rating: 4.8,
    reviews: 178,
    priceFrom: 120,
    amenities: ['Natural Grass', 'Professional Goals', 'Changing Rooms'],
    availability: 'Available Today',
    description: 'Full-size football field with natural grass.'
  }
]

export default function CourtsPage() {
  const [courts, setCourts] = useState<any[]>([])
  const [filteredCourts, setFilteredCourts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [priceRange, setPriceRange] = useState([0, 25000])
  const [sortBy, setSortBy] = useState('rating')
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [dataSource, setDataSource] = useState<'database' | 'mock' | 'unknown'>('unknown')

  // Load courts from database
  useEffect(() => {
    loadCourts()
  }, [])

  const loadCourts = async () => {
    console.log('Loading courts...')
    setLoading(true)

    try {
      console.log('Querying courts from database...')
      // Load courts with their pricing rules
      const { data, error } = await supabase
        .from('courts')
        .select(`
          id, name, type, description, image_url, images, amenities, is_active,
          pricing_rules (
            duration_hours,
            off_peak_price,
            peak_price
          )
        `)
        .eq('is_active', true)
        .order('name')

      if (error) {
        console.error('Database error loading courts:', error)
        console.log('Falling back to mock data')
        setDataSource('mock')
        setCourts(mockCourts)
        setFilteredCourts(mockCourts)
      } else if (!data || data.length === 0) {
        console.log('No courts found in database, using mock data')
        setDataSource('mock')
        setCourts(mockCourts)
        setFilteredCourts(mockCourts)
      } else {
        console.log(`Found ${data.length} courts in database`)

        // Transform database data to match component expectations
        const transformedCourts = data.map((court: any) => {
          // Get the lowest price from pricing rules for "priceFrom"
          let priceFrom = getPriceForType(court.type) // fallback
          let priceDuration = 'hour'
          if (court.pricing_rules && court.pricing_rules.length > 0) {
            // Find the minimum priced rule
            let minPrice = Infinity
            let minDuration = 1
            court.pricing_rules.forEach((rule: any) => {
              if (rule.off_peak_price < minPrice) {
                minPrice = rule.off_peak_price
                minDuration = rule.duration_hours
              }
            })
            priceFrom = minPrice
            // Map duration_hours to display label
            if (minDuration === 4) {
              priceDuration = 'halfday'
            } else if (minDuration === 8) {
              priceDuration = 'day'
            } else {
              priceDuration = 'hour'
            }
          }

          // Get court image - support both new images array and old image_url
          let courtImage = getDefaultImageForType(court.type)
          if (court.images && Array.isArray(court.images) && court.images.length > 0) {
            courtImage = court.images[0] // Use first image from array
          } else if (court.image_url) {
            courtImage = court.image_url
          }

          return {
            id: court.id,
            name: court.name,
            type: court.type,
            image: courtImage,
            location: 'Sports Complex',
            rating: 4.5,
            reviews: 50,
            priceFrom: priceFrom,
            priceDuration: priceDuration,
            amenities: court.amenities ? court.amenities.split(', ') : getDefaultAmenitiesForType(court.type),
            availability: 'Available Today',
            description: court.description || 'Professional sports court'
          }
        })

        console.log('Transformed courts:', transformedCourts)
        setDataSource('database')
        setCourts(transformedCourts)
        setFilteredCourts(transformedCourts)
      }
    } catch (error) {
      console.error('Exception loading courts:', error)
      console.log('Using mock data due to exception')
      setDataSource('mock')
      setCourts(mockCourts)
      setFilteredCourts(mockCourts)
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort courts
  useEffect(() => {
    let filtered = courts.filter(court => {
      const matchesSearch = court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           court.location.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = selectedType === 'all' || court.type === selectedType
      const matchesPrice = court.priceFrom >= priceRange[0] && court.priceFrom <= priceRange[1]
      
      return matchesSearch && matchesType && matchesPrice
    })

    // Sort courts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'price-low':
          return a.priceFrom - b.priceFrom
        case 'price-high':
          return b.priceFrom - a.priceFrom
        case 'reviews':
          return b.reviews - a.reviews
        default:
          return 0
      }
    })

    setFilteredCourts(filtered)
  }, [courts, searchTerm, selectedType, priceRange, sortBy])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <HeaderApp />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading courts...</p>
              <p className="text-sm text-gray-500 mt-2">This should only take a few seconds</p>
            </div>
          </div>
        </main>
        <FooterSimple />
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <HeaderApp />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Find Your Perfect Court
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Browse our collection of premium sports venues and book your next game
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 transition-colors duration-200"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search courts by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="rating">Sort by Rating</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="reviews">Most Reviewed</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </Button>
            </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-gray-200"
            >
              <CourtFilters
                selectedType={selectedType}
                onTypeChange={setSelectedType}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
              />
            </motion.div>
          )}
        </motion.div>

        {/* Results Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <p className="text-gray-600">
            Showing {filteredCourts.length} of {courts.length} courts
            {selectedType !== 'all' && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {selectedType}
              </span>
            )}
            <span className={`ml-2 px-2 py-1 rounded-full text-sm ${
              dataSource === 'database'
                ? 'bg-green-100 text-green-800'
                : dataSource === 'mock'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {dataSource === 'database' ? '🗄️ Database' : dataSource === 'mock' ? '📝 Mock Data' : '❓ Unknown'}
            </span>
          </p>
        </motion.div>

        {/* Courts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourts.length > 0 ? (
            filteredCourts.map((court, index) => {
              try {
                return (
                  <motion.div
                    key={court.id || index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <CourtCard court={court} />
                  </motion.div>
                )
              } catch (error) {
                console.error('Error rendering court card:', error, court)
                return (
                  <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">Error loading court: {court.name || 'Unknown'}</p>
                  </div>
                )
              }
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">Loading courts...</p>
            </div>
          )}
        </div>

        {/* No Results */}
        {filteredCourts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🏟️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No courts found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or filters
            </p>
            <Button
              onClick={() => {
                setSearchTerm('')
                setSelectedType('all')
                setPriceRange([0, 25000])
              }}
            >
              Clear Filters
            </Button>
          </motion.div>
        )}
        </main>

        <FooterSimple />
      </div>
    </AppLayout>
  )
}
