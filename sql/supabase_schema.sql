-- Enable PostGIS for location data (optional but good for future)
-- create extension if not exists postgis;

-- Create tables

CREATE TABLE public.routes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    path_data JSONB NOT NULL, -- Array of {lat, lng} objects
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.drivers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id), -- Link to Supabase Auth user
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.buses (
    id TEXT PRIMARY KEY, -- License plate e.g., MH-20-BL-1234
    driver_id UUID REFERENCES public.drivers(id),
    route_id UUID REFERENCES public.routes(id),
    location JSONB NOT NULL, -- {lat, lng}
    occupancy TEXT DEFAULT 'Empty', -- Enum: Empty, Low, Medium, High, Full
    status TEXT DEFAULT 'Inactive', -- Enum: Available, In Trip, Inactive, Maintenance
    sos BOOLEAN DEFAULT FALSE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;

-- Create Policies (Simplified for demo - allow public read, authenticated update)

-- Routes: Everyone can read, only admins can insert/update (mocking admin as auth user for now)
CREATE POLICY "Public routes are viewable by everyone" ON public.routes FOR SELECT USING (true);
CREATE POLICY "Admins can insert routes" ON public.routes FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Drivers: Everyone can read
-- Drivers: Everyone can read, authenticated users can manage
CREATE POLICY "Public drivers are viewable by everyone" ON public.drivers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert drivers" ON public.drivers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update drivers" ON public.drivers FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete drivers" ON public.drivers FOR DELETE USING (auth.role() = 'authenticated');

-- Buses: Everyone can read, authenticated users (drivers) can update
CREATE POLICY "Public buses are viewable by everyone" ON public.buses FOR SELECT USING (true);
CREATE POLICY "Drivers can update their bus" ON public.buses FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can insert buses" ON public.buses FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Seed Data (Optional - to get started quickly)
INSERT INTO public.routes (name, path_data) VALUES
('Jalna–Ambad', '[{"lat": 19.8347, "lng": 75.8816}, {"lat": 19.7200, "lng": 75.8300}, {"lat": 19.6100, "lng": 75.7900}]'),
('Jalna–Chhatrapati Sambhajinagar', '[{"lat": 19.8347, "lng": 75.8816}, {"lat": 19.8500, "lng": 75.6000}, {"lat": 19.8762, "lng": 75.3433}]'),
('Jalna–Beed', '[{"lat": 19.8347, "lng": 75.8816}, {"lat": 19.4000, "lng": 75.8200}, {"lat": 18.9900, "lng": 75.7600}]'),
('Jalna–Pune', '[{"lat": 19.8347, "lng": 75.8816}, {"lat": 19.2000, "lng": 74.8000}, {"lat": 18.5204, "lng": 73.8567}]');

-- Insert a dummy driver (you'll need to create a real auth user and link it later)
-- INSERT INTO public.drivers (name, email) VALUES ('Demo Driver', 'driver@bustracker.pro');
