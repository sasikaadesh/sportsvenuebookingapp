-- STEP 1: Fix user profiles for existing auth users
-- Run this first
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

-- STEP 2: Create sample courts (run each INSERT separately if needed)
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

-- STEP 3: Fix the trigger for new users
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
        RAISE WARNING 'Failed to create user profile: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- STEP 4: Check results
SELECT 'Auth Users' as table_name, count(*) as count FROM auth.users
UNION ALL
SELECT 'Profile Users' as table_name, count(*) as count FROM users
UNION ALL
SELECT 'Courts' as table_name, count(*) as count FROM courts;
