'use client'

import { ThemeProvider } from '@/components/providers/ThemeProvider'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <ThemeProvider>
      <div className="min-h-screen transition-colors duration-200">
        {children}
      </div>
    </ThemeProvider>
  )
}
