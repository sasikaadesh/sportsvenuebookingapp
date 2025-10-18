-- FIX USER DELETION TRIGGER ISSUE
-- This fixes the problem where deleted users reappear in the admin panel
-- Run this in Supabase SQL Editor

-- The issue: The trigger runs on INSERT OR UPDATE, and uses ON CONFLICT DO UPDATE
-- This can cause deleted users to be recreated

-- Solution: Change trigger to only run on INSERT, not UPDATE
-- And change ON CONFLICT to DO NOTHING instead of DO UPDATE

-- 1. Drop the existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Update the function to use DO NOTHING on conflict
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create profile if it doesn't exist
    -- DO NOTHING on conflict to prevent recreating deleted users
    INSERT INTO users (id, email, name, phone)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', '')
    )
    ON CONFLICT (id) DO NOTHING;  -- Changed from DO UPDATE to DO NOTHING
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the auth process
        RAISE WARNING 'Failed to create user profile: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recreate the trigger - ONLY on INSERT, not UPDATE
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users  -- Changed from "INSERT OR UPDATE" to just "INSERT"
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. Verify the trigger was created correctly
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 5. First, check what columns exist in your users table
SELECT
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'users'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Test: Check if there are any orphaned profiles (users in public.users but not in auth.users)
-- Note: Adjust column names based on what you see above
-- Common column names: 'name' or 'full_name'
SELECT
    u.id,
    u.email,
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'name')
        THEN (SELECT name FROM users WHERE id = u.id)
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'full_name')
        THEN (SELECT full_name FROM users WHERE id = u.id)
        ELSE 'N/A'
    END as user_name,
    'Orphaned - exists in users table but not in auth.users' as status
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE au.id IS NULL;

-- If you see orphaned profiles above, you can clean them up with:
-- DELETE FROM users WHERE id IN (
--     SELECT u.id FROM users u
--     LEFT JOIN auth.users au ON u.id = au.id
--     WHERE au.id IS NULL
-- );

-- 6. Verify cascade delete is working
-- Check the foreign key constraint
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.table_name = 'users' 
    AND tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_name = 'users';

-- Expected result: delete_rule should be 'CASCADE'
-- If not, run this to fix it:
-- ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;
-- ALTER TABLE users ADD CONSTRAINT users_id_fkey 
--     FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

SELECT 'Trigger fix complete! User deletion should now work correctly on first attempt.' as status;

