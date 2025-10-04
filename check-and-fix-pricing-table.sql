-- CHECK AND FIX PRICING TABLE SCHEMA
-- Run this in Supabase SQL Editor to diagnose and fix the pricing_rules table

-- 1. First, let's check what pricing_rules table currently looks like
SELECT 
    'Current pricing_rules table structure:' as info,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pricing_rules' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if the table exists at all
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'pricing_rules' AND table_schema = 'public'
        ) 
        THEN 'pricing_rules table EXISTS'
        ELSE 'pricing_rules table DOES NOT EXIST'
    END as table_status;

-- 3. If table exists but has wrong schema, drop and recreate it
DO $$ 
BEGIN
    -- Check if table exists but has wrong columns
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'pricing_rules' AND table_schema = 'public'
    ) THEN
        -- Check if it has the old schema (single 'price' column instead of off_peak_price/peak_price)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'pricing_rules' 
            AND column_name = 'off_peak_price' 
            AND table_schema = 'public'
        ) THEN
            RAISE NOTICE 'Dropping existing pricing_rules table with incompatible schema';
            DROP TABLE pricing_rules CASCADE;
        ELSE
            RAISE NOTICE 'pricing_rules table has correct schema';
        END IF;
    ELSE
        RAISE NOTICE 'pricing_rules table does not exist, will create it';
    END IF;
END $$;

-- 4. Create the correct pricing_rules table
CREATE TABLE IF NOT EXISTS pricing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
    duration_hours INTEGER NOT NULL,
    off_peak_price DECIMAL(10,2) NOT NULL,
    peak_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create unique constraint to prevent duplicates
DROP INDEX IF EXISTS idx_pricing_rules_court_duration;
CREATE UNIQUE INDEX idx_pricing_rules_court_duration 
ON pricing_rules(court_id, duration_hours);

-- 6. Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_pricing_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_pricing_rules_updated_at ON pricing_rules;
CREATE TRIGGER update_pricing_rules_updated_at
    BEFORE UPDATE ON pricing_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_pricing_rules_updated_at();

-- 7. Insert default pricing for all existing courts
INSERT INTO pricing_rules (court_id, duration_hours, off_peak_price, peak_price)
SELECT 
    c.id,
    1,
    CASE 
        WHEN c.type = 'tennis' THEN 45.00
        WHEN c.type = 'basketball' THEN 35.00
        WHEN c.type = 'cricket' THEN 240.00
        WHEN c.type = 'badminton' THEN 30.00
        WHEN c.type = 'football' THEN 120.00
        ELSE 45.00
    END,
    CASE 
        WHEN c.type = 'tennis' THEN 65.00
        WHEN c.type = 'basketball' THEN 50.00
        WHEN c.type = 'cricket' THEN 350.00
        WHEN c.type = 'badminton' THEN 45.00
        WHEN c.type = 'football' THEN 180.00
        ELSE 65.00
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
        WHEN c.type = 'basketball' THEN 65.00
        WHEN c.type = 'cricket' THEN 450.00
        WHEN c.type = 'badminton' THEN 55.00
        WHEN c.type = 'football' THEN 220.00
        ELSE 85.00
    END,
    CASE 
        WHEN c.type = 'tennis' THEN 120.00
        WHEN c.type = 'basketball' THEN 90.00
        WHEN c.type = 'cricket' THEN 650.00
        WHEN c.type = 'badminton' THEN 80.00
        WHEN c.type = 'football' THEN 320.00
        ELSE 120.00
    END
FROM courts c
WHERE NOT EXISTS (
    SELECT 1 FROM pricing_rules pr 
    WHERE pr.court_id = c.id AND pr.duration_hours = 2
);

-- 8. Set up RLS policies
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view pricing rules" ON pricing_rules;
CREATE POLICY "Anyone can view pricing rules" ON pricing_rules 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage pricing rules" ON pricing_rules;
CREATE POLICY "Admins can manage pricing rules" ON pricing_rules 
FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- 9. Verify the final structure
SELECT 
    'Final pricing_rules table structure:' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'pricing_rules' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 10. Show sample data
SELECT 
    'Sample pricing data:' as info,
    c.name as court_name,
    c.type,
    pr.duration_hours,
    pr.off_peak_price,
    pr.peak_price
FROM courts c
LEFT JOIN pricing_rules pr ON c.id = pr.court_id
ORDER BY c.name, pr.duration_hours
LIMIT 10;
