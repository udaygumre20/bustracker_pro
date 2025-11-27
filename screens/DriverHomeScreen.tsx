import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSupabase } from '../context/SupabaseContext';
import { useLocalization } from '../context/LocalizationContext';
import { api } from '../services/api';
import { Occupancy, BusStatus, reverseGeocode } from '../types';
import MapComponent from '../components/MapComponent';
import { getBusMarkerIconObj } from '../components/mapUtils';
import { AlertIcon, ClockIcon, LogoutIcon, BusIcon, GpsIcon } from '../components/icons';

const OccupancyButton: React.FC<{
  level: Occupancy;
  current: Occupancy;
  onClick: (level: Occupancy) => void;
  color: string;
}> = ({ level, current, onClick, color }) => (
  <button
    onClick={() => onClick(level)}
    className={`flex-1 py-3.5 rounded-xl font-bold text-white transition-all duration-200 transform active:scale-95 ${color
      } ${current === level
        ? 'ring-4 ring-offset-2 ring-offset-neutral-50 dark:ring-offset-neutral-900 shadow-lg scale-105'
        : 'opacity-70 hover:opacity-100 hover:scale-102'
      }`}
  >
    <div className="text-xs uppercase tracking-wider mb-1 font-semibold">Occupancy</div>
    <div className="text-base font-bold">{level}</div>
  </button>
);

