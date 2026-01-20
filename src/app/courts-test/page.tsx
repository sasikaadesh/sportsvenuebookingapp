'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { AdminOnlyPage } from '@/components/admin/AdminOnlyPage'

function CourtsTestPageContent() {
  const { user, loading: authLoading } = useAuth()
  const [courts, setCourts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('Ready to test courts loading...')

  const testCourtsLoading = async () => {
    setLoading(true)
    setStatus('Testing courts loading...')
    
    try {
      console.log('Starting courts test...')
      
      // Test 1: Basic connection
      setStatus('Testing basic connection...')
      const { data: testData, error: testError } = await supabase
        .from('courts')
        .select('count')
        .limit(1)

      if (testError) {
        setStatus(`❌ Connection failed: ${testError.message}`)
        return
      }

      // Test 2: Load all courts
      setStatus('Loading all courts...')
      const { data, error } = await supabase
        .from('courts')
        .select(`
          *,
          pricing_rules (
            duration_hours,
            off_peak_price,
            peak_price
          )
        `)
        .eq('is_active', true)

      if (error) {
        setStatus(`❌ Courts query failed: ${error.message}`)
        console.error('Courts error:', error)
        return
      }

      if (!data || data.length === 0) {
        setStatus('⚠️ No courts found in database')
        setCourts([])
        return
      }

      // Transform data
      const transformedCourts = data.map((court: any) => ({
        id: court.id,
        name: court.name,
        type: court.type,
        image: court.images?.[0] || 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        location: 'Sports Complex',
        rating: 4.5,
        reviews: 50,
        priceFrom: court.pricing_rules?.[0]?.off_peak_price || 45,
        amenities: court.amenities || [],
        availability: 'Available Today',
        description: court.description || 'Professional sports court'
      }))

      setCourts(transformedCourts)
      setStatus(`✅ Successfully loaded ${transformedCourts.length} courts`)
      console.log('Courts loaded:', transformedCourts)

    } catch (error) {
      setStatus(`❌ Exception: ${error}`)
      console.error('Exception:', error)
    } finally {
      setLoading(false)
    }
  }

  const testMockData = () => {
    const mockCourts = [
      {
        id: 'mock-1',
        name: 'Mock Tennis Court',
        type: 'tennis',
        image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        location: 'Mock Location',
        rating: 4.5,
        reviews: 50,
        priceFrom: 45,
        amenities: ['Mock Amenity'],
        availability: 'Available',
        description: 'Mock court for testing'
      }
    ]
    
    setCourts(mockCourts)
    setStatus('✅ Mock data loaded successfully')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Courts Loading Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Status</h2>
          <p className="text-lg mb-4">{status}</p>
          
          <div className="space-x-4 mb-4">
            <Button onClick={testCourtsLoading} disabled={loading}>
              {loading ? 'Testing...' : 'Test Courts Loading'}
            </Button>
            <Button onClick={testMockData} disabled={loading} variant="outline">
              Load Mock Data
            </Button>
          </div>

          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            <p><strong>Auth Loading:</strong> {authLoading ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {user ? user.email : 'Not signed in'}</p>
            <p><strong>Courts Count:</strong> {courts.length}</p>
          </div>
        </div>

        {courts.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Courts Found ({courts.length})</h2>
            <div className="grid gap-4">
              {courts.map((court, index) => (
                <div key={court.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{court.name}</h3>
                      <p className="text-sm text-gray-600">Type: {court.type}</p>
                      <p className="text-sm text-gray-600">ID: {court.id}</p>
                      <p className="text-sm text-gray-600">Price: ${court.priceFrom}</p>
                      <p className="text-sm text-gray-600">Location: {court.location}</p>
                    </div>
                    <div className="text-right">
                      <a 
                        href={`/courts/${court.id}/book`}
                        className="inline-block bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Test Booking
                      </a>
                    </div>
                  </div>
                  {court.description && (
                    <p className="text-sm text-gray-500 mt-2">{court.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Debug Steps:</h3>
          <ol className="text-yellow-700 text-sm space-y-1">
            <li>1. Click &quot;Test Courts Loading&quot; to see if courts load properly</li>
            <li>2. Check browser console for detailed error messages</li>
            <li>3. If courts load here but not on main page, there&apos;s a component issue</li>
            <li>4. Try &quot;Load Mock Data&quot; to test with simple data</li>
            <li>5. Go to <Link href="/courts" className="underline">main courts page</Link> to compare</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default function CourtsTestPage() {
  return (
    <AdminOnlyPage pageName="Courts Test">
      <CourtsTestPageContent />
    </AdminOnlyPage>
  )
}
