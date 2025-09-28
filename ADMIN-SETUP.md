# Admin Setup Guide

This guide explains how to set up admin access for your Sports Venue Booking App.

## 1. Database Setup

First, run the admin setup SQL script in your Supabase SQL Editor:

```sql
-- Copy the contents of fix-admin-setup.sql and run it in Supabase
```

## 2. Environment Variables

Add admin emails to your `.env.local` file (create it if it doesn't exist):

```env
# Supabase Configuration (required)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin Email Configuration
# Users with these emails will automatically get admin privileges
NEXT_PUBLIC_ADMIN_EMAIL_1=admin@yourdomain.com
NEXT_PUBLIC_ADMIN_EMAIL_2=manager@yourdomain.com
NEXT_PUBLIC_ADMIN_EMAIL_3=owner@yourdomain.com
```

## 3. Manual Admin Assignment

If you need to manually make a user an admin, run this SQL in Supabase:

```sql
-- Replace with actual email address
UPDATE users 
SET role = 'admin' 
WHERE email = 'user@example.com';
```

## 4. Admin Setup Page

For development/testing, you can use the admin setup page:

1. Sign in to your account
2. Go to `http://localhost:3000/admin-setup`
3. Click "Make Me Admin" to promote your current user

## 5. Accessing Admin Panel

Once you have admin privileges:

- Main admin dashboard: `http://localhost:3000/admin`
- All bookings: `http://localhost:3000/admin/bookings`
- Manage courts: `http://localhost:3000/admin/courts`

## 6. Verify Admin Access

To check if admin setup is working:

1. Sign in with an admin email
2. Go to `http://localhost:3000/admin-setup`
3. Click "Check Admin Status"
4. Click "Test Admin Access" to open the admin panel

## Troubleshooting

### Admin page shows "Access Denied"
- Check that your user has `role = 'admin'` in the database
- Verify the admin email is configured in environment variables
- Make sure the database has the `role` column

### Database errors
- Run the `fix-admin-setup.sql` script
- Check that all tables exist and have the correct schema

### Environment variables not working
- Restart your development server after adding environment variables
- Make sure `.env.local` is in your project root
- Check that variable names start with `NEXT_PUBLIC_` for client-side access

## Security Notes

- Admin emails are configured at build time
- Don't commit actual admin emails to version control
- Use environment variables for production deployment
- Consider implementing more sophisticated role management for large applications
