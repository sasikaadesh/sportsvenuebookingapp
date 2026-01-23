-- Migration script to add multiple images support to courts table
-- Run this in your Supabase SQL Editor

-- 1. Add new images column (JSONB array) if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'courts' AND column_name = 'images'
  ) THEN
    ALTER TABLE courts ADD COLUMN images JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- 2. Migrate existing image_url data to images array
UPDATE courts 
SET images = jsonb_build_array(image_url)
WHERE image_url IS NOT NULL 
  AND image_url != '' 
  AND (images IS NULL OR images = '[]'::jsonb);

-- 3. Add nice multiple images for each court type
-- Tennis Courts
UPDATE courts 
SET images = '[
  "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
]'::jsonb
WHERE type = 'tennis' AND name LIKE '%Premium%';

UPDATE courts 
SET images = '[
  "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
]'::jsonb
WHERE type = 'tennis' AND name NOT LIKE '%Premium%';

-- Basketball Courts
UPDATE courts 
SET images = '[
  "https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519861531473-9200262188bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
]'::jsonb
WHERE type = 'basketball';

-- Cricket Grounds
UPDATE courts 
SET images = '[
  "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
]'::jsonb
WHERE type = 'cricket';

-- Football Fields
UPDATE courts 
SET images = '[
  "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
]'::jsonb
WHERE type = 'football';

-- Badminton Courts
UPDATE courts 
SET images = '[
  "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1593786481097-b5f9b1eb6e0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
]'::jsonb
WHERE type = 'badminton';

-- 4. Verify the migration
SELECT 
  id,
  name,
  type,
  jsonb_array_length(images) as image_count,
  images
FROM courts
ORDER BY type, name;

-- 5. Optional: Drop image_url column after verifying migration
-- Uncomment the line below only after you've verified everything works
-- ALTER TABLE courts DROP COLUMN IF EXISTS image_url;

SELECT 'Migration complete! Courts now support multiple images.' as status;

