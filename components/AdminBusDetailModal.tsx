import React from 'react';
import { BusIcon, UserIcon, CloseIcon, AlertIcon, GpsIcon } from './icons';
import { Bus, Occupancy, BusStatus } from '../types';

export interface BusForModal extends Bus {
    address?: string;
    sos?: boolean;
    status: BusStatus;
}
export interface DriverForModal {
    id: string;
    name: string;
}

interface AdminBusDetailModalProps {
  bus: BusForModal | null;
  driver: DriverForModal | null;
  onClose: () => void;
  onResolveSos?: (busId: string) => void;
}

const getStatusStyle = (status: BusStatus) => {
    switch (status) {
        case BusStatus.AVAILABLE: return { color: 'text-green-500', label: 'Available' };
        case BusStatus.IN_TRIP: return { color: 'text-blue-500', label: 'In Trip' };
        case BusStatus.INACTIVE: return { color: 'text-neutral-500', label: 'Inactive' };
        default: return { color: 'text-neutral-500', label: 'Unknown' };
    }
};

const OccupancyInfo: React.FC<{ occupancy: Occupancy }> = ({ occupancy }) => {
    const getStyle = () => {
        switch (occupancy) {
            case Occupancy.EMPTY: return { color: '#10B981', label: 'Empty' };
            case Occupancy.LOW: return { color: '#10B981', label: 'Low (25%)' };
            case Occupancy.MEDIUM: return { color: '#F59E0B', label: 'Medium (50%)' };
            case Occupancy.HIGH: return { color: '#f97316', label: 'High (75%)' };
            case Occupancy.FULL: return { color: '#EF4444', label: 'Full' };
            default: return { color: '#6B7280', label: 'Unknown' };
        }
    };
    const { color, label } = getStyle();
    return (
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
            <span className="font-medium text-neutral-800 dark:text-neutral-100">{label}</span>
        </div>
    );
};


const AdminBusDetailModal: React.FC<AdminBusDetailModalProps> = ({ bus, driver, onClose, onResolveSos }) => {
    if (!bus) return null;
    
    const { color, label } = getStatusStyle(bus.status);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[1002] p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">
                    <CloseIcon className="w-6 h-6" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <div className={`p-3 rounded-full ${bus.sos ? 'bg-emergency' : 'bg-primary'}`}>
                        <BusIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold text-neutral-800 dark:text-neutral-100">{bus.id}</h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">{bus.route}</p>
                    </div>
                </div>

                {/* SOS Banner */}
                {bus.sos && (
                    <div className="bg-emergency/10 border-l-4 border-emergency text-emergency p-4 rounded-r-lg mb-4">
                        <div className="flex items-center gap-3">
                            <AlertIcon className="w-6 h-6" />
                            <p className="font-bold">This bus has an active SOS alert!</p>
                        </div>
                    </div>
                )}

                {/* Details */}
                <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                        <span className="font-semibold text-neutral-600 dark:text-neutral-300">Status</span>
                        <span className={`font-bold ${color}`}>{label}</span>
                    </div>
                     <div className="flex justify-between p-3 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                        <span className="font-semibold text-neutral-600 dark:text-neutral-300">Occupancy</span>
                        <OccupancyInfo occupancy={bus.occupancy} />
                    </div>
                    <div className="p-3 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                        <span className="font-semibold text-neutral-600 dark:text-neutral-300 flex items-center gap-2 mb-1"><GpsIcon className="w-4 h-4" /> Current Location</span>
                        <p className="text-sm text-neutral-800 dark:text-neutral-100">{bus.address || 'Resolving address...'}</p>
                    </div>
                     <div className="p-3 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                        <span className="font-semibold text-neutral-600 dark:text-neutral-300 flex items-center gap-2 mb-1"><UserIcon className="w-4 h-4" /> Assigned Driver</span>
                        <p className="text-sm text-neutral-800 dark:text-neutral-100">{driver?.name || 'Unassigned'}</p>
                    </div>
                </div>

                {/* Actions */}
                {bus.sos && onResolveSos && (
                    <button onClick={() => onResolveSos(bus.id)} className="w-full mt-6 bg-secondary hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
                        Resolve SOS Alert
                    </button>
                )}
            </div>
            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-up { from { transform: translateY(20px); opacity: 0.5; } to { transform: translateY(0); opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default AdminBusDetailModal;