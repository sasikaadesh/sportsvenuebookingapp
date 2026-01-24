'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import logo from '../../assets/images/SVB_Logo_white.png'
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, X } from 'lucide-react'

export function FooterSimple() {
  const [showTermsPopup, setShowTermsPopup] = useState(false)
  const [showPrivacyPopup, setShowPrivacyPopup] = useState(false)

  return (
    <>
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4 lg:col-span-2">
              <div className="flex items-center space-x-3">
                <Image
                  src={logo}
                  alt="SportsVenueBookings logo"
                  width={420}
                  height={90}
                  className="object-contain"
                />
              </div>
              <p className="text-gray-400 text-sm">
                Your premier destination for booking sports venues. Play your favorite sports with ease and convenience.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

          {/* Quick Links */}
          <div className="space-y-4 lg:justify-self-end">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/courts" className="text-gray-400 hover:text-white transition-colors">
                  Browse Courts
                </Link>
              </li>
              <li>
                <Link href="/app/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/app/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4 lg:justify-self-end">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-400" />
                <span className="text-gray-400">+94 76 644 4050</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-400 shrink-0" />
                <span className="text-gray-400">info@sportsvenuebookings.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-400 mt-0.5" />
                <span className="text-gray-400">
                  123 Sports Avenue<br />
                  Athletic District<br />
                  City, State 12345
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} SportsVenueBookings. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <button
              onClick={() => setShowTermsPopup(true)}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Terms
            </button>
            <button
              onClick={() => setShowPrivacyPopup(true)}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Privacy
            </button>
          </div>
        </div>
      </div>
    </footer>

    {/* Terms Popup */}
    {showTermsPopup && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
          <button
            onClick={() => setShowTermsPopup(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Terms of Service</h3>
          <div className="text-gray-600 space-y-3">
            <p>
              Welcome to SportsVenueBookings! By using our platform, you agree to our terms and conditions.
            </p>
            <p>
              Our service allows you to book sports venues easily and securely. All bookings are subject to availability and venue policies.
            </p>
            <p>
              Users are responsible for providing accurate information and adhering to booking schedules. Cancellation policies vary by venue.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              For complete terms and conditions, please contact our support team.
            </p>
          </div>
          <button
            onClick={() => setShowTermsPopup(false)}
            className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    )}

    {/* Privacy Popup */}
    {showPrivacyPopup && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
          <button
            onClick={() => setShowPrivacyPopup(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Privacy Policy</h3>
          <div className="text-gray-600 space-y-3">
            <p>
              Your privacy is important to us. We collect and use your personal information solely to provide and improve our booking services.
            </p>
            <p>
              We collect information such as your name, email, phone number, and booking preferences. This data is securely stored and never shared with third parties without your consent.
            </p>
            <p>
              You have the right to access, modify, or delete your personal information at any time through your account settings.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              For our complete privacy policy, please contact our support team.
            </p>
          </div>
          <button
            onClick={() => setShowPrivacyPopup(false)}
            className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    )}
  </>
  )
}
