'use client'

import { motion } from 'framer-motion'
import { Users, Target, Award, Heart, MapPin, Phone, Mail, Code, Shield, Calendar, Database, Zap, Smartphone } from 'lucide-react'
import { HeaderMarketing } from '@/components/layout/HeaderMarketing'
import { Footer } from '@/components/layout/Footer'
import Image from 'next/image'

// Optimized animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function AboutPage() {
  const features = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To eliminate the hassle of sports venue booking and save athletes time and money through innovative technology.',
      color: 'bg-blue-500'
    },
    {
      icon: Users,
      title: 'Trusted by Thousands',
      description: 'Over 10,000 athletes trust SportVenue for their booking needs, from weekend warriors to professional teams.',
      color: 'bg-green-500'
    },
    {
      icon: Award,
      title: 'Verified Quality',
      description: 'Every venue in our network is personally inspected and verified to meet our high standards for safety and quality.',
      color: 'bg-purple-500'
    },
    {
      icon: Heart,
      title: 'Built by Athletes',
      description: 'Founded by sports enthusiasts who experienced the booking frustration firsthand and decided to fix it.',
      color: 'bg-red-500'
    }
  ]

  const stats = [
    { number: '10,000+', label: 'Happy Athletes' },
    { number: '500+', label: 'Premium Venues' },
    { number: '50+', label: 'Cities Covered' },
    { number: '$2M+', label: 'Saved by Users' }
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

  const team = [
    {
      name: 'Alex Thompson',
      role: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      description: 'Former college athlete turned tech entrepreneur. Built SportVenue after struggling to book courts for his team.'
    },
    {
      name: 'Sarah Kim',
      role: 'Head of Product',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b9c3c1b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      description: 'UX expert and marathon runner who designs every feature with the athlete experience in mind.'
    },
    {
      name: 'Marcus Johnson',
      role: 'VP of Partnerships',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      description: 'Former sports facility manager who brings 500+ premium venues into our growing network.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <HeaderMarketing />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              {...fadeInUp}
              className="text-center"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                About <span className="text-blue-600">SportVenue</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                We&apos;re revolutionizing sports venue booking with technology that makes finding and reserving
                premium sports facilities as easy as ordering food online. Join thousands of athletes who have
                already discovered the future of sports booking.
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-green-600 mx-auto"></div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  variants={fadeInUp}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              {...fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose SportVenue?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We&apos;re not just another booking platform. We&apos;re the solution to every athlete&apos;s venue booking problems.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {features.map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <motion.div
                    key={feature.title}
                    variants={fadeInUp}
                    className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow"
                  >
                    <div className={`w-16 h-16 ${feature.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              {...fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Key Features & Tech Stack
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Built with cutting-edge technology to deliver a seamless and reliable booking experience.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {techStack.map((tech, index) => {
                const IconComponent = tech.icon
                return (
                  <motion.div
                    key={tech.title}
                    variants={fadeInUp}
                    className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow"
                  >
                    <div className={`w-16 h-16 ${tech.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {tech.title}
                    </h3>
                    <p className="text-gray-600">
                      {tech.description}
                    </p>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-white px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              {...fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Meet Our Team
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Passionate professionals dedicated to providing you with the best sports experience.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid md:grid-cols-3 gap-8"
            >
              {team.map((member, index) => (
                <motion.div
                  key={member.name}
                  variants={fadeInUp}
                  className="bg-gray-50 rounded-xl p-6 text-center"
                >
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Rj5m4xVvEH1Toi/d1a4z6LdGuNNlhXTWuL1WNcBdHLdQjHLlUOlhOe6eBXTEfthVcWOjKw2g=="
                  />
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {member.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Contact Info Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              {...fadeInUp}
              className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-8 md:p-12 text-white text-center"
            >
              <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Booking Experience?</h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of athletes who have already discovered the easiest way to book sports venues!
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <p className="font-medium">Visit Us</p>
                  <p className="text-sm opacity-90">123 Sports Avenue<br />Athletic District, City 12345</p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                    <Phone className="w-6 h-6" />
                  </div>
                  <p className="font-medium">Call Us</p>
                  <p className="text-sm opacity-90">(555) 123-4567<br />Mon-Sun 6AM-10PM</p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                    <Mail className="w-6 h-6" />
                  </div>
                  <p className="font-medium">Email Us</p>
                  <p className="text-sm opacity-90">info@sportvenue.com<br />support@sportvenue.com</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}



