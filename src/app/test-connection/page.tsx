'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { AdminOnlyPage } from '@/components/admin/AdminOnlyPage'

function TestConnectionPageContent() {
  const [status, setStatus] = useState('Testing...')
  const [details, setDetails] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    setLoading(true)
    setStatus('Testing Supabase connection...')
    
    const results: any = {
      envVars: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
      },
      tests: {}
    }

    try {
      // Test 1: Basic connection
      setStatus('Testing basic connection...')
      const { data: healthData, error: healthError } = await supabase
        .from('users')
        .select('count')
        .limit(1)

      results.tests.basicConnection = {
        success: !healthError,
        error: healthError?.message || null
      }

      // Test 2: Auth status
      setStatus('Testing auth status...')
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      results.tests.auth = {
        success: !authError,
        user: user ? { id: user.id, email: user.email } : null,
        error: authError?.message || null
      }

      // Test 3: Database tables
      setStatus('Testing database tables...')
      const tables = ['users', 'courts', 'bookings', 'pricing_rules']
      const tableResults: any = {}

      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('count')
            .limit(1)
          
          tableResults[table] = {
            exists: !error,
            error: error?.message || null
          }
        } catch (err) {
          tableResults[table] = {
            exists: false,
            error: String(err)
          }
        }
      }

      results.tests.tables = tableResults

      // Test 4: Count records
      setStatus('Counting records...')
      const counts: any = {}
      
      for (const table of tables) {
        try {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true })
          
          counts[table] = error ? 'Error' : count
        } catch (err) {
          counts[table] = 'Error'
        }
      }

      results.counts = counts

      setDetails(results)
      setStatus('✅ Connection test completed!')

    } catch (error) {
      setStatus(`❌ Connection test failed: ${error}`)
      results.tests.generalError = String(error)
      setDetails(results)
    } finally {
      setLoading(false)
    }
  }

  const createBasicData = async () => {
    setLoading(true)
    setStatus('Creating basic data...')

    try {
      // Create a test court
      const { data: courtData, error: courtError } = await (supabase as any)
        .from('courts')
        .insert({
          name: 'Test Tennis Court',
          type: 'tennis',
          description: 'Test court for debugging',
          images: ['https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
          amenities: ['Lighting', 'Seating'],
          is_active: true
        })
        .select()
        .single()

      if (courtError) {
        setStatus(`❌ Failed to create court: ${courtError.message}`)
        return
      }

      // Create pricing for the court
      const { error: pricingError } = await (supabase as any)
        .from('pricing_rules')
        .insert([
          {
            court_id: courtData.id,
            duration_hours: 1,
            off_peak_price: 45.00,
            peak_price: 65.00
          },
          {
            court_id: courtData.id,
            duration_hours: 2,
            off_peak_price: 85.00,
            peak_price: 120.00
          }
        ])

      if (pricingError) {
        console.error('Pricing error:', pricingError)
      }

      setStatus('✅ Basic data created successfully!')
      testConnection() // Refresh the test

    } catch (error) {
      setStatus(`❌ Failed to create data: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Supabase Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <p className="text-lg mb-4">{status}</p>
          
          <div className="space-x-4">
            <Button onClick={testConnection} disabled={loading}>
              {loading ? 'Testing...' : 'Test Connection'}
            </Button>
            <Button onClick={createBasicData} disabled={loading} variant="outline">
              Create Basic Data
            </Button>
          </div>
        </div>

        {Object.keys(details).length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(details, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-blue-800 mb-2">Quick Links:</h3>
          <div className="space-x-4">
            <Link href="/dashboard" className="text-blue-600 hover:underline">Dashboard</Link>
            <Link href="/debug-courts" className="text-blue-600 hover:underline">Debug Courts</Link>
            <Link href="/courts" className="text-blue-600 hover:underline">Courts Page</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TestConnectionPage() {
  return (
    <AdminOnlyPage pageName="Test Connection">
      <TestConnectionPageContent />
    </AdminOnlyPage>
  )
}
