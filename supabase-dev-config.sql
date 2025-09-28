-- Development Configuration for Supabase
-- Run this in Supabase SQL Editor to make development easier

-- 1. Auto-confirm all existing users (for development)
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 2. Create a simple function to auto-confirm new users (development only)
CREATE OR REPLACE FUNCTION auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-confirm users in development
    NEW.email_confirmed_at = NOW();
    -- Don't set confirmed_at as it's a generated column
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create trigger to auto-confirm (ONLY FOR DEVELOPMENT)
-- Remove this trigger in production!
DROP TRIGGER IF EXISTS auto_confirm_users ON auth.users;
CREATE TRIGGER auto_confirm_users
    BEFORE INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION auto_confirm_user();

-- 4. Check results
SELECT 
    email,
    email_confirmed_at IS NOT NULL as confirmed,
    created_at
FROM auth.users
ORDER BY created_at DESC;
