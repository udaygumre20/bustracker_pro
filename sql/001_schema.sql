-- 001_schema.sql
-- Schema definition for Bus Tracker Pro
-- Idempotent: Can be run multiple times without errors

-- Enable PostGIS if needed (optional, using simple lat/lng for now)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Create Tables (without Foreign Keys first to avoid circular dependency issues)

-- DRIVERS Table
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Link to Supabase Auth
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    assigned_bus_id TEXT, -- FK added later
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROUTES Table
CREATE TABLE IF NOT EXISTS public.routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    path_data JSONB DEFAULT '[]'::jsonb, -- Array of {lat, lng}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BUSES Table
CREATE TABLE IF NOT EXISTS public.buses (
    id TEXT PRIMARY KEY, -- License Plate e.g., MH12AB1234
    route_id UUID REFERENCES public.routes(id) ON DELETE SET NULL,
    -- Explicitly name the constraint so we can rely on it in the API (drivers!buses_driver_id_fkey)
    driver_id UUID CONSTRAINT buses_driver_id_fkey REFERENCES public.drivers(id) ON DELETE SET NULL,
    location JSONB DEFAULT '{"lat": 19.8347, "lng": 75.8816}'::jsonb,
    occupancy TEXT DEFAULT 'Empty', -- Empty, Low, Medium, High, Full
    status TEXT DEFAULT 'Inactive', -- Available, In Trip, Inactive
    sos BOOLEAN DEFAULT FALSE,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SOS ALERTS Table
CREATE TABLE IF NOT EXISTS public.sos_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bus_id TEXT REFERENCES public.buses(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE,
    location JSONB NOT NULL,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 1.5 Ensure columns exist (Fix for existing tables with missing columns)
DO $$ 
BEGIN 
    -- Drivers: status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'status') THEN
        ALTER TABLE public.drivers ADD COLUMN status TEXT DEFAULT 'Active';
    END IF;

    -- Buses: status, occupancy, sos, last_updated
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'buses' AND column_name = 'status') THEN
        ALTER TABLE public.buses ADD COLUMN status TEXT DEFAULT 'Inactive';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'buses' AND column_name = 'occupancy') THEN
        ALTER TABLE public.buses ADD COLUMN occupancy TEXT DEFAULT 'Empty';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'buses' AND column_name = 'sos') THEN
        ALTER TABLE public.buses ADD COLUMN sos BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'buses' AND column_name = 'last_updated') THEN
        ALTER TABLE public.buses ADD COLUMN last_updated TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- Routes: path_data
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'routes' AND column_name = 'path_data') THEN
        ALTER TABLE public.routes ADD COLUMN path_data JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- 2. Add Circular Foreign Keys (Drivers -> Buses)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_drivers_bus') THEN
        ALTER TABLE public.drivers 
        ADD CONSTRAINT fk_drivers_bus 
        FOREIGN KEY (assigned_bus_id) 
        REFERENCES public.buses(id) 
        ON DELETE SET NULL;
    END IF;

    -- Fix drivers -> users FK to be ON DELETE CASCADE explicitly
    -- This resolves the "update or delete on table users violates foreign key constraint" error
    -- by allowing the driver record to be automatically deleted if the user is deleted.
    -- We drop and recreate it to ensure the ON DELETE behavior is correct.
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'drivers_user_id_fkey') THEN
        ALTER TABLE public.drivers DROP CONSTRAINT drivers_user_id_fkey;
    END IF;

    ALTER TABLE public.drivers
    ADD CONSTRAINT drivers_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;
END $$;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- DRIVERS Policies
DROP POLICY IF EXISTS "Public drivers read access" ON public.drivers;
CREATE POLICY "Public drivers read access" ON public.drivers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Drivers update own or admin" ON public.drivers;
CREATE POLICY "Drivers update own or admin" ON public.drivers FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.drivers WHERE user_id = auth.uid() AND status = 'Admin')
);

DROP POLICY IF EXISTS "Authenticated insert drivers" ON public.drivers;
CREATE POLICY "Authenticated insert drivers" ON public.drivers FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated delete drivers" ON public.drivers;
CREATE POLICY "Authenticated delete drivers" ON public.drivers FOR DELETE USING (auth.role() = 'authenticated');

-- ROUTES Policies
DROP POLICY IF EXISTS "Public routes read access" ON public.routes;
CREATE POLICY "Public routes read access" ON public.routes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth routes insert" ON public.routes;
CREATE POLICY "Auth routes insert" ON public.routes FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth routes update" ON public.routes;
CREATE POLICY "Auth routes update" ON public.routes FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth routes delete" ON public.routes;
CREATE POLICY "Auth routes delete" ON public.routes FOR DELETE USING (auth.role() = 'authenticated');

-- BUSES Policies
DROP POLICY IF EXISTS "Public buses read access" ON public.buses;
CREATE POLICY "Public buses read access" ON public.buses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth buses insert" ON public.buses;
CREATE POLICY "Auth buses insert" ON public.buses FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth buses update" ON public.buses;
CREATE POLICY "Auth buses update" ON public.buses FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth buses delete" ON public.buses;
CREATE POLICY "Auth buses delete" ON public.buses FOR DELETE USING (auth.role() = 'authenticated');

-- SOS ALERTS Policies
DROP POLICY IF EXISTS "Public sos read access" ON public.sos_alerts;
CREATE POLICY "Public sos read access" ON public.sos_alerts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Drivers create sos" ON public.sos_alerts;
CREATE POLICY "Drivers create sos" ON public.sos_alerts FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth resolve sos" ON public.sos_alerts;
CREATE POLICY "Auth resolve sos" ON public.sos_alerts FOR UPDATE USING (auth.role() = 'authenticated');

-- 5. Realtime Publication
-- Enable realtime for these tables so the map updates live
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'buses') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.buses;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'sos_alerts') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.sos_alerts;
  END IF;
END $$;
