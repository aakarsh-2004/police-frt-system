import { useState } from 'react';
import { MapPin, Search, Filter, Clock, User, ArrowRight, Shield, AlertTriangle, Camera } from 'lucide-react';
import { suspects } from '../suspect/suspects';

interface LocationFilter {
    city: string;
    area: string;
    place: string;
}

interface SuspectLocation {
    id: string;
    suspectId: string;
    lat: number;
    lng: number;
    timestamp: string;
    location: string;
    details: string;
    type: 'suspect' | 'camera' | 'alert';
    status?: 'active' | 'inactive';
    confidence?: number;
    lastSeen?: string;
    cameraId?: string;
    incidentType?: string;
}

export default function MapView() {
    const [filters, setFilters] = useState<LocationFilter>({
        city: '',
        area: '',
        place: ''
    });
    const [selectedLocation, setSelectedLocation] = useState<SuspectLocation | null>(null);

    const suspectLocations: SuspectLocation[] = [
        {
            id: 'loc1',
            suspectId: 'SUSP001',
            lat: 23.2599,
            lng: 77.4126,
            timestamp: '2024-03-14 10:45:23',
            location: 'MP Nagar Zone 1, Bhopal',
            details: 'High priority suspect spotted near main market',
            type: 'suspect',
            confidence: 98.5,
            lastSeen: '5 minutes ago',
            status: 'active'
        },
        {
            id: 'loc2',
            suspectId: 'CAM001',
            lat: 23.2584,
            lng: 77.4009,
            timestamp: '2024-03-14 11:30:00',
            location: 'New Market, Bhopal',
            details: 'Active surveillance camera monitoring shopping complex',
            type: 'camera',
            status: 'active',
            cameraId: 'CAM-001'
        },
        {
            id: 'loc3',
            suspectId: 'ALERT001',
            lat: 23.2550,
            lng: 77.4150,
            timestamp: '2024-03-14 11:15:00',
            location: 'Habibganj Railway Station',
            details: 'Suspicious activity detected near platform 1',
            type: 'alert',
            incidentType: 'Suspicious Behavior',
            confidence: 85.2
        },
        {
            id: 'loc4',
            suspectId: 'SUSP002',
            lat: 23.2630,
            lng: 77.4200,
            timestamp: '2024-03-14 11:00:00',
            location: 'Arera Colony, Bhopal',
            details: 'Suspect last seen entering residential area',
            type: 'suspect',
            confidence: 92.1,
            lastSeen: '30 minutes ago',
            status: 'active'
        },
        {
            id: 'loc5',
            suspectId: 'CAM002',
            lat: 23.2520,
            lng: 77.4180,
            timestamp: '2024-03-14 10:55:00',
            location: 'DB Mall, Bhopal',
            details: 'High-resolution camera monitoring mall entrance',
            type: 'camera',
            status: 'active',
            cameraId: 'CAM-002'
        },
        {
            id: 'loc6',
            suspectId: 'ALERT002',
            lat: 23.2570,
            lng: 77.4090,
            timestamp: '2024-03-14 10:50:00',
            location: 'TT Nagar Stadium',
            details: 'Unauthorized access attempt detected',
            type: 'alert',
            incidentType: 'Security Breach',
            confidence: 78.9
        },
        {
            id: 'loc7',
            suspectId: 'SUSP003',
            lat: 23.2610,
            lng: 77.4160,
            timestamp: '2024-03-14 10:40:00',
            location: 'Bittan Market, Bhopal',
            details: 'Suspect identified through facial recognition',
            type: 'suspect',
            confidence: 95.3,
            lastSeen: '1 hour ago',
            status: 'active'
        },
        {
            id: 'loc8',
            suspectId: 'CAM003',
            lat: 23.2540,
            lng: 77.4220,
            timestamp: '2024-03-14 10:35:00',
            location: 'BHEL Gate, Bhopal',
            details: 'Industrial area surveillance camera',
            type: 'camera',
            status: 'active',
            cameraId: 'CAM-003'
        }
    ];

    const getMarkerStyle = (type: string) => {
        switch (type) {
            case 'suspect':
                return 'bg-red-500 animate-pulse';
            case 'camera':
                return 'bg-blue-500';
            case 'alert':
                return 'bg-amber-500 animate-pulse';
            default:
                return 'bg-gray-500';
        }
    };

    const getMarkerIcon = (type: string) => {
        switch (type) {
            case 'suspect':
                return <User className="w-4 h-4" />;
            case 'camera':
                return <Camera className="w-4 h-4" />;
            case 'alert':
                return <AlertTriangle className="w-4 h-4" />;
            default:
                return <MapPin className="w-4 h-4" />;
        }
    };

    return (
        <div className="p-6">
            <div className="max-w-[2000px] mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <MapPin className="w-6 h-6 text-blue-900 dark:text-blue-400" />
                        <h1 className="text-2xl font-bold dark:text-white">Criminal Location Map</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by ID, name..."
                                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                            <h3 className="text-lg font-medium mb-4 flex items-center dark:text-white">
                                <Filter className="w-5 h-5 mr-2" />
                                Location Filters
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        City
                                    </label>
                                    <select
                                        value={filters.city}
                                        onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                                    >
                                        <option value="">All Cities</option>
                                        <option value="bhopal">Bhopal</option>
                                        <option value="indore">Indore</option>
                                        <option value="gwalior">Gwalior</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Area
                                    </label>
                                    <select
                                        value={filters.area}
                                        onChange={(e) => setFilters({ ...filters, area: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                                    >
                                        <option value="">All Areas</option>
                                        <option value="mp-nagar">MP Nagar</option>
                                        <option value="arera-colony">Arera Colony</option>
                                        <option value="new-market">New Market</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Place
                                    </label>
                                    <select
                                        value={filters.place}
                                        onChange={(e) => setFilters({ ...filters, place: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                                    >
                                        <option value="">All Places</option>
                                        <option value="market">Markets</option>
                                        <option value="station">Railway Stations</option>
                                        <option value="mall">Shopping Malls</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                            <h3 className="text-lg font-medium mb-4 dark:text-white">Map Legend</h3>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm dark:text-gray-300">Active Suspects</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm dark:text-gray-300">Surveillance Cameras</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 bg-amber-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm dark:text-gray-300">Active Alerts</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                            <div className="relative aspect-[16/9] bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b"
                                    alt="Map View"
                                    className="w-full h-full object-cover"
                                />

                                {suspectLocations.map((loc) => (
                                    <button
                                        key={loc.id}
                                        className="absolute group"
                                        style={{
                                            left: `${(loc.lng - 77.4) * 1000}%`,
                                            top: `${(loc.lat - 23.25) * 1000}%`
                                        }}
                                        onClick={() => setSelectedLocation(loc)}
                                    >
                                        <div className="relative">
                                            <div className={`p-2 rounded-full text-white ${getMarkerStyle(loc.type)}`}>
                                                {getMarkerIcon(loc.type)}
                                            </div>

                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 text-sm opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium dark:text-white">
                                                            {loc.type === 'suspect' ? suspects.find(s => s.id === loc.suspectId)?.name :
                                                                loc.type === 'camera' ? `Camera ${loc.cameraId}` :
                                                                    'Alert'}
                                                        </span>
                                                        {loc.confidence && (
                                                            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                                                {loc.confidence}% Match
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                                        <Clock className="w-4 h-4 mr-1" />
                                                        {loc.timestamp}
                                                    </div>
                                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                                        <MapPin className="w-4 h-4 mr-1" />
                                                        {loc.location}
                                                    </div>
                                                    {loc.status && (
                                                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                                                            <Shield className="w-4 h-4 mr-1" />
                                                            Status: {loc.status.toUpperCase()}
                                                        </div>
                                                    )}
                                                    <p className="text-gray-600 dark:text-gray-400">
                                                        {loc.details}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {selectedLocation && (
                                <div className="mt-4 p-4 border dark:border-gray-700 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-lg font-medium dark:text-white">
                                            Location Details
                                        </h3>
                                        <button
                                            onClick={() => setSelectedLocation(null)}
                                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Type</span>
                                            <p className="font-medium dark:text-white capitalize">{selectedLocation.type}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">ID</span>
                                            <p className="font-medium dark:text-white">{selectedLocation.suspectId}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Time</span>
                                            <p className="font-medium dark:text-white">{selectedLocation.timestamp}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Location</span>
                                            <p className="font-medium dark:text-white">{selectedLocation.location}</p>
                                        </div>
                                        {selectedLocation.confidence && (
                                            <div>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">Confidence</span>
                                                <p className="font-medium text-green-600">{selectedLocation.confidence}%</p>
                                            </div>
                                        )}
                                        {selectedLocation.status && (
                                            <div>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                                                <p className="font-medium dark:text-white capitalize">{selectedLocation.status}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-4">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Details</span>
                                        <p className="font-medium dark:text-white">{selectedLocation.details}</p>
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <button className="btn btn-primary text-sm">
                                            View Full Profile
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}