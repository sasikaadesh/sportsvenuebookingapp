import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required', valid: false },
        { status: 400 }
      )
    }

    console.log('🔍 Verifying reset token:', token.substring(0, 10) + '...')

    // Find token in database
    const { data: resetToken, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .single()

    if (tokenError || !resetToken) {
      console.log('❌ Token not found')
      return NextResponse.json({
        valid: false,
        error: 'Invalid or expired reset token'
      })
    }

    // Check if token is expired
    const now = new Date()
    const expiresAt = new Date(resetToken.expires_at)

    if (now > expiresAt) {
      console.log('❌ Token expired')
      return NextResponse.json({
        valid: false,
        error: 'Reset token has expired'
      })
    }

    // Check if token has been used
    if (resetToken.used) {
      console.log('❌ Token already used')
      return NextResponse.json({
        valid: false,
        error: 'Reset token has already been used'
      })
    }

    console.log('✅ Token is valid')

    return NextResponse.json({
      valid: true,
      email: resetToken.email,
      userId: resetToken.user_id
    })

  } catch (error) {
    console.error('❌ Unexpected error in verify-reset-token API:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred', valid: false },
      { status: 500 }
    )
  }
}

