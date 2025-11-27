-- Fix Bus Marker Position Issue (SAFE VERSION)
-- This script updates bus locations to be on the actual route paths
-- Only updates buses that have valid routes in the routes table

-- Step 1: Check which buses have invalid route references
SELECT 
  b.id as bus_id,
  b.route_id,
  r.name as route_name,
  CASE 
    WHEN r.id IS NULL THEN 'INVALID - Route does not exist'
    ELSE 'Valid'
  END as status
FROM public.buses b
LEFT JOIN public.routes r ON b.route_id = r.id
ORDER BY status DESC, b.id;

-- Step 2: SAFE UPDATE - Only update buses with valid routes
UPDATE public.buses b
SET 
  location = (
    SELECT (path_data->0)::jsonb
    FROM public.routes r
    WHERE r.id = b.route_id
  ),
  last_updated = NOW()
WHERE route_id IS NOT NULL
  AND EXISTS (
    SELECT 1 
    FROM public.routes r 
    WHERE r.id = b.route_id
  );

-- Step 3: For buses with invalid routes, set a default location (Jalna)
UPDATE public.buses
SET 
  location = '{"lat": 19.8347, "lng": 75.8816}'::jsonb,
  last_updated = NOW()
WHERE route_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 
    FROM public.routes r 
    WHERE r.id = b.route_id
  );

-- Step 4: Verify the update
SELECT 
  b.id as bus_id,
  b.location as bus_location,
  r.name as route_name,
  r.path_data->0 as route_start
FROM public.buses b
LEFT JOIN public.routes r ON b.route_id = r.id
ORDER BY b.id;

-- EXPLANATION OF THE ERROR:
-- The original query failed because:
-- 1. Bus MH21BB4321 has route_id = '511a9b24-022b-4615-aac5-b8c4f28ef95d'
-- 2. But this route_id doesn't exist in the routes table
-- 3. So the subquery returned NULL
-- 4. PostgreSQL rejected NULL because location has a NOT NULL constraint
--
-- This fixed version:
-- 1. Only updates buses where the route actually exists (using EXISTS)
-- 2. Sets a default location for buses with invalid route references
-- 3. Prevents the NULL constraint violation
