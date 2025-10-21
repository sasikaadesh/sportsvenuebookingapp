-- CLEAN 90% OF BOOKINGS DATA
-- This script safely deletes 90% of old bookings, keeping the most recent 10%
-- Run this in Supabase SQL Editor

-- STEP 1: Check current bookings count
SELECT 
    'Current bookings count' as info,
    COUNT(*) as total_bookings
FROM bookings;

-- STEP 2: Show what will be kept (most recent 10%)
SELECT 
    'Bookings that will be KEPT (most recent 10%)' as info,
    COUNT(*) as bookings_to_keep
FROM bookings
WHERE id IN (
    SELECT id 
    FROM bookings 
    ORDER BY created_at DESC 
    LIMIT (SELECT CEIL(COUNT(*) * 0.1) FROM bookings)
);

-- STEP 3: Show what will be deleted (oldest 90%)
SELECT 
    'Bookings that will be DELETED (oldest 90%)' as info,
    COUNT(*) as bookings_to_delete
FROM bookings
WHERE id NOT IN (
    SELECT id 
    FROM bookings 
    ORDER BY created_at DESC 
    LIMIT (SELECT CEIL(COUNT(*) * 0.1) FROM bookings)
);

-- STEP 4: Show date range of bookings to be kept
SELECT 
    'Date range of bookings to KEEP' as info,
    MIN(booking_date) as oldest_kept_booking,
    MAX(booking_date) as newest_kept_booking,
    MIN(created_at) as oldest_created_at,
    MAX(created_at) as newest_created_at
FROM bookings
WHERE id IN (
    SELECT id 
    FROM bookings 
    ORDER BY created_at DESC 
    LIMIT (SELECT CEIL(COUNT(*) * 0.1) FROM bookings)
);

-- STEP 5: Show date range of bookings to be deleted
SELECT 
    'Date range of bookings to DELETE' as info,
    MIN(booking_date) as oldest_deleted_booking,
    MAX(booking_date) as newest_deleted_booking,
    MIN(created_at) as oldest_created_at,
    MAX(created_at) as newest_created_at
FROM bookings
WHERE id NOT IN (
    SELECT id 
    FROM bookings 
    ORDER BY created_at DESC 
    LIMIT (SELECT CEIL(COUNT(*) * 0.1) FROM bookings)
);

-- ============================================
-- IMPORTANT: REVIEW THE ABOVE RESULTS FIRST!
-- ============================================
-- If you're happy with what will be deleted, 
-- uncomment the DELETE statement below and run it

/*
-- STEP 6: DELETE the oldest 90% of bookings
DELETE FROM bookings
WHERE id NOT IN (
    SELECT id 
    FROM bookings 
    ORDER BY created_at DESC 
    LIMIT (SELECT CEIL(COUNT(*) * 0.1) FROM bookings)
);
*/

-- STEP 7: After deletion, verify the results
-- Uncomment this after running the DELETE to see the results
/*
SELECT 
    'Bookings remaining after cleanup' as info,
    COUNT(*) as total_bookings
FROM bookings;

SELECT 
    'Date range of remaining bookings' as info,
    MIN(booking_date) as oldest_booking,
    MAX(booking_date) as newest_booking,
    MIN(created_at) as oldest_created_at,
    MAX(created_at) as newest_created_at
FROM bookings;
*/

-- ============================================
-- ALTERNATIVE: Delete by specific date range
-- ============================================
-- If you prefer to delete bookings before a specific date instead,
-- uncomment and modify this:

/*
-- Delete all bookings created before a specific date
DELETE FROM bookings
WHERE created_at < '2025-01-01'::timestamp;
*/

/*
-- Or delete all bookings with booking_date before a specific date
DELETE FROM bookings
WHERE booking_date < '2025-01-01'::date;
*/

-- ============================================
-- ALTERNATIVE: Keep only last N bookings
-- ============================================
-- If you want to keep a specific number of bookings instead of a percentage:

/*
-- Keep only the most recent 100 bookings
DELETE FROM bookings
WHERE id NOT IN (
    SELECT id 
    FROM bookings 
    ORDER BY created_at DESC 
    LIMIT 100
);
*/

-- ============================================
-- SAFETY CHECK: Count by status
-- ============================================
-- See how many bookings of each status will be deleted
SELECT 
    status,
    COUNT(*) as count,
    CASE 
        WHEN id IN (
            SELECT id FROM bookings 
            ORDER BY created_at DESC 
            LIMIT (SELECT CEIL(COUNT(*) * 0.1) FROM bookings)
        ) THEN 'KEEP'
        ELSE 'DELETE'
    END as action
FROM bookings
GROUP BY status, action
ORDER BY status, action;

