'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'

export default function CourtsDiagnosticPage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('Ready to test database connection...')

  const runDiagnostics = async () => {
    setLoading(true)
    setStatus('Running diagnostics...')
    const diagnosticResults: any = {}

    try {
      // Test 1: Basic connection
      setStatus('Testing basic Supabase connection...')
      try {
        const { data: connectionTest, error: connectionError } = await supabase
          .from('courts')
          .select('count')
          .limit(1)

        diagnosticResults.connection = {
          success: !connectionError,
          error: connectionError?.message || null,
          details: connectionError ? 'Failed to connect to Supabase' : 'Connection successful'
        }
      } catch (err) {
        diagnosticResults.connection = {
          success: false,
          error: `Exception: ${err}`,
          details: 'Failed to establish connection'
        }
      }

      // Test 2: Count courts
      setStatus('Counting courts in database...')
      try {
        const { count, error: countError } = await supabase
          .from('courts')
          .select('*', { count: 'exact', head: true })

        diagnosticResults.count = {
          success: !countError,
          count: count || 0,
          error: countError?.message || null
        }
      } catch (err) {
        diagnosticResults.count = {
          success: false,
          count: 0,
          error: `Exception: ${err}`
        }
      }

      // Test 3: Fetch all courts
      setStatus('Fetching all courts...')
      try {
        const { data: allCourts, error: fetchError } = await supabase
          .from('courts')
          .select('*')

        diagnosticResults.fetch = {
          success: !fetchError,
          count: allCourts?.length || 0,
          data: allCourts || [],
          error: fetchError?.message || null
        }
      } catch (err) {
        diagnosticResults.fetch = {
          success: false,
          count: 0,
          data: [],
          error: `Exception: ${err}`
        }
      }

      // Test 4: Fetch active courts only
      setStatus('Fetching active courts...')
      try {
        const { data: activeCourts, error: activeError } = await supabase
          .from('courts')
          .select('*')
          .eq('is_active', true)

        diagnosticResults.active = {
          success: !activeError,
          count: activeCourts?.length || 0,
          data: activeCourts || [],
          error: activeError?.message || null
        }
      } catch (err) {
        diagnosticResults.active = {
          success: false,
          count: 0,
          data: [],
          error: `Exception: ${err}`
        }
      }

      // Test 5: Check RLS policies
      setStatus('Checking RLS status...')
      try {
        const { data: rlsCheck, error: rlsError } = await supabase
          .rpc('check_rls_status')

        diagnosticResults.rls = {
          success: !rlsError,
          data: rlsCheck,
          error: rlsError?.message || 'RLS check function not available'
        }
      } catch (err) {
        diagnosticResults.rls = {
          success: false,
          data: null,
          error: 'RLS check not available'
        }
      }

      setResults(diagnosticResults)
      setStatus('Diagnostics complete!')

    } catch (error) {
      setStatus(`Diagnostics failed: ${error}`)
      console.error('Diagnostics error:', error)
    } finally {
      setLoading(false)
    }
  }

  const insertTestCourt = async () => {
    setLoading(true)
    setStatus('Inserting test court...')

    try {
      const testCourt = {
        name: 'Test Court ' + Date.now(),
        type: 'tennis',
        description: 'Test court for diagnostics',
        images: ['https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        amenities: ['Test Amenity'],
        is_active: true
      }

      const { data, error } = await supabase
        .from('courts')
        .insert([testCourt])
        .select()

      if (error) {
        setStatus(`❌ Insert failed: ${error.message}`)
      } else {
        setStatus(`✅ Test court inserted successfully: ${data[0]?.name}`)
        // Re-run diagnostics to see the new court
        setTimeout(runDiagnostics, 1000)
      }
    } catch (error) {
      setStatus(`❌ Insert exception: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Courts Database Diagnostics</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <p className="text-lg mb-4">{status}</p>
          
          <div className="space-x-4">
            <Button onClick={runDiagnostics} disabled={loading}>
              {loading ? 'Running...' : 'Run Diagnostics'}
            </Button>
            <Button onClick={insertTestCourt} disabled={loading} variant="outline">
              Insert Test Court
            </Button>
          </div>
        </div>

        {Object.keys(results).length > 0 && (
          <div className="grid gap-6">
            {/* Connection Test */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-3">
                {results.connection?.success ? '✅' : '❌'} Database Connection
              </h3>
              <p className="text-sm text-gray-600">{results.connection?.details}</p>
              {results.connection?.error && (
                <p className="text-red-600 text-sm mt-2">Error: {results.connection.error}</p>
              )}
            </div>

            {/* Count Test */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-3">
                {results.count?.success ? '✅' : '❌'} Courts Count
              </h3>
              <p className="text-sm text-gray-600">
                Total courts in database: <strong>{results.count?.count || 0}</strong>
              </p>
              {results.count?.error && (
                <p className="text-red-600 text-sm mt-2">Error: {results.count.error}</p>
              )}
            </div>

            {/* Fetch Test */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-3">
                {results.fetch?.success ? '✅' : '❌'} All Courts Fetch
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Fetched courts: <strong>{results.fetch?.count || 0}</strong>
              </p>
              {results.fetch?.error && (
                <p className="text-red-600 text-sm mb-3">Error: {results.fetch.error}</p>
              )}
              {results.fetch?.data && results.fetch.data.length > 0 && (
                <div className="bg-gray-50 p-3 rounded text-xs">
                  <pre>{JSON.stringify(results.fetch.data, null, 2)}</pre>
                </div>
              )}
            </div>

            {/* Active Courts Test */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-3">
                {results.active?.success ? '✅' : '❌'} Active Courts Fetch
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Active courts: <strong>{results.active?.count || 0}</strong>
              </p>
              {results.active?.error && (
                <p className="text-red-600 text-sm mb-3">Error: {results.active.error}</p>
              )}
              {results.active?.data && results.active.data.length > 0 && (
                <div className="bg-gray-50 p-3 rounded text-xs max-h-40 overflow-y-auto">
                  <pre>{JSON.stringify(results.active.data, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
          <h3 className="font-semibold text-blue-800 mb-2">Interpretation:</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• If connection fails - Check Supabase URL/Key in .env.local</li>
            <li>• If count is 0 - No courts in database, using mock data</li>
            <li>• If fetch fails - RLS policies blocking access</li>
            <li>• If active courts = 0 but total {'>'}= 0 - All courts are inactive</li>
            <li>• <a href="/courts" className="underline">Test main courts page</a></li>
            <li>• <a href="/simple-courts" className="underline">Test simple courts page</a></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
