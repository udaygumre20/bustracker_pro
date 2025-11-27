-- Comprehensive RLS Policy Fix for All Tables
-- This fixes deletion and update issues across routes, buses, and drivers tables

-- ===== ROUTES TABLE =====

-- Add UPDATE policy for routes
CREATE POLICY "Authenticated users can update routes" 
ON public.routes 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Add DELETE policy for routes
CREATE POLICY "Authenticated users can delete routes" 
ON public.routes 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- ===== BUSES TABLE =====

-- Add DELETE policy for buses
CREATE POLICY "Authenticated users can delete buses" 
ON public.buses 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- ===== VERIFY ALL POLICIES =====

-- Check routes policies
SELECT 'ROUTES' as table_name, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'routes'
UNION ALL
-- Check buses policies
SELECT 'BUSES' as table_name, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'buses'
UNION ALL
-- Check drivers policies
SELECT 'DRIVERS' as table_name, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'drivers'
ORDER BY table_name, cmd;

-- EXPECTED OUTPUT:
-- All tables should have policies for: SELECT, INSERT, UPDATE, DELETE

-- SUMMARY:
-- This script adds the missing UPDATE and DELETE policies for routes and buses.
-- After running this, you should be able to:
-- ✅ Delete routes from admin panel
-- ✅ Edit routes from admin panel
-- ✅ Delete buses from admin panel
-- ✅ Edit buses from admin panel (already working)
-- ✅ Manage drivers (already working)
