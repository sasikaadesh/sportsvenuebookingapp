-- SIMPLE DATABASE SETUP FOR SPORTS VENUE BOOKING APP
-- Copy and paste this EXACTLY into Supabase SQL Editor

-- 1. DISABLE ALL RLS POLICIES (for development)
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS courts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bookings DISABLE ROW LEVEL SECURITY;

-- 2. DROP EXISTING POLICIES (ignore errors)
DO $$ 
BEGIN
    -- Drop all policies on users table
    DROP POLICY IF EXISTS "Users can view own profile" ON users;
    DROP POLICY IF EXISTS "Users can update own profile" ON users;
    DROP POLICY IF EXISTS "Enable read access for all users" ON users;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
    DROP POLICY IF EXISTS "Enable update for users based on email" ON users;
    DROP POLICY IF EXISTS "Allow public read access to users" ON users;
    DROP POLICY IF EXISTS "Allow authenticated users to insert" ON users;

    -- Drop all policies on courts table
    DROP POLICY IF EXISTS "Courts are viewable by everyone" ON courts;
    DROP POLICY IF EXISTS "Enable read access for all users" ON courts;
    DROP POLICY IF EXISTS "Allow public read access to courts" ON courts;

    -- Drop all policies on bookings table
    DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
    DROP POLICY IF EXISTS "Users can insert own bookings" ON bookings;
    DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
    DROP POLICY IF EXISTS "Allow users to view own bookings" ON bookings;
    DROP POLICY IF EXISTS "Allow users to create own bookings" ON bookings;
    DROP POLICY IF EXISTS "Allow users to update own bookings" ON bookings;
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Ignore errors
END $$;

-- 3. CREATE TABLES IF THEY DON'T EXIST

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courts table
CREATE TABLE IF NOT EXISTS courts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('tennis', 'basketball', 'cricket', 'football', 'badminton')),
  description TEXT,
  images TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  location TEXT DEFAULT 'Sports Complex',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_hours INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CLEAR EXISTING COURTS DATA AND INSERT FRESH DATA
DELETE FROM courts;

-- Insert sample courts
INSERT INTO courts (name, type, description, images, amenities, is_active) VALUES
('Premium Tennis Court A', 'tennis', 'Professional-grade tennis court with synthetic grass surface', 
 '["https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]', 
 '["Professional Lighting", "Equipment Rental", "Parking Available"]', true),

('Tennis Court B', 'tennis', 'Standard tennis court with hard surface', 
 '["https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]', 
 '["Lighting", "Parking Available"]', true),

('Basketball Court Pro', 'basketball', 'Indoor basketball court with professional equipment', 
 '["https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]', 
 '["Indoor", "Air Conditioning", "Sound System"]', true),

('Cricket Ground Elite', 'cricket', 'Full-size cricket ground with professional facilities', 
 '["https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]', 
 '["Professional Pitch", "Pavilion", "Equipment"]', true),

('Football Field', 'football', 'Standard football field with grass surface', 
 '["https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]', 
 '["Grass Surface", "Goal Posts", "Changing Rooms"]', true),

('Badminton Court', 'badminton', 'Indoor badminton court with wooden flooring', 
 '["https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]', 
 '["Indoor", "Wooden Floor", "Net Equipment"]', true);

-- 5. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_courts_type ON courts(type);
CREATE INDEX IF NOT EXISTS idx_courts_active ON courts(is_active);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_court ON bookings(court_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);

-- 6. CREATE UPDATED_AT TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_courts_updated_at ON courts;
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;

-- Create new triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courts_updated_at BEFORE UPDATE ON courts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. VERIFY SETUP
SELECT 'SUCCESS: Database setup complete!' as status;

-- Show table counts
SELECT 'courts' as table_name, count(*) as record_count FROM courts
UNION ALL
SELECT 'users' as table_name, count(*) as record_count FROM users
UNION ALL
SELECT 'bookings' as table_name, count(*) as record_count FROM bookings;

-- Show sample court data with IDs
SELECT 
  id,
  name,
  type,
  is_active,
  array_length(images, 1) as image_count,
  array_length(amenities, 1) as amenity_count
FROM courts 
ORDER BY created_at DESC;
