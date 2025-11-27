-- Move Bus to Jalna (Route Origin)
-- This script updates the location of all buses to be at the starting point of the Jalna routes.

-- Coordinates for Jalna: 19.8347, 75.8816
UPDATE public.buses
SET 
    location = '{"lat": 19.8347, "lng": 75.8816}',
    status = 'Available',
    occupancy = 'Empty',
    last_updated = NOW();

-- Verify the update
SELECT id, location, status FROM public.buses;
