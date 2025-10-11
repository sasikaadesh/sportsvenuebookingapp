-- COMPLETE USER DELETION SOLUTION
-- Run this in Supabase SQL Editor to create a robust user deletion system

-- 1. Create a function to completely delete a user
CREATE OR REPLACE FUNCTION delete_user_completely(user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_email TEXT;
    user_name TEXT;
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
    SELECT email, name INTO user_email, user_name FROM public.users WHERE id = user_id;
    IF user_email IS NOT NULL THEN
        profile_exists := TRUE;
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
        'deleted_name', user_name,
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

-- 2. Grant execute permission to service role
GRANT EXECUTE ON FUNCTION delete_user_completely(UUID) TO service_role;

-- 3. Create a function to check user existence
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
    
    -- Check public.users
    SELECT id, email, name, role INTO profile_user FROM public.users WHERE id = user_id;
    
    RETURN json_build_object(
        'user_id', user_id,
        'auth_exists', auth_user.id IS NOT NULL,
        'auth_email', auth_user.email,
        'auth_created', auth_user.created_at,
        'profile_exists', profile_user.id IS NOT NULL,
        'profile_email', profile_user.email,
        'profile_name', profile_user.name,
        'profile_role', profile_user.role
    );
END;
$$;

-- 4. Grant execute permission
GRANT EXECUTE ON FUNCTION check_user_exists(UUID) TO service_role;

-- 5. Test the functions (uncomment and replace with actual user ID to test)
-- SELECT check_user_exists('your-user-id-here');
-- SELECT delete_user_completely('your-user-id-here');

-- 6. Verify functions were created
SELECT 
    routine_name, 
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_name IN ('delete_user_completely', 'check_user_exists')
AND routine_schema = 'public';
