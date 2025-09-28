# Deployment Guide - Sports Venue Booking App

This guide will help you deploy the Sports Venue Booking App to production.

## Prerequisites

- Node.js 18+ installed
- A Supabase account
- A Vercel account (or Netlify)
- Google Cloud Console account (for OAuth)
- SendGrid or Resend account (for emails)

## 1. Supabase Setup

### Create a New Project
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready
4. Note down your project URL and anon key

### Database Setup
1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `supabase-schema.sql`
3. Run the SQL to create all tables and policies
4. Optionally, run `sample-data.sql` to populate with sample data

### Authentication Setup
1. Go to Authentication > Settings in Supabase
2. Configure the following:
   - Site URL: `https://your-domain.com`
   - Redirect URLs: `https://your-domain.com/auth/callback`
3. Enable Google OAuth:
   - Go to Authentication > Providers
   - Enable Google provider
   - Add your Google Client ID and Secret (see Google setup below)

### Storage Setup (Optional)
1. Go to Storage in Supabase
2. Create a bucket named `court-images`
3. Set appropriate policies for image uploads

## 2. Google OAuth Setup

### Create Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
5. Configure OAuth consent screen
6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized JavaScript origins: `https://your-domain.com`
   - Authorized redirect URIs: `https://your-supabase-project.supabase.co/auth/v1/callback`
7. Note down Client ID and Client Secret

## 3. Email Service Setup

### Option A: SendGrid
1. Create a [SendGrid](https://sendgrid.com) account
2. Generate an API key
3. Verify your sender identity
4. Note down the API key

### Option B: Resend
1. Create a [Resend](https://resend.com) account
2. Generate an API key
3. Verify your domain
4. Note down the API key

## 4. Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Service
SENDGRID_API_KEY=your-sendgrid-api-key
# OR
RESEND_API_KEY=your-resend-api-key

# Google Maps (Optional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 5. Vercel Deployment

### Automatic Deployment
1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your GitHub repository
4. Configure environment variables in Vercel dashboard
5. Deploy

### Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... add all other environment variables

# Deploy to production
vercel --prod
```

## 6. Netlify Deployment (Alternative)

### Automatic Deployment
1. Push your code to GitHub
2. Go to [Netlify](https://netlify.com)
3. Connect your GitHub repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Add environment variables in Netlify dashboard
6. Deploy

### Manual Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Build the project
npm run build

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

## 7. Domain Configuration

### Custom Domain
1. In Vercel/Netlify dashboard, go to Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update environment variables with new domain

### SSL Certificate
- Vercel and Netlify automatically provide SSL certificates
- Ensure all URLs use HTTPS

## 8. Post-Deployment Setup

### Update Supabase Settings
1. Update Site URL in Supabase Auth settings
2. Update Redirect URLs with your production domain
3. Test authentication flow

### Update Google OAuth
1. Update authorized origins and redirect URIs in Google Console
2. Test Google sign-in

### Test Email Functionality
1. Test contact form submissions
2. Test booking confirmation emails
3. Verify email templates

## 9. Monitoring and Analytics

### Error Monitoring
Consider adding error monitoring services:
- Sentry
- LogRocket
- Bugsnag

### Analytics
Add analytics tracking:
- Google Analytics
- Vercel Analytics
- Mixpanel

### Performance Monitoring
- Vercel Speed Insights
- Web Vitals monitoring
- Lighthouse CI

## 10. Security Checklist

- [ ] All environment variables are secure
- [ ] Supabase RLS policies are properly configured
- [ ] HTTPS is enforced
- [ ] CORS settings are configured
- [ ] Rate limiting is implemented
- [ ] Input validation is in place
- [ ] SQL injection protection is active

## 11. Backup and Recovery

### Database Backups
- Supabase automatically backs up your database
- Consider setting up additional backup strategies for critical data

### Code Backups
- Ensure code is backed up in version control
- Tag releases for easy rollback

## 12. Scaling Considerations

### Database Scaling
- Monitor Supabase usage and upgrade plan as needed
- Optimize queries and add indexes

### CDN and Caching
- Vercel/Netlify provide CDN automatically
- Configure appropriate cache headers

### Performance Optimization
- Optimize images and assets
- Implement lazy loading
- Use Next.js optimization features

## 13. Maintenance

### Regular Updates
- Keep dependencies updated
- Monitor security advisories
- Update Node.js version regularly

### Database Maintenance
- Monitor database performance
- Clean up old data periodically
- Optimize queries as needed

## Troubleshooting

### Common Issues

1. **Authentication not working**
   - Check redirect URLs in Google Console and Supabase
   - Verify environment variables

2. **Database connection issues**
   - Check Supabase URL and keys
   - Verify RLS policies

3. **Email not sending**
   - Check email service API keys
   - Verify sender authentication

4. **Build failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed

### Support Resources
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)

## Contact

For deployment support, please contact the development team or create an issue in the repository.
