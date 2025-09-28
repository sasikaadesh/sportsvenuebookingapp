'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/Button'

// Create a simple client for testing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const testClient = createClient(supabaseUrl, supabaseKey)

export default function SimpleTestPage() {
  const [courts, setCourts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('Ready to test')

  const testDirectConnection = async () => {
    setLoading(true)
    setStatus('Testing direct connection to courts table...')
    
    try {
      console.log('Testing with URL:', supabaseUrl)
      console.log('Testing with Key:', supabaseKey ? 'Set' : 'Missing')
      
      const { data, error } = await testClient
        .from('courts')
        .select('*')
      
      if (error) {
        setStatus(`❌ Error: ${error.message}`)
        console.error('Supabase error:', error)
      } else {
        setStatus(`✅ Success! Found ${data?.length || 0} courts`)
        setCourts(data || [])
        console.log('Courts data:', data)
      }
    } catch (error) {
      setStatus(`❌ Connection error: ${error}`)
      console.error('Connection error:', error)
    } finally {
      setLoading(false)
    }
  }

  const testWithoutRLS = async () => {
    setLoading(true)
    setStatus('Testing without RLS policies...')
    
    try {
      // Try a simple query that shouldn't trigger RLS
      const response = await fetch(`${supabaseUrl}/rest/v1/courts?select=*`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        setStatus(`❌ HTTP Error: ${response.status} - ${errorText}`)
        return
      }
      
      const data = await response.json()
      setStatus(`✅ Direct API Success! Found ${data?.length || 0} courts`)
      setCourts(data || [])
      console.log('Direct API data:', data)
      
    } catch (error) {
      setStatus(`❌ Direct API error: ${error}`)
      console.error('Direct API error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Simple Supabase Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Test</h2>
          <p className="text-lg mb-4">{status}</p>
          
          <div className="space-x-4 mb-4">
            <Button onClick={testDirectConnection} disabled={loading}>
              {loading ? 'Testing...' : 'Test Supabase Client'}
            </Button>
            <Button onClick={testWithoutRLS} disabled={loading} variant="outline">
              {loading ? 'Testing...' : 'Test Direct API'}
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            <p>URL: {supabaseUrl}</p>
            <p>Key: {supabaseKey ? 'Set' : 'Missing'}</p>
          </div>
        </div>

        {courts.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Courts Found ({courts.length})</h2>
            <div className="space-y-4">
              {courts.map((court, index) => (
                <div key={court.id || index} className="border rounded-lg p-4">
                  <h3 className="font-semibold">{court.name}</h3>
                  <p className="text-sm text-gray-600">Type: {court.type}</p>
                  <p className="text-sm text-gray-600">ID: {court.id}</p>
                  <p className="text-sm text-gray-600">Active: {court.is_active ? 'Yes' : 'No'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
          <ol className="text-blue-700 text-sm space-y-1">
            <li>1. First run the RLS fix script in Supabase SQL Editor</li>
            <li>2. Try "Test Supabase Client" button</li>
            <li>3. If that fails, try "Test Direct API" button</li>
            <li>4. Check browser console for detailed error messages</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