const DriverHomeScreen: React.FC = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [tripActive, setTripActive] = useState(false);
  const [occupancy, setOccupancy] = useState<Occupancy>(Occupancy.EMPTY);
  const [gpsActive, setGpsActive] = useState(false);
  const [showSosConfirm, setShowSosConfirm] = useState(false);

  const [currentLocation, setCurrentLocation] = useState<[number, number]>([19.8347, 75.8816]);
  const [currentAddress, setCurrentAddress] = useState('Updating location...');

  const { t } = useLocalization();
  const { user, logout } = useAuth();

  const [assignedBusId, setAssignedBusId] = useState<string | null>(null);
  const [availableRoutes, setAvailableRoutes] = useState<string[]>([]);
  const [selectedRoute, setSelectedRoute] = useState('');

  // Fetch Assigned Bus & Routes
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch all routes first
        const routes = await api.getRoutes();
        const names = routes.map(r => r.name);
        setAvailableRoutes(names);

        let assignedRouteName = '';

        // 2. If user is logged in, check for assigned bus and its route
        if (user) {
          const driver = await api.getDriverByUserId(user.id);
          if (driver && driver.assigned_bus_id) {
            setAssignedBusId(driver.assigned_bus_id);

            // Fetch the bus details to get the assigned route
            const buses = await api.getBuses();
            const assignedBus = buses.find(b => b.id === driver.assigned_bus_id);

            if (assignedBus && assignedBus.routes) {
              // Supabase might return it as an array or object depending on relationship
              // Cast to any to handle both cases safely
              const routeData = assignedBus.routes as any;
              assignedRouteName = routeData.name || (Array.isArray(routeData) && routeData[0]?.name) || '';
            }
          }
        }

        // 3. Set the selected route: priority to assigned route, then existing selection, then first available
        if (assignedRouteName) {
          setSelectedRoute(assignedRouteName);
        } else if (!selectedRoute && names.length > 0) {
          setSelectedRoute(names[0]);
        }
      } catch (error) {
        console.error('Error fetching driver data:', error);
      }
    };
    fetchData();
  }, [user]);

  // Handle Occupancy Change
  const handleOccupancyChange = (newOccupancy: Occupancy) => {
    setOccupancy(newOccupancy);
    if (assignedBusId) {
      api.updateBus(assignedBusId, { occupancy: newOccupancy });
    }
  };

  // GPS Tracking Logic (Simplified for brevity, same as before but cleaner)
  useEffect(() => {
    if (!tripActive || !assignedBusId) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setGpsActive(true);
        const { latitude, longitude } = position.coords;
        setCurrentLocation([latitude, longitude]);
        api.updateBusLocation(assignedBusId, latitude, longitude, occupancy, 'Calculating...');
        reverseGeocode(latitude, longitude).then(setCurrentAddress).catch(() => { });
      },
      (error) => {
        console.error("GPS Error:", error);
        setGpsActive(false);
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [tripActive, assignedBusId, occupancy]);

  const handleGoOnline = () => {
    setIsOnline(!isOnline);
    if (!isOnline) {
      // Going Online
      if (assignedBusId) api.updateBusStatus(assignedBusId, BusStatus.AVAILABLE);
    } else {
      // Going Offline
      setTripActive(false);
      if (assignedBusId) api.updateBusStatus(assignedBusId, BusStatus.INACTIVE);
    }
  };

  const handleStartSharing = () => {
    if (!isOnline) {
      alert("Please go online first.");
      return;
    }
    setTripActive(!tripActive);
    if (!tripActive) {
      if (assignedBusId) api.updateBusStatus(assignedBusId, BusStatus.IN_TRIP);
    } else {
      if (assignedBusId) api.updateBusStatus(assignedBusId, BusStatus.AVAILABLE);
    }
  };

  const handleSos = () => {
    if (assignedBusId) {
      api.updateBusStatus(assignedBusId, undefined, true);
      alert('SOS Alert Sent! Help is on the way.');
      setShowSosConfirm(false);
    }
  };

  const getOccupancyColor = (level: Occupancy) => {
    switch (level) {
      case Occupancy.LOW: return 'bg-success hover:bg-green-600';
      case Occupancy.MEDIUM: return 'bg-warning hover:bg-yellow-600';
      case Occupancy.FULL: return 'bg-danger hover:bg-red-700';
      default: return 'bg-neutral-400 hover:bg-neutral-500';
    }
  };

  return (
    <div className="h-full flex flex-col bg-neutral-50 dark:bg-neutral-900 overflow-y-auto pb-20">
      {/* Welcome Card */}
      <div className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 p-6 rounded-b-3xl shadow-medium mb-6">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">Hello, {user?.name || 'Driver'}</h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">Ready to start your shift?</p>
          </div>
          <div className={`px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm ${isOnline
            ? 'bg-success/10 text-success ring-2 ring-success/20'
            : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
            }`}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </div>
        </div>

        <div className="card p-4">
          <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3 block">Assigned Bus</label>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-xl">
              <BusIcon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-grow">
              <select
                className="w-full bg-transparent font-bold text-lg text-neutral-900 dark:text-white outline-none cursor-not-allowed"
                value={assignedBusId || ''}
                disabled={!!assignedBusId}
                onChange={(e) => setAssignedBusId(e.target.value)}
              >
                <option value={assignedBusId || ''}>{assignedBusId || 'No Bus Assigned'}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Main Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleGoOnline}
            className={`p-5 rounded-2xl font-bold text-white shadow-lg transition-all duration-200 transform active:scale-95 flex flex-col items-center justify-center gap-3 ${isOnline
              ? 'bg-success hover:bg-green-600 shadow-glow-success'
              : 'bg-neutral-400 hover:bg-neutral-500'
              }`}
          >
            <div className={`w-3 h-3 rounded-full bg-white ${isOnline ? 'animate-pulse' : ''}`} />
            <span className="text-sm">{isOnline ? 'You are Online' : 'Go Online'}</span>
          </button>

          <button
            onClick={handleStartSharing}
            disabled={!isOnline}
            className={`p-5 rounded-2xl font-bold text-white shadow-lg transition-all duration-200 transform active:scale-95 flex flex-col items-center justify-center gap-3 ${tripActive
              ? 'bg-primary hover:bg-blue-600 shadow-glow-primary'
              : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400'
              } ${!isOnline ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <GpsIcon className={`w-6 h-6 ${tripActive ? 'animate-bounce' : ''}`} />
            <span className="text-sm">{tripActive ? 'Sharing Location' : 'Start Sharing'}</span>
          </button>
        </div>

        {/* Occupancy */}
        {tripActive && (
          <div className="card p-5 animate-scale-in">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4 uppercase tracking-wide">Update Occupancy</h3>
            <div className="flex gap-3">
              {[Occupancy.LOW, Occupancy.MEDIUM, Occupancy.FULL].map(level => (
                <OccupancyButton
                  key={level}
                  level={level}
                  current={occupancy}
                  onClick={handleOccupancyChange}
                  color={getOccupancyColor(level)}
                />
              ))}
            </div>
          </div>
        )}

        {/* SOS Button */}
        <button
          onClick={() => setShowSosConfirm(true)}
          className="w-full bg-danger/10 dark:bg-danger/20 border-2 border-danger text-danger font-bold py-5 rounded-2xl hover:bg-danger/20 dark:hover:bg-danger/30 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-glow-danger active:scale-95"
        >
          <AlertIcon className="w-6 h-6" />
          <span className="text-base">SEND SOS ALERT</span>
        </button>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-4 flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-neutral-400'}`} />
          <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">{isOnline ? 'Online' : 'Offline'}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-neutral-500 hover:text-red-500 transition-colors"
        >
          <span className="text-sm font-medium">Logout</span>
          <LogoutIcon className="w-5 h-5" />
        </button>
      </div>

      {/* SOS Confirmation Modal */}
      {showSosConfirm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl animate-slide-up">
            <div className="bg-red-100 dark:bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertIcon className="w-8 h-8 text-red-600 dark:text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Send SOS Alert?</h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6">This will immediately notify the admin team and share your live location.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSosConfirm(false)}
                className="flex-1 py-3 rounded-xl font-bold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSos}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30"
              >
                YES, SEND
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverHomeScreen;