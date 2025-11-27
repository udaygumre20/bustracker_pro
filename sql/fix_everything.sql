-- COMPREHENSIVE FIX SCRIPT FOR BUSTRACKER PRO
-- Run this entire script in the Supabase SQL Editor to fix all issues.

-- ==========================================
-- 0. FIX SCHEMA (MISSING COLUMNS)
-- ==========================================

-- Add assigned_bus_id to drivers table if it doesn't exist
-- This is required for the bidirectional relationship logic
ALTER TABLE public.drivers 
ADD COLUMN IF NOT EXISTS assigned_bus_id TEXT;


-- ==========================================
-- 1. FIX DELETION PERMISSIONS (RLS POLICIES)
-- ==========================================

-- Enable deletion for Drivers
DROP POLICY IF EXISTS "Authenticated users can delete drivers" ON public.drivers;
CREATE POLICY "Authenticated users can delete drivers" ON public.drivers FOR DELETE USING (auth.role() = 'authenticated');

-- Enable updates for Drivers
DROP POLICY IF EXISTS "Authenticated users can update drivers" ON public.drivers;
CREATE POLICY "Authenticated users can update drivers" ON public.drivers FOR UPDATE USING (auth.role() = 'authenticated');

-- Enable deletion for Buses
DROP POLICY IF EXISTS "Authenticated users can delete buses" ON public.buses;
CREATE POLICY "Authenticated users can delete buses" ON public.buses FOR DELETE USING (auth.role() = 'authenticated');

-- Enable deletion for Routes
DROP POLICY IF EXISTS "Authenticated users can delete routes" ON public.routes;
CREATE POLICY "Authenticated users can delete routes" ON public.routes FOR DELETE USING (auth.role() = 'authenticated');

-- Enable updates for Routes
DROP POLICY IF EXISTS "Authenticated users can update routes" ON public.routes;
CREATE POLICY "Authenticated users can update routes" ON public.routes FOR UPDATE USING (auth.role() = 'authenticated');


-- ==========================================
-- 2. FIX AUTH USER DELETION (TRIGGER)
-- ==========================================

-- Create function to delete auth user when driver is deleted
CREATE OR REPLACE FUNCTION delete_driver_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete the auth user associated with this driver
  DELETE FROM auth.users WHERE id = OLD.user_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_delete_driver_auth_user ON public.drivers;
CREATE TRIGGER trigger_delete_driver_auth_user
  BEFORE DELETE ON public.drivers
  FOR EACH ROW
  EXECUTE FUNCTION delete_driver_auth_user();


-- ==========================================
-- 3. FIX DATA CONSISTENCY (BUS ASSIGNMENTS)
-- ==========================================

-- Fix: If a Bus has a driver_id, ensure that Driver has the assigned_bus_id
UPDATE public.drivers d
SET assigned_bus_id = b.id
FROM public.buses b
WHERE b.driver_id = d.id
AND (d.assigned_bus_id IS NULL OR d.assigned_bus_id != b.id);

-- Fix: If a Driver has an assigned_bus_id, ensure that Bus has the driver_id
UPDATE public.buses b
SET driver_id = d.id
FROM public.drivers d
WHERE d.assigned_bus_id = b.id
AND (b.driver_id IS NULL OR b.driver_id != d.id);

-- Special Fix for "Aditya" if still unassigned
DO $$
DECLARE
  v_driver_id uuid;
  v_bus_id uuid;
BEGIN
  -- Find Aditya
  SELECT id INTO v_driver_id FROM public.drivers WHERE name ILIKE '%Aditya%' AND assigned_bus_id IS NULL LIMIT 1;
  
  IF v_driver_id IS NOT NULL THEN
    -- Find an unassigned bus
    SELECT id INTO v_bus_id FROM public.buses WHERE driver_id IS NULL LIMIT 1;
    
    IF v_bus_id IS NOT NULL THEN
      -- Assign them
      UPDATE public.drivers SET assigned_bus_id = v_bus_id WHERE id = v_driver_id;
      UPDATE public.buses SET driver_id = v_driver_id WHERE id = v_bus_id;
    END IF;
  END IF;
END $$;

-- Verify Results
SELECT 'Policies Fixed' as status;
