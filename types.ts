

export enum UserRole {
  DRIVER = 'DRIVER',
  PASSENGER = 'PASSENGER',
  ADMIN = 'ADMIN',
}

export enum Occupancy {
  EMPTY = '0%',
  LOW = '25%',
  MEDIUM = '50%',
  HIGH = '75%',
  FULL = 'Full',
}

export enum BusStatus {
  AVAILABLE = 'Available',
  IN_TRIP = 'In Trip',
  INACTIVE = 'Inactive',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Bus {
  id: string; // Can be BUS-01 or registration number like MH14BX9999
  driverId: string | null;
  route: string; // Kept for passenger screen mock data compatibility
  routeId?: string | null;
  location: {
    lat: number;
    lng: number;
  };
  occupancy: Occupancy;
  eta: string;
  capacity?: number;
  status?: BusStatus;
  registrationNumber?: string;
  sos?: boolean;
}

export interface Route {
  id: string;
  name: string; // e.g., "Jalna–Aurangabad"
  stops: BusStop[];
  path?: { lat: number; lng: number }[]; // Array of coordinates for the route line
}

export interface BusStop {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
}

export interface Trip {
  id: string;
  busId: string;
  driverId: string;
  startTime: Date;
  endTime: Date | null;
  status: 'ongoing' | 'completed';
}

export interface SosAlert {
  id: string;
  driverId: string;
  busId: string;
  location: {
    lat: number;
    lng: number;
  };
  timestamp: Date;
  resolved: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  type: 'arrival' | 'delay' | 'emergency' | 'info';
  read: boolean;
}

// Real Google Maps Geocoding
export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  // Check if Google Maps API is loaded
  if (!(window as any).google || !(window as any).google.maps || !(window as any).google.maps.Geocoder) {
    console.warn("Google Maps API not loaded yet for geocoding");
    return "Locating...";
  }

  const geocoder = new (window as any).google.maps.Geocoder();

  try {
    const response = await geocoder.geocode({ location: { lat, lng } });
    if (response.results && response.results[0]) {
      // Return the first result (usually the most specific address)
      // You can also format this to be shorter if needed, e.g., results[0].formatted_address
      // or constructing it from address_components
      return response.results[0].formatted_address;
    }
    return "Unknown Location";
  } catch (error) {
    console.error("Geocoding failed:", error);
    return "Address unavailable";
  }
};