// scripts/seed_supabase.js
// Run with: node scripts/seed_supabase.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // MUST be the service role key

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Error: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    console.error('Please ensure you have these set. The Service Role Key is required for admin tasks.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function runSQL(filePath) {
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`\n--- Executing ${path.basename(filePath)} ---`);

    // Supabase JS client doesn't support raw SQL execution directly on the public interface easily
    // without the pg driver or using the RPC workaround if enabled.
    // However, for setup scripts, we often use the 'postgres' library or similar.
    // BUT, since we are using supabase-js, we might not have direct SQL access unless we use the REST API 
    // to call a stored procedure that runs SQL (exec_sql).
    //
    // ALTERNATIVE: We can use the Supabase Management API if available, or just instruct the user to run SQL in dashboard.
    //
    // FOR THIS SCRIPT: We will assume we can't easily run raw DDL via supabase-js without a helper function.
    // So we will try to use the `rpc` method if an `exec_sql` function exists, OR we will just log the instructions.
    //
    // WAIT! We can use the `pg` library if the user installs it. 
    // Since I cannot guarantee `pg` is installed, I will provide a script that uses standard REST calls 
    // to seed data (DML), but for DDL (Schema), I will output the SQL to be run in the dashboard 
    // OR try to use a common "rpc" pattern if the user has set it up.

    // Let's try to be helpful: We will parse the seeds (INSERTs) and run them via the JS client.
    // For Schema, we will warn the user.

    if (filePath.includes('schema')) {
        console.log('⚠️  Schema creation via JS client requires direct DB connection or RPC.');
        console.log('👉 Please copy content of sql/001_schema.sql and run it in the Supabase SQL Editor.');
        return;
    }

    // For Seeds, we can parse simple INSERTs or just use the JS API directly.
    // Let's use the JS API for seeding to be robust.
    if (filePath.includes('seeds')) {
        await seedData();
    }
}

async function seedData() {
    console.log('🌱 Seeding Data via Supabase API...');

    // 1. Seed Routes
    const routes = [
        { name: 'Jalna–Aurangabad', path_data: [{ lat: 19.8347, lng: 75.8816 }, { lat: 19.8500, lng: 75.6000 }, { lat: 19.8762, lng: 75.3433 }] },
        { name: 'Jalna–Pune', path_data: [{ lat: 19.8347, lng: 75.8816 }, { lat: 19.2000, lng: 74.8000 }, { lat: 18.5204, lng: 73.8567 }] },
        { name: 'Jalna–Ambad', path_data: [{ lat: 19.8347, lng: 75.8816 }, { lat: 19.7200, lng: 75.8300 }, { lat: 19.6100, lng: 75.7900 }] },
        { name: 'Jalna–Beed', path_data: [{ lat: 19.8347, lng: 75.8816 }, { lat: 19.4000, lng: 75.8200 }, { lat: 18.9900, lng: 75.7600 }] }
    ];

    for (const route of routes) {
        const { error } = await supabase.from('routes').upsert(route, { onConflict: 'name' });
        if (error) console.error(`Error seeding route ${route.name}:`, error.message);
        else console.log(`✅ Route ensured: ${route.name}`);
    }

    // Fetch routes to get IDs
    const { data: dbRoutes } = await supabase.from('routes').select('id, name');
    const getRouteId = (name) => dbRoutes?.find(r => r.name === name)?.id;

    // 2. Seed Buses
    const buses = [
        { id: 'MH-20-BL-1234', route_id: getRouteId('Jalna–Aurangabad'), location: { lat: 19.8347, lng: 75.8816 }, occupancy: 'Empty', status: 'Available' },
        { id: 'MH-20-BL-5678', route_id: getRouteId('Jalna–Pune'), location: { lat: 19.8347, lng: 75.8816 }, occupancy: 'Empty', status: 'Available' },
        { id: 'MH-20-BL-9012', route_id: getRouteId('Jalna–Ambad'), location: { lat: 19.8347, lng: 75.8816 }, occupancy: 'Empty', status: 'Inactive' },
        { id: 'MH-20-BL-3456', route_id: getRouteId('Jalna–Beed'), location: { lat: 19.8347, lng: 75.8816 }, occupancy: 'Empty', status: 'Inactive' }
    ];

    for (const bus of buses) {
        const { error } = await supabase.from('buses').upsert(bus, { onConflict: 'id' });
        if (error) console.error(`Error seeding bus ${bus.id}:`, error.message);
        else console.log(`✅ Bus ensured: ${bus.id}`);
    }
}

async function main() {
    await runSQL(path.join(__dirname, '../sql/001_schema.sql'));
    await runSQL(path.join(__dirname, '../sql/002_seeds.sql'));
    console.log('\n🎉 Database setup check complete.');
}

main();
