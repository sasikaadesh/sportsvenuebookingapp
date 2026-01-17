-- Update pricing for specific courts in LKR, setting peak = off_peak * 1.3
-- Safe to run multiple times (upsert on (court_id, duration_hours))

BEGIN;

WITH targets(name, price_1h, price_2h) AS (
  VALUES
    -- name, 1-hour off-peak, 2-hour off-peak (all LKR)
    ('Badminton Court', 1500, 2500),
    ('Basketball Court Pro', 2000, 3000),
    ('Cricket Ground Elite', 5000, 8000),
    ('Football Field', 1500, 2000),
    ('Premium Tennis Court A', 1500, 2500),
    ('Tennis Court A', 1500, 2500),
    ('Tennis Court B', 1000, 1500)
),
matched AS (
  -- Match exact (case-insensitive) OR starts-with to include variants like "Football Field Stadium"
  SELECT c.id AS court_id, c.name, t.price_1h, t.price_2h
  FROM targets t
  JOIN courts c ON LOWER(c.name) = LOWER(t.name) OR c.name ILIKE t.name || '%'
),
expanded AS (
  SELECT court_id,
         1::int AS duration_hours,
         (price_1h)::numeric(10,2) AS off_peak_price,
         ROUND((price_1h * 1.3)::numeric, 2) AS peak_price
  FROM matched
  UNION ALL
  SELECT court_id,
         2::int AS duration_hours,
         (price_2h)::numeric(10,2) AS off_peak_price,
         ROUND((price_2h * 1.3)::numeric, 2) AS peak_price
  FROM matched
),
upsert AS (
  INSERT INTO pricing_rules (court_id, duration_hours, off_peak_price, peak_price)
  SELECT court_id, duration_hours, off_peak_price, peak_price
  FROM expanded
  ON CONFLICT (court_id, duration_hours)
  DO UPDATE SET
    off_peak_price = EXCLUDED.off_peak_price,
    peak_price     = EXCLUDED.peak_price
  RETURNING court_id, duration_hours
)
SELECT 'rows_upserted' AS info, COUNT(*) AS count FROM upsert;

-- Optional: show the resulting prices for the targeted courts
SELECT c.name,
       pr.duration_hours,
       pr.off_peak_price,
       pr.peak_price
FROM courts c
JOIN pricing_rules pr ON pr.court_id = c.id
WHERE LOWER(c.name) IN (
  'badminton court',
  'basketball court pro',
  'cricket ground elite',
  'football field',
  'premium tennis court a',
  'tennis court a',
  'tennis court b'
)
ORDER BY c.name, pr.duration_hours;

COMMIT;

