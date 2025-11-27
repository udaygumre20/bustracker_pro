-- 002_seeds.sql
-- Initial data seeding for Bus Tracker Pro
-- Idempotent: Uses ON CONFLICT DO NOTHING

-- 1. Seed Routes
INSERT INTO public.routes (name, path_data) VALUES
('Jalna–Aurangabad', '[{"lat": 19.8347, "lng": 75.8816}, {"lat": 19.8500, "lng": 75.6000}, {"lat": 19.8762, "lng": 75.3433}]'::jsonb),
('Jalna–Pune', '[{"lat": 19.8347, "lng": 75.8816}, {"lat": 19.2000, "lng": 74.8000}, {"lat": 18.5204, "lng": 73.8567}]'::jsonb),
('Jalna–Ambad', '[{"lat": 19.8347, "lng": 75.8816}, {"lat": 19.7200, "lng": 75.8300}, {"lat": 19.6100, "lng": 75.7900}]'::jsonb),
('Jalna–Beed', '[{"lat": 19.8347, "lng": 75.8816}, {"lat": 19.4000, "lng": 75.8200}, {"lat": 18.9900, "lng": 75.7600}]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- 2. Seed Buses
-- Note: We don't assign drivers here as drivers are linked to Auth Users which are dynamic.
-- Admins will assign drivers via the UI later.
INSERT INTO public.buses (id, route_id, location, occupancy, status) 
VALUES
('MH-20-BL-1234', (SELECT id FROM public.routes WHERE name = 'Jalna–Aurangabad'), '{"lat": 19.8347, "lng": 75.8816}'::jsonb, 'Empty', 'Available'),
('MH-20-BL-5678', (SELECT id FROM public.routes WHERE name = 'Jalna–Pune'), '{"lat": 19.8347, "lng": 75.8816}'::jsonb, 'Empty', 'Available'),
('MH-20-BL-9012', (SELECT id FROM public.routes WHERE name = 'Jalna–Ambad'), '{"lat": 19.8347, "lng": 75.8816}'::jsonb, 'Empty', 'Inactive'),
('MH-20-BL-3456', (SELECT id FROM public.routes WHERE name = 'Jalna–Beed'), '{"lat": 19.8347, "lng": 75.8816}'::jsonb, 'Empty', 'Inactive')
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Admin (Optional placeholder)
-- In a real app, you'd create this via the Auth API, but we can insert a driver record for the admin if they exist.
-- INSERT INTO public.drivers (name, email, status) VALUES ('Admin User', 'admin@bustracker.com', 'Admin') ON CONFLICT (email) DO NOTHING;
