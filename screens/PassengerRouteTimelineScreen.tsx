import React, { useState, useEffect, useRef } from 'react';
import { BusIcon, ChevronLeftIcon } from '../components/icons';
import { api } from '../services/api';
import { calculateETA, geocodeAddress } from '../utils/etaUtils';

// --- Types ---
interface Stop {
  id: number;
  name: string;
  location?: { lat: number; lng: number };
  eta?: string;
}

interface RouteData {
  routeId: string;
  start: string;
  destination: string;
  stops: Stop[];
  currentStopId: number;
}

interface PassengerRouteTimelineScreenProps {
  onBack: () => void;
  routeId: string;
  busLocation?: { lat: number; lng: number; };
}

const PassengerRouteTimelineScreen: React.FC<PassengerRouteTimelineScreenProps> = ({ onBack, routeId, busLocation }) => {
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStopIndex, setSelectedStopIndex] = useState<number | null>(null);
  const currentStopRef = useRef<HTMLDivElement>(null);

  // Fetch Route Data and Geocode Stops
  useEffect(() => {
    const fetchRoute = async () => {
      setLoading(true);
      try {
        const routes = await api.getRoutes();
        const route = routes.find(r => r.id === routeId);

        if (route) {
          const parts = route.name.split(' - ');
          const start = parts[0];
          const destination = parts[parts.length - 1];

          const stops: Stop[] = await Promise.all(parts.map(async (part, index) => {
            // Geocode the stop name to get coordinates
            // Append "Maharashtra, India" for better accuracy if needed, or rely on bounds
            const location = await geocodeAddress(part + ", Maharashtra, India");
            return {
              id: index + 1,
              name: part.trim(),
              location: location || undefined
            };
          }));

          setRouteData({
            routeId: route.name,
            start,
            destination,
            stops,
            currentStopId: 1
          });
        }
      } catch (error) {
        console.error("Failed to fetch route details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (routeId) {
      fetchRoute();
    } else {
      setLoading(false);
    }
  }, [routeId]);

  // Calculate ETAs when bus location or stops change
  useEffect(() => {
    const updateETAs = async () => {
      if (!busLocation || !routeData) return;

      const updatedStops = await Promise.all(routeData.stops.map(async (stop) => {
        if (stop.location) {
          const eta = await calculateETA(busLocation, stop.location);
          return { ...stop, eta };
        }
        return stop;
      }));

      setRouteData(prev => prev ? { ...prev, stops: updatedStops } : null);
    };

    updateETAs();
    // Refresh ETAs every minute
    const interval = setInterval(updateETAs, 60000);
    return () => clearInterval(interval);
  }, [busLocation, routeData?.stops.length]);

  // Auto-scroll to current stop
  useEffect(() => {
    if (currentStopRef.current) {
      currentStopRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [routeData?.currentStopId]);

  const getStopStatus = (stopId: number, currentId: number) => {
    if (stopId < currentId) return 'completed';
    if (stopId === currentId) return 'current';
    return 'upcoming';
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-white dark:bg-neutral-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!routeData) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-white dark:bg-neutral-900 text-neutral-500">
        <p>Route not found.</p>
        <button onClick={onBack} className="mt-4 text-primary font-bold">Go Back</button>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-sans">
      {/* App Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 z-10 shadow-sm">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
          <ChevronLeftIcon className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-bold leading-tight">{routeData.start} - {routeData.destination}</h1>
        </div>
        <div className="w-10" />
      </div>

      {/* Timeline Content */}
      <div className="flex-grow overflow-y-auto px-6 py-4 relative">
        {/* Continuous Vertical Line */}
        <div className="absolute left-[39px] top-4 bottom-4 w-0.5 bg-neutral-200 dark:bg-neutral-700 z-0" />

        <div className="space-y-0 relative z-10">
          {routeData.stops.map((stop, index) => {
            const status = getStopStatus(stop.id, routeData.currentStopId);
            const isLast = index === routeData.stops.length - 1;
            const isSelected = index === selectedStopIndex;

            return (
              <div
                key={stop.id}
                ref={status === 'current' ? currentStopRef : null}
                className="flex items-start min-h-[70px] group cursor-pointer"
                onClick={() => setSelectedStopIndex(index)}
              >
                {/* Timeline Marker Area */}
                <div className="flex flex-col items-center mr-4 w-8 pt-1">
                  {status === 'completed' && (
                    <div className={`w-4 h-4 rounded-full border-2 border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-800 z-10 relative transition-all duration-300 ${isSelected ? 'animate-pulse ring-4 ring-primary/20 border-primary' : ''}`}>
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-neutral-300 dark:bg-neutral-600" />
                    </div>
                  )}

                  {status === 'current' && (
                    <div className={`w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/30 z-20 scale-110 transition-transform duration-500 ${isSelected ? 'animate-pulse ring-4 ring-teal-500/40' : ''}`}>
                      <BusIcon className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {status === 'upcoming' && (
                    <div className={`w-4 h-4 rounded-full border-2 border-neutral-800 bg-white dark:border-neutral-400 dark:bg-neutral-800 z-10 transition-all duration-300 ${isSelected ? 'animate-pulse ring-4 ring-primary/20 border-primary' : ''}`} />
                  )}
                </div>

                {/* Stop Details */}
                <div className={`flex-grow pt-0.5 pb-6 ${!isLast ? 'border-b border-neutral-100 dark:border-neutral-800' : ''}`}>
                  <h3 className={`text-base font-bold transition-colors duration-300 ${status === 'current'
                    ? 'text-teal-600 dark:text-teal-400 scale-[1.02] origin-left'
                    : status === 'completed'
                      ? 'text-neutral-400 dark:text-neutral-500'
                      : 'text-neutral-900 dark:text-white'
                    }`}>
                    {stop.name}
                  </h3>
                  {status === 'current' && (
                    <p className="text-xs text-teal-500 font-medium mt-1 animate-pulse">Arriving Now</p>
                  )}
                  {stop.eta && status !== 'current' && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-1">ETA: {stop.eta}</p>
                  )}
                  {isSelected && (
                    <p className="text-xs text-primary font-medium mt-1 animate-fade-in">Selected Stop</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PassengerRouteTimelineScreen;
