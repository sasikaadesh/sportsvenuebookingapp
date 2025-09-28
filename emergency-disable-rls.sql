-- EMERGENCY: Disable ALL RLS policies
-- Copy and paste this EXACTLY into Supabase SQL Editor

-- Disable RLS on all tables
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS courts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pricing_rules DISABLE ROW LEVEL SECURITY;

-- Force drop any remaining policies (ignore errors)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON users;
DROP POLICY IF EXISTS "Allow public read access to users" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON users;

DROP POLICY IF EXISTS "Courts are viewable by everyone" ON courts;
DROP POLICY IF EXISTS "Enable read access for all users" ON courts;
DROP POLICY IF EXISTS "Allow public read access to courts" ON courts;

DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can insert own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
DROP POLICY IF EXISTS "Allow users to view own bookings" ON bookings;
DROP POLICY IF EXISTS "Allow users to create own bookings" ON bookings;
DROP POLICY IF EXISTS "Allow users to update own bookings" ON bookings;

DROP POLICY IF EXISTS "Pricing rules are viewable by everyone" ON pricing_rules;
DROP POLICY IF EXISTS "Allow public read access to pricing" ON pricing_rules;

-- Test that tables are now accessible
SELECT 'SUCCESS: RLS Disabled' as status;

-- Verify we can query each table
SELECT 'courts' as table_name, count(*) as record_count FROM courts
UNION ALL
SELECT 'users' as table_name, count(*) as record_count FROM users
UNION ALL
SELECT 'bookings' as table_name, count(*) as record_count FROM bookings
UNION ALL
SELECT 'pricing_rules' as table_name, count(*) as record_count FROM pricing_rules;
