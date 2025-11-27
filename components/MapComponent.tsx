import React, { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline, DirectionsRenderer } from '@react-google-maps/api';
import { getStartMarkerIconObj, getEndMarkerIconObj } from './mapUtils';

const containerStyle = {
    width: '100%',
    height: '100%'
};



const defaultCenter = {
    lat: 19.8297, // Jalna
    lng: 75.8800
};

interface MapComponentProps {
    center?: { lat: number; lng: number };
    zoom?: number;
    markers?: Array<{
        id: string;
        position: { lat: number; lng: number };
        title?: string;
        icon?: any; // google.maps.Icon | google.maps.Symbol | string
    }>;
    routes?: Array<{
        id: string;
        path: { lat: number; lng: number }[];
        color?: string;
    }>;
    onMarkerClick?: (id: string) => void;
    userLocation?: { lat: number; lng: number } | null;
}

const MapComponent: React.FC<MapComponentProps> = ({
    center = defaultCenter,
    zoom = 12,
    markers = [],
    routes = [],
    onMarkerClick,
    userLocation
}) => {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_MAP_API_KEY || ''
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);

    // Fetch directions when routes change
    React.useEffect(() => {
        setDirectionsResponse(null);

        if (isLoaded && routes.length > 0 && (window as any).google) {
            const route = routes[0];

            if (route.path && route.path.length >= 2) {
                const origin = route.path[0];
                const destination = route.path[route.path.length - 1];
                const waypoints = route.path.slice(1, -1).map(p => ({ location: p, stopover: true }));

                const directionsService = new google.maps.DirectionsService();
                directionsService.route({
                    origin: origin,
                    destination: destination,
                    waypoints: waypoints,
                    travelMode: google.maps.TravelMode.DRIVING,
                }, (result, status) => {
                    if (status === google.maps.DirectionsStatus.OK) {
                        setDirectionsResponse(result);
                    } else {
                        console.error(`error fetching directions ${result}`);
                    }
                });
            }
        }
    }, [isLoaded, routes]);

    const onLoad = useCallback(function callback(map: google.maps.Map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map: google.maps.Map) {
        setMap(null);
    }, []);

    if (loadError) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-red-500 p-4 text-center">
                <p className="font-bold mb-2">Error loading Google Maps</p>
                <p className="text-sm">{loadError.message}</p>
                <p className="text-xs mt-2 text-neutral-500">Check your API Key in .env.local</p>
            </div>
        );
    }

    if (!isLoaded) {
        return <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-500">Loading Map...</div>;
    }

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={zoom}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
                disableDefaultUI: false,
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
            }}
        >
            {markers.map(marker => {
                let icon = marker.icon;
                // Hydrate plain objects to Google Maps classes if needed
                if (isLoaded && icon && typeof icon === 'object' && icon.scaledSize && (window as any).google && !(icon.scaledSize instanceof google.maps.Size)) {
                    try {
                        icon = {
                            ...icon,
                            scaledSize: new google.maps.Size(icon.scaledSize.width, icon.scaledSize.height),
                            anchor: icon.anchor ? new google.maps.Point(icon.anchor.x, icon.anchor.y) : null
                        };
                    } catch (e) {
                        console.error("Error hydrating marker icon:", e);
                    }
                }

                return (
                    <Marker
                        key={marker.id}
                        position={marker.position}
                        title={marker.title}
                        icon={icon}
                        onClick={() => onMarkerClick && onMarkerClick(marker.id)}
                    />
                );
            })}

            {/* Render Real Directions if available */}
            {directionsResponse && (
                <>
                    <DirectionsRenderer
                        directions={directionsResponse}
                        options={{
                            suppressMarkers: true,
                            polylineOptions: {
                                strokeColor: '#3B82F6',
                                strokeWeight: 5,
                            },
                            preserveViewport: true
                        }}
                    />
                    {/* Custom Start Marker */}
                    {directionsResponse.routes[0]?.legs[0]?.start_location && (
                        <Marker
                            key="start-marker"
                            zIndex={1000}
                            position={directionsResponse.routes[0].legs[0].start_location}
                            title="Start"
                            icon={(() => {
                                const iconObj = getStartMarkerIconObj();
                                if (isLoaded && (window as any).google && (window as any).google.maps) {
                                    return {
                                        ...iconObj,
                                        scaledSize: new google.maps.Size(iconObj.scaledSize.width, iconObj.scaledSize.height),
                                        anchor: new google.maps.Point(iconObj.anchor.x, iconObj.anchor.y)
                                    };
                                }
                                return iconObj;
                            })() as any}
                        />
                    )}
                    {/* Custom End Marker */}
                    {directionsResponse.routes[0]?.legs?.length > 0 && (
                        <Marker
                            key="end-marker"
                            zIndex={1000}
                            position={directionsResponse.routes[0].legs[directionsResponse.routes[0].legs.length - 1].end_location}
                            title="End"
                            icon={(() => {
                                const iconObj = getEndMarkerIconObj();
                                if (isLoaded && (window as any).google && (window as any).google.maps) {
                                    return {
                                        ...iconObj,
                                        scaledSize: new google.maps.Size(iconObj.scaledSize.width, iconObj.scaledSize.height),
                                        anchor: new google.maps.Point(iconObj.anchor.x, iconObj.anchor.y)
                                    };
                                }
                                return iconObj;
                            })() as any}
                        />
                    )}
                </>
            )}

            {/* Fallback to Polyline if no directions (or while loading) */}
            {!directionsResponse && routes.map(route => (
                <Polyline
                    key={route.id}
                    path={route.path}
                    options={{
                        strokeColor: route.color || '#FF0000',
                        strokeOpacity: 0.8,
                        strokeWeight: 4,
                    }}
                />
            ))}

            {userLocation && (window as any).google && (
                <Marker
                    position={userLocation}
                    icon={{
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 7,
                        fillColor: '#4285F4',
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 2,
                    }}
                    title="You are here"
                />
            )}
        </GoogleMap>
    );
};

export default React.memo(MapComponent);
