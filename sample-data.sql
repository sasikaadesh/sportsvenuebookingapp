-- Sample data for Sports Venue Booking App
-- Run this after setting up the main schema

-- Insert sample courts
INSERT INTO courts (id, name, type, description, images, amenities, is_active, maintenance_mode) VALUES
(
    'court-tennis-1',
    'Premium Tennis Court A',
    'tennis',
    'Professional-grade tennis court with synthetic grass surface. Perfect for competitive matches and training sessions.',
    '["https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]',
    '["Professional Lighting", "Equipment Rental", "Parking Available", "Changing Rooms", "Water Fountain"]',
    true,
    false
),
(
    'court-tennis-2',
    'Tennis Court B',
    'tennis',
    'Standard tennis court with hard surface. Great for recreational play and practice.',
    '["https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]',
    '["Lighting", "Parking Available", "Water Fountain"]',
    true,
    false
),
(
    'court-basketball-1',
    'Basketball Court Pro',
    'basketball',
    'Indoor basketball court with professional-grade flooring and adjustable hoops.',
    '["https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]',
    '["Indoor Climate Control", "Professional Sound System", "Scoreboard", "Changing Rooms", "Equipment Storage"]',
    true,
    false
),
(
    'court-basketball-2',
    'Outdoor Basketball Court',
    'basketball',
    'Outdoor basketball court with weather-resistant surface and regulation hoops.',
    '["https://images.unsplash.com/photo-1519861531473-9200262188bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]',
    '["Outdoor Lighting", "Parking Available", "Water Fountain", "Bench Seating"]',
    true,
    false
),
(
    'court-cricket-1',
    'Cricket Ground Elite',
    'cricket',
    'Full-size cricket ground with professionally maintained pitch and pavilion facilities.',
    '["https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]',
    '["Professional Pitch", "Pavilion", "Equipment Rental", "Scoreboard", "Changing Rooms", "Parking"]',
    true,
    false
),
(
    'court-badminton-1',
    'Badminton Court A',
    'badminton',
    'Indoor badminton court with wooden flooring and professional net setup.',
    '["https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]',
    '["Indoor Climate Control", "Professional Lighting", "Equipment Rental", "Changing Rooms"]',
    true,
    false
),
(
    'court-badminton-2',
    'Badminton Court B',
    'badminton',
    'Standard indoor badminton court suitable for recreational and competitive play.',
    '["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]',
    '["Indoor Lighting", "Equipment Rental", "Water Fountain"]',
    true,
    false
),
(
    'court-football-1',
    'Football Field Premium',
    'football',
    'Full-size football field with natural grass and professional goal posts.',
    '["https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]',
    '["Natural Grass", "Professional Goals", "Changing Rooms", "Parking", "Spectator Seating"]',
    true,
    false
);

-- Insert pricing rules
INSERT INTO pricing_rules (court_id, duration_hours, price, is_peak_hour, day_of_week, start_time, end_time) VALUES
-- Tennis Court A pricing
('court-tennis-1', 1.0, 45.00, false, NULL, '06:00', '17:00'),
('court-tennis-1', 1.0, 65.00, true, NULL, '17:00', '22:00'),
('court-tennis-1', 1.5, 67.50, false, NULL, '06:00', '17:00'),
('court-tennis-1', 1.5, 97.50, true, NULL, '17:00', '22:00'),
('court-tennis-1', 2.0, 90.00, false, NULL, '06:00', '17:00'),
('court-tennis-1', 2.0, 130.00, true, NULL, '17:00', '22:00'),

-- Tennis Court B pricing
('court-tennis-2', 1.0, 35.00, false, NULL, '06:00', '17:00'),
('court-tennis-2', 1.0, 50.00, true, NULL, '17:00', '22:00'),
('court-tennis-2', 1.5, 52.50, false, NULL, '06:00', '17:00'),
('court-tennis-2', 1.5, 75.00, true, NULL, '17:00', '22:00'),
('court-tennis-2', 2.0, 70.00, false, NULL, '06:00', '17:00'),
('court-tennis-2', 2.0, 100.00, true, NULL, '17:00', '22:00'),

