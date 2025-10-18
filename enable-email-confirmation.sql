-- RE-ENABLE EMAIL CONFIRMATION FOR PRODUCTION
-- Run this in Supabase SQL Editor to enable email confirmations

-- 1. Remove the auto-confirm trigger (if it exists)
DROP TRIGGER IF EXISTS auto_confirm_user_trigger ON auth.users;

-- 2. Remove the auto-confirm function (if it exists)
DROP FUNCTION IF EXISTS auto_confirm_user();

-- 3. Verify the trigger is removed
SELECT 
    tgname as trigger_name,
    tgenabled as is_enabled
FROM pg_trigger 
WHERE tgname = 'auto_confirm_user_trigger';

-- 4. Check recent users to see if auto-confirm is still happening
SELECT 
    email,
    email_confirmed_at,
    confirmed_at,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL AND created_at = email_confirmed_at THEN 'Auto-confirmed'
        WHEN email_confirmed_at IS NOT NULL THEN 'Manually confirmed'
        ELSE 'Not confirmed'
    END as confirmation_status
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 5. (Optional) If you want to un-confirm existing users to test email flow
-- Uncomment the lines below to reset confirmation for testing
-- WARNING: This will require all users to re-confirm their emails!

-- UPDATE auth.users
-- SET email_confirmed_at = NULL,
--     confirmed_at = NULL
-- WHERE email = 'test@example.com'; -- Replace with specific test email

-- NEXT STEPS:
-- 1. Go to Supabase Dashboard → Authentication → Settings
-- 2. Make sure "Enable email confirmations" is CHECKED ✅
-- 3. Set Site URL to: https://sportsvenuebookings.com
-- 4. Add Redirect URLs:
--    - https://sportsvenuebookings.com/**
--    - https://sportsvenuebookings.com/auth/callback
--    - https://sportsvenuebookings.com/auth/signin
--    - https://sportsvenuebookings.com/auth/signin?returnTo=/app
-- 5. Test signup with a new email address
-- 6. Check spam folder if email doesn't arrive

