'use client'

import { motion } from 'framer-motion'
import { Users, Target, Award, Heart, ArrowLeft, Code, Shield, Calendar, Database, Zap, Smartphone } from 'lucide-react'
import { HeaderApp } from '@/components/layout/HeaderApp'
import { FooterSimple } from '@/components/layout/FooterSimple'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

export default function AppAboutPage() {
  const router = useRouter()

  const features = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'Making sports venue booking simple, fast, and affordable for every athlete.',
      color: 'bg-blue-500'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Built by athletes, for athletes. We understand your booking needs.',
      color: 'bg-green-500'
    },
    {
      icon: Award,
      title: 'Quality Assured',
      description: 'Every venue is verified and meets our high standards for safety and quality.',
      color: 'bg-purple-500'
    },
    {
      icon: Heart,
      title: 'Athlete First',
      description: 'Every feature is designed with the athlete experience as our top priority.',
      color: 'bg-red-500'
    }
  ]

  const stats = [
    { number: '10K+', label: 'Active Users' },
    { number: '500+', label: 'Venues' },
    { number: '50+', label: 'Cities' },
    { number: '4.9', label: 'Rating' }
  ]

  const techStack = [
    {
      icon: Code,
      title: 'Frontend',
      description: 'Next.js 14 with TypeScript, responsive design with glassmorphism effects',
      color: 'bg-blue-500'
    },
    {
      icon: Shield,
      title: 'Authentication',
      description: 'Supabase Auth with email/password and Google OAuth',
      color: 'bg-green-500'
    },
    {
      icon: Calendar,
      title: 'Booking System',
      description: 'Interactive calendar with real-time availability and conflict prevention',
      color: 'bg-purple-500'
    },
    {
      icon: Smartphone,
      title: 'Admin Panel',
      description: 'Court management, booking oversight, and analytics dashboard',
      color: 'bg-orange-500'
    },
    {
      icon: Database,
      title: 'Database',
      description: 'PostgreSQL with Row Level Security via Supabase',
      color: 'bg-indigo-500'
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Live booking availability using Supabase subscriptions',
      color: 'bg-red-500'
    }
  ]

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <HeaderApp />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </motion.button>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            About SportVenue
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            We&apos;re revolutionizing how athletes find and book sports venues.
            Simple, fast, and reliable - the way booking should be.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <div key={stat.label} className="text-center bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg transition-colors duration-200">
              <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 dark:text-gray-300 text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Why Athletes Choose Us
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <div
                  key={feature.title}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-all duration-200"
                >
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Tech Stack Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Key Features & Tech Stack
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techStack.map((tech, index) => {
              const IconComponent = tech.icon
              return (
                <div
                  key={tech.title}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-all duration-200"
                >
                  <div className={`w-12 h-12 ${tech.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {tech.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {tech.description}
                  </p>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-700 dark:to-green-700 rounded-xl p-8 text-white text-center"
        >
          <h2 className="text-2xl font-bold mb-4">Ready to Book Your Next Game?</h2>
          <p className="text-blue-100 dark:text-blue-200 mb-6">
            Join thousands of athletes who trust SportVenue for their venue booking needs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              onClick={() => router.push('/courts')}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Browse Courts
            </Button>
            <Button 
              onClick={() => router.push('/app/contact')}
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              Contact Us
            </Button>
          </div>
        </motion.div>
        </main>

        <FooterSimple />
      </div>
    </AppLayout>
  )
}
