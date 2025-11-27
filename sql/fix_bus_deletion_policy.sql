-- Fix Bus Deletion Issue
-- Similar to routes, buses table is missing DELETE policy

-- Add DELETE policy for buses table
CREATE POLICY "Authenticated users can delete buses" 
ON public.buses 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Verify policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'buses';

-- Test deletion (replace with actual bus ID)
DELETE FROM public.buses WHERE id = 'MH-20-BL-5678';

-- EXPLANATION:
-- The buses table has RLS enabled but no DELETE policy.
-- This policy allows authenticated users (admins) to delete buses.
