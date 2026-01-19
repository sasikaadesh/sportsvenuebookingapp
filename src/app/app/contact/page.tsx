'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  MessageCircle,
  Users,
  Calendar,
  ArrowLeft
} from 'lucide-react'
import { HeaderApp } from '@/components/layout/HeaderApp'
import { FooterSimple } from '@/components/layout/FooterSimple'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { sendContactEmails, isEmailJSConfigured } from '@/lib/emailjs'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function AppContactPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  })
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Save message to database
      const { data, error } = await (supabase as any)
        .from('contact_messages')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            message: `Subject: ${formData.subject}\n\nInquiry Type: ${formData.inquiryType}\n\nMessage:\n${formData.message}`,
            status: 'new'
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)
        toast.error(`Database error: ${error.message}`)
        return
      }

      // Send confirmation emails using EmailJS
      if (isEmailJSConfigured()) {
        try {
          const emailResult = await sendContactEmails({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            subject: formData.subject,
            message: formData.message,
            inquiryType: formData.inquiryType
          })

          if (emailResult.success) {
            toast.success('Message sent successfully! Check your email for confirmation.')
          } else {
            toast.success('Message sent successfully! We\'ll get back to you within 24 hours.')
          }
        } catch (emailError) {
          console.error('Email error:', emailError)
          toast.success('Message sent successfully! We\'ll get back to you within 24 hours.')
        }
      } else {
        toast.success('Message sent successfully! We\'ll get back to you within 24 hours.')
      }
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        inquiryType: 'general'
      })
    } catch (error) {
      console.error('Contact form error:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const contactInfo = [
    {
      icon: Phone,
      title: 'Support',
      details: ['+94 76 644 4050'],
      description: 'Mon-Sun 6AM-10PM'
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['support@sportvenue.com'],
      description: 'Response within 24 hours'
    }
  ]

  const inquiryTypes = [
    { value: 'general', label: 'General Question', icon: MessageCircle },
    { value: 'booking', label: 'Booking Help', icon: Calendar },
    { value: 'technical', label: 'Technical Issue', icon: Phone },
    { value: 'feedback', label: 'Feedback', icon: Users }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <HeaderApp />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </motion.button>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Contact Support
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Need help with booking or have questions? We&apos;re here to assist you!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Inquiry Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How can we help?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {inquiryTypes.map((type) => {
                    const IconComponent = type.icon
                    return (
                      <label
                        key={type.value}
                        className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-all text-sm ${
                          formData.inquiryType === type.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="inquiryType"
                          value={type.value}
                          checked={formData.inquiryType === type.value}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <IconComponent className="w-4 h-4" />
                        <span className="font-medium">{type.label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Name and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Tell us more..."
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                loading={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </form>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Contact Cards */}
            {contactInfo.map((info, index) => {
              const IconComponent = info.icon
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {info.title}
                      </h3>
                      <div className="space-y-1">
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="text-gray-700 font-medium">
                            {detail}
                          </p>
                        ))}
                      </div>
                      <p className="text-gray-600 text-sm mt-2">
                        {info.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Need Immediate Help?</h3>
              <p className="text-blue-100 mb-4 text-sm">
                Browse our courts or check your bookings for quick assistance.
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={() => router.push('/courts')}
                  variant="outline" 
                  className="w-full border-white text-white hover:bg-white hover:text-blue-600"
                >
                  Browse Courts
                </Button>
                <Button 
                  onClick={() => router.push('/dashboard')}
                  variant="outline" 
                  className="w-full border-white text-white hover:bg-white hover:text-blue-600"
                >
                  My Bookings
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <FooterSimple />
    </div>
  )
}
