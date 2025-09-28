'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'

export default function DebugCourtsIdsPage() {
  const [courts, setCourts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('Loading courts...')

  useEffect(() => {
    loadCourts()
  }, [])

  const loadCourts = async () => {
    try {
      setLoading(true)
      setStatus('Fetching courts from database...')

      const { data, error } = await supabase
        .from('courts')
        .select('id, name, type, is_active')
        .order('created_at', { ascending: false })

      if (error) {
        setStatus(`❌ Error: ${error.message}`)
        console.error('Error loading courts:', error)
        return
      }

      setCourts(data || [])
      setStatus(`✅ Found ${data?.length || 0} courts`)
      console.log('Courts loaded:', data)

    } catch (error) {
      setStatus(`❌ Exception: ${error}`)
      console.error('Exception:', error)
    } finally {
      setLoading(false)
    }
  }

  const testCourtLink = (courtId: string) => {
    const url = `/courts/${courtId}/book`
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug: Court IDs</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <p className="text-lg mb-4">{status}</p>
          
          <Button onClick={loadCourts} disabled={loading}>
            {loading ? 'Loading...' : 'Reload Courts'}
          </Button>
        </div>

        {courts.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Courts in Database</h2>
            <div className="space-y-4">
              {courts.map((court, index) => (
                <div key={court.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">{court.name}</h3>
                      <p className="text-sm text-gray-600">Type: {court.type}</p>
                      <p className="text-sm text-gray-600">Active: {court.is_active ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>ID:</strong> <code className="bg-gray-200 px-1 rounded">{court.id}</code>
                      </p>
                      <div className="space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => testCourtLink(court.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Test Booking Link
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigator.clipboard.writeText(court.id)}
                        >
                          Copy ID
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500">
                      <strong>Booking URL:</strong> 
                      <code className="ml-1 bg-gray-200 px-1 rounded text-xs">
                        /courts/{court.id}/book
                      </code>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && courts.length === 0 && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Courts Found</h3>
            <p className="text-gray-600 mb-4">There are no courts in the database.</p>
            <Button onClick={loadCourts}>
              Retry Loading
            </Button>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-yellow-800 mb-2">Debug Info:</h3>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• This page shows the actual court IDs in your database</li>
            <li>• Click "Test Booking Link" to test if the booking page works</li>
            <li>• If booking page shows "Court Not Found", there's an ID mismatch</li>
            <li>• The court IDs should match what's used in the courts page links</li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <h3 className="font-semibold text-blue-800 mb-2">Quick Links:</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• <a href="/courts" className="underline">Main Courts Page</a></li>
            <li>• <a href="/courts-diagnostic" className="underline">Courts Diagnostic</a></li>
            <li>• <a href="/" className="underline">Home Page</a></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
