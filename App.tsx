import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserRole, Route, BusStatus } from './types';

import LoginScreen from './screens/LoginScreen';
import DriverHomeScreen from './screens/DriverHomeScreen';
import PassengerHomeScreen from './screens/PassengerHomeScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import DriverManagementScreen from './screens/DriverManagementScreen';
import BusManagementScreen from './screens/BusManagementScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import RaiseIssueScreen from './screens/RaiseIssueScreen';
import Header from './components/Header';
import SideMenu from './components/SideMenu';
import { LocalizationProvider } from './context/LocalizationContext';
import { SupabaseProvider } from './context/SupabaseContext';
import { api } from './services/api';

// --- Centralized Mock Data ---
// --- Centralized Mock Data Removed ---



const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [screenHistory, setScreenHistory] = useState(['home']);
  const [showLogin, setShowLogin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- Lifted State ---
  const [drivers, setDrivers] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);

  // Fetch data from Supabase on mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [driversData, busesData, routesData] = await Promise.all([
          api.getDrivers(),
          api.getBuses(),
          api.getRoutes()
        ]);

        // Map Supabase data to expected format
        const mappedDrivers = driversData.map((d: any) => ({
          id: d.id,
          name: d.name,
          email: d.email,
          phone: d.phone,
          assigned_bus_id: busesData.find((b: any) => b.driver_id === d.id)?.id || '',
          status: 'Active'
        }));

        const mappedBuses = busesData.map((b: any) => ({
          id: b.id,
          capacity: 50, // Default capacity
          driverId: b.driver_id,
          routeId: b.route_id,
          status: b.status
        }));

        const mappedRoutes = routesData.map((r: any) => ({
          id: r.id,
          name: r.name,
          stops: [] // Routes don't have stops in current schema
        }));

        setDrivers(mappedDrivers);
        setBuses(mappedBuses);
        setRoutes(mappedRoutes);
      } catch (error) {
        console.error('Failed to load management data:', error);
        console.error('Failed to load management data:', error);
        // Fallback to empty arrays on error to indicate no data
        setDrivers([]);
        setBuses([]);
        setRoutes([]);
      }
    };
    loadData();
  }, []);

  const activeScreen = screenHistory[screenHistory.length - 1];

  const navigateTo = (screen: string) => {
    // This function is for primary navigation from the side menu.
    // It resets the history stack to show a top-level screen.
    const currentTopScreen = screenHistory[screenHistory.length - 1];
    const isAlreadyOnTopLevelScreen = screenHistory.length <= 2 && (currentTopScreen === screen || screenHistory[1] === screen);

    if (isAlreadyOnTopLevelScreen && screen !== 'home') {
      return;
    }

    if (screen === 'home') {
      setScreenHistory(['home']);
    } else {
      setScreenHistory(['home', screen]);
    }
  };

  const pushScreen = (screen: string) => {
    // This function adds a new screen to the history stack for drill-down navigation.
    setScreenHistory(prev => [...prev, screen]);
  };

  const goBack = () => {
    if (screenHistory.length > 1) {
      setScreenHistory(prev => prev.slice(0, -1));
    }
  };

  // --- State Handlers ---
  const handleSaveDriver = async (driverData: any, isEditing: boolean) => {
    try {
      const driverId = driverData.id;
      const oldDriverData = isEditing ? drivers.find(d => d.id === driverId) : null;
      const oldBusId = oldDriverData?.assigned_bus_id;
      const newBusId = driverData.assigned_bus_id;

      let savedDriverId = driverId;

      if (isEditing) {
        // Update driver in Supabase
        await api.updateDriver(driverId, {
          name: driverData.name,
          email: driverData.email,
          phone: driverData.phone
        });
      } else {
        // Create new driver in Supabase
        const newDriver = await api.createDriver({
          name: driverData.name,
          email: driverData.email,
          phone: driverData.phone,
          password: driverData.password
        });
        savedDriverId = newDriver.id;
      }

      // Handle bus assignment changes
      if (oldBusId !== newBusId) {
        if (oldBusId) {
          await api.updateBus(oldBusId, { driver_id: null });
        }
        if (newBusId && savedDriverId) {
          await api.updateBus(newBusId, { driver_id: savedDriverId });
        }
      }

      // Reload data to reflect changes
      const [driversData, busesData] = await Promise.all([
        api.getDrivers(),
        api.getBuses()
      ]);

      const mappedDrivers = driversData.map((d: any) => ({
        id: d.id,
        name: d.name,
        email: d.email,
        phone: d.phone,
        assigned_bus_id: busesData.find((b: any) => b.driver_id === d.id)?.id || '',
        status: 'Active'
      }));

      const mappedBuses = busesData.map((b: any) => ({
        id: b.id,
        capacity: 50,
        driverId: b.driver_id,
        routeId: b.route_id,
        status: b.status
      }));

      setDrivers(mappedDrivers);
      setBuses(mappedBuses);
    } catch (error: any) {
      console.error('Failed to save driver:', error);
      alert(`Failed to save driver: ${error.message || JSON.stringify(error)}`);
    }
  };

  const handleDeleteDriver = async (driverId: string) => {
    try {
      await api.deleteDriver(driverId);

      // Reload data
      const [driversData, busesData] = await Promise.all([
        api.getDrivers(),
        api.getBuses()
      ]);

      const mappedDrivers = driversData.map((d: any) => ({
        id: d.id,
        name: d.name,
        email: d.email,
        phone: d.phone,
        assigned_bus_id: busesData.find((b: any) => b.driver_id === d.id)?.id || '',
        status: 'Active'
      }));

      const mappedBuses = busesData.map((b: any) => ({
        id: b.id,
        capacity: 50,
        driverId: b.driver_id,
        routeId: b.route_id,
        status: b.status
      }));

      setDrivers(mappedDrivers);
      setBuses(mappedBuses);
    } catch (error: any) {
      console.error('Failed to delete driver:', error);
      alert(`Failed to delete driver: ${error.message || JSON.stringify(error)}`);
    }
  };

  const handleSaveBus = async (busData: any, isEditing: boolean) => {
    try {
      const oldBusData = isEditing ? buses.find(b => b.id === busData.id) : null;
      const oldDriverId = oldBusData?.driverId;
      const newDriverId = busData.driverId || null; // Convert empty string to null

      if (isEditing) {
        // Update bus in Supabase
        await api.updateBus(busData.id, {
          route_id: busData.routeId || null, // Convert empty string to null
          driver_id: busData.driverId || null, // Convert empty string to null
          status: busData.status
        });
      } else {
        // Create new bus in Supabase
        await api.createBus({
          id: busData.id,
          route_id: busData.routeId || null, // Convert empty string to null
          driver_id: busData.driverId || null, // Convert empty string to null
          location: { lat: 19.8347, lng: 75.8816 }, // Default location
          occupancy: 'Empty',
          status: busData.status || 'Inactive'
        });
      }

      // --- CRITICAL FIX: Update Driver's assigned_bus_id ---
      // If the driver assignment changed, we need to update the driver records too.
      if (oldDriverId !== newDriverId) {
        // 1. Unassign from old driver
        if (oldDriverId) {
          await api.updateDriver(oldDriverId, { assigned_bus_id: null });
        }
        // 2. Assign to new driver
        if (newDriverId) {
          await api.updateDriver(newDriverId, { assigned_bus_id: busData.id });
        }
      } else if (newDriverId) {
        // Even if driver didn't change, ensure the link is consistent (self-healing)
        // This covers cases where the link might be broken in one direction
        await api.updateDriver(newDriverId, { assigned_bus_id: busData.id });
      }
      // -----------------------------------------------------

      // Reload data
      const [driversData, busesData, routesData] = await Promise.all([
        api.getDrivers(),
        api.getBuses(),
        api.getRoutes()
      ]);

      const mappedDrivers = driversData.map((d: any) => ({
        id: d.id,
        name: d.name,
        email: d.email,
        phone: d.phone,
        assigned_bus_id: busesData.find((b: any) => b.driver_id === d.id)?.id || '',
        status: 'Active'
      }));

      const mappedBuses = busesData.map((b: any) => ({
        id: b.id,
        capacity: 50,
        driverId: b.driver_id,
        routeId: b.route_id,
        status: b.status
      }));

      const mappedRoutes = routesData.map((r: any) => ({
        id: r.id,
        name: r.name,
        stops: []
      }));

      setDrivers(mappedDrivers);
      setBuses(mappedBuses);
      setRoutes(mappedRoutes);
    } catch (error: any) {
      console.error('Failed to save bus:', error);
      alert(`Failed to save bus: ${error.message || JSON.stringify(error)}`);
    }
  };

  const handleDeleteBus = async (busId: string) => {
    try {
      await api.deleteBus(busId);

      // Reload data
      const [driversData, busesData] = await Promise.all([
        api.getDrivers(),
        api.getBuses()
      ]);

      const mappedDrivers = driversData.map((d: any) => ({
        id: d.id,
        name: d.name,
        email: d.email,
        phone: d.phone,
        assigned_bus_id: busesData.find((b: any) => b.driver_id === d.id)?.id || '',
        status: 'Active'
      }));

      const mappedBuses = busesData.map((b: any) => ({
        id: b.id,
        capacity: 50,
        driverId: b.driver_id,
        routeId: b.route_id,
        status: b.status
      }));

      setDrivers(mappedDrivers);
      setBuses(mappedBuses);
    } catch (error: any) {
      console.error('Failed to delete bus:', error);
      alert(`Failed to delete bus: ${error.message || JSON.stringify(error)}`);
    }
  };

  const handleSaveRoute = async (routeData: any, isEditing: boolean) => {
    try {
      let pathData = routeData.path_data || [];

      // If path_data is empty and we have a route name, try to geocode it
      if (pathData.length === 0 && routeData.name) {
        // Parse route name (e.g., "Pune - Mumbai" or "Pune - Stop1 - Mumbai")
        const parts = routeData.name.split(/[-–]/).map((s: string) => s.trim());

        if (parts.length >= 2) {
          // Try to geocode all cities (origin, stops, destination)
          try {
            const { generateRoutePathData } = await import('./utils/geocodingUtils');
            pathData = await generateRoutePathData(parts);
            console.log(`Generated path_data for route with ${parts.length} locations:`, pathData);
          } catch (geocodeError) {
            console.warn('Geocoding failed, using default path:', geocodeError);
            // Fallback to default coordinates
            pathData = [
              { lat: 19.8347, lng: 75.8816 }, // Default start
              { lat: 18.5204, lng: 73.8567 }  // Default end
            ];
          }
        } else {
          // If name doesn't match pattern, use default coordinates
          pathData = [
            { lat: 19.8347, lng: 75.8816 },
            { lat: 18.5204, lng: 73.8567 }
          ];
        }
      }

      if (isEditing) {
        await api.updateRoute(routeData.id, {
          name: routeData.name,
          path_data: pathData
        });
      } else {
        await api.createRoute({
          name: routeData.name,
          path_data: pathData
        });
      }

      // Reload routes
      const routesData = await api.getRoutes();
      const mappedRoutes = routesData.map((r: any) => ({
        id: r.id,
        name: r.name,
        stops: []
      }));
      setRoutes(mappedRoutes);
    } catch (error: any) {
      console.error('Failed to save route:', error);
      alert(`Failed to save route: ${error.message || JSON.stringify(error)}`);
    }
  };

  const handleDeleteRoute = async (routeId: string) => {
    try {
      await api.deleteRoute(routeId);

      // Reload data
      const [busesData, routesData] = await Promise.all([
        api.getBuses(),
        api.getRoutes()
      ]);

      const mappedBuses = busesData.map((b: any) => ({
        id: b.id,
        capacity: 50,
        driverId: b.driver_id,
        routeId: b.route_id,
        status: b.status
      }));

      const mappedRoutes = routesData.map((r: any) => ({
        id: r.id,
        name: r.name,
        stops: []
      }));

      setBuses(mappedBuses);
      setRoutes(mappedRoutes);
    } catch (error: any) {
      console.error('Failed to delete route:', error);
      alert(`Failed to delete route: ${error.message || JSON.stringify(error)}`);
    }
  };


  // Show a loading screen while checking auth state
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
        <div className="text-xl font-bold text-primary dark:text-white">Loading...</div>
      </div>
    );
  }

  if (showLogin) {
    return <LoginScreen onLoginSuccess={() => setShowLogin(false)} onBack={() => setShowLogin(false)} />;
  }

  const renderHomeScreen = () => {
    // If a user is logged in, show their role-specific screen
    if (user) {
      switch (user.role) {
        case UserRole.DRIVER:
          return <DriverHomeScreen />;
        case UserRole.ADMIN:
          return <AdminDashboardScreen navigateTo={navigateTo} />;
        default:
          // Fallback for logged-in user with no valid role screen
          return <PassengerHomeScreen />;
      }
    }
    // Default for guests (not logged in) is the Passenger screen
    return <PassengerHomeScreen />;
  };

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'home':
        return renderHomeScreen();
      case 'map':
        // For simplicity, the map screen can be the same as the home screen for all roles
        return renderHomeScreen();
      case 'notifications':
        return <NotificationsScreen />;
      case 'profile':
        return <ProfileScreen onLoginClick={() => setShowLogin(true)} />;
      case 'driverManagement':
        return <DriverManagementScreen
          drivers={drivers}
          buses={buses}
          onSave={handleSaveDriver}
          onDelete={handleDeleteDriver}
        />;
      case 'busManagement':
        return <BusManagementScreen
          buses={buses}
          routes={routes}
          drivers={drivers}
          onSaveBus={handleSaveBus}
          onDeleteBus={handleDeleteBus}
          onSaveRoute={handleSaveRoute}
          onDeleteRoute={handleDeleteRoute}
        />;
      case 'settings':
        return <SettingsScreen navigateTo={pushScreen} />;
      case 'raiseIssue':
        return <RaiseIssueScreen />;
      default:
        return renderHomeScreen();
    }
  }

  // Show header and menu for all roles for a consistent experience
  const showHeaderAndMenu = true;

  const getScreenTitle = () => {
    if (activeScreen === 'notifications') return 'Notifications';
    if (activeScreen === 'profile') return 'Profile';
    if (activeScreen === 'driverManagement') return 'Driver Management';
    if (activeScreen === 'busManagement') return 'Bus & Route Management';
    if (activeScreen === 'settings') return 'Settings';
    if (activeScreen === 'raiseIssue') return 'Raise an Issue';
    if (user?.role === UserRole.ADMIN) return 'Admin Dashboard';
    if (user?.role === UserRole.DRIVER) return 'Driver Control';
    return 'Bus Tracker';
  };

  return (
    <div className="h-dvh w-screen flex flex-col font-sans">
      {showHeaderAndMenu && (
        <Header
          onMenuClick={() => setIsMenuOpen(true)}
          onBackClick={goBack}
          title={getScreenTitle()}
          showBackButton={screenHistory.length > 1}
        />
      )}

      <main className="flex-grow overflow-y-auto">
        {renderActiveScreen()}
      </main>

      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeScreen={activeScreen}
        navigateTo={navigateTo}
      />
    </div>
  );
};


const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LocalizationProvider>
        <SupabaseProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </SupabaseProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;
