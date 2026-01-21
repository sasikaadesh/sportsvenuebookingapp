'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import logoLight from '@/assets/images/SVB_Logo.png'
import logoDark from '@/assets/images/SVB_Logo_white.png'
import { useAuth } from '@/components/providers/AuthProvider'
import { useTheme } from '@/components/providers/ThemeProvider'
import { Menu, X, User, LogOut, Calendar, Settings, Home, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface HeaderAppProps {
  hideThemeToggle?: boolean
}

export function HeaderApp({ hideThemeToggle = false }: HeaderAppProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { user, profile, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const profileRef = useRef<HTMLDivElement>(null)

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      setIsMenuOpen(false)
      setIsProfileOpen(false)
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  return (
    <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-700/60 sticky top-0 z-50 transition-colors duration-200">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-16">
          {/* Logo */}
          <Link href="/app" className="flex items-center space-x-2">
            <div className="relative h-12 md:h-14 w-[200px] md:w-[240px] shrink-0">
              <Image
                src={theme === 'dark' ? logoDark : logoLight}
                alt="SportsVenueBookings"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full font-medium">Demo</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center md:space-x-6 lg:space-x-8">
            <Link href="/app" className="whitespace-nowrap leading-tight text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Home
            </Link>
            <Link href="/courts" className="whitespace-nowrap leading-tight text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Courts
            </Link>
            <Link href="/" className="whitespace-nowrap leading-tight text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center space-x-1">
              <Home className="w-4 h-4" />
              <span>Marketing Site</span>
            </Link>
          </nav>

          {/* Theme Toggle & Desktop Auth */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle */}
            {!hideThemeToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2 whitespace-nowrap"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </Button>
            )}
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2 whitespace-nowrap">
                    <Calendar className="w-4 h-4" />
                    <span>My Bookings</span>
                  </Button>
                </Link>
                
                {profile?.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2 whitespace-nowrap">
                      <Settings className="w-4 h-4" />
                      <span>Admin</span>
                    </Button>
                  </Link>
                )}

                <div className="relative" ref={profileRef}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2 whitespace-nowrap"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                  >
                    <User className="w-4 h-4" />
                    <span>{profile?.full_name || user.email?.split('@')[0] || 'User'}</span>
                  </Button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Profile Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <LogOut className="w-4 h-4 inline mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/signin?returnTo=/app"
                  onClick={() => {
                    // Store current app context for redirect after auth
                    localStorage.setItem('auth_return_to', '/app')
                  }}
                >
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link
                  href="/auth/signup?returnTo=/app"
                  onClick={() => {
                    // Store current app context for redirect after auth
                    localStorage.setItem('auth_return_to', '/app')
                  }}
                >
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-colors duration-200">
            <div className="flex flex-col space-y-4">
              <Link
                href="/app"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/courts"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Courts
              </Link>
              <Link
                href="/"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center space-x-1"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="w-4 h-4" />
                <span>Marketing Site</span>
              </Link>

              {/* Theme Toggle */}
              {!hideThemeToggle && (
                <button
                  onClick={toggleTheme}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
                >
                  {theme === 'light' ? (
                    <Moon className="w-4 h-4" />
                  ) : (
                    <Sun className="w-4 h-4" />
                  )}
                  <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>
              )}

              {user ? (
                <div className="flex flex-col space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>My Bookings</span>
                  </Link>

                  {profile?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Admin Panel</span>
                    </Link>
                  )}

                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-left transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-4 pt-4 border-t border-gray-200">
                  <Link
                    href="/auth/signin?returnTo=/app"
                    onClick={() => {
                      setIsMenuOpen(false)
                      // Store current app context for redirect after auth
                      localStorage.setItem('auth_return_to', '/app')
                    }}
                  >
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      Sign In
                    </Button>
                  </Link>
                  <Link
                    href="/auth/signup?returnTo=/app"
                    onClick={() => {
                      setIsMenuOpen(false)
                      // Store current app context for redirect after auth
                      localStorage.setItem('auth_return_to', '/app')
                    }}
                  >
                    <Button size="sm" className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
