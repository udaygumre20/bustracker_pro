
import React, { ReactNode } from 'react';

interface MapPlaceholderProps {
  children?: ReactNode;
}

const MapPlaceholder: React.FC<MapPlaceholderProps> = ({ children }) => {
  return (
    <div className="relative w-full h-full bg-neutral-200 dark:bg-neutral-800 rounded-lg overflow-hidden shadow-lg">
      <img
        src="https://picsum.photos/seed/map/1200/800"
        alt="Map placeholder"
        className="w-full h-full object-cover opacity-50"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center p-4 bg-black bg-opacity-50 rounded-lg">
          <h3 className="text-white font-bold text-lg">Live Map View</h3>
          <p className="text-neutral-300 text-sm">Real-time tracking is simulated.</p>
        </div>
      </div>
      {children}
    </div>
  );
};

export default MapPlaceholder;
