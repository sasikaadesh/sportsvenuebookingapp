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
      public_users: publicUsers?.map(u => {
        const user = u as { id: string; email: string; name: string; role: string }
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }) || [],
      auth_users: authUsers.map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at
      })),
      orphaned_profiles: [] as Array<{ id: string; email: string; name: string }>,
      missing_profiles: [] as Array<{ id: string; email: string }>
    }

    // Find orphaned profiles (in public.users but not in auth.users)
    if (publicUsers) {
      const typedPublicUsers = publicUsers as Array<{ id: string; email: string; name: string }>
      comparison.orphaned_profiles = typedPublicUsers.filter(pu =>
        !authUsers.find(au => au.id === pu.id)
      ).map(u => ({ id: u.id, email: u.email, name: u.name }))
    }

    // Find missing profiles (in auth.users but not in public.users)
    const typedPublicUsersForMissing = publicUsers as Array<{ id: string }> | null
    comparison.missing_profiles = authUsers.filter(au =>
      !typedPublicUsersForMissing?.find(pu => pu.id === au.id)
    ).map(u => ({ id: u.id, email: u.email || 'No email' }))

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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    )
  }
}
