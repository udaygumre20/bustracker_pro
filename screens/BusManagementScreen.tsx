import React, { useState, useEffect } from 'react';
import { BusIcon, CloseIcon } from '../components/icons';
import { BusStatus, Route } from '../types';

interface Driver {
    id: string;
    name: string;
}

// --- MODAL COMPONENTS ---

// Bus Form Modal
const BusFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (busData: any) => void;
    bus: any | null;
    availableRoutes: Route[];
    availableDrivers: Driver[];
}> = ({ isOpen, onClose, onSave, bus, availableRoutes, availableDrivers }) => {
    const [formData, setFormData] = useState({
        id: '', capacity: 45, driverId: '', routeId: '', status: BusStatus.AVAILABLE,
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (bus) {
                setFormData({ ...bus, driverId: bus.driverId || '', routeId: bus.routeId || '' });
            } else {
                setFormData({
                    id: '',
                    capacity: 45,
                    driverId: '',
                    routeId: availableRoutes.length > 0 ? availableRoutes[0].id : '',
                    status: BusStatus.AVAILABLE,
                });
            }
            setError('');
        }
    }, [bus, isOpen, availableRoutes]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const capacityNum = Number(formData.capacity);
        if (!formData.id || isNaN(capacityNum) || capacityNum <= 0) {
            setError('Please fill out a valid Bus ID/Reg. Number and Capacity.');
            return;
        }
        onSave({ ...formData, capacity: capacityNum });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[1002] p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">
                    <CloseIcon className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-6">{bus ? 'Edit Bus' : 'Add New Bus'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">Bus ID / Reg. Number</label>
                        <input type="text" name="id" value={formData.id} onChange={handleChange} className="w-full p-2 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-100 dark:bg-neutral-700" required disabled={!!bus} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">Capacity</label>
                        <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} className="w-full p-2 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-100 dark:bg-neutral-700" required min="1" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">Assign Driver</label>
                        <select name="driverId" value={formData.driverId} onChange={handleChange} className="w-full p-2 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-100 dark:bg-neutral-700">
                            <option value="">Unassigned</option>
                            {availableDrivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">Assign Route</label>
                        <select name="routeId" value={formData.routeId} onChange={handleChange} className="w-full p-2 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-100 dark:bg-neutral-700">
                            <option value="">Unassigned</option>
                            {availableRoutes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-100 dark:bg-neutral-700">
                            {Object.values(BusStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    {error && <p className="text-sm text-emergency text-left">{error}</p>}
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-neutral-200 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-200 font-bold py-2 px-6 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-primary text-white font-bold py-2 px-6 rounded-lg">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Route Form Modal
const RouteFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (routeData: any) => void;
    route: Route | null;
}> = ({ isOpen, onClose, onSave, route }) => {
    const [fromLocation, setFromLocation] = useState('');
    const [toLocation, setToLocation] = useState('');
    const [stops, setStops] = useState<string[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (route) {
                // Try to split existing name by " - "
                const parts = route.name.split(' - ');
                if (parts.length >= 2) {
                    setFromLocation(parts[0]);
                    setToLocation(parts[parts.length - 1]);
                    // Middle parts are stops
                    setStops(parts.slice(1, -1));
                } else {
                    // Fallback for names that don't match the pattern
                    setFromLocation(route.name);
                    setToLocation('');
                    setStops([]);
                }
            } else {
                setFromLocation('');
                setToLocation('');
                setStops([]);
            }
            setError('');
        }
    }, [route, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!fromLocation.trim() || !toLocation.trim()) {
            setError('Both Origin and Destination are required.');
            return;
        }
        // Build route name with stops: "Origin - Stop1 - Stop2 - Destination"
        const allLocations = [
            fromLocation.trim(),
            ...stops.filter(s => s.trim()).map(s => s.trim()),
            toLocation.trim()
        ];
        const name = allLocations.join(' - ');
        onSave({ name, stops: stops.filter(s => s.trim()) });
    };

    const addStop = () => {
        setStops([...stops, '']);
    };

    const removeStop = (index: number) => {
        setStops(stops.filter((_, i) => i !== index));
    };

    const updateStop = (index: number, value: string) => {
        const newStops = [...stops];
        newStops[index] = value;
        setStops(newStops);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[1002] p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 relative animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">
                    <CloseIcon className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-6">{route ? 'Edit Route' : 'Add New Route'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">From (Origin)</label>
                        <input
                            type="text"
                            value={fromLocation}
                            onChange={(e) => setFromLocation(e.target.value)}
                            placeholder="e.g., Jalna"
                            className="w-full p-2 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-100 dark:bg-neutral-700"
                            required
                        />
                    </div>

                    {/* Stops Section */}
                    {stops.length > 0 && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300">Stops (Optional)</label>
                            {stops.map((stop, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={stop}
                                        onChange={(e) => updateStop(index, e.target.value)}
                                        placeholder={`Stop ${index + 1}`}
                                        className="flex-1 p-2 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-100 dark:bg-neutral-700"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeStop(index)}
                                        className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add Stop Button */}
                    <button
                        type="button"
                        onClick={addStop}
                        className="w-full py-2 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-600 dark:text-neutral-400 hover:border-primary hover:text-primary transition-colors"
                    >
                        + Add Stop
                    </button>

                    <div>
                        <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">To (Destination)</label>
                        <input
                            type="text"
                            value={toLocation}
                            onChange={(e) => setToLocation(e.target.value)}
                            placeholder="e.g., Aurangabad"
                            className="w-full p-2 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-100 dark:bg-neutral-700"
                            required
                        />
                    </div>
                    {error && <p className="text-sm text-emergency text-left">{error}</p>}
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-neutral-200 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-200 font-bold py-2 px-6 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-primary text-white font-bold py-2 px-6 rounded-lg">Save Route</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- MAIN SCREEN COMPONENT ---
interface BusManagementScreenProps {
    buses: any[];
    routes: Route[];
    drivers: Driver[];
    onSaveBus: (busData: any, isEditing: boolean) => void;
    onDeleteBus: (busId: string) => void;
    onSaveRoute: (routeData: any, isEditing: boolean) => void;
    onDeleteRoute: (routeId: string) => void;
}

const BusManagementScreen: React.FC<BusManagementScreenProps> = ({
    buses,
    routes,
    drivers,
    onSaveBus,
    onDeleteBus,
    onSaveRoute,
    onDeleteRoute,
}) => {
    const [activeTab, setActiveTab] = useState('buses'); // 'buses' or 'routes'

    // Bus state
    const [isBusModalOpen, setIsBusModalOpen] = useState(false);
    const [editingBus, setEditingBus] = useState<any | null>(null);

    // Route state
    const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
    const [editingRoute, setEditingRoute] = useState<Route | null>(null);

    // Bus handlers
    const handleAddBus = () => {
        setEditingBus(null);
        setIsBusModalOpen(true);
    };

    const handleEditBus = (bus: any) => {
        setEditingBus(bus);
        setIsBusModalOpen(true);
    };

    const handleSaveBus = (busData: any) => {
        onSaveBus({ ...editingBus, ...busData }, !!editingBus);
        setIsBusModalOpen(false);
    };

    const handleDeleteBus = (busId: string) => {
        if (window.confirm("Are you sure you want to delete this bus?")) {
            onDeleteBus(busId);
        }
    };

    // Route handlers
    const handleAddRoute = () => {
        setEditingRoute(null);
        setIsRouteModalOpen(true);
    };

    const handleEditRoute = (route: Route) => {
        setEditingRoute(route);
        setIsRouteModalOpen(true);
    };

    const handleSaveRoute = (routeData: any) => {
        onSaveRoute({ ...editingRoute, ...routeData }, !!editingRoute);
        setIsRouteModalOpen(false);
    };

    const handleDeleteRoute = (routeId: string) => {
        if (window.confirm("Are you sure you want to delete this route? Deleting a route may unassign it from buses.")) {
            onDeleteRoute(routeId);
        }
    };

    const getStatusStyle = (status: BusStatus) => {
        switch (status) {
            case BusStatus.AVAILABLE: return 'bg-green-100 text-green-800 dark:bg-green-800/50 dark:text-green-200';
            case BusStatus.IN_TRIP: return 'bg-blue-100 text-blue-800 dark:bg-blue-800/50 dark:text-blue-200';
            case BusStatus.INACTIVE: return 'bg-neutral-200 text-neutral-800 dark:bg-neutral-600 dark:text-neutral-100';
            default: return 'bg-neutral-200 text-neutral-800 dark:bg-neutral-600 dark:text-neutral-100';
        }
    };

    return (
        <div className="p-4 h-full flex flex-col gap-4">
            {/* Tabs */}
            <div className="flex border-b border-neutral-300 dark:border-neutral-700">
                <button onClick={() => setActiveTab('buses')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'buses' ? 'border-b-2 border-primary text-primary dark:border-accent dark:text-accent' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'}`}>Buses</button>
                <button onClick={() => setActiveTab('routes')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'routes' ? 'border-b-2 border-primary text-primary dark:border-accent dark:text-accent' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'}`}>Routes</button>
            </div>

            {/* Content */}
            {activeTab === 'buses' && (
                <>
                    <div className="flex justify-end items-center">
                        <button onClick={handleAddBus} className="bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                            Add New Bus
                        </button>
                    </div>
                    <div className="flex-grow overflow-y-auto space-y-3">
                        {buses.map(bus => {
                            const driver = drivers.find(d => d.id === bus.driverId);
                            const route = routes.find(r => r.id === bus.routeId);
                            return (
                                <div key={bus.id} className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-md flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full bg-blue-100 dark:bg-blue-900/50`}><BusIcon className={`w-6 h-6 text-blue-600 dark:text-blue-300`} /></div>
                                        <div>
                                            <p className="font-bold text-neutral-800 dark:text-neutral-100">{bus.id}</p>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Driver: {driver?.name || 'Unassigned'}</p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Route: {route?.name || 'Unassigned'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(bus.status)}`}>{bus.status}</span>
                                        <button onClick={() => handleEditBus(bus)} className="p-1.5 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md">Edit</button>
                                        <button onClick={() => handleDeleteBus(bus.id)} className="p-1.5 text-sm text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md">Delete</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {activeTab === 'routes' && (
                <>
                    <div className="flex justify-end items-center">
                        <button onClick={handleAddRoute} className="bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                            Add New Route
                        </button>
                    </div>
                    <div className="flex-grow overflow-y-auto space-y-3">
                        {routes.map(route => (
                            <div key={route.id} className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-md flex items-center justify-between">
                                <p className="font-medium text-neutral-800 dark:text-neutral-100">{route.name}</p>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleEditRoute(route)} className="p-1.5 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md">Edit</button>
                                    <button onClick={() => handleDeleteRoute(route.id)} className="p-1.5 text-sm text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <BusFormModal isOpen={isBusModalOpen} onClose={() => setIsBusModalOpen(false)} onSave={handleSaveBus} bus={editingBus} availableRoutes={routes} availableDrivers={drivers} />
            <RouteFormModal isOpen={isRouteModalOpen} onClose={() => setIsRouteModalOpen(false)} onSave={handleSaveRoute} route={editingRoute} />

            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-up { from { transform: translateY(20px); opacity: 0.5; } to { transform: translateY(0); opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default BusManagementScreen;