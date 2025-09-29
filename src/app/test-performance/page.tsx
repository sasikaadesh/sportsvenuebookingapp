'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'

export default function TestPerformancePage() {
  const { user, loading: authLoading } = useAuth()
  const [sessionTests, setSessionTests] = useState<any[]>([])
  const [loadingTests, setLoadingTests] = useState<any[]>([])
  const [refreshCount, setRefreshCount] = useState(0)

  useEffect(() => {
    runPerformanceTests()
  }, [])

  const runPerformanceTests = () => {
    // Test loading times
    const startTime = Date.now()
    
    const loadingTest = {
      timestamp: new Date().toISOString(),
      authLoadingTime: authLoading ? 'Still loading...' : `${Date.now() - startTime}ms`,
      userStatus: user ? 'Authenticated' : 'Not authenticated',
      refreshCount: refreshCount
    }
    
    setLoadingTests(prev => [loadingTest, ...prev.slice(0, 9)]) // Keep last 10 tests
  }

  const testSessionPersistence = () => {
    const sessionTest = {
      timestamp: new Date().toISOString(),
      beforeRefresh: {
        user: user ? user.email : 'No user',
        authLoading: authLoading,
        localStorage: typeof window !== 'undefined' ? {
          hasAuthToken: !!localStorage.getItem('sb-sports-venue-auth-token'),
          tokenLength: localStorage.getItem('sb-sports-venue-auth-token')?.length || 0
        } : null
      }
    }
    
    setSessionTests(prev => [sessionTest, ...prev.slice(0, 4)]) // Keep last 5 tests
    
    // Force refresh
    setTimeout(() => {
      setRefreshCount(prev => prev + 1)
      window.location.reload()
    }, 1000)
  }

  const clearAllStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
      alert('All storage cleared! The page will refresh and you should be signed out.')
      setTimeout(() => window.location.reload(), 1000)
    }
  }

  const measurePageLoadTimes = () => {
    const pages = ['/courts', '/dashboard', '/']
    
    pages.forEach(page => {
      const startTime = Date.now()
      const link = document.createElement('a')
      link.href = page
      link.target = '_blank'
      link.click()
      
      console.log(`Opened ${page} at ${Date.now() - startTime}ms`)
    })
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', color: '#333' }}>Performance & Session Test</h1>
      
      {/* Current Status */}
      <div style={{ 
        backgroundColor: user ? '#f0fdf4' : '#fef2f2',
        border: `2px solid ${user ? '#22c55e' : '#ef4444'}`,
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>
          Current Status (Refresh #{refreshCount})
        </h3>
        <p><strong>Auth Loading:</strong> {authLoading ? 'Yes' : 'No'}</p>
        <p><strong>User:</strong> {user ? user.email : 'Not signed in'}</p>
        <p><strong>Page Load Time:</strong> {typeof window !== 'undefined' ? `${Date.now() - window.performance.timeOrigin}ms` : 'N/A'}</p>
        {typeof window !== 'undefined' && (
          <p><strong>Local Storage:</strong> {localStorage.getItem('sb-sports-venue-auth-token') ? 'Has auth token' : 'No auth token'}</p>
        )}
      </div>

      {/* Test Controls */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={testSessionPersistence}
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
          Test Session Persistence (Refresh)
        </button>

        <button 
          onClick={runPerformanceTests}
          style={{
            backgroundColor: '#10b981',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginRight: '1rem',
            fontSize: '1rem'
          }}
        >
          Run Performance Test
        </button>

        <button 
          onClick={measurePageLoadTimes}
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
          Test Page Load Times
        </button>

        <button 
          onClick={clearAllStorage}
          style={{
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Clear Storage & Test
        </button>
      </div>

      {/* Session Persistence Tests */}
      {sessionTests.length > 0 && (
        <div style={{ 
          backgroundColor: 'white',
          border: '2px solid #e5e7eb',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Session Persistence Tests</h3>
          {sessionTests.map((test, index) => (
            <div key={index} style={{ 
              backgroundColor: '#f9fafb',
              padding: '1rem',
              borderRadius: '4px',
              marginBottom: '1rem',
              border: '1px solid #e5e7eb'
            }}>
              <p><strong>Test #{sessionTests.length - index}</strong> - {test.timestamp}</p>
              <p><strong>Before Refresh:</strong></p>
              <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                <li>User: {test.beforeRefresh.user}</li>
                <li>Auth Loading: {test.beforeRefresh.authLoading ? 'Yes' : 'No'}</li>
                <li>Has Auth Token: {test.beforeRefresh.localStorage?.hasAuthToken ? 'Yes' : 'No'}</li>
                <li>Token Length: {test.beforeRefresh.localStorage?.tokenLength || 0}</li>
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Performance Tests */}
      {loadingTests.length > 0 && (
        <div style={{ 
          backgroundColor: 'white',
          border: '2px solid #e5e7eb',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Performance Tests</h3>
          {loadingTests.map((test, index) => (
            <div key={index} style={{ 
              backgroundColor: '#f9fafb',
              padding: '1rem',
              borderRadius: '4px',
              marginBottom: '1rem',
              border: '1px solid #e5e7eb'
            }}>
              <p><strong>Test #{loadingTests.length - index}</strong> - {test.timestamp}</p>
              <p><strong>Auth Loading Time:</strong> {test.authLoadingTime}</p>
              <p><strong>User Status:</strong> {test.userStatus}</p>
              <p><strong>Refresh Count:</strong> {test.refreshCount}</p>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div style={{ 
        backgroundColor: '#fef3c7',
        border: '2px solid #f59e0b',
        padding: '1.5rem',
        borderRadius: '8px'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#92400e' }}>Test Instructions:</h3>
        <ol style={{ margin: 0, paddingLeft: '1.5rem', color: '#92400e' }}>
          <li><strong>Session Persistence:</strong> Sign in, then click &quot;Test Session Persistence&quot; multiple times. You should stay signed in after each refresh.</li>
          <li><strong>Performance:</strong> Click &quot;Run Performance Test&quot; to measure loading times. Auth should complete quickly.</li>
          <li><strong>Page Load Times:</strong> Click &quot;Test Page Load Times&quot; to open courts, dashboard, and home pages in new tabs. They should load quickly.</li>
          <li><strong>Storage Test:</strong> Click &quot;Clear Storage &amp; Test&quot; to verify sign-out behavior works correctly.</li>
        </ol>
        
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fbbf24', borderRadius: '4px' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#92400e' }}>Expected Results:</h4>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#92400e' }}>
            <li>✅ Session persists across refreshes</li>
            <li>✅ Auth loading completes in under 2 seconds</li>
            <li>✅ Pages load in under 5 seconds</li>
            <li>✅ Storage clearing signs you out</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
