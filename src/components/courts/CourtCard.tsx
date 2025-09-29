'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { MapPin, Star, Clock, Heart, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getCourtTypeIcon } from '@/lib/utils'

interface Court {
  id: string
  name: string
  type: string
  image: string
  location: string
  rating: number
  reviews: number
  priceFrom: number
  amenities: string[]
  availability: string
  description: string
}

interface CourtCardProps {
  court: Court
}

export function CourtCard({ court }: CourtCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: court.name,
          text: court.description,
          url: `/courts/${court.id}`,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/courts/${court.id}`)
    }
  }

  const getAvailabilityColor = (availability: string) => {
    if (availability.includes('Today')) return 'bg-green-500'
    if (availability.includes('Tomorrow')) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* Court Image */}
      <div className="relative h-48 overflow-hidden">
        <div className={`absolute inset-0 bg-gray-200 ${imageLoaded ? 'hidden' : 'block'}`}>
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
        
        <Image
          src={court.image}
          alt={court.name}
          width={400}
          height={240}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Overlay Actions */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              isLiked 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 text-gray-700 hover:bg-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-white/80 text-gray-700 hover:bg-white backdrop-blur-sm transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Court Type Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium capitalize flex items-center space-x-1">
            <span>{getCourtTypeIcon(court.type)}</span>
            <span>{court.type}</span>
          </span>
        </div>

        {/* Availability Badge */}
        <div className="absolute bottom-4 left-4">
          <span className={`${getAvailabilityColor(court.availability)} text-white px-3 py-1 rounded-full text-sm font-medium`}>
            {court.availability}
          </span>
        </div>
      </div>

      {/* Court Info */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-1">
            {court.name}
          </h3>

          <div className="flex items-center ml-2">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-900 dark:text-white ml-1">
              {court.rating}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
              ({court.reviews})
            </span>
          </div>
        </div>

        <div className="flex items-center text-gray-600 dark:text-gray-300 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm line-clamp-1">{court.location}</span>
        </div>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {court.description}
        </p>

        {/* Amenities */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {court.amenities.slice(0, 3).map((amenity, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
              >
                {amenity}
              </span>
            ))}
            {court.amenities.length > 3 && (
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                +{court.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              ${court.priceFrom}
            </span>
            <span className="text-gray-600 dark:text-gray-300 text-sm">/hour</span>
          </div>
          
          <div className="flex space-x-2">
            <Link href={`/courts/${court.id}`}>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </Link>
            
            <Link href={`/courts/${court.id}/book`}>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Book Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
