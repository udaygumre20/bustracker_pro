import { Occupancy } from '../types';

const getMarkerColor = (occupancy: Occupancy, isSos: boolean): string => {
    if (isSos) return '#EF4444'; // Red-500
    switch (occupancy) {
        case Occupancy.EMPTY:
        case Occupancy.LOW:
            return '#10B981'; // Emerald-500
        case Occupancy.MEDIUM:
            return '#F59E0B'; // Amber-500
        case Occupancy.HIGH:
        case Occupancy.FULL:
            return '#EF4444'; // Red-500
        default:
            return '#3B82F6'; // Blue-500
    }
};

const getMarkerText = (occupancy: Occupancy, isSos: boolean): string => {
    if (isSos) return '!';
    switch (occupancy) {
        case Occupancy.EMPTY: return '0%';
        case Occupancy.LOW: return '30%';
        case Occupancy.MEDIUM: return '60%';
        case Occupancy.HIGH: return '90%';
        case Occupancy.FULL: return 'Full';
        default: return '';
    }
};

export const getBusMarkerSVG = (occupancy: Occupancy, isSos: boolean = false): string => {
    const color = getMarkerColor(occupancy, isSos);
    const text = getMarkerText(occupancy, isSos);

    // SVG Template
    const svg = `
    <svg width="50" height="60" viewBox="0 0 50 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Pin Shape -->
        <path d="M25 60C25 60 50 41.5 50 25C50 11.1929 38.8071 0 25 0C11.1929 0 0 11.1929 0 25C0 41.5 25 60 25 60Z" fill="${color}"/>
        <path d="M25 56C25 56 46 39.5 46 25C46 13.402 36.598 4 25 4C13.402 4 4 13.402 4 25C4 39.5 25 56 25 56Z" fill="${color}" stroke="white" stroke-width="2"/>
        
        <!-- Bus Icon (Simplified) -->
        <rect x="13" y="12" width="24" height="20" rx="2" fill="white"/>
        <path d="M13 28H37V30C37 31.1046 36.1046 32 35 32H15C13.8954 32 13 31.1046 13 30V28Z" fill="white"/>
        <circle cx="17" cy="32" r="2" fill="#374151"/>
        <circle cx="33" cy="32" r="2" fill="#374151"/>
        <rect x="15" y="14" width="20" height="8" rx="1" fill="${color}" fill-opacity="0.3"/>
        
        <!-- Text Label (if not default/blue) -->
        ${text ? `
        <rect x="10" y="38" width="30" height="14" rx="7" fill="white"/>
        <text x="25" y="48" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="${color}" text-anchor="middle">${text}</text>
        ` : ''}
        
        <!-- SOS Alert Overlay -->
        ${isSos ? `
        <circle cx="38" cy="12" r="10" fill="#FEF2F2" stroke="#EF4444" stroke-width="2"/>
        <text x="38" y="16" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#EF4444" text-anchor="middle">!</text>
        ` : ''}
    </svg>
    `.trim();

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const getBusMarkerIconObj = (occupancy: Occupancy, isSos: boolean = false) => {
    const url = getBusMarkerIconSVG(occupancy, isSos);
    return {
        url: url,
        scaledSize: { width: 50, height: 60 },
        anchor: { x: 25, y: 60 }
    };
};

// Alias for compatibility if needed, but we should use the new function
export const getBusMarkerIcon = (occupancy: Occupancy, isSos: boolean = false): string => {
    return getBusMarkerSVG(occupancy, isSos);
};

// Internal helper to avoid circular dependency or confusion
const getBusMarkerIconSVG = getBusMarkerSVG;

export const getStartMarkerSVG = (): string => {
    const svg = `
    <svg width="60" height="30" viewBox="0 0 60 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="60" height="30" rx="15" fill="#10B981" stroke="white" stroke-width="2"/>
        <text x="30" y="20" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">Start</text>
    </svg>
    `.trim();
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const getEndMarkerSVG = (): string => {
    const svg = `
    <svg width="50" height="30" viewBox="0 0 50 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="50" height="30" rx="15" fill="#EF4444" stroke="white" stroke-width="2"/>
        <text x="25" y="20" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">End</text>
    </svg>
    `.trim();
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const getStartMarkerIconObj = () => {
    return {
        url: getStartMarkerSVG(),
        scaledSize: { width: 60, height: 30 },
        anchor: { x: 30, y: 15 }
    };
};

export const getEndMarkerIconObj = () => {
    return {
        url: getEndMarkerSVG(),
        scaledSize: { width: 50, height: 30 },
        anchor: { x: 25, y: 15 }
    };
};
