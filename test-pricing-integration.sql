-- TEST PRICING INTEGRATION ACROSS ALL PAGES
-- Run this in Supabase SQL Editor to verify pricing is working correctly

-- 1. Check if pricing_rules table exists and has correct structure
SELECT 
    'Pricing Rules Table Structure:' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'pricing_rules' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check total number of pricing rules
SELECT 
    'Total Pricing Rules:' as info,
    COUNT(*) as count
FROM pricing_rules;

-- 3. Check pricing rules per court
SELECT 
    'Pricing Rules Per Court:' as info,
    c.name as court_name,
    c.type as court_type,
    COUNT(pr.id) as pricing_rules_count
FROM courts c
LEFT JOIN pricing_rules pr ON c.id = pr.court_id
WHERE c.is_active = true
GROUP BY c.id, c.name, c.type
ORDER BY c.name;

-- 4. Show detailed pricing for each court
SELECT 
    'Detailed Court Pricing:' as info,
    c.name as court_name,
    c.type,
    pr.duration_hours,
    pr.off_peak_price,
    pr.peak_price,
    ROUND(pr.peak_price - pr.off_peak_price, 2) as peak_markup
FROM courts c
LEFT JOIN pricing_rules pr ON c.id = pr.court_id
WHERE c.is_active = true
ORDER BY c.name, pr.duration_hours;

-- 5. Check for courts without pricing rules
SELECT 
    'Courts Without Pricing Rules:' as info,
    c.name as court_name,
    c.type
FROM courts c
LEFT JOIN pricing_rules pr ON c.id = pr.court_id
WHERE c.is_active = true 
AND pr.id IS NULL;

-- 6. Test the query that the frontend uses (courts listing page)
SELECT 
    'Frontend Courts Query Test:' as info,
    c.id,
    c.name,
    c.type,
    c.image_url,
    c.is_active,
    json_agg(
        json_build_object(
            'duration_hours', pr.duration_hours,
            'off_peak_price', pr.off_peak_price,
            'peak_price', pr.peak_price
        ) ORDER BY pr.duration_hours
    ) as pricing_rules
FROM courts c
LEFT JOIN pricing_rules pr ON c.id = pr.court_id
WHERE c.is_active = true
GROUP BY c.id, c.name, c.type, c.image_url, c.is_active
ORDER BY c.name
LIMIT 5;

-- 7. Test the query for a specific court (court detail page)
SELECT 
    'Single Court Query Test:' as info,
    c.*,
    json_agg(
        json_build_object(
            'duration_hours', pr.duration_hours,
            'off_peak_price', pr.off_peak_price,
            'peak_price', pr.peak_price
        ) ORDER BY pr.duration_hours
    ) as pricing_rules
FROM courts c
LEFT JOIN pricing_rules pr ON c.id = pr.court_id
WHERE c.is_active = true
GROUP BY c.id
LIMIT 1;

-- 8. Check price ranges across all courts
SELECT 
    'Price Range Analysis:' as info,
    MIN(pr.off_peak_price) as min_off_peak,
    MAX(pr.off_peak_price) as max_off_peak,
    AVG(pr.off_peak_price) as avg_off_peak,
    MIN(pr.peak_price) as min_peak,
    MAX(pr.peak_price) as max_peak,
    AVG(pr.peak_price) as avg_peak
FROM pricing_rules pr;

-- 9. Check pricing by court type
SELECT 
    'Pricing By Court Type:' as info,
    c.type,
    pr.duration_hours,
    AVG(pr.off_peak_price) as avg_off_peak,
    AVG(pr.peak_price) as avg_peak,
    COUNT(*) as court_count
FROM courts c
JOIN pricing_rules pr ON c.id = pr.court_id
WHERE c.is_active = true
GROUP BY c.type, pr.duration_hours
ORDER BY c.type, pr.duration_hours;

-- 10. Verify RLS policies are working
SELECT 
    'RLS Policies Check:' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'pricing_rules';

-- 11. Test data integrity
SELECT 
    'Data Integrity Check:' as info,
    CASE 
        WHEN COUNT(*) = 0 THEN 'PASS: No orphaned pricing rules'
        ELSE CONCAT('FAIL: ', COUNT(*), ' orphaned pricing rules found')
    END as orphaned_rules_check
FROM pricing_rules pr
LEFT JOIN courts c ON pr.court_id = c.id
WHERE c.id IS NULL;

-- 12. Check for duplicate pricing rules
SELECT 
    'Duplicate Rules Check:' as info,
    court_id,
    duration_hours,
    COUNT(*) as duplicate_count
FROM pricing_rules
GROUP BY court_id, duration_hours
HAVING COUNT(*) > 1;

-- 13. Final summary
SELECT 
    'SUMMARY:' as info,
    (SELECT COUNT(*) FROM courts WHERE is_active = true) as active_courts,
    (SELECT COUNT(*) FROM pricing_rules) as total_pricing_rules,
    (SELECT COUNT(DISTINCT court_id) FROM pricing_rules) as courts_with_pricing,
    CASE 
        WHEN (SELECT COUNT(*) FROM courts WHERE is_active = true) = 
             (SELECT COUNT(DISTINCT court_id) FROM pricing_rules)
        THEN 'PASS: All courts have pricing'
        ELSE 'FAIL: Some courts missing pricing'
    END as pricing_coverage;
