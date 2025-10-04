-- DISABLE EMAIL CONFIRMATION FOR DEVELOPMENT
-- Run this in Supabase SQL Editor to make signup easier during development

-- 1. Auto-confirm all existing users
UPDATE auth.users
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 2. Create a trigger to auto-confirm new users (development only)
CREATE OR REPLACE FUNCTION auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-confirm users in development
    NEW.email_confirmed_at = NOW();
    NEW.confirmed_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger
DROP TRIGGER IF EXISTS auto_confirm_user_trigger ON auth.users;
CREATE TRIGGER auto_confirm_user_trigger
    BEFORE INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION auto_confirm_user();

-- 4. Verify the changes
SELECT 
    email,
    email_confirmed_at IS NOT NULL as is_confirmed,
    created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- NOTE: To re-enable email confirmation later, run:
-- DROP TRIGGER IF EXISTS auto_confirm_user_trigger ON auth.users;
-- DROP FUNCTION IF EXISTS auto_confirm_user();
