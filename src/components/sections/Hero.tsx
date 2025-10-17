'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Image from 'next/image'

const textSlides = [
  "No more endless phone calls, confusing spreadsheets, or missed bookings.",
  "SportsVenueBookings brings everything together in one powerful, easy-to-use platform.",
  "Book courts, manage schedules, track your activity, and discover new venues - all from your browser, anytime, anywhere."
]

export function Hero() {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % textSlides.length)
    }, 4000) // Change text every 4 seconds

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Content */}
          <div className="text-left space-y-6 z-10">
            <motion.h1
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900"
            >
              One platform<br />
              for all your<br />
              <span className="text-blue-600">sports bookings</span>
            </motion.h1>

            {/* Carousel Text Container */}
            <div className="relative h-32 md:h-28 text-lg md:text-xl text-gray-600 max-w-lg overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentTextIndex}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 0.5 }}
                  className={currentTextIndex === 2 ? "text-base md:text-lg" : ""}
                >
                  {textSlides[currentTextIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Carousel Indicators */}
            <div className="flex space-x-2">
              {textSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTextIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentTextIndex
                      ? 'bg-blue-600 w-8'
                      : 'bg-gray-300 w-1.5 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4"
            >
              <Link href="/app">
                <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 text-lg rounded-full">
                  Try Now
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-100 px-8 py-4 text-lg rounded-full"
                >
                  Learn More
                </Button>
              </a>
            </motion.div>
          </div>

          {/* Right Content - iPad Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex items-center justify-center lg:justify-end"
          >
            {/* Animated Background Gradient Blob */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute w-[500px] h-[500px] bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 rounded-full blur-3xl opacity-30"
            />

            {/* iPad Container with Animation */}
            <motion.div
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative z-10"
            >
              {/* Main iPad */}
              <div className="relative w-[280px] sm:w-[350px] md:w-[400px] lg:w-[450px]">
                {/* iPad Frame */}
                <div className="relative bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl">
                  {/* Screen */}
                  <div className="bg-white rounded-[2rem] overflow-hidden aspect-[3/4] relative">
                    {/* App Screenshot - Sports Booking Interface */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 p-6">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg"></div>
                          <span className="font-bold text-sm">SVB</span>
                        </div>
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      </div>

                      {/* Featured Card */}
                      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-4 mb-4 text-white">
                        <div className="text-xs opacity-80 mb-1">Featured Venue</div>
                        <div className="font-bold text-lg mb-2">Premium Courts</div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm">Book Now</div>
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                            <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-white rounded-xl p-3 shadow-sm">
                          <div className="text-blue-600 font-bold text-lg">24</div>
                          <div className="text-xs text-gray-500">Venues</div>
                        </div>
                        <div className="bg-white rounded-xl p-3 shadow-sm">
                          <div className="text-green-600 font-bold text-lg">15</div>
                          <div className="text-xs text-gray-500">Bookings</div>
                        </div>
                        <div className="bg-white rounded-xl p-3 shadow-sm">
                          <div className="text-purple-600 font-bold text-lg">5</div>
                          <div className="text-xs text-gray-500">Sports</div>
                        </div>
                      </div>

                      {/* Venue List */}
                      <div className="space-y-2">
                        <div className="bg-white rounded-xl p-3 shadow-sm flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="font-semibold text-xs">Tennis Court A</div>
                            <div className="text-xs text-gray-500">Available Now</div>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-3 shadow-sm flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="font-semibold text-xs">Basketball Court</div>
                            <div className="text-xs text-gray-500">2 slots left</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Home Button */}
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-700 rounded-full"></div>
                </div>
              </div>

              {/* Secondary iPad (Overlapping) */}
              <motion.div
                animate={{
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                className="absolute -right-8 top-12 w-[200px] sm:w-[250px] md:w-[280px] lg:w-[320px] opacity-80"
              >
                <div className="relative bg-gray-900 rounded-[2rem] p-2.5 shadow-2xl transform rotate-6">
                  <div className="bg-white rounded-[1.5rem] overflow-hidden aspect-[3/4] relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 p-4">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="font-bold text-sm text-gray-900">Your Stats</div>
                        <div className="text-xl">🏆</div>
                      </div>

                      {/* Stats Cards */}
                      <div className="space-y-3">
                        {/* Total Bookings */}
                        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-3 text-white">
                          <div className="text-xs opacity-80 mb-1">Total Bookings</div>
                          <div className="text-2xl font-bold">127</div>
                          <div className="text-xs opacity-80 mt-1">↑ 23% this month</div>
                        </div>

                        {/* Hours Played */}
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-3 text-white">
                          <div className="text-xs opacity-80 mb-1">Hours Played</div>
                          <div className="text-2xl font-bold">342</div>
                          <div className="text-xs opacity-80 mt-1">Across 5 sports</div>
                        </div>

                        {/* Favorite Sport */}
                        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-3 text-white">
                          <div className="text-xs opacity-80 mb-1">Favorite Sport</div>
                          <div className="flex items-center space-x-2">
                            <div className="text-lg">🎾</div>
                            <div className="font-bold">Tennis</div>
                          </div>
                          <div className="text-xs opacity-80 mt-1">68 sessions</div>
                        </div>

                        {/* Achievements */}
                        <div className="bg-white rounded-xl p-3 shadow-sm border border-purple-100">
                          <div className="text-xs text-gray-600 mb-2">Recent Achievement</div>
                          <div className="flex items-center space-x-2">
                            <div className="text-lg">⭐</div>
                            <div className="text-xs font-semibold text-gray-900">100 Bookings!</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
