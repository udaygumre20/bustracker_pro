-- Fix Driver Bus Assignment Issue
-- Problem: Driver "aditya" shows "No Bus Assigned" after login
-- Solution: Assign a bus to the driver in the database

-- Step 1: Check current driver and bus data
SELECT 
  d.id as driver_id,
  d.name as driver_name,
  d.email,
  b.id as assigned_bus,
  b.driver_id as bus_driver_id
FROM public.drivers d
LEFT JOIN public.buses b ON b.driver_id = d.id
ORDER BY d.name;

-- Step 2: Check which buses are available (not assigned to any driver)
SELECT 
  b.id as bus_id,
  b.driver_id,
  b.route_id,
  r.name as route_name,
  CASE 
    WHEN b.driver_id IS NULL THEN 'Available'
    ELSE 'Assigned'
  END as status
FROM public.buses b
LEFT JOIN public.routes r ON b.route_id = r.id
ORDER BY status, b.id;

-- Step 3: Assign a bus to driver "aditya"
-- First, get aditya's driver ID
-- Then assign an available bus to them

-- Option A: Assign a specific bus (replace with actual bus ID)
UPDATE public.buses
SET driver_id = (
  SELECT id FROM public.drivers WHERE name = 'aditya' LIMIT 1
)
WHERE id = 'MH-20-BL-5678'  -- Replace with actual bus ID
  AND driver_id IS NULL;  -- Only if bus is not already assigned

-- Option B: Assign the first available bus to aditya
UPDATE public.buses
SET driver_id = (
  SELECT id FROM public.drivers WHERE name = 'aditya' LIMIT 1
)
WHERE id = (
  SELECT id FROM public.buses WHERE driver_id IS NULL LIMIT 1
);

-- Step 4: Verify the assignment
SELECT 
  d.name as driver_name,
  d.email,
  b.id as assigned_bus,
  r.name as route_name
FROM public.drivers d
LEFT JOIN public.buses b ON b.driver_id = d.id
LEFT JOIN public.routes r ON b.route_id = r.id
WHERE d.name = 'aditya';

-- EXPLANATION:
-- The driver table has a record for "aditya", but no bus in the buses table
-- has driver_id pointing to aditya's ID. We need to update a bus record
-- to set its driver_id to aditya's driver ID.
--
-- After running this, aditya should see their assigned bus in the dropdown.
