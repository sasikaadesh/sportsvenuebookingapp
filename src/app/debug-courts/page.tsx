'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'

export default function DebugCourtsPage() {
  const [courts, setCourts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('Loading...')
  const [connectionTest, setConnectionTest] = useState<any>(null)

  useEffect(() => {
    testConnectionAndLoadCourts()
  }, [])

  const testConnectionAndLoadCourts = async () => {
    setLoading(true)
    setStatus('Testing Supabase connection...')

    const testResults: any = {
      envVars: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Missing',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
      },
      connection: null,
      tables: {},
      courts: []
    }

    try {
      // Test 1: Basic connection using courts table instead of users
      setStatus('Testing basic connection...')
      const { data: testData, error: testError } = await supabase
        .from('courts')
        .select('count')
        .limit(1)

      testResults.connection = {
        success: !testError,
        error: testError?.message || null
      }

      if (testError) {
        setStatus(`❌ Connection failed: ${testError.message}`)
        setConnectionTest(testResults)
        return
      }

      // Test 2: Check if courts table exists
      setStatus('Checking courts table...')
      const { data: courtsData, error: courtsError } = await supabase
        .from('courts')
        .select('*')
        .limit(1)

      testResults.tables.courts = {
        exists: !courtsError,
        error: courtsError?.message || null
      }

      if (courtsError) {
        setStatus(`❌ Courts table error: ${courtsError.message}`)
        setConnectionTest(testResults)
        return
      }

      // Test 3: Load all courts
      setStatus('Loading courts...')
      const { data: allCourts, error: allCourtsError } = await supabase
        .from('courts')
        .select('*')

      if (allCourtsError) {
        setStatus(`❌ Error loading courts: ${allCourtsError.message}`)
        testResults.courts = []
      } else {
        setStatus(`✅ Loaded ${allCourts?.length || 0} courts`)
        testResults.courts = allCourts || []
        setCourts(allCourts || [])
      }

      setConnectionTest(testResults)

    } catch (error) {
      setStatus(`❌ Connection error: ${error}`)
      testResults.connection = { success: false, error: String(error) }
      setConnectionTest(testResults)
    } finally {
      setLoading(false)
    }
  }

  const loadCourts = async () => {
    setLoading(true)
    setStatus('Refreshing courts...')

    try {
      const { data, error } = await supabase
        .from('courts')
        .select('*')

      if (error) {
        setStatus(`❌ Error: ${error.message}`)
        setCourts([])
      } else {
        setStatus(`✅ Loaded ${data?.length || 0} courts`)
        setCourts(data || [])
      }
    } catch (error) {
      setStatus(`❌ Error: ${error}`)
      setCourts([])
    } finally {
      setLoading(false)
    }
  }

  const createSampleCourts = async () => {
    setLoading(true)
    setStatus('Creating sample courts...')

    try {
      const sampleCourts = [
        {
          name: 'Tennis Court A',
          type: 'tennis',
          description: 'Professional tennis court with synthetic surface',
          images: ['https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
          amenities: ['Lighting', 'Seating', 'Water Fountain'],
          is_active: true
        },
        {
          name: 'Basketball Court Pro',
          type: 'basketball',
          description: 'Indoor basketball court with wooden flooring',
          images: ['https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
          amenities: ['Air Conditioning', 'Sound System', 'Scoreboard'],
          is_active: true
        },
        {
          name: 'Cricket Ground Elite',
          type: 'cricket',
          description: 'Full-size cricket ground with natural grass',
          images: ['https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
          amenities: ['Pavilion', 'Scoreboard', 'Practice Nets'],
          is_active: true
        }
      ]

      const { data, error } = await supabase
        .from('courts')
        .insert(sampleCourts)
        .select()

      if (error) {
        setStatus(`❌ Error creating courts: ${error.message}`)
        console.error('Error creating courts:', error)
      } else {
        setStatus(`✅ Created ${data?.length || 0} courts successfully!`)
        console.log('Courts created:', data)

        // Create pricing rules for each court
        if (data && data.length > 0) {
          const pricingRules = data.flatMap(court => [
            {
              court_id: court.id,
              duration_hours: 1,
              off_peak_price: 45.00,
              peak_price: 65.00
            },
            {
              court_id: court.id,
              duration_hours: 2,
              off_peak_price: 85.00,
              peak_price: 120.00
            }
          ])

          const { error: pricingError } = await supabase
            .from('pricing_rules')
            .insert(pricingRules)

          if (pricingError) {
            console.error('Pricing rules error:', pricingError)
          }
        }

        // Refresh the courts list
        testConnectionAndLoadCourts()
      }
    } catch (error) {
      setStatus(`❌ Error: ${error}`)
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Courts</h1>

        {/* Status Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <p className="text-lg mb-4">{status}</p>

          <div className="space-x-4">
            <Button onClick={testConnectionAndLoadCourts} disabled={loading}>
              {loading ? 'Testing...' : 'Test Connection'}
            </Button>
            <Button onClick={loadCourts} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh Courts'}
            </Button>
            <Button onClick={createSampleCourts} disabled={loading}>
              Create Sample Courts
            </Button>
          </div>
        </div>

        {/* Connection Test Results */}
        {connectionTest && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Connection Test Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Environment Variables</h3>
                <p className="text-sm">URL: {connectionTest.envVars.url}</p>
                <p className="text-sm">Anon Key: {connectionTest.envVars.anonKey}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Connection Status</h3>
                <p className="text-sm">
                  Status: {connectionTest.connection?.success ? '✅ Connected' : '❌ Failed'}
                </p>
                {connectionTest.connection?.error && (
                  <p className="text-sm text-red-600">Error: {connectionTest.connection.error}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Courts in Database ({courts.length})</h2>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading courts...</p>
            </div>
          ) : courts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No courts found in database</p>
              <Button onClick={createSampleCourts}>Create Sample Courts</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {courts.map((court, index) => (
                <div key={court.id} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">{court.name}</h3>
                      <p className="text-sm text-gray-600">Type: {court.type}</p>
                    </div>
                    <div>
                      <p className="text-sm"><strong>ID:</strong> {court.id}</p>
                      <p className="text-sm"><strong>Active:</strong> {court.is_active ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <p className="text-sm"><strong>Images:</strong> {court.images?.length || 0}</p>
                      <p className="text-sm"><strong>Amenities:</strong> {court.amenities?.length || 0}</p>
                    </div>
                    <div>
                      <a 
                        href={`/courts/${court.id}/book`}
                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Test Booking
                      </a>
                    </div>
                  </div>
                  {court.description && (
                    <p className="text-sm text-gray-600 mt-2">{court.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">Debug Info:</h3>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• This page shows all courts in your Supabase database</li>
            <li>• Use "Create Sample Courts" if no courts exist</li>
            <li>• Click "Test Booking" to test the booking page for each court</li>
            <li>• Check browser console for detailed logs</li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Quick Actions:</h3>
          <div className="space-y-2">
            <p className="text-blue-700 text-sm">If courts aren't loading, try these steps:</p>
            <ol className="text-blue-700 text-sm space-y-1 ml-4">
              <li>1. Click "Test Connection" to check Supabase connectivity</li>
              <li>2. If connection fails, check your .env.local file</li>
              <li>3. If connection works but no courts, click "Create Sample Courts"</li>
              <li>4. Go to <a href="/test-connection" className="underline">Test Connection Page</a> for detailed diagnostics</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
