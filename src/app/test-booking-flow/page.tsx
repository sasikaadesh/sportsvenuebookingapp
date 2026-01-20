'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/providers/AuthProvider'
import { AdminOnlyPage } from '@/components/admin/AdminOnlyPage'

function TestBookingFlowPageContent() {
  const { user } = useAuth()
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testCompleteBookingFlow = async () => {
    if (!user) {
      setResult({ success: false, error: 'Please sign in first' })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      // Step 1: Get a court
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

      // Step 2: Simulate BookingCalendar data (exactly as it would be passed)
      const mockBookingData = {
        date: new Date().toISOString().split('T')[0], // Today in YYYY-MM-DD format
        startTime: '14:00', // HH:MM format (as passed by BookingCalendar)
        duration: 1,
        price: 45.00
      }

      console.log('Mock booking data from calendar:', mockBookingData)

      // Step 3: Process the booking data (same logic as in booking page)
      const startTime = mockBookingData.startTime || (mockBookingData as any).time
      
      if (!startTime) {
        setResult({ 
          success: false, 
          error: 'Start time is missing from booking data' 
        })
        return
      }

      const bookingData = {
        user_id: user.id,
        court_id: (courts as any[])[0].id,
        booking_date: mockBookingData.date,
        start_time: startTime + ':00', // Convert HH:MM to HH:MM:SS
        duration_hours: mockBookingData.duration,
        total_price: mockBookingData.price,
        status: 'confirmed',
        payment_status: 'paid'
      }

      console.log('Final booking data for database:', bookingData)

      // Step 4: Create booking
      const { data: booking, error: bookingError } = await (supabase as any)
        .from('bookings')
        .insert([bookingData])
        .select()

      if (bookingError) {
        console.error('Booking creation error:', bookingError)
        setResult({ 
          success: false, 
          error: `Booking creation failed: ${bookingError.message}`,
          details: bookingError,
          bookingData: bookingData
        })
        return
      }

      console.log('Booking created successfully:', booking)
      setResult({ 
        success: true, 
        booking: booking[0],
        court: courts[0],
        message: 'Complete booking flow test successful!',
        originalData: mockBookingData,
        processedData: bookingData
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

  const testTimeFormats = () => {
    const testCases = [
      { input: '14:00', expected: '14:00:00' },
      { input: '09:30', expected: '09:30:00' },
      { input: '18:45', expected: '18:45:00' }
    ]

    console.log('Testing time format conversions:')
    testCases.forEach(test => {
      const result = test.input + ':00'
      console.log(`${test.input} -> ${result} (expected: ${test.expected})`)
    })

    setResult({
      success: true,
      message: 'Time format tests completed - check console for results',
      timeTests: testCases.map(test => ({
        input: test.input,
        output: test.input + ':00',
        expected: test.expected,
        correct: (test.input + ':00') === test.expected
      }))
    })
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', color: '#333' }}>Test Complete Booking Flow</h1>
      
      {!user ? (
        <div style={{ 
          backgroundColor: '#fef2f2',
          border: '2px solid #ef4444',
          padding: '1rem',
          borderRadius: '6px',
          marginBottom: '2rem'
        }}>
          <p style={{ margin: 0, color: '#ef4444' }}>
            ❌ Please sign in first to test booking flow
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
          onClick={testTimeFormats}
          style={{
            backgroundColor: '#8b5cf6',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginRight: '1rem',
            fontSize: '1rem'
          }}
        >
          Test Time Formats
        </button>

        <button 
          onClick={testCompleteBookingFlow}
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
          {loading ? 'Testing...' : 'Test Complete Booking Flow'}
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

          {result.timeTests && (
            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '4px', marginTop: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Time Format Tests:</h4>
              {result.timeTests.map((test: any, index: number) => (
                <div key={index} style={{ 
                  padding: '0.5rem', 
                  backgroundColor: test.correct ? '#f0fdf4' : '#fef2f2',
                  margin: '0.25rem 0',
                  borderRadius: '3px'
                }}>
                  <code>{test.input}</code> → <code>{test.output}</code> 
                  {test.correct ? ' ✅' : ' ❌'}
                </div>
              ))}
            </div>
          )}
          
          {result.booking && (
            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '4px', marginTop: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Booking Created:</h4>
              <p><strong>ID:</strong> {result.booking.id}</p>
              <p><strong>Court:</strong> {result.court?.name}</p>
              <p><strong>Date:</strong> {result.booking.booking_date}</p>
              <p><strong>Time:</strong> {result.booking.start_time}</p>
              <p><strong>Duration:</strong> {result.booking.duration_hours} hours</p>
              <p><strong>Price:</strong> ${result.booking.total_price}</p>
            </div>
          )}

          {result.originalData && (
            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '4px', marginTop: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Data Flow:</h4>
              <div style={{ fontSize: '0.9rem' }}>
                <p><strong>Original (from calendar):</strong></p>
                <pre style={{ backgroundColor: '#f3f4f6', padding: '0.5rem', borderRadius: '3px' }}>
                  {JSON.stringify(result.originalData, null, 2)}
                </pre>
                <p><strong>Processed (for database):</strong></p>
                <pre style={{ backgroundColor: '#f3f4f6', padding: '0.5rem', borderRadius: '3px' }}>
                  {JSON.stringify(result.processedData, null, 2)}
                </pre>
              </div>
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
        <h3 style={{ margin: '0 0 1rem 0', color: '#92400e' }}>What This Tests:</h3>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#92400e' }}>
          <li>Time format conversion (HH:MM to HH:MM:SS)</li>
          <li>Property name handling (startTime vs time)</li>
          <li>Complete booking creation flow</li>
          <li>Database constraint validation</li>
          <li>Data flow from calendar to database</li>
        </ul>
      </div>
    </div>
  )
}

export default function TestBookingFlowPage() {
  return (
    <AdminOnlyPage pageName="Test Booking Flow">
      <TestBookingFlowPageContent />
    </AdminOnlyPage>
  )
}
