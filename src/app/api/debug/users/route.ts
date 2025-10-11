import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('Debug users API called')

    // Get all users from public.users
    const { data: publicUsers, error: publicError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role, created_at')
      .order('created_at', { ascending: false })

    // Get all users from auth.users
    const { data: authUsersResponse, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    const authUsers = authUsersResponse?.users || []

    // Compare the two lists
    const comparison = {
      public_users_count: publicUsers?.length || 0,
      auth_users_count: authUsers.length,
      public_users: publicUsers?.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role
      })) || [],
      auth_users: authUsers.map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at
      })),
      orphaned_profiles: [],
      missing_profiles: []
    }

    // Find orphaned profiles (in public.users but not in auth.users)
    if (publicUsers) {
      comparison.orphaned_profiles = publicUsers.filter(pu => 
        !authUsers.find(au => au.id === pu.id)
      ).map(u => ({ id: u.id, email: u.email, name: u.name }))
    }

    // Find missing profiles (in auth.users but not in public.users)
    comparison.missing_profiles = authUsers.filter(au => 
      !publicUsers?.find(pu => pu.id === au.id)
    ).map(u => ({ id: u.id, email: u.email }))

    return NextResponse.json({
      success: true,
      data: comparison,
      errors: {
        public_error: publicError,
        auth_error: authError
      }
    })

  } catch (error) {
    console.error('Exception in debug users API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
