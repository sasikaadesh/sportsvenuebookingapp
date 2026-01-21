'use client'

import { ReactNode } from 'react'
import { ThemeProvider } from '@/components/providers/ThemeProvider'

interface AdminLayoutProps {
  children: ReactNode
}

/**
 * AdminLayout component that wraps admin pages with ThemeProvider
 * This enables light/dark mode support for admin pages
 */
export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ThemeProvider>
      <div className="min-h-screen transition-colors duration-200">
        {children}
      </div>
    </ThemeProvider>
  )
}
