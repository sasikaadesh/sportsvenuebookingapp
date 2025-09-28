-- Create Sample Courts - Run this in Supabase SQL Editor if the debug page fails

-- First, make sure the courts table exists (run the full schema first if needed)

-- Insert sample courts
INSERT INTO courts (name, type, description, images, amenities, is_active) VALUES
('Tennis Court A', 'tennis', 'Professional tennis court with synthetic surface', 
 '["https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]', 
 '["Lighting", "Seating", "Water Fountain"]', true),
('Basketball Court Pro', 'basketball', 'Indoor basketball court with wooden flooring', 
 '["https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]', 
 '["Air Conditioning", "Sound System", "Scoreboard"]', true),
('Cricket Ground Elite', 'cricket', 'Full-size cricket ground with natural grass', 
 '["https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]', 
 '["Pavilion", "Scoreboard", "Practice Nets"]', true),
('Badminton Court Central', 'badminton', 'Indoor badminton court with wooden flooring', 
 '["https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]', 
 '["Air Conditioning", "Equipment Rental", "Seating"]', true),
('Football Field Stadium', 'football', 'Full-size football field with natural grass', 
 '["https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]', 
 '["Floodlights", "Changing Rooms", "Parking"]', true)
ON CONFLICT (name) DO NOTHING;

-- Create pricing rules for each court
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

-- Check results
SELECT 
    'Courts' as table_name, 
    count(*) as count 
FROM courts
UNION ALL
SELECT 
    'Pricing Rules' as table_name, 
    count(*) as count 
FROM pricing_rules;
