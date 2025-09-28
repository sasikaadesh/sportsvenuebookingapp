-- Fix Database Script
-- Run this in Supabase SQL Editor to fix all issues

-- 1. Create profiles for existing auth users who don't have profiles
INSERT INTO users (id, email, name, phone, role)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'name', ''),
    COALESCE(au.raw_user_meta_data->>'phone', ''),
    'user'::user_role
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 2. Create sample courts if they don't exist
INSERT INTO courts (name, type, description, images, amenities, is_active)
SELECT 'Tennis Court A', 'tennis', 'Professional tennis court with synthetic surface',
       '["https://images.unsplash.com/photo-1554068865-24cecd4e34b8"]',
       '["Lighting", "Seating", "Water Fountain"]', true
WHERE NOT EXISTS (SELECT 1 FROM courts WHERE name = 'Tennis Court A');

INSERT INTO courts (name, type, description, images, amenities, is_active)
SELECT 'Basketball Court Pro', 'basketball', 'Indoor basketball court with wooden flooring',
       '["https://images.unsplash.com/photo-1546519638-68e109498ffc"]',
       '["Air Conditioning", "Sound System", "Scoreboard"]', true
WHERE NOT EXISTS (SELECT 1 FROM courts WHERE name = 'Basketball Court Pro');

INSERT INTO courts (name, type, description, images, amenities, is_active)
SELECT 'Cricket Ground Elite', 'cricket', 'Full-size cricket ground with natural grass',
       '["https://images.unsplash.com/photo-1540747913346-19e32dc3e97e"]',
       '["Pavilion", "Scoreboard", "Practice Nets"]', true
WHERE NOT EXISTS (SELECT 1 FROM courts WHERE name = 'Cricket Ground Elite');

INSERT INTO courts (name, type, description, images, amenities, is_active)
SELECT 'Badminton Court Central', 'badminton', 'Indoor badminton court with wooden flooring',
       '["https://images.unsplash.com/photo-1544551763-46a013bb70d5"]',
       '["Air Conditioning", "Equipment Rental", "Seating"]', true
WHERE NOT EXISTS (SELECT 1 FROM courts WHERE name = 'Badminton Court Central');

INSERT INTO courts (name, type, description, images, amenities, is_active)
SELECT 'Football Field Stadium', 'football', 'Full-size football field with natural grass',
       '["https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d"]',
       '["Floodlights", "Changing Rooms", "Parking"]', true
WHERE NOT EXISTS (SELECT 1 FROM courts WHERE name = 'Football Field Stadium');

-- 3. Create pricing rules for courts
INSERT INTO pricing_rules (court_id, duration_hours, off_peak_price, peak_price)
SELECT 
    c.id,
    1,
    CASE 
        WHEN c.type = 'tennis' THEN 45.00
        WHEN c.type = 'basketball' THEN 55.00
        WHEN c.type = 'cricket' THEN 80.00
        WHEN c.type = 'badminton' THEN 35.00
        WHEN c.type = 'football' THEN 120.00
        ELSE 50.00
    END,
    CASE 
        WHEN c.type = 'tennis' THEN 65.00
        WHEN c.type = 'basketball' THEN 75.00
        WHEN c.type = 'cricket' THEN 120.00
        WHEN c.type = 'badminton' THEN 50.00
        WHEN c.type = 'football' THEN 180.00
        ELSE 70.00
    END
FROM courts c
WHERE NOT EXISTS (
    SELECT 1 FROM pricing_rules pr 
    WHERE pr.court_id = c.id AND pr.duration_hours = 1
);

INSERT INTO pricing_rules (court_id, duration_hours, off_peak_price, peak_price)
SELECT 
    c.id,
    2,
    CASE 
        WHEN c.type = 'tennis' THEN 85.00
        WHEN c.type = 'basketball' THEN 105.00
        WHEN c.type = 'cricket' THEN 150.00
        WHEN c.type = 'badminton' THEN 65.00
        WHEN c.type = 'football' THEN 220.00
        ELSE 95.00
    END,
    CASE 
        WHEN c.type = 'tennis' THEN 120.00
        WHEN c.type = 'basketball' THEN 140.00
        WHEN c.type = 'cricket' THEN 220.00
        WHEN c.type = 'badminton' THEN 90.00
        WHEN c.type = 'football' THEN 320.00
        ELSE 130.00
    END
FROM courts c
WHERE NOT EXISTS (
    SELECT 1 FROM pricing_rules pr 
    WHERE pr.court_id = c.id AND pr.duration_hours = 2
);

-- 4. Verify the trigger is working
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users (id, email, name, phone)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', '')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, users.name),
        phone = COALESCE(EXCLUDED.phone, users.phone),
        updated_at = NOW();
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the auth process
        RAISE WARNING 'Failed to create user profile: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 5. Check results
SELECT 'Auth Users' as table_name, count(*) as count FROM auth.users
UNION ALL
SELECT 'Profile Users' as table_name, count(*) as count FROM users
UNION ALL
SELECT 'Courts' as table_name, count(*) as count FROM courts
UNION ALL
SELECT 'Pricing Rules' as table_name, count(*) as count FROM pricing_rules
UNION ALL
SELECT 'Bookings' as table_name, count(*) as count FROM bookings;
