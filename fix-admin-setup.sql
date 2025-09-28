-- FIX ADMIN SETUP - Add role column and setup admin functionality
-- Copy and paste this into Supabase SQL Editor

-- 1. Add role column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 2. Update role column to use proper constraints
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('user', 'admin'));

-- 3. Create index for role column for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 4. Show current users and their roles
SELECT 
  id, 
  email, 
  full_name, 
  role,
  created_at
FROM users 
ORDER BY created_at DESC;

-- 5. Instructions to make a user admin:
-- Replace 'your-email@example.com' with the actual email
-- UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

-- 6. Verify admin users
-- SELECT id, email, full_name, role FROM users WHERE role = 'admin';

SELECT 'Admin setup complete! Use the UPDATE statement above to make a user admin.' as message;

