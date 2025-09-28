-- EMERGENCY COURTS SETUP - MINIMAL VERSION
-- Copy and paste this EXACTLY into Supabase SQL Editor

-- 1. DISABLE RLS ON COURTS TABLE
ALTER TABLE IF EXISTS courts DISABLE ROW LEVEL SECURITY;

-- 2. DROP ALL POLICIES ON COURTS
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Courts are viewable by everyone" ON courts;
    DROP POLICY IF EXISTS "Enable read access for all users" ON courts;
    DROP POLICY IF EXISTS "Allow public read access to courts" ON courts;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 3. CREATE COURTS TABLE (if it doesn't exist)
CREATE TABLE IF NOT EXISTS courts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CLEAR AND INSERT COURTS DATA
DELETE FROM courts;

INSERT INTO courts (name, type, description, images, amenities, is_active) VALUES
('Premium Tennis Court A', 'tennis', 'Professional tennis court', 
 '["https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]', 
 '["Lighting", "Equipment Rental"]', true),

('Basketball Court Pro', 'basketball', 'Indoor basketball court', 
 '["https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]', 
 '["Indoor", "Air Conditioning"]', true),

('Cricket Ground', 'cricket', 'Cricket ground', 
 '["https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]', 
 '["Professional Pitch"]', true);

-- 5. CREATE USERS TABLE (needed for bookings)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CREATE BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_hours INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 45.00,
  status TEXT NOT NULL DEFAULT 'confirmed',
  payment_status TEXT NOT NULL DEFAULT 'paid',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. DISABLE RLS ON ALL TABLES
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bookings DISABLE ROW LEVEL SECURITY;

-- 8. VERIFY SETUP
SELECT 'Complete setup finished!' as status;
SELECT id, name, type, is_active FROM courts ORDER BY name;
