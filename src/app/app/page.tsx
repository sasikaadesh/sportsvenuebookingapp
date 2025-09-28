import { HeroCompact } from '@/components/sections/HeroCompact'
import { FeaturedCourts } from '@/components/sections/FeaturedCourts'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { HeaderApp } from '@/components/layout/HeaderApp'
import { FooterSimple } from '@/components/layout/FooterSimple'
import { AppLayout } from '@/components/layout/AppLayout'

export default function AppPage() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <HeaderApp />
        <main>
          <HeroCompact />
          <FeaturedCourts />
          <HowItWorks variant="simple" />
        </main>
        <FooterSimple />
      </div>
    </AppLayout>
  )
}
