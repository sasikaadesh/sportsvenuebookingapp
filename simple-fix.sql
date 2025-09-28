-- Simple fix for development - run this in Supabase SQL Editor

-- 1. Auto-confirm all existing users
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 2. Check results
SELECT 
    email,
    email_confirmed_at IS NOT NULL as is_confirmed,
    created_at
FROM auth.users
ORDER BY created_at DESC;
