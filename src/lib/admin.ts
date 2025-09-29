import { supabase } from './supabase'

/**
 * Admin configuration - Add admin emails here or use environment variables
 */
const ADMIN_EMAILS = [
  process.env.NEXT_PUBLIC_ADMIN_EMAIL_1,
  process.env.NEXT_PUBLIC_ADMIN_EMAIL_2,
  process.env.NEXT_PUBLIC_ADMIN_EMAIL_3,
  // Add more as needed
].filter(Boolean) as string[]

// Fallback admin emails (for development/testing)
const FALLBACK_ADMIN_EMAILS = [
  'admin@sportsvenueapp.com',
  'admin@example.com'
]

/**
 * Get all configured admin emails
 */
export function getAdminEmails(): string[] {
  const envEmails = ADMIN_EMAILS.length > 0 ? ADMIN_EMAILS : FALLBACK_ADMIN_EMAILS
  console.log('Configured admin emails:', envEmails)
  return envEmails
}

/**
 * Check if an email is configured as admin
 */
export function isAdminEmail(email: string): boolean {
  const adminEmails = getAdminEmails()
  return adminEmails.includes(email.toLowerCase())
}

/**
 * Automatically promote configured admin emails to admin role
 */
export async function ensureAdminRole(userId: string, userEmail: string): Promise<boolean> {
  try {
    if (!isAdminEmail(userEmail)) {
      return false
    }

    console.log(`Promoting ${userEmail} to admin role...`)

    // Update user role to admin
    const { data, error } = await (supabase as any)
      .from('users')
      .update({ role: 'admin' })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error promoting user to admin:', error)
      return false
    }

    console.log(`Successfully promoted ${userEmail} to admin role`)
    return true
  } catch (error) {
    console.error('Exception promoting user to admin:', error)
    return false
  }
}

/**
 * Check if user has admin role in database
 */
export async function checkAdminRole(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (error || !data) {
      return false
    }

    return (data as any).role === 'admin'
  } catch (error) {
    console.error('Error checking admin role:', error)
    return false
  }
}

/**
 * Setup admin role for current user (for development/testing)
 */
export async function makeCurrentUserAdmin(): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, message: 'No authenticated user found' }
    }

    // Update user to admin
    const { error } = await (supabase as any)
      .from('users')
      .update({ role: 'admin' })
      .eq('id', user.id)

    if (error) {
      return { 
        success: false, 
        message: 'Failed to update user role', 
        error: error.message 
      }
    }

    return { 
      success: true, 
      message: `Successfully promoted ${user.email} to admin role` 
    }
  } catch (error) {
    return { 
      success: false, 
      message: 'Exception occurred', 
      error: String(error) 
    }
  }
}

