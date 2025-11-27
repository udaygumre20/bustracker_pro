-- Automatic Auth User Deletion When Driver is Deleted
-- This creates a database trigger that automatically deletes the associated
-- auth user when a driver is deleted from the drivers table

-- Step 1: Create a function to delete the auth user
CREATE OR REPLACE FUNCTION delete_driver_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete the auth user associated with this driver
  -- Note: This requires the function to have service role permissions
  DELETE FROM auth.users WHERE id = OLD.user_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create a trigger that calls this function before driver deletion
DROP TRIGGER IF EXISTS trigger_delete_driver_auth_user ON public.drivers;
CREATE TRIGGER trigger_delete_driver_auth_user
  BEFORE DELETE ON public.drivers
  FOR EACH ROW
  EXECUTE FUNCTION delete_driver_auth_user();

-- Step 3: Verify the trigger was created
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_delete_driver_auth_user';

-- EXPLANATION:
-- When you delete a driver from the admin panel:
-- 1. The DELETE query runs on the drivers table
-- 2. The trigger fires BEFORE the deletion
-- 3. The trigger function deletes the associated auth user
-- 4. Then the driver record is deleted
--
-- This ensures that when a driver is removed, their login credentials
-- are also removed from the system.

-- TESTING:
-- To test this, try deleting a driver from the admin panel.
-- The driver's auth account should also be deleted, and they won't
-- be able to log in anymore.
