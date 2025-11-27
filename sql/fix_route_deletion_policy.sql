-- Fix Route Deletion Issue
-- The problem: Row Level Security (RLS) policy doesn't allow DELETE on routes table

-- Add DELETE policy for routes table
CREATE POLICY "Authenticated users can delete routes" 
ON public.routes 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Verify policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'routes';

-- Test deletion (replace with actual route name)
DELETE FROM public.routes WHERE name = 'Pune - Mumbai';

-- EXPLANATION:
-- The original schema only had policies for SELECT and INSERT on routes.
-- There was no DELETE policy, so authenticated users couldn't delete routes.
-- This policy allows any authenticated user to delete routes.
