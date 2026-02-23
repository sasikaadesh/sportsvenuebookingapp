# Custom Password Reset Implementation Guide

## 🎯 Overview

This implementation uses a **custom token-based password reset flow** with **EmailJS** for sending emails, completely bypassing Supabase's built-in email system.

### Why This Approach?

✅ **No SMTP configuration needed**  
✅ **No dependency on Resend or Gmail**  
✅ **No 2FA required**  
✅ **Full control over the email flow**  
✅ **Uses existing EmailJS setup**

---

## 📋 Implementation Steps

### Step 1: Create Database Table ✅ COMPLETE

**File:** `password-reset-tokens-table.sql`

Run this SQL in your Supabase SQL Editor to create the `password_reset_tokens` table:

```bash
# In Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Copy and paste the contents of password-reset-tokens-table.sql
# 3. Click "Run"
```

This creates:
- Table to store reset tokens with expiry (1 hour)
- Indexes for fast lookups
- RLS policies for security
- Cleanup function for expired tokens

---

### Step 2: API Routes ✅ COMPLETE

Three API routes have been created:

#### 1. Generate Reset Token
**File:** `src/app/api/auth/forgot-password/route.ts`

- Validates email
- Checks if user exists
- Generates secure 32-byte token
- Stores token in database with 1-hour expiry
- Returns reset link for EmailJS to send

#### 2. Verify Reset Token
**File:** `src/app/api/auth/verify-reset-token/route.ts`

- Validates token exists
- Checks if token is expired
- Checks if token has been used
- Returns user email if valid

#### 3. Reset Password
**File:** `src/app/api/auth/reset-password/route.ts`

- Verifies token is valid
- Updates user password using Supabase Admin client
- Marks token as used
- Returns success/error

---

### Step 3: Frontend Pages ✅ COMPLETE

#### Forgot Password Page
**File:** `src/app/auth/forgot-password/page.tsx`

- Calls `/api/auth/forgot-password` to generate token
- Sends email via EmailJS with reset link
- Shows success message (doesn't reveal if email exists)

#### Reset Password Page
**File:** `src/app/auth/reset-password/page.tsx`

- Extracts token from URL query parameter
- Calls `/api/auth/verify-reset-token` to verify token
- Shows error if token is invalid/expired/used
- Calls `/api/auth/reset-password` to update password
- Redirects to sign in on success

---

## 🧪 Testing Instructions

### Step 1: Run Database Migration

1. Open **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy contents of `password-reset-tokens-table.sql`
4. Click **Run**
5. Verify table was created in **Table Editor**

### Step 2: Verify EmailJS Configuration

Make sure these are in your `.env.local`:

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_290uqkk
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_9f2olnc
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=POiM46Nge2eU-gYrC
NEXT_PUBLIC_ADMIN_EMAIL=sasikaadesh@gmail.com
NEXT_PUBLIC_APP_URL=http://localhost:3007
```

### Step 3: Update EmailJS Template

Go to your EmailJS dashboard and make sure your template (`template_9f2olnc`) can handle these parameters:

- `user_name`
- `user_email`
- `from_name`
- `reply_to`
- `subject`
- `message` (contains the reset link)

### Step 4: Test the Flow

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Go to forgot password page:**
   ```
   http://localhost:3007/auth/forgot-password
   ```

3. **Enter your email** (must exist in Supabase Auth → Users)

4. **Check your email inbox** (and spam folder)

5. **Click the reset link** in the email

6. **Enter new password** and submit

7. **Sign in** with your new password

---

## 🔍 Troubleshooting

### Email Not Received?

1. **Check browser console** for EmailJS errors
2. **Check EmailJS dashboard** for delivery status
3. **Check spam folder**
4. **Verify email exists** in Supabase Auth → Users
5. **Check EmailJS template** is configured correctly

### Token Invalid/Expired?

1. **Check token expiry** (default: 1 hour)
2. **Check if token was already used**
3. **Request a new reset link**

### Password Reset Failed?

1. **Check browser console** for API errors
2. **Check Supabase logs** (Dashboard → Logs → Auth Logs)
3. **Verify SUPABASE_SERVICE_ROLE_KEY** is in `.env.local`
4. **Check password meets requirements** (8+ chars, uppercase, lowercase, number, special char)

---

## 🔐 Security Features

✅ **Secure token generation** using crypto.randomBytes  
✅ **1-hour token expiry**  
✅ **Single-use tokens** (marked as used after password reset)  
✅ **No email enumeration** (always returns success message)  
✅ **Password strength validation**  
✅ **Admin-only password updates** (using service role key)

---

## 📝 Next Steps

- [ ] Run database migration
- [ ] Test forgot password flow
- [ ] Verify email delivery
- [ ] Test password reset
- [ ] Test sign in with new password

---

## 🎉 Benefits Over Supabase Email System

1. **No SMTP configuration** - EmailJS handles everything
2. **No email provider issues** - Works with any EmailJS account
3. **Full control** - Customize email content and flow
4. **Better debugging** - See exactly what's happening in console
5. **No 2FA required** - No need to set up Gmail 2FA

---

## 📞 Support

If you encounter any issues:

1. Check browser console for errors
2. Check Supabase logs
3. Check EmailJS dashboard
4. Review this guide
5. Check the API route logs in terminal

Good luck! 🚀

