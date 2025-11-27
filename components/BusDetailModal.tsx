import React from 'react';
import { Bus, Occupancy } from '../types';
import { BusIcon, ClockIcon, CloseIcon, MapIcon, GpsIcon } from './icons';

interface BusWithAddress extends Bus {
  address?: string;
  distance?: string; // Added distance
}

interface BusDetailModalProps {
  bus: BusWithAddress | null;
  onClose: () => void;
  onNotify: (busId: string) => void;
  onViewRoute?: () => void;
  onTrackLive?: () => void;
}

const OccupancyInfo: React.FC<{ occupancy: Occupancy }> = ({ occupancy }) => {
  const getStyle = () => {
    switch (occupancy) {
      case Occupancy.EMPTY:
      case Occupancy.LOW:
        return { gradient: 'from-success to-green-400', label: 'Low', width: '33%', textColor: 'text-success' };
      case Occupancy.MEDIUM:
        return { gradient: 'from-warning to-yellow-400', label: 'Medium', width: '66%', textColor: 'text-warning' };
      case Occupancy.HIGH:
      case Occupancy.FULL:
        return { gradient: 'from-danger to-red-500', label: 'Full', width: '100%', textColor: 'text-danger' };
      default:
        return { gradient: 'from-neutral-400 to-neutral-300', label: 'Unknown', width: '0%', textColor: 'text-neutral-400' };
    }
  };

  const { gradient, label, width, textColor } = getStyle();

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-2 text-neutral-600 dark:text-neutral-400">
        <span className="font-semibold">Occupancy Level</span>
        <span className={`font-bold ${textColor}`}>{label}</span>
      </div>
      <div className="h-3 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden shadow-inner">
        <div className={`h-full bg-gradient-to-r ${gradient} transition-all duration-700 ease-out rounded-full`} style={{ width }}></div>
      </div>
    </div>
  );
};

const BusDetailModal: React.FC<BusDetailModalProps> = ({ bus, onClose, onNotify, onViewRoute, onTrackLive }) => {
  if (!bus) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1002] transition-opacity animate-fade-in"
        onClick={onClose}
      />
      <div
        className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 rounded-t-3xl shadow-strong z-[1003] p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div className="w-14 h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-full mx-auto mb-6 opacity-50" />

        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1.5">{bus.id}</h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">{bus.route}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors active:scale-95"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="card p-4 hover:shadow-medium transition-shadow">
            <div className="flex items-center gap-2 text-primary mb-2">
              <ClockIcon className="w-5 h-5" />
              <span className="font-bold text-xs uppercase tracking-wide">ETA</span>
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{bus.eta}</p>
          </div>
          <div className="card p-4 hover:shadow-medium transition-shadow">
            <div className="flex items-center gap-2 text-primary mb-2">
              <MapIcon className="w-5 h-5" />
              <span className="font-bold text-xs uppercase tracking-wide">Distance</span>
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{bus.distance || 'Calculating...'}</p>
          </div>
        </div>

        <div className="mb-8 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl">
          <OccupancyInfo occupancy={bus.occupancy} />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onViewRoute}
            className="flex-1 btn-secondary py-4 px-4 flex items-center justify-center gap-2 text-sm"
          >
            <MapIcon className="w-5 h-5" />
            <span className="font-bold">View Route</span>
          </button>
          <button
            onClick={onTrackLive}
            className="flex-1 btn-primary py-4 px-4 flex items-center justify-center gap-2 text-sm"
          >
            <GpsIcon className="w-5 h-5" />
            <span className="font-bold">Track Live</span>
          </button>
        </div>
      </div>
      <style>{`
          @keyframes slide-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
        `}</style>
    </>
  );
};

export default BusDetailModal;