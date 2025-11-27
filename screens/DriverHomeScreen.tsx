import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';
import { api, DBBus } from '../services/api';
import { Occupancy, BusStatus, reverseGeocode } from '../types';
import { AlertIcon, LogoutIcon, BusIcon, GpsIcon } from '../components/icons';

const DriverHomeScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useLocalization();

  // Persistent State: Initialize from localStorage
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    const savedStatus = localStorage.getItem('driverOnlineStatus');
    return savedStatus === 'true';
  });

  // App State
  const [assignedBus, setAssignedBus] = useState<DBBus | null>(null);
  const [assignedRouteName, setAssignedRouteName] = useState<string>('Loading route...');
  const [occupancy, setOccupancy] = useState<Occupancy>(Occupancy.EMPTY);
  const [locationSending, setLocationSending] = useState<boolean>(false);
  const [lastLocationTime, setLastLocationTime] = useState<string>('-');
  const [showSosConfirm, setShowSosConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Refs for interval management
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch Driver Profile & Assigned Bus on Mount
  useEffect(() => {
    const fetchDriverData = async () => {
      if (!user) return;
      try {
        const driver = await api.getDriverByUserId(user.id);
        if (driver && driver.assigned_bus_id) {
          // Fetch full bus details
          const bus = await api.getBusById(driver.assigned_bus_id);
          if (bus) {
            setAssignedBus(bus);
            // Extract route name safely
            const routeData = bus.routes as any;
            const routeName = routeData?.name || (Array.isArray(routeData) && routeData[0]?.name) || 'No Route Assigned';
            setAssignedRouteName(routeName);
          } else {
            setErrorMsg('Assigned bus not found. Contact admin.');
          }
        } else {
          setErrorMsg('No bus assigned. Contact admin.');
        }
      } catch (err) {
        console.error('Error fetching driver data:', err);
        setErrorMsg('Something went wrong. Try again.');
      }
    };

    fetchDriverData();
  }, [user]);

  // 2. Persist Online Status & Sync with Backend
  useEffect(() => {
    localStorage.setItem('driverOnlineStatus', String(isOnline));

    const syncStatus = async () => {
      if (!user || !assignedBus) return;

      try {
        // Update Driver Status (Logical)
        await api.updateDriverStatus(user.id, isOnline ? 'online' : 'offline');

        // Update Bus Status (Physical)
        const newStatus = isOnline ? BusStatus.AVAILABLE : BusStatus.INACTIVE;
        await api.updateBusStatus(assignedBus.id, newStatus);
      } catch (err) {
        console.error("Failed to sync status:", err);
      }
    };

    syncStatus();
  }, [isOnline, assignedBus, user]);


  // 3. Location Sending Logic (5-second Interval)
  useEffect(() => {
    // Clear existing interval if any
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }

    // Only start if Online AND Bus is Assigned
    if (isOnline && assignedBus) {
      // Start Interval
      locationIntervalRef.current = setInterval(async () => {
        if (!navigator.geolocation) {
          setLocationSending(false);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const timestamp = new Date().toLocaleTimeString();

            try {
              // Send Location Update
              await api.updateBusLocation(assignedBus.id, latitude, longitude, occupancy);

              // Update UI State
              setLocationSending(true);
              setLastLocationTime(timestamp);
            } catch (err) {
              console.error("API Error sending location:", err);
              setLocationSending(false); // API failed
            }
          },
          (error) => {
            console.error("GPS Error:", error);
            setLocationSending(false); // GPS failed
            if (error.code === 1) alert("Turn on GPS.");
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      }, 5000);
    } else {
      setLocationSending(false);
    }

    // Cleanup on unmount or dependency change
    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
    };
  }, [isOnline, assignedBus, occupancy]);


  // Handlers
  const toggleOnlineStatus = () => {
    if (!assignedBus) {
      alert("Cannot go online without an assigned bus.");
      return;
    }
    setIsOnline(prev => !prev);
  };

  const handleOccupancyChange = (newOccupancy: Occupancy) => {
    setOccupancy(newOccupancy);
    // Immediate update for occupancy if online
    if (isOnline && assignedBus) {
      api.updateBus(assignedBus.id, { occupancy: newOccupancy });
    }
  };

  const handleSos = async () => {
    if (assignedBus) {
      try {
        await api.updateBusStatus(assignedBus.id, undefined, true);
        alert('SOS Alert Sent! Help is on the way.');
        setShowSosConfirm(false);
      } catch (err) {
        alert("Failed to send SOS. Try again.");
      }
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
      {/* Header / Dashboard Card */}
      <div className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 p-6 rounded-b-3xl shadow-medium mb-6">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
              {user?.name || 'Driver'}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">
              Dashboard
            </p>
          </div>
          <div className={`px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm transition-colors ${isOnline
              ? 'bg-success/10 text-success ring-2 ring-success/20'
              : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500'
            }`}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </div>
        </div>

        {/* Bus Info Card */}
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-700">
          {errorMsg ? (
            <div className="text-red-500 font-bold text-center py-2">{errorMsg}</div>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-3">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <BusIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-bold">Assigned Bus</p>
                  <p className="text-lg font-bold text-neutral-900 dark:text-white">
                    {assignedBus?.id || 'Loading...'}
                  </p>
                </div>
              </div>
              <div className="border-t border-neutral-100 dark:border-neutral-700 pt-3">
                <p className="text-xs text-neutral-500 uppercase font-bold mb-1">Route</p>
                <p className="text-base font-medium text-neutral-800 dark:text-neutral-200">
                  {assignedRouteName}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* GO ONLINE / OFFLINE BUTTON */}
        <button
          onClick={toggleOnlineStatus}
          disabled={!!errorMsg}
          className={`w-full p-6 rounded-2xl font-bold text-white shadow-lg transition-all duration-300 transform active:scale-95 flex flex-col items-center justify-center gap-2 ${isOnline
              ? 'bg-success hover:bg-green-600 shadow-glow-success'
              : 'bg-neutral-400 hover:bg-neutral-500'
            } ${!!errorMsg ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className={`w-4 h-4 rounded-full bg-white ${isOnline ? 'animate-pulse' : ''}`} />
          <span className="text-xl tracking-wide">
            {isOnline ? 'YOU ARE ONLINE' : 'GO ONLINE'}
          </span>
          <span className="text-xs font-normal opacity-90">
            {isOnline ? 'Sharing live location...' : 'Tap to start shift'}
          </span>
        </button>

        {/* Debug / Status Indicators */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center ${locationSending
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
            <span className="text-xs font-bold uppercase mb-1 text-neutral-500">Location Sending</span>
            <span className={`text-lg font-bold ${locationSending ? 'text-green-600' : 'text-red-500'}`}>
              {locationSending ? 'YES' : 'NO'}
            </span>
          </div>
          <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold uppercase mb-1 text-neutral-500">Last Update</span>
            <span className="text-lg font-mono font-medium text-neutral-700 dark:text-neutral-300">
              {lastLocationTime}
            </span>
          </div>
        </div>

        {/* Occupancy Controls - Only visible when Online */}
        {isOnline && (
          <div className="card p-5 animate-scale-in bg-white dark:bg-neutral-800 rounded-xl shadow-sm">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4 uppercase tracking-wide">
              Current Occupancy
            </h3>
            <div className="flex gap-3">
              {[Occupancy.LOW, Occupancy.MEDIUM, Occupancy.FULL].map(level => (
                <button
                  key={level}
                  onClick={() => handleOccupancyChange(level)}
                  className={`flex-1 py-3 rounded-xl font-bold text-white transition-all duration-200 transform active:scale-95 ${getOccupancyColor(level)
                    } ${occupancy === level
                      ? 'ring-4 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900 shadow-lg scale-105'
                      : 'opacity-70 hover:opacity-100'
                    }`}
                >
                  <div className="text-xs uppercase opacity-80 mb-1">Level</div>
                  {level}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SOS Button */}
        <button
          onClick={() => setShowSosConfirm(true)}
          className="w-full mt-4 bg-danger/10 dark:bg-danger/20 border-2 border-danger text-danger font-bold py-4 rounded-2xl hover:bg-danger/20 transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          <AlertIcon className="w-6 h-6" />
          <span>SEND SOS ALERT</span>
        </button>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-4 flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">v1.0.0</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-neutral-500 hover:text-red-500 transition-colors"
        >
          <span className="text-sm font-medium">Logout</span>
          <LogoutIcon className="w-5 h-5" />
        </button>
      </div>

      {/* SOS Modal */}
      {showSosConfirm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl animate-slide-up">
            <div className="bg-red-100 dark:bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertIcon className="w-8 h-8 text-red-600 dark:text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Send SOS Alert?</h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6">
              This will notify admin and share your live location.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSosConfirm(false)}
                className="flex-1 py-3 rounded-xl font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSos}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700"
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
