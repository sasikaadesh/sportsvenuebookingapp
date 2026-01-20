'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { AdminOnlyPage } from '@/components/admin/AdminOnlyPage'

function TestSupabasePageContent() {
  const [status, setStatus] = useState('Testing...')
  const [users, setUsers] = useState<any[]>([])
  const [authUsers, setAuthUsers] = useState<any[]>([])

  const testConnection = async () => {
    try {
      setStatus('Testing Supabase connection...')
      
      // Test basic connection
      const { data, error } = await supabase.from('users').select('*').limit(5)
      
      if (error) {
        setStatus(`Error: ${error.message}`)
        console.error('Supabase error:', error)
      } else {
        setStatus('✅ Supabase connected successfully!')
        setUsers(data || [])
      }
    } catch (err) {
      setStatus(`Connection failed: ${err}`)
      console.error('Connection error:', err)
    }
  }

  const testAuth = async () => {
    try {
      setStatus('Testing auth...')
      const { data: { user } } = await supabase.auth.getUser()
      setStatus(`Current user: ${user ? user.email : 'Not signed in'}`)
    } catch (err) {
      setStatus(`Auth test failed: ${err}`)
    }
  }

  const createTestUser = async () => {
    try {
      setStatus('Creating test user...')
      const { data, error } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            name: 'Test User'
          }
        }
      })

      if (error) {
        setStatus(`Signup error: ${error.message}`)
      } else {
        setStatus('✅ Test user created! Check your database.')
      }
    } catch (err) {
      setStatus(`Signup failed: ${err}`)
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Supabase Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <p className="text-lg mb-4">{status}</p>
          
          <div className="space-x-4">
            <Button onClick={testConnection}>Test Connection</Button>
            <Button onClick={testAuth}>Test Auth</Button>
            <Button onClick={createTestUser}>Create Test User</Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Users in Database ({users.length})</h2>
          {users.length > 0 ? (
            <div className="space-y-2">
              {users.map((user, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded">
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Name:</strong> {user.name || 'N/A'}</p>
                  <p><strong>Role:</strong> {user.role}</p>
                  <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No users found in database</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Check</h2>
          <div className="space-y-2">
            <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
            <p><strong>Anon Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TestSupabasePage() {
  return (
    <AdminOnlyPage pageName="Test Supabase">
      <TestSupabasePageContent />
    </AdminOnlyPage>
  )
}
