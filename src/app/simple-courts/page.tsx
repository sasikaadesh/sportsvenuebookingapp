'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { AdminOnlyPage } from '@/components/admin/AdminOnlyPage'

function SimpleCourtsPageContent() {
  const [courts, setCourts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCourts = useCallback(async () => {
    try {
      console.log('Loading courts...')
      setLoading(true)
      setError(null)

      const { data, error: dbError } = await supabase
        .from('courts')
        .select('id, name, type, description, image_url, amenities, is_active')
        .eq('is_active', true)

      if (dbError) {
        console.error('Database error:', dbError)
        setError(`Database error: ${dbError.message}`)
        // Use mock data as fallback
        setCourts(getMockCourts())
      } else if (!data || data.length === 0) {
        console.log('No courts in database, using mock data')
        setCourts(getMockCourts())
      } else {
        console.log('Loaded courts from database:', data)
        setCourts(data)
      }
    } catch (err) {
      console.error('Error loading courts:', err)
      setError(`Error: ${err}`)
      setCourts(getMockCourts())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCourts()
  }, [loadCourts])

  const getMockCourts = () => [
    {
      id: 'mock-tennis-1',
      name: 'Tennis Court A',
      type: 'tennis',
      description: 'Professional tennis court',
      images: ['https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
      amenities: ['Lighting', 'Equipment Rental'],
      is_active: true
    },
    {
      id: 'mock-basketball-1',
      name: 'Basketball Court Pro',
      type: 'basketball',
      description: 'Indoor basketball court',
      images: ['https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
      amenities: ['Air Conditioning', 'Sound System'],
      is_active: true
    },
    {
      id: 'mock-cricket-1',
      name: 'Cricket Ground',
      type: 'cricket',
      description: 'Full-size cricket ground',
      images: ['https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
      amenities: ['Pavilion', 'Practice Nets'],
      is_active: true
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple Courts Page
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            This is a simplified courts page for testing. If this loads but the main courts page doesn&apos;t,
            there&apos;s an issue with the complex components.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
            <Button onClick={loadCourts} className="mt-2" size="sm">
              Retry Loading
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading courts...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courts.map((court, index) => (
              <div key={court.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-w-16 aspect-h-9">
                  <Image
                    src={court.images?.[0] || 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                    alt={court.name}
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover"
                  />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {court.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-2">
                    Type: {court.type}
                  </p>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {court.description}
                  </p>

                  {court.amenities && court.amenities.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Amenities:</p>
                      <div className="flex flex-wrap gap-2">
                        {court.amenities.map((amenity: string, idx: number) => (
                          <span
                            key={idx}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Link href={`/courts/${court.id}/book`} className="flex-1">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        Book Now
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && courts.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courts available</h3>
            <p className="text-gray-600 mb-6">There are no courts available at the moment.</p>
            <Button onClick={loadCourts}>
              Retry Loading
            </Button>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
          <h3 className="font-semibold text-blue-800 mb-2">Debug Info:</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Courts loaded: {courts.length}</li>
            <li>• Loading state: {loading ? 'Yes' : 'No'}</li>
            <li>• Error: {error || 'None'}</li>
            <li>• <Link href="/courts" className="underline">Try main courts page</Link></li>
            <li>• <Link href="/courts-test" className="underline">Try courts test page</Link></li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function SimpleCourtsPage() {
  return (
    <AdminOnlyPage pageName="Simple Courts">
      <SimpleCourtsPageContent />
    </AdminOnlyPage>
  )
}
