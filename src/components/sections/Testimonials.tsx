'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import Image from 'next/image'

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Tennis Enthusiast',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    rating: 5,
    text: 'SportVenue has completely transformed how I book tennis courts. The process is so smooth and the courts are always in excellent condition. Highly recommended!',
    sport: 'Tennis'
  },
  {
    id: 2,
    name: 'Mike Chen',
    role: 'Basketball Coach',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    rating: 5,
    text: 'As a coach, I need reliable court bookings for my team practices. SportVenue delivers every time with great facilities and easy scheduling.',
    sport: 'Basketball'
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Cricket Player',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    rating: 5,
    text: 'The cricket grounds available through SportVenue are top-notch. The booking system is user-friendly and the customer service is exceptional.',
    sport: 'Cricket'
  },
  {
    id: 4,
    name: 'David Thompson',
    role: 'Badminton Player',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    rating: 5,
    text: 'I love how easy it is to find and book badminton courts near me. The real-time availability feature is a game-changer!',
    sport: 'Badminton'
  },
  {
    id: 5,
    name: 'Lisa Park',
    role: 'Football Enthusiast',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    rating: 5,
    text: 'Organizing football matches for our group has never been easier. SportVenue provides excellent fields and seamless booking experience.',
    sport: 'Football'
  }
]

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    setIsAutoPlaying(false)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    setIsAutoPlaying(false)
  }

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
  }

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            What Our Customers Say
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Join thousands of satisfied customers who trust SportVenue for their sports venue needs
          </motion.p>
        </div>

        {/* Testimonial Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 relative overflow-hidden">
            {/* Quote Icon */}
            <div className="absolute top-6 right-6 text-blue-100">
              <Quote className="w-16 h-16" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                {/* Customer Image */}
                <div className="mb-6">
                  <Image
                    src={testimonials[currentIndex].image}
                    alt={testimonials[currentIndex].name}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-blue-100"
                  />
                </div>

                {/* Rating */}
                <div className="flex justify-center mb-6">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <blockquote className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6 italic">
                  &quot;{testimonials[currentIndex].text}&quot;
                </blockquote>

                {/* Customer Info */}
                <div>
                  <div className="font-semibold text-gray-900 text-lg">
                    {testimonials[currentIndex].name}
                  </div>
                  <div className="text-gray-600">
                    {testimonials[currentIndex].role}
                  </div>
                  <div className="text-blue-600 text-sm mt-1">
                    {testimonials[currentIndex].sport} Player
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-shadow text-gray-600 hover:text-blue-600"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-shadow text-gray-600 hover:text-blue-600"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Customer Logos/Brands (Optional) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-500 text-sm mb-8">Trusted by sports enthusiasts everywhere</p>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            {/* You can add partner logos here */}
            <div className="text-2xl font-bold text-gray-400">🏆</div>
            <div className="text-2xl font-bold text-gray-400">⭐</div>
            <div className="text-2xl font-bold text-gray-400">🥇</div>
            <div className="text-2xl font-bold text-gray-400">🎯</div>
            <div className="text-2xl font-bold text-gray-400">🏅</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
