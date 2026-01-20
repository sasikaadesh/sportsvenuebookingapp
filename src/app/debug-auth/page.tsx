'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { AdminOnlyPage } from '@/components/admin/AdminOnlyPage'

function DebugAuthPageContent() {
  const { user, profile, session } = useAuth()
  const [authCheck, setAuthCheck] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkAuthStatus = async () => {
    setLoading(true)
    try {
      // Check current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      // Check current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      // Check profile in database
      let profileData = null
      let profileError = null
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
        profileData = data
        profileError = error
      }

      // Get debug info from API
      let debugUsersData = null
      try {
        const debugResponse = await fetch('/api/debug/users')
        if (debugResponse.ok) {
          debugUsersData = await debugResponse.json()
        }
      } catch (debugError) {
        console.log('Debug API not available:', debugError)
      }

      setAuthCheck({
        session: session ? {
          user_id: session.user.id,
          email: session.user.email,
          expires_at: session.expires_at
        } : null,
        sessionError,
        user: user ? {
          id: user.id,
          email: user.email,
          email_confirmed_at: user.email_confirmed_at,
          last_sign_in_at: user.last_sign_in_at
        } : null,
        userError,
        profile: profileData,
        profileError,
        debugUsers: debugUsersData,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      setAuthCheck({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
    setLoading(false)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setAuthCheck(null)
  }

  useEffect(() => {
    checkAuthStatus()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Authentication Debug Page</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AuthProvider State */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">AuthProvider State</h2>
            <div className="space-y-2 text-sm">
              <div><strong>User:</strong> {user ? user.email : 'null'}</div>
              <div><strong>User ID:</strong> {user?.id || 'null'}</div>
              <div><strong>Profile:</strong> {profile ? profile.email : 'null'}</div>
              <div><strong>Role:</strong> {profile?.role || 'null'}</div>
              <div><strong>Session:</strong> {session ? 'exists' : 'null'}</div>
            </div>
          </div>

          {/* Direct Auth Check */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Direct Auth Check</h2>
            <button 
              onClick={checkAuthStatus}
              disabled={loading}
              className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Check Auth Status'}
            </button>
            
            {authCheck && (
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-64">
                {JSON.stringify(authCheck, null, 2)}
              </pre>
            )}
          </div>
        </div>

        {/* Debug Users Data */}
        {authCheck?.debugUsers && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Database Users Comparison</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Public Users ({authCheck.debugUsers.data?.public_users_count || 0})</h3>
                <div className="text-xs bg-gray-100 p-2 rounded max-h-32 overflow-auto">
                  {authCheck.debugUsers.data?.public_users?.map((u: any) => (
                    <div key={u.id}>{u.email} ({u.id.slice(0, 8)}...)</div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Auth Users ({authCheck.debugUsers.data?.auth_users_count || 0})</h3>
                <div className="text-xs bg-gray-100 p-2 rounded max-h-32 overflow-auto">
                  {authCheck.debugUsers.data?.auth_users?.map((u: any) => (
                    <div key={u.id}>{u.email} ({u.id.slice(0, 8)}...)</div>
                  ))}
                </div>
              </div>
            </div>
            
            {authCheck.debugUsers.data?.orphaned_profiles?.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-red-600">Orphaned Profiles (in public.users but not auth.users)</h3>
                <div className="text-xs bg-red-50 p-2 rounded">
                  {authCheck.debugUsers.data.orphaned_profiles.map((u: any) => (
                    <div key={u.id}>{u.email} ({u.id.slice(0, 8)}...)</div>
                  ))}
                </div>
              </div>
            )}
            
            {authCheck.debugUsers.data?.missing_profiles?.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-yellow-600">Missing Profiles (in auth.users but not public.users)</h3>
                <div className="text-xs bg-yellow-50 p-2 rounded">
                  {authCheck.debugUsers.data.missing_profiles.map((u: any) => (
                    <div key={u.id}>{u.email} ({u.id.slice(0, 8)}...)</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <button 
              onClick={signOut}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Sign Out
            </button>
            <button 
              onClick={() => window.location.href = '/auth/signin'}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Go to Sign In
            </button>
            <button 
              onClick={() => window.location.href = '/admin/users'}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Go to Admin Users
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Debug Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Create a test user account and sign in</li>
            <li>Visit this page and check the auth status</li>
            <li>Note the user ID from the debug info</li>
            <li>Go to admin panel and delete the test user</li>
            <li>Come back to this page and click &quot;Check Auth Status&quot;</li>
            <li>Try to sign in again with the deleted user credentials</li>
            <li>Check the console logs for detailed debugging info</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default function DebugAuthPage() {
  return (
    <AdminOnlyPage pageName="Debug Auth">
      <DebugAuthPageContent />
    </AdminOnlyPage>
  )
}
