import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    console.log('🔍 Processing password reset request for:', email)

    // Check if user exists in auth.users
    const { data: authUsers, error: authError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single()

    // For security, don't reveal if email exists or not
    // Always return success, but only send email if user exists
    if (authError || !authUsers) {
      console.log('⚠️ User not found, but returning success for security')
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.'
      })
    }

    console.log('✅ User found:', authUsers.email)

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    console.log('🔑 Generated reset token:', token.substring(0, 10) + '...')

    // Store token in database
    const { error: insertError } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: authUsers.id,
        email: email,
        token: token,
        expires_at: expiresAt.toISOString(),
        used: false
      })

    if (insertError) {
      console.error('❌ Error storing reset token:', insertError)
      return NextResponse.json(
        { error: 'Failed to generate reset token' },
        { status: 500 }
      )
    }

    console.log('✅ Reset token stored in database')

    // Generate reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3007'}/auth/reset-password?token=${token}`

    console.log('🔗 Reset link:', resetLink)

    // Return success with token and link (for EmailJS to send)
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.',
      data: {
        email: email,
        resetLink: resetLink,
        token: token
      }
    })

  } catch (error) {
    console.error('❌ Unexpected error in forgot-password API:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

