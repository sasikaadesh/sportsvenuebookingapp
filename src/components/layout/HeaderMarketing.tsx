'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function HeaderMarketing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-16">
          {/* Logo */}
          <Link prefetch href="/" className="flex items-center">
            <Image
              src="/SVB_Logo.png"
              alt="SportsVenueBookings"
              width={1000}
              height={250}
              className="h-24 md:h-28 w-auto shrink-0"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center md:space-x-6 lg:space-x-8">
            <Link prefetch href="/#features" className="whitespace-nowrap leading-tight text-gray-700 hover:text-blue-600 transition-colors">
              Features
            </Link>
            <Link prefetch href="/#how-it-works" className="whitespace-nowrap leading-tight text-gray-700 hover:text-blue-600 transition-colors">
              How It Works
            </Link>
            <Link prefetch href="/#testimonials" className="whitespace-nowrap leading-tight text-gray-700 hover:text-blue-600 transition-colors">
              Reviews
            </Link>
            <Link prefetch href="/about" className="whitespace-nowrap leading-tight text-gray-700 hover:text-blue-600 transition-colors">
              About Us
            </Link>
            <Link prefetch href="/contact" className="whitespace-nowrap leading-tight text-gray-700 hover:text-blue-600 transition-colors">
              Contact Us
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Link prefetch href="/app">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2">
                <span>Try Demo App</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link prefetch
                href="/#features"
                className="text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link prefetch
                href="/#how-it-works"
                className="text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link prefetch
                href="/#testimonials"
                className="text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Reviews
              </Link>
              <Link prefetch
                href="/about"
                className="text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
              <Link prefetch
                href="/contact"
                className="text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact Us
              </Link>
              
              <div className="pt-4 border-t border-gray-200">
                <Link prefetch href="/app" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center space-x-2">
                    <span>Try Demo App</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
