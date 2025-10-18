-- FIX USER DELETION TRIGGER - SAFE VERSION
-- This version works regardless of your column names
-- Run this in Supabase SQL Editor

-- STEP 1: Check your users table structure first
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- STEP 2: Drop the existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- STEP 3: Create the fixed function
-- This version checks which columns exist and uses them appropriately
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    has_name_column BOOLEAN;
    has_full_name_column BOOLEAN;
    user_name_value TEXT;
BEGIN
    -- Check which name column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND table_schema = 'public'
        AND column_name = 'name'
    ) INTO has_name_column;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND table_schema = 'public'
        AND column_name = 'full_name'
    ) INTO has_full_name_column;
    
    -- Get the name value from metadata
    user_name_value := COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        ''
    );
    
    -- Insert based on which columns exist
    IF has_name_column THEN
        -- Table has 'name' column
        INSERT INTO users (id, email, name, phone)
        VALUES (
            NEW.id,
            NEW.email,
            user_name_value,
            COALESCE(NEW.raw_user_meta_data->>'phone', '')
        )
        ON CONFLICT (id) DO NOTHING;  -- DO NOTHING to prevent recreating deleted users
        
    ELSIF has_full_name_column THEN
        -- Table has 'full_name' column
        INSERT INTO users (id, email, full_name, phone)
        VALUES (
            NEW.id,
            NEW.email,
            user_name_value,
            COALESCE(NEW.raw_user_meta_data->>'phone', '')
        )
        ON CONFLICT (id) DO NOTHING;  -- DO NOTHING to prevent recreating deleted users
        
    ELSE
        -- Table has neither, just insert id and email
        INSERT INTO users (id, email, phone)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'phone', '')
        )
        ON CONFLICT (id) DO NOTHING;  -- DO NOTHING to prevent recreating deleted users
    END IF;
    
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the auth process
        RAISE WARNING 'Failed to create user profile: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 4: Recreate the trigger - ONLY on INSERT, not UPDATE
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users  -- Only INSERT, not UPDATE
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- STEP 5: Verify the trigger was created correctly
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created'
AND event_object_table = 'users'
AND event_object_schema = 'auth';

-- STEP 6: Verify cascade delete is working
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
    AND tc.table_schema = 'public';

-- Expected result: delete_rule should be 'CASCADE'
-- If delete_rule is not CASCADE, run this to fix it:
/*
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;
ALTER TABLE users ADD CONSTRAINT users_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
*/

-- STEP 7: Clean up any orphaned profiles (optional)
-- Uncomment the following to remove users that exist in public.users but not in auth.users
/*
DELETE FROM users 
WHERE id NOT IN (SELECT id FROM auth.users);
*/

-- STEP 8: Show summary
SELECT 
    'Trigger fix complete!' as status,
    'User deletion should now work correctly on first attempt' as message;

-- STEP 9: Show current user counts
SELECT 
    'Auth Users' as table_name, 
    COUNT(*) as count 
FROM auth.users
UNION ALL
SELECT 
    'Profile Users' as table_name, 
    COUNT(*) as count 
FROM users;

