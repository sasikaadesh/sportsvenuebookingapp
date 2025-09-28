'use client'

import { motion } from 'framer-motion'
import { 
  Calendar, 
  Shield, 
  Clock, 
  CreditCard, 
  MapPin, 
  Users,
  Star,
  Smartphone
} from 'lucide-react'

const features = [
  {
    icon: Calendar,
    title: 'Easy Booking',
    description: 'Book your favorite courts in just a few clicks with our intuitive booking system.',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Your payments are protected with industry-standard security measures.',
    color: 'bg-green-100 text-green-600'
  },
  {
    icon: Clock,
    title: 'Real-time Availability',
    description: 'See live availability and book instantly without waiting for confirmation.',
    color: 'bg-purple-100 text-purple-600'
  },
  {
    icon: CreditCard,
    title: 'Flexible Pricing',
    description: 'Choose from various pricing options including peak and off-peak rates.',
    color: 'bg-orange-100 text-orange-600'
  },
  {
    icon: MapPin,
    title: 'Multiple Locations',
    description: 'Access courts across the city with detailed location information and directions.',
    color: 'bg-red-100 text-red-600'
  },
  {
    icon: Users,
    title: 'Group Bookings',
    description: 'Organize tournaments and group events with our specialized booking options.',
    color: 'bg-indigo-100 text-indigo-600'
  },
  {
    icon: Star,
    title: 'Quality Assurance',
    description: 'All our venues are regularly inspected and maintained to the highest standards.',
    color: 'bg-yellow-100 text-yellow-600'
  },
  {
    icon: Smartphone,
    title: 'Mobile Friendly',
    description: 'Book and manage your reservations on the go with our responsive design.',
    color: 'bg-pink-100 text-pink-600'
  }
]

export function Features() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            Why Choose SportVenue?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            We make sports venue booking simple, secure, and convenient for everyone
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 bg-white rounded-2xl p-8 shadow-lg"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                500+
              </div>
              <div className="text-gray-600">Courts Available</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
                10K+
              </div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">
                50+
              </div>
              <div className="text-gray-600">Locations</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">
                4.9
              </div>
              <div className="text-gray-600">Average Rating</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
