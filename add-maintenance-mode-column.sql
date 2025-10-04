-- ADD MAINTENANCE_MODE COLUMN TO COURTS TABLE
-- Run this in Supabase SQL Editor to fix the "maintenance_mode column not found" error

-- 1. Check if the column exists and add it if missing
DO $$ 
BEGIN
    -- Check if maintenance_mode column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'courts' 
        AND column_name = 'maintenance_mode'
        AND table_schema = 'public'
    ) THEN
        -- Add the maintenance_mode column
        ALTER TABLE courts ADD COLUMN maintenance_mode BOOLEAN DEFAULT false;
        
        -- Update existing courts to have maintenance_mode = false
        UPDATE courts SET maintenance_mode = false WHERE maintenance_mode IS NULL;
        
        RAISE NOTICE 'Added maintenance_mode column to courts table';
    ELSE
        RAISE NOTICE 'maintenance_mode column already exists';
    END IF;
END $$;

-- 2. Also check and add other potentially missing columns
DO $$ 
BEGIN
    -- Check if image_url column exists (some schemas use images array, others use image_url)
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'courts' 
        AND column_name = 'image_url'
        AND table_schema = 'public'
    ) THEN
        -- Add the image_url column
        ALTER TABLE courts ADD COLUMN image_url TEXT;
        RAISE NOTICE 'Added image_url column to courts table';
    END IF;
    
    -- Check if updated_at column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'courts' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        -- Add the updated_at column
        ALTER TABLE courts ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to courts table';
    END IF;
END $$;

-- 3. Create or update the trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_courts_updated_at ON courts;

-- Create the trigger
CREATE TRIGGER update_courts_updated_at
    BEFORE UPDATE ON courts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Update RLS policies to include maintenance_mode
DROP POLICY IF EXISTS "Anyone can view active courts" ON courts;
CREATE POLICY "Anyone can view active courts" ON courts 
FOR SELECT USING (
    is_active = true AND 
    COALESCE(maintenance_mode, false) = false
);

-- 5. Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'courts' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Show current courts data to verify
SELECT 
    id, 
    name, 
    type, 
    is_active, 
    COALESCE(maintenance_mode, false) as maintenance_mode,
    created_at,
    updated_at
FROM courts 
LIMIT 5;
