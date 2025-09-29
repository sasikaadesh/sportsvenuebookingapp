'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/providers/AuthProvider'

export default function TestBookingSimplePage() {
  const { user } = useAuth()
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const createTestBooking = async () => {
    if (!user) {
      setResult({ success: false, error: 'Please sign in first' })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      // Step 1: Get a court
      console.log('Step 1: Getting courts...')
      const { data: courts, error: courtsError } = await supabase
        .from('courts')
        .select('id, name')
        .eq('is_active', true)
        .limit(1)

      if (courtsError || !courts || courts.length === 0) {
        setResult({ 
          success: false, 
          error: `No courts available: ${courtsError?.message || 'No courts found'}` 
        })
        return
      }

      console.log('Found court:', courts[0])

      // Step 2: Prepare booking data with proper formatting
      const today = new Date()
      const bookingDate = today.toISOString().split('T')[0] // YYYY-MM-DD format
      const startTime = '14:00:00' // HH:MM:SS format for TIME type
      
      const bookingData = {
        user_id: user.id,
        court_id: (courts as any[])[0].id,
        booking_date: bookingDate,
        start_time: startTime,
        duration_hours: 1,
        total_price: 45.00,
        status: 'confirmed',
        payment_status: 'paid'
      }

      console.log('Step 2: Creating booking with data:', bookingData)

      // Step 3: Create booking
      const { data: booking, error: bookingError } = await (supabase as any)
        .from('bookings')
        .insert([bookingData])
        .select()

      if (bookingError) {
        console.error('Booking creation error:', bookingError)
        setResult({ 
          success: false, 
          error: `Booking creation failed: ${bookingError.message}`,
          details: bookingError
        })
        return
      }

      console.log('Booking created successfully:', booking)
      setResult({ 
        success: true, 
        booking: booking[0],
        court: courts[0],
        message: 'Test booking created successfully!'
      })

    } catch (error) {
      console.error('Exception:', error)
      setResult({ 
        success: false, 
        error: `Exception: ${error}` 
      })
    } finally {
      setLoading(false)
    }
  }

  const checkUserProfile = async () => {
    if (!user) {
      setResult({ success: false, error: 'Please sign in first' })
      return
    }

    try {
      // Check if user exists in users table
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (userError && userError.code === 'PGRST116') {
        // User doesn't exist, create profile
        console.log('Creating user profile...')
        const { data: newProfile, error: createError } = await (supabase as any)
          .from('users')
          .insert([{
            id: user.id,
            email: user.email || 'unknown@example.com',
            full_name: user.user_metadata?.full_name || 'Test User'
          }])
          .select()

        if (createError) {
          setResult({ 
            success: false, 
            error: `Failed to create user profile: ${createError.message}` 
          })
          return
        }

        setResult({ 
          success: true, 
          message: 'User profile created successfully!',
          profile: newProfile[0]
        })
      } else if (userError) {
        setResult({ 
          success: false, 
          error: `User profile error: ${userError.message}` 
        })
      } else {
        setResult({ 
          success: true, 
          message: 'User profile exists!',
          profile: userProfile
        })
      }
    } catch (error) {
      setResult({ 
        success: false, 
        error: `Exception: ${error}` 
      })
    }
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', color: '#333' }}>Test Booking Creation</h1>
      
      {!user ? (
        <div style={{ 
          backgroundColor: '#fef2f2',
          border: '2px solid #ef4444',
          padding: '1rem',
          borderRadius: '6px',
          marginBottom: '2rem'
        }}>
          <p style={{ margin: 0, color: '#ef4444' }}>
            ❌ Please sign in first to test booking creation
          </p>
        </div>
      ) : (
        <div style={{ 
          backgroundColor: '#f0fdf4',
          border: '2px solid #22c55e',
          padding: '1rem',
          borderRadius: '6px',
          marginBottom: '2rem'
        }}>
          <p style={{ margin: 0, color: '#22c55e' }}>
            ✅ Signed in as: {user.email}
          </p>
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={checkUserProfile}
          disabled={!user || loading}
          style={{
            backgroundColor: '#8b5cf6',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '6px',
            cursor: !user || loading ? 'not-allowed' : 'pointer',
            marginRight: '1rem',
            fontSize: '1rem'
          }}
        >
          Check/Create User Profile
        </button>

        <button 
          onClick={createTestBooking}
          disabled={!user || loading}
          style={{
            backgroundColor: '#10b981',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '6px',
            cursor: !user || loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem'
          }}
        >
          {loading ? 'Creating...' : 'Create Test Booking'}
        </button>
      </div>

      {result && (
        <div style={{ 
          backgroundColor: result.success ? '#f0fdf4' : '#fef2f2',
          border: `2px solid ${result.success ? '#22c55e' : '#ef4444'}`,
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>
            {result.success ? '✅ Success' : '❌ Error'}
          </h3>
          
          {result.message && (
            <p style={{ margin: '0 0 1rem 0', fontWeight: 'bold' }}>
              {result.message}
            </p>
          )}
          
          {result.error && (
            <p style={{ color: '#ef4444', margin: '0 0 1rem 0' }}>
              <strong>Error:</strong> {result.error}
            </p>
          )}
          
          {result.booking && (
            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '4px', marginTop: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Booking Details:</h4>
              <p><strong>ID:</strong> {result.booking.id}</p>
              <p><strong>Court:</strong> {result.court?.name}</p>
              <p><strong>Date:</strong> {result.booking.booking_date}</p>
              <p><strong>Time:</strong> {result.booking.start_time}</p>
              <p><strong>Duration:</strong> {result.booking.duration_hours} hours</p>
              <p><strong>Price:</strong> ${result.booking.total_price}</p>
              <p><strong>Status:</strong> {result.booking.status}</p>
            </div>
          )}

          {result.profile && (
            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '4px', marginTop: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>User Profile:</h4>
              <p><strong>ID:</strong> {result.profile.id}</p>
              <p><strong>Email:</strong> {result.profile.email}</p>
              <p><strong>Name:</strong> {result.profile.full_name}</p>
            </div>
          )}
          
          {result.details && (
            <details style={{ marginTop: '1rem' }}>
              <summary style={{ cursor: 'pointer', color: '#666' }}>Show Error Details</summary>
              <pre style={{ 
                backgroundColor: '#f3f4f6', 
                padding: '0.5rem', 
                borderRadius: '4px', 
                fontSize: '0.8rem',
                overflow: 'auto',
                marginTop: '0.5rem'
              }}>
                {JSON.stringify(result.details, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}

      <div style={{ 
        backgroundColor: '#fef3c7',
        border: '2px solid #f59e0b',
        padding: '1.5rem',
        borderRadius: '8px'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#92400e' }}>Instructions:</h3>
        <ol style={{ margin: 0, paddingLeft: '1.5rem', color: '#92400e' }}>
          <li>Make sure you&apos;ve run the emergency database setup</li>
          <li>Sign in to your account first</li>
          <li>Click &quot;Check/Create User Profile&quot; first</li>
          <li>Then click &quot;Create Test Booking&quot;</li>
          <li>Check for any error messages</li>
        </ol>
      </div>
    </div>
  )
}
