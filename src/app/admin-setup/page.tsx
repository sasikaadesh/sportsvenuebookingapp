'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { makeCurrentUserAdmin, checkAdminRole, getAdminEmails, isAdminEmail } from '@/lib/admin'

export default function AdminSetupPage() {
  const { user } = useAuth()
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleMakeAdmin = async () => {
    if (!user) {
      setResult({ success: false, error: 'Please sign in first' })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const adminResult = await makeCurrentUserAdmin()
      setResult(adminResult)
    } catch (error) {
      setResult({ 
        success: false, 
        error: `Exception: ${error}` 
      })
    } finally {
      setLoading(false)
    }
  }

  const checkAdminStatus = async () => {
    if (!user) {
      setResult({ success: false, error: 'Please sign in first' })
      return
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, role')
        .eq('id', user.id)
        .single()

      if (error) {
        if (error.message?.includes('role')) {
          setResult({ 
            success: false, 
            error: 'Database schema issue: role column not found',
            suggestion: 'Run the database setup script first: fix-role-column-immediate.sql'
          })
        } else {
          setResult({ 
            success: false, 
            error: `User not found in database: ${error.message}`,
            suggestion: 'Try "Make Me Admin" to create your admin profile'
          })
        }
      } else {
        setResult({ 
          success: true, 
          message: 'User profile found!',
          user: data,
          isAdmin: data.role === 'admin'
        })
      }
    } catch (error) {
      setResult({ 
        success: false, 
        error: `Exception: ${error}` 
      })
    }
  }

  const testAdminAccess = () => {
    window.open('/admin', '_blank')
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', color: '#333' }}>Admin Setup</h1>
      
      {!user ? (
        <div style={{ 
          backgroundColor: '#fef2f2',
          border: '2px solid #ef4444',
          padding: '1rem',
          borderRadius: '6px',
          marginBottom: '2rem'
        }}>
          <p style={{ margin: 0, color: '#ef4444' }}>
            ❌ Please sign in first to set up admin access
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
          <p style={{ margin: '0 0 0.5rem 0', color: '#22c55e' }}>
            ✅ Signed in as: {user.email}
          </p>
          {user.email && isAdminEmail(user.email) && (
            <p style={{ margin: 0, color: '#22c55e', fontSize: '0.9rem' }}>
              🎯 This email is configured as admin in environment variables
            </p>
          )}
        </div>
      )}

      {/* Admin Emails Configuration */}
      <div style={{ 
        backgroundColor: '#f8fafc',
        border: '2px solid #64748b',
        padding: '1rem',
        borderRadius: '6px',
        marginBottom: '2rem'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#334155' }}>Configured Admin Emails:</h3>
        <div style={{ fontSize: '0.9rem', color: '#475569' }}>
          {getAdminEmails().map((email, index) => (
            <div key={index} style={{ margin: '0.25rem 0' }}>
              📧 {email}
            </div>
          ))}
        </div>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
          Users with these emails will automatically get admin privileges when they sign in.
        </p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={checkAdminStatus}
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
          Check Admin Status
        </button>

        <button 
          onClick={handleMakeAdmin}
          disabled={!user || loading}
          style={{
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '6px',
            cursor: !user || loading ? 'not-allowed' : 'pointer',
            marginRight: '1rem',
            fontSize: '1rem'
          }}
        >
          {loading ? 'Processing...' : 'Make Me Admin'}
        </button>

        <button 
          onClick={testAdminAccess}
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
          Test Admin Access
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

          {result.suggestion && (
            <p style={{ color: '#f59e0b', margin: '0 0 1rem 0' }}>
              <strong>Suggestion:</strong> {result.suggestion}
            </p>
          )}

          {result.user && (
            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '4px', marginTop: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>User Profile:</h4>
              <p><strong>ID:</strong> {result.user.id}</p>
              <p><strong>Email:</strong> {result.user.email}</p>
              <p><strong>Name:</strong> {result.user.full_name}</p>
              <p><strong>Role:</strong> <span style={{ 
                color: result.user.role === 'admin' ? '#22c55e' : '#6b7280',
                fontWeight: 'bold'
              }}>{result.user.role || 'user'}</span></p>
              
              {result.isAdmin && (
                <div style={{ 
                  backgroundColor: '#22c55e', 
                  color: 'white', 
                  padding: '0.5rem', 
                  borderRadius: '4px', 
                  marginTop: '0.5rem',
                  textAlign: 'center'
                }}>
                  🎉 You are now an admin! You can access the admin panel.
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
        borderRadius: '8px'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#92400e' }}>Instructions:</h3>
        <ol style={{ margin: 0, paddingLeft: '1.5rem', color: '#92400e' }}>
          <li>Sign in to your account first</li>
          <li>Click "Check Admin Status" to see your current role</li>
          <li>Click "Make Me Admin" to grant yourself admin privileges</li>
          <li>Click "Test Admin Access" to open the admin panel</li>
          <li>Admin panel URL: <code>/admin</code></li>
          <li>All bookings URL: <code>/admin/bookings</code></li>
        </ol>
      </div>
    </div>
  )
}
