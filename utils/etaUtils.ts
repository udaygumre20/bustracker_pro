interface Location {
    lat: number;
    lng: number;
}

export const calculateETA = async (
    origin: Location,
    destination: Location
): Promise<string> => {
    if (!origin || !destination) return 'Unknown';
    if (!origin || !destination) return 'Unknown';
    console.log(`Calculating ETA from Bus (${JSON.stringify(origin)}) to User (${JSON.stringify(destination)})`);

    // Check if Google Maps API is available
    if (typeof google !== 'undefined' && google.maps && google.maps.DistanceMatrixService) {
        const service = new google.maps.DistanceMatrixService();

        try {
            const response = await service.getDistanceMatrix({
                origins: [origin],
                destinations: [destination],
                travelMode: google.maps.TravelMode.DRIVING,
            });

            if (
                response.rows[0] &&
                response.rows[0].elements[0] &&
                response.rows[0].elements[0].status === 'OK'
            ) {
                console.log('Google Maps API Success:', response.rows[0].elements[0].duration.text);
                return response.rows[0].elements[0].duration.text;
            } else {
                console.warn('Google Maps ETA Error:', response.rows[0]?.elements[0]?.status);
            }
        } catch (error) {
            console.error('Google Maps API Error:', error);
        }
    }

    // Fallback: Calculate straight-line distance and assume 30km/h average speed
    console.log('Using Fallback ETA Calculation');
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(destination.lat - origin.lat);
    const dLng = deg2rad(destination.lng - origin.lng);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(origin.lat)) *
        Math.cos(deg2rad(destination.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c; // Distance in km

    const speedKmph = 50; // Average speed (increased for intercity)
    const timeHours = distanceKm / speedKmph;
    const timeMinutes = Math.round(timeHours * 60);

    if (timeMinutes < 1) return '< 1 min';
    if (timeMinutes > 60) {
        const hours = Math.floor(timeMinutes / 60);
        const mins = timeMinutes % 60;
        return `${hours} hr ${mins} min`;
    }
    return `${timeMinutes} min`;
};

export const geocodeAddress = async (address: string): Promise<Location | null> => {
    if (typeof google === 'undefined' || !google.maps || !google.maps.Geocoder) {
        console.warn("Google Maps API not loaded for geocoding");
        return null;
    }

    const geocoder = new google.maps.Geocoder();
    try {
        const response = await geocoder.geocode({ address });
        if (response.results && response.results[0]) {
            const location = response.results[0].geometry.location;
            return {
                lat: location.lat(),
                lng: location.lng()
            };
        }
    } catch (error) {
        console.error("Geocoding failed for address:", address, error);
    }
    return null;
};

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}
