'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Database } from '@/types/database'
import { ensureAdminRole, isAdminEmail } from '@/lib/admin'

type UserProfile = Database['public']['Tables']['users']['Row']

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.log('Profile fetch error:', error.code, error.message)
        // If profile doesn't exist, try to create it
        if (error.code === 'PGRST116' || error.message?.includes('No rows found')) {
          console.log('Profile not found, creating new profile for user:', userId)
          return await createProfile(userId)
        }
        console.error('Error fetching profile:', error)
        return null
      }

      console.log('Profile fetched successfully:', data)
      return data
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }

  const createProfile = async (userId: string) => {
    try {
      console.log('Creating profile for user:', userId)
      // Get user data from auth
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        console.error('No authenticated user found')
        return null
      }

      const userEmail = user.email || ''
      const isAdmin = isAdminEmail(userEmail)
      
      const profileData = {
        id: userId,
        email: userEmail,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || userEmail.split('@')[0] || '',
        phone: user.user_metadata?.phone || '',
        role: isAdmin ? 'admin' as const : 'user' as const
      }

      console.log('Creating profile with data:', profileData)

      const { data, error } = await supabase
        .from('users')
        .insert(profileData as any)
        .select()
        .single()

      if (error) {
        console.error('Error creating profile:', error)
        // If profile already exists, try to fetch it
        if (error.code === '23505') {
          console.log('Profile already exists, fetching...')
          const { data: existingData, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()

          if (!fetchError) {
            return existingData
          }
        }
        return null
      }

      console.log('Profile created successfully:', data)
      return data
    } catch (error) {
      console.error('Error creating profile:', error)
      return null
    }
  }

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
    }
  }

  const signOut = async () => {
    try {
      console.log('Signing out user...')

      // Check current context before signing out
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/'
      const isInAppContext = currentPath.startsWith('/app') ||
                            currentPath.includes('/courts') ||
                            currentPath.includes('/dashboard') ||
                            currentPath.includes('/profile')

      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('Sign out error:', error)
        throw error
      }

      // Clear state immediately
      setUser(null)
      setProfile(null)
      setSession(null)

      console.log('User signed out successfully')

      // Redirect based on context
      if (typeof window !== 'undefined') {
        if (isInAppContext) {
          window.location.href = '/app'
        } else {
          window.location.href = '/'
        }
      }
    } catch (error) {
      console.error('Error signing out:', error)
      // Even if there's an error, clear local state
      setUser(null)
      setProfile(null)
      setSession(null)

      // Still redirect based on context
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname
        const isInAppContext = currentPath.startsWith('/app') ||
                              currentPath.includes('/courts') ||
                              currentPath.includes('/dashboard') ||
                              currentPath.includes('/profile')

        if (isInAppContext) {
          window.location.href = '/app'
        } else {
          window.location.href = '/'
        }
      }
    }
  }

  useEffect(() => {
    // Skip auth setup if Supabase is not configured
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured, skipping auth setup')
      setLoading(false)
      return
    }

    let mounted = true

    // Get initial session with better error handling
    const getInitialSession = async () => {
      try {
        console.log('AuthProvider: Getting initial session...')

        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('AuthProvider: Error getting session:', error)
          if (mounted) {
            setSession(null)
            setUser(null)
            setProfile(null)
            setLoading(false)
          }
          return
        }

        console.log('AuthProvider: Session check result:', session ? `Found session for ${session.user.email}` : 'No session')

        if (mounted) {
          if (session?.user) {
            console.log('AuthProvider: Setting user session')
            setSession(session)
            setUser(session.user)

            // Load profile in background (don't block loading)
            fetchProfile(session.user.id).then(async (profileData) => {
              if (mounted) {
                setProfile(profileData)
                
                // Auto-promote admin emails
                if (session.user.email && isAdminEmail(session.user.email) && profileData?.role !== 'admin') {
                  console.log('Auto-promoting admin email:', session.user.email)
                  await ensureAdminRole(session.user.id, session.user.email)
                  // Refresh profile to get updated role
                  const updatedProfile = await fetchProfile(session.user.id)
                  if (mounted) {
                    setProfile(updatedProfile)
                  }
                }
              }
            }).catch(err => {
              console.error('AuthProvider: Profile fetch error:', err)
            })
          } else {
            console.log('AuthProvider: No valid session, clearing state')
            setSession(null)
            setUser(null)
            setProfile(null)
          }
          setLoading(false)
        }
      } catch (error) {
        console.error('AuthProvider: Exception getting session:', error)
        if (mounted) {
          setSession(null)
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Auth state change:', event, session?.user?.email || 'no user')

        if (!mounted) return

        try {
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (session?.user) {
              console.log('AuthProvider: Setting authenticated user')
              setSession(session)
              setUser(session.user)

              // Load profile in background
              fetchProfile(session.user.id).then(async (profileData) => {
                if (mounted) {
                  setProfile(profileData)
                  
                  // Auto-promote admin emails
                  if (session.user.email && isAdminEmail(session.user.email) && profileData?.role !== 'admin') {
                    console.log('Auto-promoting admin email:', session.user.email)
                    await ensureAdminRole(session.user.id, session.user.email)
                    // Refresh profile to get updated role
                    const updatedProfile = await fetchProfile(session.user.id)
                    if (mounted) {
                      setProfile(updatedProfile)
                    }
                  }
                }
              }).catch(err => {
                console.error('AuthProvider: Profile fetch error:', err)
              })
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('AuthProvider: Clearing user session')
            setSession(null)
            setUser(null)
            setProfile(null)
          }
        } catch (error) {
          console.error('AuthProvider: Error in auth state change:', error)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    user,
    profile,
    session,
    loading,
    signOut,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
