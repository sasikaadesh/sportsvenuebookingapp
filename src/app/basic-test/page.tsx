'use client'

import { useState } from 'react'

export default function BasicTestPage() {
  const [message, setMessage] = useState('Page loaded successfully!')
  const [count, setCount] = useState(0)

  const testBasicFunction = () => {
    setCount(count + 1)
    setMessage(`Button clicked ${count + 1} times`)
  }

  const testSupabaseImport = async () => {
    try {
      setMessage('Testing Supabase import...')
      
      // Dynamic import to avoid blocking
      const { supabase } = await import('@/lib/supabase')
      setMessage('✅ Supabase imported successfully')
      
      // Test basic query
      const { data, error } = await supabase
        .from('courts')
        .select('count')
        .limit(1)
      
      if (error) {
        setMessage(`❌ Supabase error: ${error.message}`)
      } else {
        setMessage('✅ Supabase query successful')
      }
    } catch (error) {
      setMessage(`❌ Import error: ${error}`)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '2rem', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ color: '#333', marginBottom: '1rem' }}>
          Basic Test Page
        </h1>
        
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          This is a minimal test page with no complex imports or components.
        </p>

        <div style={{ marginBottom: '1rem' }}>
          <strong>Status:</strong> {message}
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <button 
            onClick={testBasicFunction}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '1rem'
            }}
          >
            Test Basic Function
          </button>

          <button 
            onClick={testSupabaseImport}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Test Supabase
          </button>
        </div>

        <div style={{ 
          backgroundColor: '#f3f4f6', 
          padding: '1rem', 
          borderRadius: '4px',
          marginBottom: '2rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>Environment Check:</h3>
          <p><strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Missing'}</p>
          <p><strong>Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}</p>
          <p><strong>Window:</strong> {typeof window !== 'undefined' ? 'Available' : 'Not available'}</p>
        </div>

        <div style={{ 
          backgroundColor: '#fef3c7', 
          padding: '1rem', 
          borderRadius: '4px',
          border: '1px solid #f59e0b'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#92400e' }}>Debug Steps:</h3>
          <ol style={{ margin: 0, color: '#92400e' }}>
            <li>If this page loads → React is working</li>
            <li>If "Test Basic Function" works → JavaScript is working</li>
            <li>If "Test Supabase" works → Supabase connection is working</li>
            <li>If this page doesn't load → There's a fundamental build issue</li>
          </ol>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h3>Quick Links:</h3>
          <ul>
            <li><a href="/courts" style={{ color: '#3b82f6' }}>Main Courts Page</a></li>
            <li><a href="/simple-courts" style={{ color: '#3b82f6' }}>Simple Courts Page</a></li>
            <li><a href="/courts-test" style={{ color: '#3b82f6' }}>Courts Test Page</a></li>
            <li><a href="/dashboard" style={{ color: '#3b82f6' }}>Dashboard</a></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
