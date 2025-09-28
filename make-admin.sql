-- MAKE USER ADMIN SCRIPT
-- Replace 'your-email@example.com' with the actual email of the user you want to make admin

-- First, add role column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Update a specific user to be admin (replace with actual email)
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Verify the update
SELECT id, email, full_name, role 
FROM users 
WHERE role = 'admin';

-- If you want to make the first user admin (useful for testing)
-- UPDATE users 
-- SET role = 'admin' 
-- WHERE id = (SELECT id FROM users ORDER BY created_at LIMIT 1);

-- Show all users and their roles
SELECT email, full_name, role, created_at 
FROM users 
ORDER BY created_at;