-- Basketball Court Pro pricing
('court-basketball-1', 1.0, 35.00, false, NULL, '06:00', '17:00'),
('court-basketball-1', 1.0, 55.00, true, NULL, '17:00', '22:00'),
('court-basketball-1', 1.5, 52.50, false, NULL, '06:00', '17:00'),
('court-basketball-1', 1.5, 82.50, true, NULL, '17:00', '22:00'),
('court-basketball-1', 2.0, 70.00, false, NULL, '06:00', '17:00'),
('court-basketball-1', 2.0, 110.00, true, NULL, '17:00', '22:00'),

-- Outdoor Basketball Court pricing
('court-basketball-2', 1.0, 25.00, false, NULL, '06:00', '17:00'),
('court-basketball-2', 1.0, 35.00, true, NULL, '17:00', '22:00'),
('court-basketball-2', 1.5, 37.50, false, NULL, '06:00', '17:00'),
('court-basketball-2', 1.5, 52.50, true, NULL, '17:00', '22:00'),
('court-basketball-2', 2.0, 50.00, false, NULL, '06:00', '17:00'),
('court-basketball-2', 2.0, 70.00, true, NULL, '17:00', '22:00'),

-- Cricket Ground pricing
('court-cricket-1', 3.0, 240.00, false, NULL, '08:00', '17:00'),
('court-cricket-1', 3.0, 300.00, true, NULL, '17:00', '20:00'),
('court-cricket-1', 4.0, 320.00, false, NULL, '08:00', '17:00'),
('court-cricket-1', 4.0, 400.00, true, NULL, '17:00', '19:00'),

-- Badminton Court A pricing
('court-badminton-1', 1.0, 30.00, false, NULL, '06:00', '17:00'),
('court-badminton-1', 1.0, 45.00, true, NULL, '17:00', '22:00'),
('court-badminton-1', 1.5, 45.00, false, NULL, '06:00', '17:00'),
('court-badminton-1', 1.5, 67.50, true, NULL, '17:00', '22:00'),
('court-badminton-1', 2.0, 60.00, false, NULL, '06:00', '17:00'),
('court-badminton-1', 2.0, 90.00, true, NULL, '17:00', '22:00'),

-- Badminton Court B pricing
('court-badminton-2', 1.0, 25.00, false, NULL, '06:00', '17:00'),
('court-badminton-2', 1.0, 35.00, true, NULL, '17:00', '22:00'),
('court-badminton-2', 1.5, 37.50, false, NULL, '06:00', '17:00'),
('court-badminton-2', 1.5, 52.50, true, NULL, '17:00', '22:00'),
('court-badminton-2', 2.0, 50.00, false, NULL, '06:00', '17:00'),
('court-badminton-2', 2.0, 70.00, true, NULL, '17:00', '22:00'),

-- Football Field pricing
('court-football-1', 1.5, 120.00, false, NULL, '08:00', '17:00'),
('court-football-1', 1.5, 180.00, true, NULL, '17:00', '21:00'),
('court-football-1', 2.0, 160.00, false, NULL, '08:00', '17:00'),
('court-football-1', 2.0, 240.00, true, NULL, '17:00', '20:00');

-- Insert some sample blocked slots (maintenance periods)
INSERT INTO blocked_slots (court_id, blocked_date, start_time, end_time, reason) VALUES
('court-tennis-1', '2024-01-20', '08:00', '12:00', 'Court maintenance and resurfacing'),
('court-basketball-1', '2024-01-25', '06:00', '10:00', 'Equipment upgrade and cleaning'),
('court-cricket-1', '2024-01-30', '08:00', '17:00', 'Pitch maintenance and preparation');

-- Note: Sample users and bookings will be created through the application
-- as they require proper authentication and user creation flow
