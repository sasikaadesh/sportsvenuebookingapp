'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { AdminOnlyPage } from '@/components/admin/AdminOnlyPage'

function SimpleDebugPageContent() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testDatabase = async () => {
    setLoading(true)
    setResults(null)

    try {
      console.log('Testing database connection...')
      
      const { data, error } = await supabase
        .from('courts')
        .select('id, name, type')
        .limit(5)

      if (error) {
        setResults({
          success: false,
          error: error.message,
          data: null
        })
      } else {
        setResults({
          success: true,
          error: null,
          data: data,
          count: data?.length || 0
        })
      }
    } catch (err) {
      setResults({
        success: false,
        error: `Exception: ${err}`,
        data: null
      })
    } finally {
      setLoading(false)
    }
  }

  const testBookingLink = (courtId: string) => {
    const url = `/courts/${courtId}/book`
    console.log('Testing booking link:', url)
    window.open(url, '_blank')
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ marginBottom: '2rem' }}>Simple Debug Page</h1>
      
      <button 
        onClick={testDatabase}
        disabled={loading}
        style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '0.5rem 1rem',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '2rem'
        }}
      >
        {loading ? 'Testing...' : 'Test Database'}
      </button>

      {results && (
        <div style={{ 
          backgroundColor: results.success ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${results.success ? '#22c55e' : '#ef4444'}`,
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '2rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>
            {results.success ? '✅ Success' : '❌ Error'}
          </h3>
          
          {results.error && (
            <p style={{ color: '#ef4444', margin: '0 0 1rem 0' }}>
              <strong>Error:</strong> {results.error}
            </p>
          )}
          
          {results.success && (
            <p style={{ margin: '0 0 1rem 0' }}>
              <strong>Courts found:</strong> {results.count}
            </p>
          )}
          
          {results.data && results.data.length > 0 && (
            <div>
              <h4 style={{ margin: '1rem 0 0.5rem 0' }}>Courts:</h4>
              {results.data.map((court: any, index: number) => (
                <div key={court.id} style={{ 
                  backgroundColor: 'white',
                  padding: '0.5rem',
                  margin: '0.5rem 0',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px'
                }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>{court.name}</strong> ({court.type})
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
                    ID: <code style={{ backgroundColor: '#f3f4f6', padding: '0.2rem' }}>{court.id}</code>
                  </div>
                  <button
                    onClick={() => testBookingLink(court.id)}
                    style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Test Booking Link
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ 
        backgroundColor: '#fef3c7',
        border: '1px solid #f59e0b',
        padding: '1rem',
        borderRadius: '4px'
      }}>
        <h3 style={{ margin: '0 0 1rem 0' }}>Quick Links:</h3>
        <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
          <li><Link href="/courts" style={{ color: '#3b82f6' }}>Courts Page</Link></li>
          <li><Link href="/" style={{ color: '#3b82f6' }}>Home Page</Link></li>
          <li><Link href="/dashboard" style={{ color: '#3b82f6' }}>Dashboard</Link></li>
        </ul>
      </div>
    </div>
  )
}

export default function SimpleDebugPage() {
  return (
    <AdminOnlyPage pageName="Simple Debug">
      <SimpleDebugPageContent />
    </AdminOnlyPage>
  )
}
