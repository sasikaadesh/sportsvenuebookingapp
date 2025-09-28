# EmailJS Setup Guide - Easiest Email Solution

This is the **simplest way** to add email confirmations to your contact form. No backend required!

## ⚡ Quick Setup (5 minutes)

### Step 1: Create EmailJS Account
1. Go to [EmailJS.com](https://www.emailjs.com)
2. Sign up for free (200 emails/month)
3. Verify your email

### Step 2: Connect Your Email Service
1. Go to **Email Services** in your EmailJS dashboard
2. Click **Add New Service**
3. Choose your email provider:
   - **Gmail** (recommended for testing)
   - **Outlook**
   - **Yahoo**
   - **Or any SMTP service**
4. Follow the connection steps
5. **Copy your Service ID** (e.g., `service_abc123`)

### Step 3: Create Email Template
1. Go to **Email Templates** in your EmailJS dashboard
2. Click **Create New Template**
3. Use this template content:

**Template Name**: `contact_form_template`

**Email Template**:
```
Subject: {{subject}}

Dear {{to_name}},

{{message}}

---
From: {{from_name}}
Reply to: {{reply_to}}
```

4. **Copy your Template ID** (e.g., `template_xyz789`)

### Step 4: Get Public Key
1. Go to **Account** → **General**
2. **Copy your Public Key** (e.g., `user_abcdef123456`)

### Step 5: Add to Your Project
Add these to your `.env.local` file:

```env
# EmailJS Configuration
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_abc123
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xyz789
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=user_abcdef123456
NEXT_PUBLIC_ADMIN_EMAIL=admin@yourdomain.com
```

### Step 6: Restart Your Server
```bash
# Stop the current server (Ctrl+C) and restart
npm run dev
```

## ✅ That's It!

Your contact form will now:
- ✅ Save messages to database
- ✅ Send confirmation email to users
- ✅ Send notification email to admin
- ✅ Work without any backend setup

## 🧪 Test It

1. Go to `http://localhost:3002/contact`
2. Fill out the contact form
3. Submit it
4. Check your email inbox for confirmation
5. Check admin email for notification

## 🔧 Troubleshooting

### Common Issues

**Emails not sending?**
- Check your environment variables are correct
- Restart your development server
- Check browser console for errors
- Verify your EmailJS service is connected

**Gmail blocking emails?**
- Make sure 2-factor authentication is enabled
- Use an "App Password" instead of your regular password
- Check Gmail's "Less secure app access" settings

**Wrong email addresses?**
- User gets confirmation at the email they entered
- Admin gets notification at `NEXT_PUBLIC_ADMIN_EMAIL`

## 💰 Pricing

**Free Tier**: 200 emails/month
**Paid Plans**: Start at $15/month for 1,000 emails

Perfect for small to medium websites!

## 🆚 Why EmailJS vs Other Methods?

| Method | Setup Time | Backend Required | Cost | Difficulty |
|--------|------------|------------------|------|------------|
| **EmailJS** | 5 minutes | ❌ No | Free/Cheap | ⭐ Easy |
| Resend + Supabase | 30 minutes | ✅ Yes | Free/Expensive | ⭐⭐⭐ Hard |
| SendGrid | 20 minutes | ✅ Yes | Expensive | ⭐⭐⭐ Hard |
| Nodemailer | 45 minutes | ✅ Yes | Free | ⭐⭐⭐⭐ Very Hard |

## 🔒 Security Notes

- EmailJS runs on the frontend, so API keys are visible
- This is normal and safe for EmailJS (they're designed for frontend use)
- For high-security applications, consider backend solutions
- Rate limiting is handled by EmailJS automatically

## 🚀 Advanced Features

Once basic setup works, you can:
- Customize email templates with HTML
- Add file attachments
- Set up auto-replies
- Add email tracking
- Use multiple email services

But for now, the basic setup will work perfectly for your contact form! 🎉



