import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing admin permissions...')

    // Test 1: Can we list users?
    const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    console.log('List users test:', { count: authUsers?.users?.length, error: listError })

    // Test 2: Can we access public.users table?
    const { data: publicUsers, error: publicError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .limit(5)
    console.log('Public users test:', { count: publicUsers?.length, error: publicError })

    // Test 3: Check service role key
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    console.log('Service role key exists:', !!serviceRoleKey)
    console.log('Service role key starts with:', serviceRoleKey?.substring(0, 20) + '...')

    return NextResponse.json({
      success: true,
      tests: {
        auth_users: {
          success: !listError,
          count: authUsers?.users?.length || 0,
          error: listError?.message
        },
        public_users: {
          success: !publicError,
          count: publicUsers?.length || 0,
          error: publicError?.message
        },
        service_role_key: {
          exists: !!serviceRoleKey,
          valid_format: serviceRoleKey?.startsWith('eyJ') || false
        }
      }
    })

  } catch (error) {
    console.error('Admin permissions test failed:', error)
    return NextResponse.json(
      { error: 'Test failed', details: error.message },
      { status: 500 }
    )
  }
}
