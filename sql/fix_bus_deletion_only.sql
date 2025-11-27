-- Fix Bus Deletion Only
-- Run this if you already fixed routes earlier

-- Add DELETE policy for buses
CREATE POLICY "Authenticated users can delete buses" 
ON public.buses 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Verify it worked
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'buses';
