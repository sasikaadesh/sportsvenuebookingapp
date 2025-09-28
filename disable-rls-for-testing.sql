-- Temporarily disable RLS for testing - Run this in Supabase SQL Editor

-- Disable RLS on all tables for testing
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE courts DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules DISABLE ROW LEVEL SECURITY;

-- Verify tables exist and have data
SELECT 'users' as table_name, count(*) as count FROM users
UNION ALL
SELECT 'courts' as table_name, count(*) as count FROM courts
UNION ALL
SELECT 'bookings' as table_name, count(*) as count FROM bookings
UNION ALL
SELECT 'pricing_rules' as table_name, count(*) as count FROM pricing_rules;
