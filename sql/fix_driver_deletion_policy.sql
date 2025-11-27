-- Fix Driver Deletion Policy
-- This script adds the missing DELETE policy for the drivers table

-- 1. Add DELETE policy for drivers
CREATE POLICY "Authenticated users can delete drivers" 
ON public.drivers 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- 2. Add UPDATE policy for drivers (if missing)
CREATE POLICY "Authenticated users can update drivers" 
ON public.drivers 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- 3. Verify policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'drivers';
