-- Diagnostic script for route deletion issue
-- Run this in Supabase SQL Editor to check what's preventing deletion

-- Step 1: Check if routes exist
SELECT id, name FROM public.routes ORDER BY name;

-- Step 2: Check which buses are using routes
SELECT 
  r.id as route_id,
  r.name as route_name,
  COUNT(b.id) as buses_using_route
FROM public.routes r
LEFT JOIN public.buses b ON b.route_id = r.id
GROUP BY r.id, r.name
ORDER BY r.name;

-- Step 3: Check Row Level Security policies on routes table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'routes';

-- Step 4: Try to delete a specific route manually (replace with actual route ID)
-- First, unassign it from buses
UPDATE public.buses 
SET route_id = NULL 
WHERE route_id = (SELECT id FROM public.routes WHERE name = 'Pune - Mumbai' LIMIT 1);

-- Then try to delete
DELETE FROM public.routes 
WHERE name = 'Pune - Mumbai';

-- Step 5: Verify deletion
SELECT id, name FROM public.routes ORDER BY name;

-- TROUBLESHOOTING:
-- If deletion fails, check the error message
-- Common issues:
-- 1. Missing DELETE policy in RLS
-- 2. Foreign key constraints
-- 3. User doesn't have DELETE permission
