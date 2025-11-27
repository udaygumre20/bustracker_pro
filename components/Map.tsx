
import React, { useEffect, useRef, useState } from 'react';

// Helper to manage script loading with singleton pattern to prevent duplicates
let googleMapsPromise: Promise<void> | null = null;

const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
  // If the API is already available globally, resolve immediately
  if ((window as any).google && (window as any).google.maps) {
    return Promise.resolve();
  }

  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise((resolve, reject) => {
    // Check again inside the promise in case it loaded in the meantime
    if ((window as any).google && (window as any).google.maps) {
      resolve();
      return;
    }

    const existingScript = document.querySelector('script[src^="https://maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      // Script exists. It might be loading or finished.
      // We add listeners; if it's already loaded, these won't fire, so we need a timeout or status check.
      // However, Google Maps doesn't set a simple "loaded" attribute on the script tag.
      // Best bet: if it exists, we assume it's loading or loaded. 
      // We can poll for google.maps or attach to the existing script's load event.

      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', (err) => reject(err));

      // Fallback: Poll for the object (fixes cases where script is already loaded but we missed the event)
      const intervalId = setInterval(() => {
        if ((window as any).google && (window as any).google.maps) {
          clearInterval(intervalId);
          resolve();
        }
      }, 500);

      return;
    }

    // Register global error handler for auth failures (InvalidKeyMapError)
    // This must be defined BEFORE the script loads
    (window as any).gm_authFailure = () => {
      console.error("Google Maps authentication failed. Check your API key.");
      window.dispatchEvent(new Event('gm_authFailure'));
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

export interface MarkerData {
  id: string;
  position: [number, number]; // lat, lng tuple
  popupText: string;
  icon?: any; // google.maps.Symbol or Icon URL
}

export interface PolylineData {
  id: string;
  positions: [number, number][];
  color: string;
}

interface MapProps {
  center: [number, number];
  zoom: number;
  markers?: MarkerData[];
  polylines?: PolylineData[];
  className?: string;
  onMarkerClick?: (id: string) => void;
}

const Map: React.FC<MapProps> = ({ center, zoom, markers, polylines, className, onMarkerClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [id: string]: any }>({});
  const polylinesRef = useRef<{ [id: string]: any }>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Sanitize API key to remove quotes or whitespace that might cause InvalidKeyMapError
    const rawApiKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY;

    const apiKey = rawApiKey ? String(rawApiKey).replace(/["']/g, '').trim() : '';

    if (!apiKey) {
      const msg = "Google Maps API Key is missing. Please add API_KEY to your environment variables.";
      console.error(msg);
      setError(msg);
      return;
    }

    const handleAuthFailure = () => {
      setError("Invalid API Key. Please check your Google Cloud Console settings and ensure the key is valid and has no referrer restrictions blocking this domain.");
    };
    window.addEventListener('gm_authFailure', handleAuthFailure);

    loadGoogleMapsScript(apiKey)
      .then(() => {
        setIsLoaded(true);
      })
      .catch((err) => {
        console.error("Failed to load Google Maps", err);
        setError("Failed to load Google Maps API script (Network Error).");
      });

    return () => {
      window.removeEventListener('gm_authFailure', handleAuthFailure);
    };
  }, []);

  // Initialize Map
  useEffect(() => {
    if (isLoaded && mapRef.current && !mapInstanceRef.current) {
      const google = (window as any).google;
      if (!google || !google.maps) {
        setError("Google Maps loaded but global namespace is missing.");
        return;
      }
      try {
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: { lat: center[0], lng: center[1] },
          zoom: zoom,
          disableDefaultUI: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
      } catch (e) {
        console.error("Error initializing map:", e);
        setError("Error initializing map instance.");
      }
    }
  }, [isLoaded]);

  // Update Center and Zoom
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter({ lat: center[0], lng: center[1] });
      mapInstanceRef.current.setZoom(zoom);
    }
  }, [center, zoom]);

  // Manage Markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const google = (window as any).google;

    const currentMarkerIds = new Set(markers?.map(m => m.id) || []);

    // Remove markers not in the new list
    Object.keys(markersRef.current).forEach((id) => {
      if (!currentMarkerIds.has(id)) {
        markersRef.current[id].setMap(null);
        delete markersRef.current[id];
      }
    });

    // Add or update markers
    markers?.forEach((markerData) => {
      const pos = { lat: markerData.position[0], lng: markerData.position[1] };

      if (markersRef.current[markerData.id]) {
        // Update existing
        markersRef.current[markerData.id].setPosition(pos);
        if (markerData.icon) {
          markersRef.current[markerData.id].setIcon(markerData.icon);
        }
      } else {
        // Create new
        const marker = new google.maps.Marker({
          position: pos,
          map: mapInstanceRef.current,
          icon: markerData.icon,
          title: markerData.popupText.replace(/<[^>]*>?/gm, ''), // Strip HTML for title tooltip
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `<div style="color:black; padding:5px; font-family: sans-serif;">${markerData.popupText}</div>`,
        });

        marker.addListener("click", () => {
          if (onMarkerClick) {
            onMarkerClick(markerData.id);
          } else {
            infoWindow.open(mapInstanceRef.current, marker);
          }
        });

        markersRef.current[markerData.id] = marker;
      }
    });
  }, [markers, onMarkerClick, isLoaded]);

  // Manage Polylines
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const google = (window as any).google;

    const currentPolyIds = new Set(polylines?.map(p => p.id) || []);

    Object.keys(polylinesRef.current).forEach((id) => {
      if (!currentPolyIds.has(id)) {
        polylinesRef.current[id].setMap(null);
        delete polylinesRef.current[id];
      }
    });

    polylines?.forEach((polyData) => {
      const path = polyData.positions.map(p => ({ lat: p[0], lng: p[1] }));

      if (polylinesRef.current[polyData.id]) {
        polylinesRef.current[polyData.id].setPath(path);
        polylinesRef.current[polyData.id].setOptions({ strokeColor: polyData.color });
      } else {
        const polyline = new google.maps.Polyline({
          path: path,
          geodesic: true,
          strokeColor: polyData.color,
          strokeOpacity: 1.0,
          strokeWeight: 4,
          map: mapInstanceRef.current,
        });
        polylinesRef.current[polyData.id] = polyline;
      }
    });

  }, [polylines, isLoaded]);

  if (error) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border-2 border-neutral-300 dark:border-neutral-700 rounded-lg ${className || ''}`}>
        <div className="text-center p-6 max-w-sm">
          <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full inline-block mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emergency" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="mb-2 font-bold text-neutral-800 dark:text-neutral-200">Map Loading Error</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">{error}</p>
          {error.includes('API Key') && (
            <div className="text-xs bg-neutral-200 dark:bg-neutral-700 p-2 rounded text-left font-mono">
              Check .env file:<br />
              API_KEY=AIzaSy...
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className || ''}`}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 bg-opacity-50 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};

export default Map;
