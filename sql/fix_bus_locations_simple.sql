-- SIMPLE FIX: Update bus location directly without subquery
-- This avoids the NULL constraint issue entirely

-- First, let's see what routes exist
SELECT id, name FROM public.routes;

-- Now update each bus individually with a safe location
-- Option 1: Set all buses to Jalna (safe default)
UPDATE public.buses
SET 
  location = '{"lat": 19.8347, "lng": 75.8816}'::jsonb,
  last_updated = NOW();

-- Option 2: If you know the correct route IDs, update them individually
-- Replace the route_id values below with actual IDs from the SELECT above

-- Example for Jalna-Chhatrapati Sambhajinagar route:
-- UPDATE public.buses
-- SET 
--   location = '{"lat": 19.8347, "lng": 75.8816}'::jsonb,
--   route_id = 'YOUR_ACTUAL_ROUTE_ID_HERE',
--   last_updated = NOW()
-- WHERE id = 'MH21BB4321';

-- Verify the update
SELECT 
  b.id,
  b.location,
  b.route_id,
  r.name as route_name
FROM public.buses b
LEFT JOIN public.routes r ON b.route_id = r.id;

-- EXPLANATION:
-- The safest approach is to:
-- 1. Set all buses to a valid default location first (Jalna)
-- 2. Then manually assign correct route_ids that actually exist
-- 3. This prevents NULL constraint violations
