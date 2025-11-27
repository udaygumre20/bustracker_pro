import React, { useState, useEffect, useMemo } from 'react';
import { BusIcon, UserIcon, AlertIcon, MapIcon, ClockIcon } from '../components/icons';
import MapComponent from '../components/MapComponent';
import { useJsApiLoader } from '@react-google-maps/api';
import { getBusMarkerIconObj } from '../components/mapUtils';
import AdminBusDetailModal from '../components/AdminBusDetailModal';
import { api } from '../services/api';
import { Bus, BusStatus, Occupancy, reverseGeocode } from '../types';

interface BusWithDetails extends Bus {
    address?: string;
    lastUpdated: Date;
    driverId: string | null;
    driverName?: string;
    eta: string;
    status: BusStatus;
}

const DashboardCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    onClick?: () => void;
}> = ({ title, value, icon: Icon, color, onClick }) => (
    <div
        className={`card-hover p-6 ${onClick ? 'cursor-pointer transform hover:scale-105 active:scale-100' : ''}`}
        onClick={onClick}
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm font-semibold mb-2 uppercase tracking-wide">{title}</p>
                <h3 className="text-4xl font-bold text-neutral-900 dark:text-white">{value}</h3>
            </div>
            <div className={`p-4 rounded-2xl ${color} bg-opacity-10`}>
                <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
            </div>
        </div>
    </div>
);

