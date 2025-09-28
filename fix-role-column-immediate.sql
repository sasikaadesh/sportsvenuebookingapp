-- IMMEDIATE FIX: Add role column to users table
-- Copy and paste this EXACTLY into Supabase SQL Editor

-- Step 1: Add role column with default value
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';

-- Step 2: Add constraint to ensure valid values
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin'));

-- Step 3: Create index for better performance
CREATE INDEX idx_users_role ON users(role);

-- Step 4: Show current table structure to verify
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 5: Show current users (should now have role = 'user' by default)
SELECT id, email, full_name, role, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 5;

-- Success message
SELECT 'Role column added successfully! All users now have role = ''user'' by default.' as message;



