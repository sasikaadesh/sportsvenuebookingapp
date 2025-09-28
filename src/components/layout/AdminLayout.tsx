'use client'

import { ReactNode, useEffect } from 'react'

interface AdminLayoutProps {
  children: ReactNode
}

/**
 * AdminLayout component that forces light mode for admin pages only
 * This wrapper ensures admin pages always display in light mode regardless of the global theme setting
 */
export function AdminLayout({ children }: AdminLayoutProps) {
  useEffect(() => {
    // Force light mode by removing dark class from html element for admin pages
    const htmlElement = document.documentElement
    const originalClass = htmlElement.className

    // Remove dark class if present
    htmlElement.classList.remove('dark')

    // Cleanup function to restore original theme when leaving admin page
    return () => {
      // Only restore dark class if it was originally there
      if (originalClass.includes('dark')) {
        htmlElement.classList.add('dark')
      }
    }
  }, [])

  return (
    <div className="admin-layout">
      {children}
    </div>
  )
}