const AdminDashboardScreen: React.FC<{ navigateTo?: (screen: string) => void }> = ({ navigateTo }) => {
    const [buses, setBuses] = useState<BusWithDetails[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
    const [selectedBus, setSelectedBus] = useState<BusWithDetails | null>(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_MAP_API_KEY || ''
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [dbBuses, dbDrivers] = await Promise.all([api.getBuses(), api.getDrivers()]);

                const mappedBuses = dbBuses.map(b => ({
                    id: b.id,
                    driverId: b.driver_id,
                    driverName: b.drivers?.name,
                    route: b.routes?.name || '',
                    location: b.location,
                    occupancy: b.occupancy,
                    status: b.status,
                    sos: b.sos,
                    eta: 'Calculating...',
                    lastUpdated: new Date(b.last_updated),
                    address: ''
                }));
                setBuses(mappedBuses);
                setDrivers(dbDrivers);
            } catch (error) {
                console.error("Failed to load admin data:", error);
            }
        };
        loadData();

        const subscription = api.subscribeToBuses((payload) => {
            if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                loadData();
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Fetch address for modal
    useEffect(() => {
        const bus = buses.find(b => b.id === selectedBusId);
        if (bus) {
            if (!bus.address || bus.address === "Locating...") {
                if (isLoaded && (window as any).google) {
                    reverseGeocode(bus.location.lat, bus.location.lng).then(address => {
                        const busWithAddress = { ...bus, address };
                        setBuses(current => current.map(b => b.id === bus.id ? busWithAddress : b));
                        setSelectedBus(busWithAddress);
                    });
                }
            } else {
                setSelectedBus(bus);
            }
        } else {
            setSelectedBus(null);
        }
    }, [selectedBusId, buses, isLoaded]);

    const handleBusSelect = (id: string) => {
        setSelectedBusId(id);
    };

    const handleCloseModal = () => {
        setSelectedBusId(null);
    };

    const handleResolveSos = (busId: string) => {
        api.updateBusStatus(busId, undefined, false).then(() => {
            alert(`SOS for ${busId} has been marked as resolved.`);
            handleCloseModal();
        }).catch(err => console.error(err));
    };

    const stats = useMemo(() => {
        return {
            totalBuses: buses.length,
            activeDrivers: drivers.length, // Assuming all fetched drivers are "active" for now, or filter by status if available
            liveTracking: buses.filter(b => b.status === BusStatus.IN_TRIP).length,
            sosAlerts: buses.filter(b => b.sos).length
        };
    }, [buses, drivers]);

    const sosAlertsList = useMemo(() => buses.filter(b => b.sos), [buses]);

    const mapCenter = useMemo(() => {
        const bus = buses.find(b => b.id === selectedBusId);
        if (bus) return { lat: bus.location.lat, lng: bus.location.lng };
        if (buses.length > 0) return { lat: buses[0].location.lat, lng: buses[0].location.lng };
        return { lat: 19.8347, lng: 75.8816 };
    }, [selectedBusId, buses]);

    const mapMarkers = useMemo(() => {
        return buses.map(bus => ({
            id: bus.id,
            position: { lat: bus.location.lat, lng: bus.location.lng },
            title: `${bus.id} - ${bus.route}`,
            icon: getBusMarkerIconObj(bus.occupancy, bus.sos),
        }));
    }, [buses]);

    const selectedDriver = useMemo(() => {
        if (!selectedBus || !selectedBus.driverId) return null;
        return {
            id: selectedBus.driverId,
            name: selectedBus.driverName || 'Unknown Driver'
        };
    }, [selectedBus]);

    return (
        <div className="p-6 h-full flex flex-col gap-6 bg-neutral-50 dark:bg-neutral-900 overflow-y-auto">
            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard
                    title="Total Buses"
                    value={stats.totalBuses}
                    icon={BusIcon}
                    color="bg-primary"
                    onClick={() => navigateTo?.('busManagement')}
                />
                <DashboardCard
                    title="Active Drivers"
                    value={stats.activeDrivers}
                    icon={UserIcon}
                    color="bg-success"
                    onClick={() => navigateTo?.('driverManagement')}
                />
                <DashboardCard
                    title="Live Tracking"
                    value={stats.liveTracking}
                    icon={MapIcon}
                    color="bg-warning"
                    onClick={() => navigateTo?.('busManagement')}
                />
                <DashboardCard
                    title="SOS Alerts"
                    value={stats.sosAlerts}
                    icon={AlertIcon}
                    color="bg-danger"
                    onClick={() => navigateTo?.('busManagement')}
                />
            </div>

            {/* Live SOS Alerts Section */}
            {sosAlertsList.length > 0 && (
                <div className="bg-danger/10 dark:bg-danger/20 border-2 border-danger/30 dark:border-danger/40 rounded-2xl p-6 shadow-glow-danger animate-fade-in">
                    <h3 className="text-xl font-bold text-danger mb-5 flex items-center gap-3">
                        <div className="p-2 bg-danger/20 rounded-xl">
                            <AlertIcon className="w-6 h-6" />
                        </div>
                        <span>Live SOS Alerts</span>
                        <span className="ml-auto badge-danger animate-pulse">{sosAlertsList.length}</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sosAlertsList.map(bus => (
                            <div key={bus.id} className="card p-4 border-l-4 border-danger hover:shadow-medium transition-all">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-bold text-lg text-neutral-900 dark:text-white">{bus.id}</p>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">{bus.driverName || 'Unknown Driver'}</p>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-danger animate-pulse"></div>
                                </div>
                                <p className="text-xs text-danger font-bold mb-3 uppercase tracking-wide">Emergency Alert Active</p>
                                <button
                                    onClick={() => handleBusSelect(bus.id)}
                                    className="w-full btn-danger py-2 text-sm"
                                >
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Map Overview */}
            <div className="flex-grow min-h-[400px] card overflow-hidden flex flex-col">
                <div className="p-5 border-b border-neutral-100 dark:border-neutral-700 flex justify-between items-center bg-neutral-50 dark:bg-neutral-800/50">
                    <h3 className="font-bold text-lg text-neutral-800 dark:text-white flex items-center gap-2">
                        <MapIcon className="w-5 h-5 text-primary" />
                        Live Fleet Map
                    </h3>
                    <div className="flex gap-3">
                        <span className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                            <span className="w-2.5 h-2.5 rounded-full bg-success shadow-sm"></span> Available
                        </span>
                        <span className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                            <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm"></span> In Trip
                        </span>
                        <span className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                            <span className="w-2.5 h-2.5 rounded-full bg-danger shadow-sm"></span> SOS
                        </span>
                    </div>
                </div>
                <div className="flex-grow relative">
                    <MapComponent
                        center={mapCenter}
                        zoom={12}
                        markers={mapMarkers}
                        onMarkerClick={handleBusSelect}
                    />
                </div>
            </div>

            <AdminBusDetailModal
                bus={selectedBus}
                driver={selectedDriver}
                onClose={handleCloseModal}
                onResolveSos={handleResolveSos}
            />
        </div>
    );
};

export default AdminDashboardScreen;