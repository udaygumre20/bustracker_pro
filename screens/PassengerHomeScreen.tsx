import React, { useState, useEffect, useMemo } from 'react';
import { Occupancy, Bus, reverseGeocode } from '../types';
import { api, DBRoute } from '../services/api';
import MapComponent from '../components/MapComponent';
import { useJsApiLoader } from '@react-google-maps/api';
import { getBusMarkerIconObj } from '../components/mapUtils';
import { BusIcon, HomeIcon, MapIcon, QuestionMarkCircleIcon, ChevronDownIcon } from '../components/icons';
import BusDetailModal from '../components/BusDetailModal';
import { useLocalization } from '../context/LocalizationContext';
import { useSupabase } from '../context/SupabaseContext';
import { useUserLocation } from '../hooks/useUserLocation';
import { calculateETA } from '../utils/etaUtils';


interface BusWithAddress extends Bus {
  address?: string;
  distance?: string;
}

import PassengerRouteTimelineScreen from './PassengerRouteTimelineScreen';

const PassengerHomeScreen: React.FC = () => {
  const [selectedRoute, setSelectedRoute] = useState('');
  const [busesWithAddress, setBusesWithAddress] = useState<BusWithAddress[]>([]);
  const [selectedBus, setSelectedBus] = useState<BusWithAddress | null>(null);
  const [activeTab, setActiveTab] = useState('home');

  const [routes, setRoutes] = useState<DBRoute[]>([]);
  const { t } = useLocalization();
  const { location: userLocation, error: locationError, loading: locationLoading } = useUserLocation();

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_MAP_API_KEY || ''
  });

  // Fetch Routes
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const dbRoutes = await api.getRoutes();
        setRoutes(dbRoutes);

        // If no route is selected, or the selected route is not in the fetched list, select the first one
        if (dbRoutes.length > 0) {
          const currentRouteExists = dbRoutes.some(r => r.name === selectedRoute);
          if (!selectedRoute || !currentRouteExists) {
            setSelectedRoute(dbRoutes[0].name);
          }
        }
      } catch (error) {
        console.error("Failed to load routes:", error);
      }
    };
    loadRoutes();
  }, []);

  // Fetch Buses & Subscribe
  useEffect(() => {
    if (!selectedRoute) return;

    const loadBuses = async () => {
      try {
        const allBuses = await api.getBuses();
        const filtered = allBuses.filter(b => b.routes?.name === selectedRoute);

        const mappedBuses: BusWithAddress[] = await Promise.all(filtered.map(async b => {
          let eta = 'Calculating...';
          let distance = 'Unknown';

          if (userLocation) {
            // Simple distance calc for display
            const R = 6371;
            const dLat = (userLocation.lat - b.location.lat) * Math.PI / 180;
            const dLon = (userLocation.lng - b.location.lng) * Math.PI / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(b.location.lat * Math.PI / 180) * Math.cos(userLocation.lat * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const d = R * c;
            distance = `${d.toFixed(1)} km`;

            // Calculate ETA from user to bus (corrected order)
            eta = await calculateETA(
              { lat: userLocation.lat, lng: userLocation.lng },
              { lat: b.location.lat, lng: b.location.lng }
            );
          }

          return {
            id: b.id,
            driverId: b.driver_id,
            route: b.routes?.name || '',
            location: b.location,
            occupancy: b.occupancy,
            status: b.status,
            sos: b.sos,
            eta: eta,
            distance: distance
          };
        }));

        setBusesWithAddress(mappedBuses);

        if (isLoaded && (window as any).google) {
          const busesWithAddr = await Promise.all(
            mappedBuses.map(async bus => {
              const address = await reverseGeocode(bus.location.lat, bus.location.lng);
              return { ...bus, address };
            })
          );
          setBusesWithAddress(busesWithAddr);
        }
      } catch (error) {
        console.error("Failed to load buses:", error);
      }
    };

    loadBuses();

    const subscription = api.subscribeToBuses((payload) => {
      if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
        loadBuses();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedRoute, isLoaded, userLocation]);

  const mapMarkers = busesWithAddress.map(bus => ({
    id: bus.id,
    position: { lat: bus.location.lat, lng: bus.location.lng },
    title: `${bus.id}`,
    icon: getBusMarkerIconObj(bus.occupancy),
    onClick: () => setSelectedBus(bus)
  }));

  const mapCenter = busesWithAddress.length > 0
    ? { lat: busesWithAddress[0].location.lat, lng: busesWithAddress[0].location.lng }
    : { lat: 19.8347, lng: 75.8816 };

  const selectedRouteObj = routes.find(r => r.name === selectedRoute);
  const currentRoutePath = selectedRouteObj ? selectedRouteObj.path_data : [];
  const mapRoutes = useMemo(() => [{
    id: selectedRoute,
    path: currentRoutePath,
    color: '#1A73E8'
  }], [selectedRoute, currentRoutePath]);

  return (
    <div className="h-full w-full relative flex flex-col bg-background dark:bg-dark">
      {/* Floating Route Selector with Glassmorphism */}
      <div className="absolute top-4 left-4 right-4 z-10 animate-fade-in">
        <div className="glass-strong rounded-2xl shadow-medium p-3 flex items-center gap-3">
          <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
            <BusIcon className="w-6 h-6" />
          </div>
          <div className="flex-grow relative">
            <label className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold block ml-1 mb-0.5">Select Route</label>
            <div className="relative">
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="w-full bg-transparent font-bold text-neutral-900 dark:text-white outline-none border-none p-0 pr-8 focus:ring-0 cursor-pointer text-sm appearance-none relative z-10"
              >
                {routes.map(route => (
                  <option
                    key={route.id}
                    value={route.name}
                    className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  >
                    {route.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none z-0">
                <ChevronDownIcon className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Map */}
      <div className="flex-grow w-full h-full">
        <MapComponent
          center={mapCenter}
          zoom={13}
          markers={mapMarkers}
          routes={mapRoutes}
          userLocation={userLocation}
          onMarkerClick={(markerId) => {
            const bus = busesWithAddress.find(b => b.id === markerId);
            if (bus) setSelectedBus(bus);
          }}
        />
      </div>

      {/* Bottom Tab Bar */}
      <div className="bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 pb-safe pt-3 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-20">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all duration-200 ${activeTab === 'home'
              ? 'text-primary bg-primary/10 scale-105'
              : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50'
              }`}
          >
            <HomeIcon className="w-6 h-6" />
            <span className="text-xs font-semibold">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('routes')}
            className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all duration-200 ${activeTab === 'routes'
              ? 'text-primary bg-primary/10 scale-105'
              : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50'
              }`}
          >
            <MapIcon className="w-6 h-6" />
            <span className="text-xs font-semibold">Routes</span>
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all duration-200 ${activeTab === 'about'
              ? 'text-primary bg-primary/10 scale-105'
              : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50'
              }`}
          >
            <QuestionMarkCircleIcon className="w-6 h-6" />
            <span className="text-xs font-semibold">About</span>
          </button>
        </div>
      </div>

      {/* Bottom Sheet */}
      <BusDetailModal
        bus={selectedBus}
        onClose={() => setSelectedBus(null)}
        onNotify={() => alert('Notification set!')}
        onViewRoute={() => setActiveTab('routes')}
        onTrackLive={() => alert('Tracking live...')}
      />

      {/* Route Timeline Overlay */}
      {activeTab === 'routes' && (
        <div className="absolute inset-0 z-30 bg-white dark:bg-neutral-900 animate-slide-up">
          <PassengerRouteTimelineScreen
            onBack={() => setActiveTab('home')}
            routeId={selectedRouteObj?.id || ''}
            busLocation={selectedBus?.location}
          />
        </div>
      )}
    </div>
  );
};

export default PassengerHomeScreen;