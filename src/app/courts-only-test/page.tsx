'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/Button'

// Create a fresh client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const client = createClient(supabaseUrl, supabaseKey)

export default function CourtsOnlyTestPage() {
  const [status, setStatus] = useState('Ready to test courts table only...')
  const [courts, setCourts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const testCourtsOnly = async () => {
    setLoading(true)
    setStatus('Testing courts table directly...')
    
    try {
      console.log('Testing courts table with URL:', supabaseUrl)
      
      // Only query courts table - avoid users table completely
      const { data, error } = await client
        .from('courts')
        .select('id, name, type, description, is_active, images, amenities')
        .limit(20)

      if (error) {
        setStatus(`❌ Courts Error: ${error.message}`)
        console.error('Courts error:', error)
      } else {
        setStatus(`✅ Courts Success! Found ${data?.length || 0} courts`)
        setCourts(data || [])
        console.log('Courts data:', data)
      }
    } catch (error) {
      setStatus(`❌ Exception: ${error}`)
      console.error('Exception:', error)
    } finally {
      setLoading(false)
    }
  }

  const testPricingRules = async () => {
    setLoading(true)
    setStatus('Testing pricing rules...')
    
    try {
      const { data, error } = await client
        .from('pricing_rules')
        .select('*')
        .limit(10)

      if (error) {
        setStatus(`❌ Pricing Error: ${error.message}`)
        console.error('Pricing error:', error)
      } else {
        setStatus(`✅ Pricing Success! Found ${data?.length || 0} pricing rules`)
        console.log('Pricing data:', data)
      }
    } catch (error) {
      setStatus(`❌ Pricing Exception: ${error}`)
      console.error('Pricing exception:', error)
    } finally {
      setLoading(false)
    }
  }

  const createTestCourt = async () => {
    setLoading(true)
    setStatus('Creating test court...')
    
    try {
      const { data, error } = await client
        .from('courts')
        .insert({
          name: `Test Court ${Date.now()}`,
          type: 'tennis',
          description: 'Test court created from app',
          images: ['https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
          amenities: ['Test Amenity'],
          is_active: true
        })
        .select()
        .single()

      if (error) {
        setStatus(`❌ Create Error: ${error.message}`)
        console.error('Create error:', error)
      } else {
        setStatus(`✅ Court Created! ID: ${data.id}`)
        console.log('Created court:', data)
        // Refresh courts list
        testCourtsOnly()
      }
    } catch (error) {
      setStatus(`❌ Create Exception: ${error}`)
      console.error('Create exception:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Courts Only Test</h1>
        <p className="text-gray-600 mb-6">This page only tests the courts table to avoid RLS issues with users table.</p>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Status</h2>
          <p className="text-lg mb-4">{status}</p>
          
          <div className="space-x-4 mb-4">
            <Button onClick={testCourtsOnly} disabled={loading}>
              {loading ? 'Testing...' : 'Test Courts Table'}
            </Button>
            <Button onClick={testPricingRules} disabled={loading} variant="outline">
              Test Pricing Rules
            </Button>
            <Button onClick={createTestCourt} disabled={loading} variant="outline">
              Create Test Court
            </Button>
          </div>

          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            <p><strong>Supabase URL:</strong> {supabaseUrl}</p>
            <p><strong>API Key:</strong> {supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'Missing'}</p>
          </div>
        </div>

        {courts.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Courts Found ({courts.length})</h2>
            <div className="grid gap-4">
              {courts.map((court, index) => (
                <div key={court.id || index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{court.name}</h3>
                      <p className="text-sm text-gray-600">Type: {court.type}</p>
                      <p className="text-sm text-gray-600">ID: {court.id}</p>
                      <p className="text-sm text-gray-600">Active: {court.is_active ? 'Yes' : 'No'}</p>
                      {court.description && (
                        <p className="text-sm mt-2">{court.description}</p>
                      )}
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
                  {court.amenities && court.amenities.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">Amenities: {court.amenities.join(', ')}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-red-800 mb-2">🚨 Emergency Fix Instructions:</h3>
          <ol className="text-red-700 text-sm space-y-1">
            <li>1. Go to your Supabase Dashboard SQL Editor</li>
            <li>2. Copy and paste the emergency-disable-rls.sql script</li>
            <li>3. Run the script to disable all RLS policies</li>
            <li>4. Come back and click &quot;Test Courts Table&quot;</li>
            <li>5. If successful, the main app should work</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
