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
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-r from-blue-600 via-green-500 to-white">
      {/* Gradient Overlay for softer effect - more visible on left, white on right and bottom */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/85 to-white"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
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
                    {/* Admin Dashboard Interface */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50 p-6">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                            A
                          </div>
                          <div>
                            <div className="font-bold text-sm">Admin Panel</div>
                            <div className="text-xs text-gray-500">Dashboard</div>
                          </div>
                        </div>
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 text-white shadow-lg">
                          <div className="text-xs opacity-90 mb-1">Total Revenue</div>
                          <div className="text-xl font-bold">$12.5K</div>
                          <div className="text-xs opacity-80 mt-1">↑ 18% this month</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 text-white shadow-lg">
                          <div className="text-xs opacity-90 mb-1">Bookings</div>
                          <div className="text-xl font-bold">342</div>
                          <div className="text-xs opacity-80 mt-1">↑ 12% this week</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3 text-white shadow-lg">
                          <div className="text-xs opacity-90 mb-1">Active Users</div>
                          <div className="text-xl font-bold">1,248</div>
                          <div className="text-xs opacity-80 mt-1">↑ 8% growth</div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-3 text-white shadow-lg">
                          <div className="text-xs opacity-90 mb-1">Courts</div>
                          <div className="text-xl font-bold">24</div>
                          <div className="text-xs opacity-80 mt-1">All active</div>
                        </div>
                      </div>

                      {/* Recent Activity */}
                      <div className="bg-white rounded-xl p-3 shadow-md mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-xs text-gray-900">Recent Bookings</div>
                          <div className="text-xs text-blue-600">View All</div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div className="flex-1">
                              <div className="text-xs font-medium text-gray-900">Tennis Court A</div>
                              <div className="text-xs text-gray-500">John Doe • 2:00 PM</div>
                            </div>
                            <div className="text-xs font-semibold text-green-600">$7.5</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div className="flex-1">
                              <div className="text-xs font-medium text-gray-900">Basketball Pro</div>
                              <div className="text-xs text-gray-500">Jane Smith • 3:30 PM</div>
                            </div>
                            <div className="text-xs font-semibold text-green-600">$8.5</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <div className="flex-1">
                              <div className="text-xs font-medium text-gray-900">Cricket Ground</div>
                              <div className="text-xs text-gray-500">Mike Johnson • 5:00 PM</div>
                            </div>
                            <div className="text-xs font-semibold text-green-600">$25</div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white rounded-lg p-2 shadow-sm text-center">
                          <div className="text-lg mb-1">📊</div>
                          <div className="text-xs font-medium text-gray-700">Reports</div>
                        </div>
                        <div className="bg-white rounded-lg p-2 shadow-sm text-center">
                          <div className="text-lg mb-1">👥</div>
                          <div className="text-xs font-medium text-gray-700">Users</div>
                        </div>
                        <div className="bg-white rounded-lg p-2 shadow-sm text-center">
                          <div className="text-lg mb-1">⚙️</div>
                          <div className="text-xs font-medium text-gray-700">Settings</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Home Button */}
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-700 rounded-full"></div>
                </div>
              </div>

              {/* Secondary iPad (Overlapping) - Sports Courts Showcase */}
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
                className="absolute -right-8 top-12 w-[200px] sm:w-[250px] md:w-[280px] lg:w-[320px]"
              >
                <div className="relative bg-gray-900 rounded-[2rem] p-2.5 shadow-2xl transform rotate-6">
                  <div className="bg-white rounded-[1.5rem] overflow-hidden aspect-[3/4] relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 p-4">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-bold text-sm text-gray-900">Popular Courts</div>
                        <div className="text-xl">🏟️</div>
                      </div>

                      {/* Sports Court Cards */}
                      <div className="space-y-2.5">
                        {/* Badminton Court */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-md">
                          <div className="relative h-16">
                            <Image
                              src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                              alt="Badminton Court"
                              fill
                              className="object-cover"
                            />
                            <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
                              🏸 Badminton
                            </div>
                            <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
                              Available
                            </div>
                          </div>
                          <div className="p-2 flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-xs text-gray-900">Indoor Court A</div>
                              <div className="text-xs text-gray-500">$6.5/hour</div>
                            </div>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded-md font-semibold transition-colors">
                              Book
                            </button>
                          </div>
                        </div>

                        {/* Basketball Court */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-md">
                          <div className="relative h-16">
                            <Image
                              src="https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                              alt="Basketball Court"
                              fill
                              className="object-cover"
                            />
                            <div className="absolute top-1 left-1 bg-orange-600 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
                              🏀 Basketball
                            </div>
                            <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
                              Available
                            </div>
                          </div>
                          <div className="p-2 flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-xs text-gray-900">Court Pro</div>
                              <div className="text-xs text-gray-500">$8.5/hour</div>
                            </div>
                            <button className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-2 py-1 rounded-md font-semibold transition-colors">
                              Book
                            </button>
                          </div>
                        </div>

                        {/* Cricket Ground */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-md">
                          <div className="relative h-16">
                            <Image
                              src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                              alt="Cricket Ground"
                              fill
                              className="object-cover"
                            />
                            <div className="absolute top-1 left-1 bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
                              🏏 Cricket
                            </div>
                            <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
                              Available
                            </div>
                          </div>
                          <div className="p-2 flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-xs text-gray-900">Ground Elite</div>
                              <div className="text-xs text-gray-500">$25/hour</div>
                            </div>
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-2 py-1 rounded-md font-semibold transition-colors">
                              Book
                            </button>
                          </div>
                        </div>

                        {/* Tennis Court */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-md">
                          <div className="relative h-16">
                            <Image
                              src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                              alt="Tennis Court"
                              fill
                              className="object-cover"
                            />
                            <div className="absolute top-1 left-1 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
                              🎾 Tennis
                            </div>
                            <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
                              Available
                            </div>
                          </div>
                          <div className="p-2 flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-xs text-gray-900">Premium Court A</div>
                              <div className="text-xs text-gray-500">$7.5/hour</div>
                            </div>
                            <button className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded-md font-semibold transition-colors">
                              Book
                            </button>
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
