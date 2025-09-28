import Link from 'next/link'

export function FooterSimple() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SV</span>
            </div>
            <span className="text-xl font-bold">SportVenue</span>
          </div>

          {/* Quick Links */}
          <div className="flex items-center space-x-6">
            <Link href="/courts" className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors text-sm">
              Browse Courts
            </Link>
            <Link href="/dashboard" className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors text-sm">
              My Bookings
            </Link>
            <Link href="/profile" className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors text-sm">
              Profile
            </Link>
            <Link href="/app/about" className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors text-sm">
              About Us
            </Link>
            <Link href="/app/contact" className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors text-sm">
              Contact
            </Link>
            <Link href="/" className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors text-sm">
              Marketing Site
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-gray-400 dark:text-gray-500 text-sm">
            © {new Date().getFullYear()} SportVenue. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
