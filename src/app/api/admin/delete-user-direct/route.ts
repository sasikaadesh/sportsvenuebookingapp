import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function DELETE(request: NextRequest) {
  console.log('Direct delete user API called')
  
  try {
    const body = await request.json()
    console.log('Request body:', body)
    
    const { userId, adminUserId } = body

    if (!userId || !adminUserId) {
      return NextResponse.json(
        { error: 'User ID and Admin User ID are required' },
        { status: 400 }
      )
    }

    // Simple admin check
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('users')
      .select('role, email')
      .eq('id', adminUserId)
      .single()

    if (adminError || !adminUser) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Type assertion after null check
    const admin = adminUser as { role: string; email: string }

    if (admin.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    console.log('Checking if user exists before deletion:', userId)

    // Manual check - get user info from both tables
    const { data: userToDelete, error: userFetchError } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()

    console.log('User in public.users:', { userToDelete, userFetchError })

    // Also check auth.users
    const { data: authUser, error: authFetchError } = await supabaseAdmin.auth.admin.getUserById(userId)
    console.log('User in auth.users:', { authUser: authUser?.user?.email, authFetchError })

    // If user doesn't exist in either table, return error
    if (!userToDelete && !authUser?.user) {
      console.log('User not found in either table')
      return NextResponse.json(
        { error: `User not found in database. UserID: ${userId}` },
        { status: 404 }
      )
    }

    // Type assertions for user data
    const profileUser = userToDelete as { email: string } | null
    const userEmail = profileUser?.email || authUser?.user?.email || 'unknown'

    console.log(`Attempting to delete user: ${userEmail} (${userId})`)

    // IMPORTANT: Delete from users table FIRST to prevent trigger from recreating it
    console.log('Step 1: Deleting from public.users table first...')
    if (profileUser) {
      const { error: usersError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', userId)

      if (usersError) {
        console.error('Error deleting from users table:', usersError)
      } else {
        console.log('Successfully deleted from users table')
      }
    }

    // Small delay to ensure database operations complete
    await new Promise(resolve => setTimeout(resolve, 500))

    // Method 1: Direct auth.admin deletion (most reliable)
    console.log('Step 2: Trying auth.admin.deleteUser method...')
    try {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

      if (!authError) {
        console.log('User deleted successfully via auth admin')

        // Wait a bit for cascading deletes to complete
        await new Promise(resolve => setTimeout(resolve, 500))

        // Verify deletion worked
        const { data: verifyUser } = await supabaseAdmin.auth.admin.getUserById(userId)
        const { data: verifyProfile } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('id', userId)
          .single()

        if (verifyUser?.user) {
          console.log('Warning: User still exists in auth.users after deletion')
        } else {
          console.log('Confirmed: User deleted from auth.users')
        }

        if (verifyProfile) {
          console.log('Warning: User profile still exists after deletion')
          // Force delete the profile again
          await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', userId)
        } else {
          console.log('Confirmed: User profile deleted')
        }

        return NextResponse.json({
          success: true,
          message: 'User deleted successfully',
          method: 'auth.admin',
          deleted_email: userEmail
        })
      } else {
        console.error('Auth admin deletion failed:', authError)
      }
    } catch (authDeleteError) {
      console.error('Auth deletion exception:', authDeleteError)
    }

    // Method 2: Manual deletion from both tables
    console.log('Trying manual deletion from both tables...')
    try {
      let deletionResults = {
        users_table: null as string | null,
        auth_table: null as string | null
      }

      // Delete from users table first
      if (profileUser) {
        const { error: usersError } = await supabaseAdmin
          .from('users')
          .delete()
          .eq('id', userId)

        deletionResults.users_table = usersError ? `Error: ${usersError.message}` : 'Success'
        console.log('Users table deletion result:', deletionResults.users_table)
      }

      // Try to delete from auth.users using raw SQL
      try {
        const { error: authSqlError } = await supabaseAdmin
          .from('auth.users')
          .delete()
          .eq('id', userId)

        deletionResults.auth_table = authSqlError ? `Error: ${authSqlError.message}` : 'Success'
        console.log('Auth users deletion result:', deletionResults.auth_table)
      } catch (authSqlException) {
        const errorMessage = authSqlException instanceof Error ? authSqlException.message : 'Unknown error'
        console.log('Cannot delete from auth.users via SQL (expected):', errorMessage)
        deletionResults.auth_table = 'Cannot access via SQL (normal)'
      }

      console.log('Manual deletion completed with results:', deletionResults)
      return NextResponse.json({
        success: true,
        message: 'User deletion attempted',
        method: 'manual',
        results: deletionResults,
        deleted_email: userEmail
      })

    } catch (manualError) {
      console.error('Manual deletion failed:', manualError)
    }

    // If we get here, all methods failed
    console.log('All deletion methods failed')
    return NextResponse.json(
      {
        error: 'All deletion methods failed',
        user_email: userEmail,
        user_id: userId,
        message: 'User may still exist in the system'
      },
      { status: 500 }
    )

  } catch (error) {
    console.error('Exception in delete user API:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    )
  }
}
