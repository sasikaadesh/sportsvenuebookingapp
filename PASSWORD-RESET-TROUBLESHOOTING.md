# Password Reset Email Troubleshooting Guide

## Current Status
The password reset functionality is **fully implemented** in the code, but emails may not be sending. Here's what you need to check:

---

## ✅ What's Already Done (Code-wise)

1. **API Routes Created:**
   - `/api/auth/forgot-password` - Generates reset token
   - `/api/auth/verify-reset-token` - Verifies token validity
   - `/api/auth/reset-password` - Resets the password

2. **Frontend Pages Created:**
   - `/auth/forgot-password` - User enters email
   - `/auth/reset-password` - User enters new password

3. **EmailJS Integration:**
   - Code is ready to send emails via EmailJS
   - Template parameters are configured

---

## 🔍 What You Need to Check/Fix

### Step 1: Verify Supabase Database Table

**Action Required:** Run the SQL script in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `lzqwzugocmfdlvhmolkp`
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the contents of `password-reset-tokens-table.sql`
6. Click **Run** to execute the SQL

**What this does:**
- Creates the `password_reset_tokens` table
- Sets up proper indexes for performance
- Configures Row Level Security (RLS) policies
- Grants necessary permissions

**Verification:**
After running the SQL, go to **Table Editor** and verify that `password_reset_tokens` table exists.

---

### Step 2: Configure EmailJS Template

**Action Required:** Update your EmailJS template

1. Go to EmailJS Dashboard: https://dashboard.emailjs.com/
2. Login with your account
3. Go to **Email Templates**
4. Find template: `template_9f2olnc` (or create a new one)
5. Update the template content to:

```
Subject: {{subject}}

Hi {{user_name}},

{{message}}

---
From: {{from_name}}
Reply to: {{reply_to}}
```

**Important Template Variables:**
- `{{user_name}}` - Recipient's name
- `{{user_email}}` - Recipient's email
- `{{subject}}` - Email subject
- `{{message}}` - Email body (contains the reset link)
- `{{from_name}}` - Sender name
- `{{reply_to}}` - Reply-to email

**Save the template** after making changes.

---

### Step 3: Verify EmailJS Service Configuration

1. In EmailJS Dashboard, go to **Email Services**
2. Verify service `service_290uqkk` is connected
3. Make sure the email service is **active** and **verified**
4. Check that you haven't exceeded your monthly email quota (free plan: 200 emails/month)

---

### Step 4: Update Vercel Environment Variables

**Action Required:** Add environment variables to Vercel

1. Go to Vercel Dashboard: https://vercel.com/
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add/verify these variables:

```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_290uqkk
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_9f2olnc
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=POiM46Nge2eU-gYrC
NEXT_PUBLIC_ADMIN_EMAIL=sasikaadesh@gmail.com
NEXT_PUBLIC_APP_URL=https://your-app-url.vercel.app
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6cXd6dWdvY21mZGx2aG1vbGtwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjA0ODQyOCwiZXhwIjoyMDcxNjI0NDI4fQ.A4_8sqoGIuxvlmTcksHZf3RqZqK9NQnZE7MsbHyl64k
```

**Important:** After adding/updating environment variables, you must **redeploy** your application for changes to take effect.

---

### Step 5: Test the Password Reset Flow

1. **Test Locally First:**
   ```bash
   npm run dev
   ```
   - Go to http://localhost:3007/auth/forgot-password
   - Enter a valid email address (one that exists in your users table)
   - Check browser console for logs (F12 → Console)
   - Look for messages like:
     - `🔍 Attempting to send password reset email to: ...`
     - `📧 Sending email via EmailJS...`
     - `✅ Email sent successfully`

2. **Check for Errors:**
   - If you see errors in console, note them down
   - Common errors:
     - "EmailJS service not found" → Check service ID
     - "Template not found" → Check template ID
     - "Invalid public key" → Check public key
     - "Failed to generate reset token" → Database table missing

3. **Check Email Inbox:**
   - Check the email inbox (including spam folder)
   - Email should arrive within 1-2 minutes
   - If no email, check EmailJS dashboard for delivery logs

---

## 🐛 Common Issues and Solutions

### Issue 1: "Failed to generate reset token"
**Cause:** Database table doesn't exist
**Solution:** Run the SQL script in Step 1

### Issue 2: Email not received
**Possible causes:**
- EmailJS template not configured correctly → Check Step 2
- EmailJS service not active → Check Step 3
- Email in spam folder → Check spam/junk
- EmailJS quota exceeded → Check dashboard
- Wrong email address → Verify user exists in database

### Issue 3: "Invalid reset link"
**Cause:** Token expired or already used
**Solution:** Request a new password reset link

### Issue 4: Environment variables not working in Vercel
**Cause:** Variables not set or deployment not updated
**Solution:** 
- Add variables in Vercel dashboard
- Trigger a new deployment (push to GitHub or manual redeploy)

---

## 📊 How to Debug

### Check Browser Console
Open browser console (F12) and look for these log messages:
- `🔍` - Process started
- `📧` - Email operation
- `✅` - Success
- `❌` - Error

### Check Supabase Logs
1. Go to Supabase Dashboard
2. Click **Logs** in sidebar
3. Look for API errors or database errors

### Check EmailJS Dashboard
1. Go to EmailJS Dashboard
2. Click **History** or **Logs**
3. See if emails were sent successfully

---

## ✅ Success Checklist

- [ ] SQL table created in Supabase
- [ ] EmailJS template configured with correct variables
- [ ] EmailJS service is active and verified
- [ ] Environment variables added to Vercel
- [ ] Application redeployed after adding env vars
- [ ] Tested locally and emails are sending
- [ ] Tested on production (Vercel) and emails are sending

---

## 🆘 Still Not Working?

If you've completed all steps and it's still not working:

1. **Share the console logs** - Copy any error messages from browser console
2. **Check EmailJS history** - See if emails are being sent from EmailJS
3. **Verify user exists** - Make sure the email you're testing with exists in the `users` table
4. **Test with different email** - Try with a different email address

---

## 📝 Quick Test Commands

```bash
# Test locally
npm run dev

# Check if environment variables are loaded
# Add this temporarily to forgot-password page:
console.log('EmailJS Config:', {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY?.substring(0, 10) + '...'
})
```

---

**Last Updated:** 2026-02-23

