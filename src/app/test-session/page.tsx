'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/providers/AuthProvider'
import { AdminOnlyPage } from '@/components/admin/AdminOnlyPage'

function TestSessionPageContent() {
  const { user, loading: authLoading } = useAuth()
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [refreshCount, setRefreshCount] = useState(0)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      setSessionInfo({
        hasSession: !!session,
        user: session?.user || null,
        error: error?.message || null,
        timestamp: new Date().toISOString(),
        localStorage: typeof window !== 'undefined' ? {
          authToken: localStorage.getItem('sb-sports-venue-auth'),
          hasAuthData: !!localStorage.getItem('sb-sports-venue-auth')
        } : null
      })
    } catch (error) {
      setSessionInfo({
        hasSession: false,
        user: null,
        error: `Exception: ${error}`,
        timestamp: new Date().toISOString()
      })
    }
  }

  const forceRefresh = () => {
    setRefreshCount(prev => prev + 1)
    window.location.reload()
  }

  const clearStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
      alert('Storage cleared! Refresh the page to test.')
    }
  }

  const testBookingCreation = async () => {
    if (!user) {
      alert('Please sign in first')
      return
    }

    try {
      // Get a court
      const { data: courts, error: courtsError } = await supabase
        .from('courts')
        .select('id, name')
        .eq('is_active', true)
        .limit(1)

      if (courtsError || !courts || courts.length === 0) {
        alert(`No courts available: ${courtsError?.message || 'No courts found'}`)
        return
      }

      // Create test booking with proper format
      const bookingData = {
        user_id: user.id,
        court_id: (courts as any[])[0].id,
        booking_date: new Date().toISOString().split('T')[0],
        start_time: '14:00:00', // Proper HH:MM:SS format
        duration_hours: 1,
        total_price: 45.00,
        status: 'confirmed',
        payment_status: 'paid'
      }

      console.log('Creating booking with data:', bookingData)

      const { data, error } = await (supabase as any)
        .from('bookings')
        .insert([bookingData])
        .select()

      if (error) {
        alert(`Booking failed: ${error.message}`)
        console.error('Booking error:', error)
      } else {
        alert(`Booking created successfully! ID: ${data[0].id}`)
        console.log('Booking created:', data[0])
      }
    } catch (error) {
      alert(`Exception: ${error}`)
      console.error('Exception:', error)
    }
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', color: '#333' }}>Session Persistence Test</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={checkSession}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginRight: '1rem',
            fontSize: '1rem'
          }}
        >
          Check Session
        </button>

        <button 
          onClick={forceRefresh}
          style={{
            backgroundColor: '#f59e0b',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginRight: '1rem',
            fontSize: '1rem'
          }}
        >
          Force Refresh ({refreshCount})
        </button>

        <button 
          onClick={clearStorage}
          style={{
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginRight: '1rem',
            fontSize: '1rem'
          }}
        >
          Clear Storage
        </button>

        <button 
          onClick={testBookingCreation}
          disabled={!user}
          style={{
            backgroundColor: '#10b981',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '6px',
            cursor: !user ? 'not-allowed' : 'pointer',
            fontSize: '1rem'
          }}
        >
          Test Booking
        </button>
      </div>

      {/* Auth Provider Status */}
      <div style={{ 
        backgroundColor: user ? '#f0fdf4' : '#fef2f2',
        border: `2px solid ${user ? '#22c55e' : '#ef4444'}`,
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>
          {user ? '✅' : '❌'} Auth Provider Status
        </h3>
        <p><strong>Loading:</strong> {authLoading ? 'Yes' : 'No'}</p>
        <p><strong>User:</strong> {user ? user.email : 'Not signed in'}</p>
        {user && (
          <>
            <p><strong>User ID:</strong> <code>{user.id}</code></p>
            <p><strong>Created:</strong> {user.created_at}</p>
          </>
        )}
      </div>

      {/* Session Info */}
      {sessionInfo && (
        <div style={{ 
          backgroundColor: sessionInfo.hasSession ? '#f0fdf4' : '#fef2f2',
          border: `2px solid ${sessionInfo.hasSession ? '#22c55e' : '#ef4444'}`,
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>
            {sessionInfo.hasSession ? '✅' : '❌'} Direct Session Check
          </h3>
          
          <p><strong>Has Session:</strong> {sessionInfo.hasSession ? 'Yes' : 'No'}</p>
          <p><strong>Timestamp:</strong> {sessionInfo.timestamp}</p>
          
          {sessionInfo.error && (
            <p style={{ color: '#ef4444' }}><strong>Error:</strong> {sessionInfo.error}</p>
          )}
          
          {sessionInfo.user && (
            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '4px', marginTop: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Session User:</h4>
              <p><strong>Email:</strong> {sessionInfo.user.email}</p>
              <p><strong>ID:</strong> <code>{sessionInfo.user.id}</code></p>
              <p><strong>Last Sign In:</strong> {sessionInfo.user.last_sign_in_at}</p>
            </div>
          )}

          {sessionInfo.localStorage && (
            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '4px', marginTop: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Local Storage:</h4>
              <p><strong>Has Auth Data:</strong> {sessionInfo.localStorage.hasAuthData ? 'Yes' : 'No'}</p>
              <p><strong>Auth Token Length:</strong> {sessionInfo.localStorage.authToken?.length || 0}</p>
            </div>
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
          <li>Sign in to your account</li>
          <li>Check that both status boxes show green ✅</li>
          <li>Click &quot;Force Refresh&quot; multiple times</li>
          <li>You should stay signed in after each refresh</li>
          <li>Test booking creation to verify database access</li>
          <li>If you get signed out, there&apos;s a session persistence issue</li>
        </ol>
      </div>
    </div>
  )
}

export default function TestSessionPage() {
  return (
    <AdminOnlyPage pageName="Test Session">
      <TestSessionPageContent />
    </AdminOnlyPage>
  )
}
