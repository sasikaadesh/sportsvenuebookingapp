# Email Setup Guide for Contact Form

This guide explains how to set up email confirmations for the contact form using Supabase Edge Functions and Resend.

## Overview

The contact form now:
1. ✅ **Saves messages to database** (`contact_messages` table)
2. ✅ **Sends confirmation email to user**
3. ✅ **Sends notification email to admin**
4. ✅ **Provides fallback if emails fail** (message still saved)

## Setup Instructions

### 1. Set up Resend Account (Recommended Email Service)

1. **Sign up at [Resend.com](https://resend.com)**
2. **Get your API key** from the dashboard
3. **Verify your domain** (optional but recommended for production)

### 2. Configure Supabase Environment Variables

Add these environment variables in your Supabase project:

1. Go to **Supabase Dashboard** → **Settings** → **Edge Functions**
2. Add environment variables:
   ```
   RESEND_API_KEY=your-resend-api-key-here
   ADMIN_EMAIL=admin@yourdomain.com
   ```

### 3. Deploy the Email Function

Deploy the contact confirmation function to Supabase:

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy send-contact-confirmation
```

### 4. Alternative Email Services

If you prefer not to use Resend, you can modify the function to use:

#### SendGrid
```typescript
const response = await fetch('https://api.sendgrid.v3/mail/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SENDGRID_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    personalizations: [{ to: [{ email }] }],
    from: { email: 'noreply@yourdomain.com' },
    subject: 'Thank you for contacting us!',
    content: [{ type: 'text/html', value: htmlContent }]
  })
})
```

#### Nodemailer (SMTP)
```typescript
import { SMTPClient } from "https://deno.land/x/denomailer/mod.ts"

const client = new SMTPClient({
  connection: {
    hostname: "smtp.gmail.com",
    port: 465,
    tls: true,
    auth: {
      username: "your-email@gmail.com",
      password: "your-app-password",
    },
  },
})
```

## Testing the Setup

### 1. Test Contact Form
1. Go to `http://localhost:3002/contact`
2. Fill out and submit the contact form
3. Check the browser console for logs
4. Verify the message appears in your database

### 2. Test Email Functionality
1. Submit a contact form with your real email
2. Check your inbox for confirmation email
3. Check admin email for notification
4. Check Supabase function logs for any errors

### 3. Database Verification
Check that messages are saved in the `contact_messages` table:

```sql
SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 10;
```

## Email Templates

The system sends two types of emails:

### User Confirmation Email
- **Subject**: "Thank you for contacting us!"
- **Content**: Includes message details and 24-hour response promise
- **Sender**: `Sports Venue <noreply@sportsvenue.com>`

### Admin Notification Email
- **Subject**: "New Contact Form Submission: [Subject]"
- **Content**: Full contact details for admin review
- **Recipient**: Configured admin email

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check Resend API key is correct
   - Verify environment variables are set in Supabase
   - Check function deployment logs

2. **Function not found**
   - Ensure function is deployed: `supabase functions deploy send-contact-confirmation`
   - Check function name matches exactly

3. **Database errors**
   - Ensure `contact_messages` table exists
   - Check database permissions and RLS policies

### Debug Commands

```bash
# View function logs
supabase functions logs send-contact-confirmation

# Test function locally
supabase functions serve

# Check function deployment
supabase functions list
```

## Production Considerations

1. **Domain Verification**: Verify your sending domain with Resend
2. **Rate Limiting**: Implement rate limiting for contact form submissions
3. **Spam Protection**: Add CAPTCHA or similar protection
4. **Email Templates**: Customize email templates with your branding
5. **Monitoring**: Set up monitoring for email delivery failures

## Fallback Behavior

Even if email sending fails:
- ✅ Contact messages are still saved to the database
- ✅ User sees success message
- ✅ Admins can view messages in the admin dashboard
- ✅ System logs errors for debugging

This ensures the contact form always works, even if email services are temporarily unavailable.
