'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const slides = [
  {
    id: 1,
    title: 'Premium Tennis Courts',
    subtitle: 'Professional-grade courts for the perfect game',
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    sport: 'Tennis',
    icon: '🎾'
  },
  {
    id: 2,
    title: 'Basketball Courts',
    subtitle: 'Indoor and outdoor courts for every skill level',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    sport: 'Basketball',
    icon: '🏀'
  },
  {
    id: 3,
    title: 'Cricket Grounds',
    subtitle: 'Well-maintained pitches for cricket enthusiasts',
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    sport: 'Cricket',
    icon: '🏏'
  }
]

export function HeroCompact() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
      {/* Background Carousel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0 z-0"
        >
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          key={`content-${currentSlide}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-center space-x-2 mb-3">
            <span className="text-2xl">{slides[currentSlide].icon}</span>
            <span className="text-sm font-medium text-blue-300">
              {slides[currentSlide].sport}
            </span>
          </div>
          
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight">
            {slides[currentSlide].title}
          </h1>
          
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
            {slides[currentSlide].subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3 pt-6">
            <Link href="/courts">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
                <Search className="w-4 h-4 mr-2" />
                Browse Courts
              </Button>
            </Link>
            {/* Book Now button hidden - can be added back in future if needed
            <Link href="/auth/signup">
              <Button
                size="md"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-gray-900 px-6 py-3"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book Now
              </Button>
            </Link>
            */}
          </div>
        </motion.div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
