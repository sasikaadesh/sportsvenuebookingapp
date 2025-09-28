-- COMPLETE SETUP WITH AUTO USER PROFILE CREATION
-- Copy and paste this EXACTLY into Supabase SQL Editor

-- 1. DISABLE RLS ON ALL TABLES
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS courts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bookings DISABLE ROW LEVEL SECURITY;

-- 2. DROP ALL EXISTING POLICIES
DO $$ 
BEGIN
    -- Drop all policies (ignore errors)
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
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 3. CREATE USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREATE COURTS TABLE
CREATE TABLE IF NOT EXISTS courts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  images JSONB DEFAULT '[]',
  amenities JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CREATE BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_hours INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 45.00,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CLEAR AND INSERT COURTS DATA
DELETE FROM courts;

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

-- 7. CREATE FUNCTION TO AUTO-CREATE USER PROFILES
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. CREATE TRIGGER FOR AUTO USER PROFILE CREATION
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. CREATE UPDATED_AT TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_courts_updated_at ON courts;
CREATE TRIGGER update_courts_updated_at BEFORE UPDATE ON courts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_courts_type ON courts(type);
CREATE INDEX IF NOT EXISTS idx_courts_active ON courts(is_active);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_court ON bookings(court_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 11. VERIFY SETUP
SELECT 'Database setup complete with auto user profile creation!' as status;

-- Show table counts
SELECT 'courts' as table_name, count(*) as record_count FROM courts
UNION ALL
SELECT 'users' as table_name, count(*) as record_count FROM users
UNION ALL
SELECT 'bookings' as table_name, count(*) as record_count FROM bookings;

-- Show sample court data
SELECT
  id,
  name,
  type,
  is_active,
  jsonb_array_length(images) as image_count,
  jsonb_array_length(amenities) as amenity_count
FROM courts
ORDER BY name;
