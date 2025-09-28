'use client'

import { motion } from 'framer-motion'
import { Search, Calendar, CreditCard, Play } from 'lucide-react'

interface HowItWorksProps {
  variant?: 'detailed' | 'simple'
}

const steps = [
  {
    icon: Search,
    title: 'Browse & Search',
    description: 'Find the perfect sports venue from our extensive collection of courts and fields.',
    detailedDescription: 'Explore hundreds of premium sports venues across the city. Use our advanced filters to find courts by sport type, location, amenities, and availability. Each venue comes with detailed photos, reviews, and facility information.',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    icon: Calendar,
    title: 'Select Date & Time',
    description: 'Choose your preferred date and time slot with real-time availability.',
    detailedDescription: 'Our real-time booking system shows live availability across all venues. Select your preferred date and time, view pricing for different time slots, and see instant confirmation of your booking slot.',
    color: 'bg-green-100 text-green-600'
  },
  {
    icon: CreditCard,
    title: 'Secure Payment',
    description: 'Complete your booking with our secure payment system.',
    detailedDescription: 'Pay securely using multiple payment options including credit cards, digital wallets, and bank transfers. All transactions are protected with industry-standard encryption and fraud protection.',
    color: 'bg-purple-100 text-purple-600'
  },
  {
    icon: Play,
    title: 'Play & Enjoy',
    description: 'Show up and enjoy your game at the booked venue.',
    detailedDescription: 'Receive instant booking confirmation with venue details, directions, and contact information. Show up at your scheduled time and enjoy premium sports facilities with all the amenities you need.',
    color: 'bg-orange-100 text-orange-600'
  }
]

export function HowItWorks({ variant = 'detailed' }: HowItWorksProps) {
  const isSimple = variant === 'simple'

  return (
    <section className={`py-16 ${isSimple ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'} transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`${isSimple ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'} font-bold text-gray-900 dark:text-white mb-4`}
          >
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`${isSimple ? 'text-base' : 'text-lg'} text-gray-600 dark:text-gray-300 max-w-2xl mx-auto`}
          >
            {isSimple
              ? 'Book your favorite sports venue in just a few simple steps'
              : 'Booking your perfect sports venue has never been easier. Follow these simple steps to get started'
            }
          </motion.p>
        </div>

        {/* Steps */}
        <div className={`grid grid-cols-1 ${isSimple ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2'} gap-8`}>
          {steps.map((step, index) => {
            const IconComponent = step.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`${isSimple ? 'text-center' : 'flex flex-col md:flex-row items-start'} ${
                  !isSimple ? 'bg-white dark:bg-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200' : ''
                }`}
              >
                {/* Step Number & Icon */}
                <div className={`${isSimple ? 'mx-auto mb-4' : 'mr-6 mb-4 md:mb-0'} flex-shrink-0`}>
                  <div className={`relative ${isSimple ? 'w-16 h-16' : 'w-20 h-20'}`}>
                    <div className={`w-full h-full rounded-full ${step.color} flex items-center justify-center`}>
                      <IconComponent className={`${isSimple ? 'w-6 h-6' : 'w-8 h-8'}`} />
                    </div>
                    <div className={`absolute -top-2 -right-2 w-6 h-6 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-full flex items-center justify-center text-sm font-bold`}>
                      {index + 1}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className={`${isSimple ? 'text-center' : 'flex-1'}`}>
                  <h3 className={`${isSimple ? 'text-lg' : 'text-xl'} font-semibold text-gray-900 dark:text-white mb-3`}>
                    {step.title}
                  </h3>
                  <p className={`text-gray-600 dark:text-gray-300 ${isSimple ? 'text-sm' : 'leading-relaxed'}`}>
                    {isSimple ? step.description : step.detailedDescription}
                  </p>
                </div>

                {/* Connector Line (for detailed version) */}
                {!isSimple && index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-8 h-0.5 bg-gray-200 dark:bg-gray-600 transform translate-x-4" />
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Additional CTA for detailed version */}
        {!isSimple && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to Get Started?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                Join thousands of sports enthusiasts who have already discovered the easiest way to book premium sports venues.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <motion.a
                  href="/app"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Start Booking Now
                </motion.a>
                <motion.a
                  href="#testimonials"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  Learn More
                </motion.a>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
