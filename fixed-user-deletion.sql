-- FIXED USER DELETION FUNCTION
-- This version works with the actual table structure

-- 1. Drop existing functions first
DROP FUNCTION IF EXISTS delete_user_completely(UUID);
DROP FUNCTION IF EXISTS check_user_exists(UUID);

-- 2. Create a function to check user existence (fixed version)
CREATE OR REPLACE FUNCTION check_user_exists(user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    auth_user RECORD;
    profile_user RECORD;
    result JSON;
BEGIN
    -- Check auth.users
    SELECT id, email, created_at INTO auth_user FROM auth.users WHERE id = user_id;
    
    -- Check public.users (using actual column names)
    SELECT id, email INTO profile_user FROM public.users WHERE id = user_id;
    
    RETURN json_build_object(
        'user_id', user_id,
        'auth_exists', auth_user.id IS NOT NULL,
        'auth_email', auth_user.email,
        'auth_created', auth_user.created_at,
        'profile_exists', profile_user.id IS NOT NULL,
        'profile_email', profile_user.email
    );
END;
$$;

-- 3. Create the deletion function (fixed version)
CREATE OR REPLACE FUNCTION delete_user_completely(user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_email TEXT;
    auth_exists BOOLEAN := FALSE;
    profile_exists BOOLEAN := FALSE;
    result JSON;
BEGIN
    -- Check if user exists in auth.users
    SELECT email INTO user_email FROM auth.users WHERE id = user_id;
    IF user_email IS NOT NULL THEN
        auth_exists := TRUE;
    END IF;
    
    -- Check if user exists in public.users
    IF NOT auth_exists THEN
        SELECT email INTO user_email FROM public.users WHERE id = user_id;
        IF user_email IS NOT NULL THEN
            profile_exists := TRUE;
        END IF;
    ELSE
        -- Check if profile exists
        SELECT COUNT(*) > 0 INTO profile_exists FROM public.users WHERE id = user_id;
    END IF;
    
    -- If user doesn't exist in either table
    IF NOT auth_exists AND NOT profile_exists THEN
        RETURN json_build_object(
            'success', false,
            'error', 'User not found in any table',
            'user_id', user_id
        );
    END IF;
    
    -- Delete from auth.users first (this should cascade to users table)
    IF auth_exists THEN
        DELETE FROM auth.users WHERE id = user_id;
    END IF;
    
    -- Also explicitly delete from users table if it still exists
    IF profile_exists THEN
        DELETE FROM public.users WHERE id = user_id;
    END IF;
    
    -- Return success
    RETURN json_build_object(
        'success', true,
        'message', 'User deleted successfully',
        'deleted_email', user_email,
        'deleted_id', user_id,
        'auth_existed', auth_exists,
        'profile_existed', profile_exists
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'error_code', SQLSTATE,
            'user_id', user_id
        );
END;
$$;

-- 4. Grant execute permissions
GRANT EXECUTE ON FUNCTION delete_user_completely(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION check_user_exists(UUID) TO service_role;

-- 5. Test the functions work
SELECT 'Functions created successfully' as status;

-- 6. Show available functions
SELECT 
    routine_name, 
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_name IN ('delete_user_completely', 'check_user_exists')
AND routine_schema = 'public';
