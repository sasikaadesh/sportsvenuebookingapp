-- CHECK USERS TABLE STRUCTURE
-- Run this to see what columns actually exist in your users table

-- 1. Check the structure of public.users table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Show sample data from users table
SELECT * FROM public.users LIMIT 3;

-- 3. Check auth.users structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'auth'
ORDER BY ordinal_position
LIMIT 10;
