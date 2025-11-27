-- Fix Driver Assignment for "Aditya"
-- This script assigns a bus to the driver named "Aditya"

-- 1. Find the driver ID for "Aditya"
DO $$
DECLARE
  v_driver_id uuid;
  v_bus_id uuid;
  v_route_id uuid;
BEGIN
  -- Get driver ID (assuming name is 'Aditya' or similar)
  SELECT id INTO v_driver_id FROM public.drivers WHERE name ILIKE '%Aditya%' LIMIT 1;
  
  IF v_driver_id IS NULL THEN
    RAISE NOTICE 'Driver Aditya not found!';
    RETURN;
  END IF;

  -- Get a bus ID (any bus)
  SELECT id INTO v_bus_id FROM public.buses LIMIT 1;
  
  IF v_bus_id IS NULL THEN
    RAISE NOTICE 'No buses found!';
    RETURN;
  END IF;

  -- Assign bus to driver
  UPDATE public.drivers 
  SET assigned_bus_id = v_bus_id 
  WHERE id = v_driver_id;

  -- Assign driver to bus (bidirectional relationship)
  UPDATE public.buses 
  SET driver_id = v_driver_id 
  WHERE id = v_bus_id;

  -- Get the route name for verification
  SELECT route_id INTO v_route_id FROM public.buses WHERE id = v_bus_id;
  
  RAISE NOTICE 'Success! Assigned Bus % to Driver % (ID: %)', v_bus_id, 'Aditya', v_driver_id;
END $$;

-- Verify the assignment
SELECT 
  d.name as driver_name, 
  b.vehicle_number, 
  r.name as route_name
FROM public.drivers d
JOIN public.buses b ON d.assigned_bus_id = b.id
LEFT JOIN public.routes r ON b.route_id = r.id
WHERE d.name ILIKE '%Aditya%';
