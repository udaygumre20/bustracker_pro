// Geocoding utility to convert city names to coordinates
// This uses Google Maps Geocoding API

interface Location {
    lat: number;
    lng: number;
}

/**
 * Geocode a city name to get its coordinates
 */
export const geocodeCity = async (cityName: string): Promise<Location | null> => {
    if (typeof google === 'undefined' || !google.maps || !google.maps.Geocoder) {
        console.error('Google Maps not loaded');
        return null;
    }

    const geocoder = new google.maps.Geocoder();

    return new Promise((resolve) => {
        geocoder.geocode({ address: cityName }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
                const location = results[0].geometry.location;
                resolve({
                    lat: location.lat(),
                    lng: location.lng()
                });
            } else {
                console.error(`Geocoding failed for "${cityName}":`, status);
                resolve(null);
            }
        });
    });
};

/**
 * Generate path_data for a route from multiple city names (origin, stops, destination)
 */
export const generateRoutePathData = async (
    cities: string[]
): Promise<Location[]> => {
    if (cities.length < 2) {
        console.warn('Need at least 2 cities for a route');
        return [
            { lat: 19.8347, lng: 75.8816 }, // Default start
            { lat: 18.5204, lng: 73.8567 }  // Default end
        ];
    }

    // Geocode all cities
    const locations = await Promise.all(
        cities.map(city => geocodeCity(city))
    );

    // Filter out any failed geocoding attempts
    const validLocations = locations.filter(loc => loc !== null) as Location[];

    if (validLocations.length < 2) {
        // Fallback to default coordinates if geocoding failed
        console.warn('Geocoding failed for most cities, using defaults');
        return [
            { lat: 19.8347, lng: 75.8816 },
            { lat: 18.5204, lng: 73.8567 }
        ];
    }

    return validLocations;
};
