-- Fix badminton court image in existing database
-- Run this in your Supabase SQL Editor to update existing data

-- Update any badminton courts to use the correct image URL
UPDATE courts 
SET image_url = 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
WHERE type = 'badminton' OR name ILIKE '%badminton%';

-- For databases using images array (JSONB format)
UPDATE courts 
SET images = '["https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]'::jsonb
WHERE (type = 'badminton' OR name ILIKE '%badminton%') AND images IS NOT NULL;

-- Verify the changes
SELECT 
  id, 
  name, 
  type, 
  image_url,
  images
FROM courts 
WHERE type = 'badminton' OR name ILIKE '%badminton%';


