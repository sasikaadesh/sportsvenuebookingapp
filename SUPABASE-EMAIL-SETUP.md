# Supabase Email Configuration Guide

## ⚠️ IMPORTANT: Email Delivery Setup Required

By default, Supabase uses a **rate-limited email service** that may not deliver emails reliably. To enable password reset emails and other authentication emails, you need to configure a custom SMTP provider.

---

## 🚀 Quick Setup (Recommended)

### Option 1: Use Supabase's Built-in Email (Development Only)

**⚠️ Warning:** Supabase's default email service has strict rate limits:
- **Maximum 4 emails per hour** per project
- Emails may be delayed or not delivered
- **NOT recommended for production**

**To check if emails are being sent:**
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Logs**
3. Look for password reset email events
4. Check if emails are being queued or sent

---

### Option 2: Configure Custom SMTP (Production Ready) ✅

For reliable email delivery, configure a custom SMTP provider:

#### **Step 1: Choose an Email Provider**

**Recommended Providers:**
- **Resend** (easiest, modern) - https://resend.com
- **SendGrid** (popular, free tier) - https://sendgrid.com
- **AWS SES** (scalable, cheap) - https://aws.amazon.com/ses
- **Mailgun** (reliable) - https://mailgun.com
- **Postmark** (transactional) - https://postmarkapp.com

#### **Step 2: Get SMTP Credentials**

**For Resend (Recommended):**
1. Sign up at https://resend.com
2. Verify your domain (or use their test domain)
3. Go to **API Keys** → Create API Key
4. Note down the API key

**For SendGrid:**
1. Sign up at https://sendgrid.com
2. Go to **Settings** → **API Keys**
3. Create an API key with "Mail Send" permissions
4. Go to **Settings** → **Sender Authentication**
5. Verify a sender email address
6. Get SMTP credentials:
   - Host: `smtp.sendgrid.net`
   - Port: `587`
   - Username: `apikey`
   - Password: Your API key

#### **Step 3: Configure Supabase SMTP**

1. **Go to Supabase Dashboard**
2. **Navigate to:** Project Settings → Authentication → SMTP Settings
3. **Enable Custom SMTP**
4. **Enter your SMTP credentials:**

**For SendGrid:**
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP Username: apikey
SMTP Password: [Your SendGrid API Key]
Sender Email: noreply@yourdomain.com
Sender Name: Sports Venue Booking
```

**For Resend:**
```
SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP Username: resend
SMTP Password: [Your Resend API Key]
Sender Email: noreply@yourdomain.com
Sender Name: Sports Venue Booking
```

5. **Click "Save"**

#### **Step 4: Configure Email Templates**

1. **Go to:** Authentication → Email Templates
2. **Configure "Reset Password" template:**

**Subject:**
```
Reset Your Password - Sports Venue Booking
```

**Email Body (HTML):**
```html
<h2>Reset Your Password</h2>
<p>Hi there,</p>
<p>You requested to reset your password for Sports Venue Booking.</p>
<p>Click the button below to reset your password:</p>
<p>
  <a href="{{ .ConfirmationURL }}" 
     style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
    Reset Password
  </a>
</p>
<p>Or copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>
<p>This link will expire in 1 hour.</p>
<p>If you didn't request this, you can safely ignore this email.</p>
<p>Thanks,<br>Sports Venue Booking Team</p>
```

3. **Click "Save"**

---

## 🧪 Testing Email Delivery

### Test 1: Check SMTP Configuration
1. Go to Supabase Dashboard → Authentication → SMTP Settings
2. Click "Send Test Email"
3. Check if you receive the test email

### Test 2: Test Password Reset
1. Go to your app: `/auth/forgot-password`
2. Enter a valid email address (one that exists in your system)
3. Click "Send Reset Link"
4. Check browser console for any errors
5. Check your email inbox (and spam folder)
6. Check Supabase Dashboard → Authentication → Logs

---

## 🔍 Troubleshooting

### Issue: Not Receiving Emails

**Check 1: Verify Email Exists**
- Make sure the email address is registered in your system
- Go to Supabase Dashboard → Authentication → Users
- Verify the user exists

**Check 2: Check Supabase Logs**
- Go to Authentication → Logs
- Look for "password_recovery" events
- Check for any error messages

**Check 3: Check Spam Folder**
- Password reset emails often end up in spam
- Add sender email to your contacts

**Check 4: Verify SMTP Configuration**
- Go to Project Settings → Authentication → SMTP Settings
- Make sure "Enable Custom SMTP" is ON
- Verify all credentials are correct
- Send a test email

**Check 5: Check Rate Limits**
- Supabase default email has strict rate limits
- Wait 1 hour between attempts if using default email
- Use custom SMTP to avoid rate limits

**Check 6: Check Browser Console**
- Open browser developer tools (F12)
- Go to Console tab
- Look for any error messages when submitting the form

### Issue: Invalid or Expired Reset Link

**Solution:**
- Reset links expire after 1 hour (configurable in Supabase)
- Request a new reset link
- Make sure you're clicking the latest link

### Issue: SMTP Authentication Failed

**Solution:**
- Double-check your SMTP credentials
- Make sure you're using the correct username/password
- For SendGrid, username should be "apikey"
- For Resend, username should be "resend"

---

## 📧 Email Template Variables

Available variables in email templates:
- `{{ .ConfirmationURL }}` - The password reset link
- `{{ .Token }}` - The reset token
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL
- `{{ .Email }}` - User's email address

---

## ✅ Production Checklist

Before going live, make sure:
- [ ] Custom SMTP is configured
- [ ] Sender email is verified
- [ ] Email templates are customized
- [ ] Test emails are being delivered
- [ ] Password reset flow works end-to-end
- [ ] Links redirect to correct URLs
- [ ] Email templates look good on mobile
- [ ] Spam score is checked (use mail-tester.com)

---

## 🆘 Still Having Issues?

If you're still not receiving emails after following this guide:

1. **Check Supabase Status:** https://status.supabase.com
2. **Review Supabase Docs:** https://supabase.com/docs/guides/auth/auth-smtp
3. **Contact Supabase Support:** Through your dashboard
4. **Check Application Logs:** Browser console and network tab

---

## 📝 Notes

- Password reset links expire after **1 hour** by default
- Users can request multiple reset links
- Old links become invalid when a new one is requested
- For security, we don't reveal if an email exists in the system

