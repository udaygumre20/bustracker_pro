-- 003_cleanup_triggers.sql
-- Run this to remove any triggers that might be causing deletion loops

-- Drop common trigger names that might have been added
DROP TRIGGER IF EXISTS delete_user_on_driver_delete ON public.drivers;
DROP TRIGGER IF EXISTS on_driver_delete ON public.drivers;
DROP TRIGGER IF EXISTS delete_auth_user ON public.drivers;

-- If you have a specific function that deletes users, you might want to drop it too
-- DROP FUNCTION IF EXISTS delete_user(); 

-- Verify no triggers remain (this will just run without error)
DO $$
BEGIN
    -- This block doesn't do anything visible, but you can check the "Triggers" tab in Supabase
    -- to ensure the drivers table is clean of custom triggers.
    NULL;
END $$;
