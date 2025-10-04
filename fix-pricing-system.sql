-- FIX PRICING SYSTEM FOR COURT PRICE UPDATES
-- Run this in Supabase SQL Editor to fix pricing rules issues

-- 1. Check if pricing_rules table exists and create it with correct schema
DO $$ 
BEGIN
    -- Drop existing pricing_rules table if it has wrong schema
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'pricing_rules' AND table_schema = 'public'
    ) THEN
        -- Check if it has the wrong columns (price instead of off_peak_price/peak_price)
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'pricing_rules' 
            AND column_name = 'price' 
            AND table_schema = 'public'
        ) AND NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'pricing_rules' 
            AND column_name = 'off_peak_price' 
            AND table_schema = 'public'
        ) THEN
            RAISE NOTICE 'Dropping existing pricing_rules table with wrong schema';
            DROP TABLE pricing_rules CASCADE;
        END IF;
    END IF;
END $$;

-- 2. Create pricing_rules table with correct schema
CREATE TABLE IF NOT EXISTS pricing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
    duration_hours INTEGER NOT NULL,
    off_peak_price DECIMAL(10,2) NOT NULL,
    peak_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(court_id, duration_hours)
);

-- 3. Create trigger for updated_at
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

-- 4. Insert default pricing rules for existing courts
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
)
ON CONFLICT (court_id, duration_hours) DO NOTHING;

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
)
ON CONFLICT (court_id, duration_hours) DO NOTHING;

-- 5. Create RLS policies for pricing_rules
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view pricing rules" ON pricing_rules;
CREATE POLICY "Anyone can view pricing rules" ON pricing_rules 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage pricing rules" ON pricing_rules;
CREATE POLICY "Admins can manage pricing rules" ON pricing_rules 
FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- 6. Verify the setup
SELECT 
    'pricing_rules table structure' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'pricing_rules' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Show sample pricing data
SELECT 
    'sample pricing data' as info,
    c.name as court_name,
    c.type,
    pr.duration_hours,
    pr.off_peak_price,
    pr.peak_price
FROM courts c
JOIN pricing_rules pr ON c.id = pr.court_id
ORDER BY c.name, pr.duration_hours
LIMIT 10;
