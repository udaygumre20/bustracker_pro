-- Fix for Polyline Loop Issue
-- The problem: Middle waypoints are not on actual roads, causing Google Directions API
-- to create strange loops and detours.
-- 
-- Solution: Remove middle waypoints and let Google Directions API calculate the optimal route
-- between start and end points.

-- Fix Jalna–Chhatrapati Sambhajinagar route (remove middle waypoint)
UPDATE public.routes 
SET path_data = '[
  {"lat": 19.8347, "lng": 75.8816},
  {"lat": 19.8762, "lng": 75.3433}
]'::jsonb
WHERE name = 'Jalna–Chhatrapati Sambhajinagar';

-- Fix Jalna–Ambad route (remove middle waypoints)
UPDATE public.routes 
SET path_data = '[
  {"lat": 19.8347, "lng": 75.8816},
  {"lat": 19.6100, "lng": 75.7900}
]'::jsonb
WHERE name = 'Jalna–Ambad';

-- Fix Jalna–Beed route (remove middle waypoints)
UPDATE public.routes 
SET path_data = '[
  {"lat": 19.8347, "lng": 75.8816},
  {"lat": 18.9900, "lng": 75.7600}
]'::jsonb
WHERE name = 'Jalna–Beed';

-- Fix Jalna–Pune route (remove middle waypoints)
UPDATE public.routes 
SET path_data = '[
  {"lat": 19.8347, "lng": 75.8816},
  {"lat": 18.5204, "lng": 73.8567}
]'::jsonb
WHERE name = 'Jalna–Pune';

-- Verify the updates
SELECT name, path_data FROM public.routes ORDER BY name;

-- EXPLANATION:
-- Google Directions API works best with just origin and destination.
-- It automatically calculates the best route along actual roads.
-- Only add waypoints if you need the route to pass through specific locations
-- that are on actual roads (like major intersections or cities).
