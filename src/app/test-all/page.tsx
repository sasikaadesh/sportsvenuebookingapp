'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/providers/AuthProvider'

export default function TestAllPage() {
  const { user, loading: authLoading } = useAuth()
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const runAllTests = async () => {
    setLoading(true)
    const testResults: any = {}

    try {
      // Test 1: Auth Status
      testResults.auth = {
        loading: authLoading,
        user: user ? { id: user.id, email: user.email } : null,
        success: !authLoading && user !== null
      }

      // Test 2: Courts Query
      try {
        const { data: courts, error: courtsError } = await supabase
          .from('courts')
          .select('id, name, type, is_active')
          .eq('is_active', true)

        testResults.courts = {
          success: !courtsError,
          count: courts?.length || 0,
          data: courts?.slice(0, 3) || [],
          error: courtsError?.message || null
        }
      } catch (err) {
        testResults.courts = {
          success: false,
          count: 0,
          data: [],
          error: `Exception: ${err}`
        }
      }

      // Test 3: Users Query (if signed in)
      if (user) {
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, email, full_name')
            .eq('id', user.id)
            .single()

          testResults.userProfile = {
            success: !userError,
            data: userData,
            error: userError?.message || null
          }
        } catch (err) {
          testResults.userProfile = {
            success: false,
            data: null,
            error: `Exception: ${err}`
          }
        }
      }

      // Test 4: Bookings Query (if signed in)
      if (user) {
        try {
          const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select('id, court_id, booking_date, status')
            .eq('user_id', user.id)

          testResults.bookings = {
            success: !bookingsError,
            count: bookings?.length || 0,
            data: bookings || [],
            error: bookingsError?.message || null
          }
        } catch (err) {
          testResults.bookings = {
            success: false,
            count: 0,
            data: [],
            error: `Exception: ${err}`
          }
        }
      }

      setResults(testResults)
    } catch (error) {
      console.error('Test error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      runAllTests()
    }
  }, [authLoading, user])

  const testBookingCreation = async () => {
    if (!user) {
      alert('Please sign in first')
      return
    }

    try {
      // Get first court
      const { data: courts } = await supabase
        .from('courts')
        .select('id')
        .eq('is_active', true)
        .limit(1)

      if (!courts || courts.length === 0) {
        alert('No courts available')
        return
      }

      // Create test booking
      const { data, error } = await (supabase as any)
        .from('bookings')
        .insert([{
          user_id: user.id,
          court_id: (courts as any[])[0].id,
          booking_date: new Date().toISOString().split('T')[0],
          start_time: '14:00',
          duration_hours: 1,
          total_price: 45.00,
          status: 'confirmed',
          payment_status: 'paid'
        }])
        .select()

      if (error) {
        alert(`Booking creation failed: ${error.message}`)
      } else {
        alert('Test booking created successfully!')
        runAllTests() // Refresh results
      }
    } catch (error) {
      alert(`Exception: ${error}`)
    }
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', color: '#333' }}>Complete System Test</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={runAllTests}
          disabled={loading}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginRight: '1rem',
            fontSize: '1rem'
          }}
        >
          {loading ? 'Testing...' : 'Run All Tests'}
        </button>

        {user && (
          <button 
            onClick={testBookingCreation}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Test Booking Creation
          </button>
        )}
      </div>

      {Object.keys(results).length > 0 && (
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          
          {/* Auth Test */}
          <div style={{ 
            backgroundColor: results.auth?.success ? '#f0fdf4' : '#fef2f2',
            border: `2px solid ${results.auth?.success ? '#22c55e' : '#ef4444'}`,
            padding: '1.5rem',
            borderRadius: '8px'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>
              {results.auth?.success ? '✅' : '❌'} Authentication
            </h3>
            <p><strong>Loading:</strong> {results.auth?.loading ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {results.auth?.user ? results.auth.user.email : 'Not signed in'}</p>
            {results.auth?.user && (
              <p><strong>User ID:</strong> <code>{results.auth.user.id}</code></p>
            )}
          </div>

          {/* Courts Test */}
          <div style={{ 
            backgroundColor: results.courts?.success ? '#f0fdf4' : '#fef2f2',
            border: `2px solid ${results.courts?.success ? '#22c55e' : '#ef4444'}`,
            padding: '1.5rem',
            borderRadius: '8px'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>
              {results.courts?.success ? '✅' : '❌'} Courts Database
            </h3>
            <p><strong>Count:</strong> {results.courts?.count || 0}</p>
            {results.courts?.error && (
              <p style={{ color: '#ef4444' }}><strong>Error:</strong> {results.courts.error}</p>
            )}
            {results.courts?.data && results.courts.data.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <strong>Sample Courts:</strong>
                <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                  {results.courts.data.map((court: any) => (
                    <li key={court.id} style={{ fontSize: '0.9rem' }}>
                      {court.name} ({court.type})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* User Profile Test */}
          {user && (
            <div style={{ 
              backgroundColor: results.userProfile?.success ? '#f0fdf4' : '#fef2f2',
              border: `2px solid ${results.userProfile?.success ? '#22c55e' : '#ef4444'}`,
              padding: '1.5rem',
              borderRadius: '8px'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>
                {results.userProfile?.success ? '✅' : '❌'} User Profile
              </h3>
              {results.userProfile?.data ? (
                <div>
                  <p><strong>Email:</strong> {results.userProfile.data.email}</p>
                  <p><strong>Name:</strong> {results.userProfile.data.full_name || 'Not set'}</p>
                </div>
              ) : (
                <p style={{ color: '#ef4444' }}>
                  <strong>Error:</strong> {results.userProfile?.error || 'No data'}
                </p>
              )}
            </div>
          )}

          {/* Bookings Test */}
          {user && (
            <div style={{ 
              backgroundColor: results.bookings?.success ? '#f0fdf4' : '#fef2f2',
              border: `2px solid ${results.bookings?.success ? '#22c55e' : '#ef4444'}`,
              padding: '1.5rem',
              borderRadius: '8px'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>
                {results.bookings?.success ? '✅' : '❌'} Bookings
              </h3>
              <p><strong>Count:</strong> {results.bookings?.count || 0}</p>
              {results.bookings?.error && (
                <p style={{ color: '#ef4444' }}><strong>Error:</strong> {results.bookings.error}</p>
              )}
              {results.bookings?.data && results.bookings.data.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <strong>Recent Bookings:</strong>
                  <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                    {results.bookings.data.slice(0, 3).map((booking: any) => (
                      <li key={booking.id} style={{ fontSize: '0.9rem' }}>
                        {booking.booking_date} - {booking.status}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div style={{ 
        backgroundColor: '#fef3c7',
        border: '2px solid #f59e0b',
        padding: '1.5rem',
        borderRadius: '8px',
        marginTop: '2rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#92400e' }}>Instructions:</h3>
        <ol style={{ margin: 0, paddingLeft: '1.5rem', color: '#92400e' }}>
          <li>Run the complete database setup SQL script in Supabase first</li>
          <li>Sign in to test user-specific features</li>
          <li>All tests should show green checkmarks</li>
          <li>If any test fails, check the error messages</li>
        </ol>
      </div>
    </div>
  )
}
