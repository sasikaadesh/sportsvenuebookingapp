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
    const { data: adminUser } = await supabaseAdmin
      .from('users')
      .select('role, email')
      .eq('id', adminUserId)
      .single()

    if (!adminUser || adminUser.role !== 'admin') {
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

    const userEmail = userToDelete?.email || authUser?.user?.email || 'unknown'

    console.log(`Attempting to delete user: ${userEmail} (${userId})`)

    // Method 1: Direct auth.admin deletion (most reliable)
    console.log('Trying auth.admin.deleteUser method...')
    try {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

      if (!authError) {
        console.log('User deleted successfully via auth admin')

        // Verify deletion worked
        const { data: verifyUser } = await supabaseAdmin.auth.admin.getUserById(userId)
        if (verifyUser?.user) {
          console.log('Warning: User still exists in auth.users after deletion')
        } else {
          console.log('Confirmed: User deleted from auth.users')
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
        users_table: null,
        auth_table: null
      }

      // Delete from users table first
      if (userToDelete) {
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
        console.log('Cannot delete from auth.users via SQL (expected):', authSqlException.message)
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
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
