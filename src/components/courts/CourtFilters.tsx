'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { getCourtTypeIcon } from '@/lib/utils'

interface CourtFiltersProps {
  selectedType: string
  onTypeChange: (type: string) => void
  priceRange: number[]
  onPriceRangeChange: (range: number[]) => void
}

const courtTypes = [
  { value: 'all', label: 'All Sports', icon: '🏟️' },
  { value: 'tennis', label: 'Tennis', icon: '🎾' },
  { value: 'basketball', label: 'Basketball', icon: '🏀' },
  { value: 'cricket', label: 'Cricket', icon: '🏏' },
  { value: 'badminton', label: 'Badminton', icon: '🏸' },
  { value: 'football', label: 'Football', icon: '⚽' },
]

const amenityOptions = [
  'Professional Lighting',
  'Equipment Rental',
  'Parking Available',
  'Changing Rooms',
  'Air Conditioning',
  'Sound System',
  'Indoor',
  'Outdoor',
  'Natural Grass',
  'Professional Pitch',
]

export function CourtFilters({
  selectedType,
  onTypeChange,
  priceRange,
  onPriceRangeChange,
}: CourtFiltersProps) {
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [selectedRating, setSelectedRating] = useState(0)

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    )
  }

  const handlePriceChange = (index: number, value: string) => {
    const newRange = [...priceRange]
    newRange[index] = parseInt(value) || 0
    onPriceRangeChange(newRange)
  }

  return (
    <div className="space-y-6">
      {/* Court Type Filter */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Sport Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {courtTypes.map((type) => (
            <motion.button
              key={type.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onTypeChange(type.value)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                selectedType === type.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">{type.icon}</div>
              <div className="text-sm font-medium">{type.label}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Price Range (per hour)</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">LKR</span>
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) => handlePriceChange(0, e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="0"
              />
            </div>
          </div>
          
          <div className="text-gray-500 mt-6">to</div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">LKR</span>
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) => handlePriceChange(1, e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="500"
                min="0"
              />
            </div>
          </div>
        </div>
        
        {/* Price Range Slider */}
        <div className="mt-4">
            <input
              type="range"
              min="0"
              max="25000"
              value={priceRange[1]}
              onChange={(e) => handlePriceChange(1, e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>LKR 0</span>
            <span>LKR 25,000+</span>
          </div>
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Minimum Rating</h3>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <motion.button
              key={rating}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedRating(rating === selectedRating ? 0 : rating)}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg border transition-all duration-200 ${
                selectedRating >= rating
                  ? 'border-yellow-400 bg-yellow-50 text-yellow-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="text-yellow-400">★</span>
              <span className="text-sm font-medium">{rating}+</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Amenities Filter */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {amenityOptions.map((amenity) => (
            <motion.label
              key={amenity}
              whileHover={{ scale: 1.02 }}
              className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                selectedAmenities.includes(amenity)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedAmenities.includes(amenity)}
                onChange={() => handleAmenityToggle(amenity)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">{amenity}</span>
            </motion.label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <div className="pt-4 border-t border-gray-200">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
            onClick={() => {
            onTypeChange('all')
            onPriceRangeChange([0, 25000])
            setSelectedAmenities([])
            setSelectedRating(0)
          }}
          className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Clear All Filters
        </motion.button>
      </div>
    </div>
  )
}
