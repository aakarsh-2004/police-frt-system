import { useState } from 'react';
import { MapPin, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';

interface CrimeHotspot {
    id: string;
    area: string;
    location: string;
    crimeRate: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    recentIncidents: number;
    coordinates: {
        x: number;
        y: number;
    };
}

const hotspots: CrimeHotspot[] = [
    {
        id: '1',
        area: 'MP Nagar',
        location: 'Zone 1, Bhopal',
        crimeRate: 85,
        trend: 'increasing',
        recentIncidents: 12,
        coordinates: { x: 45, y: 35 }
    },
    {
        id: '2',
        area: 'New Market',
        location: 'TT Nagar, Bhopal',
        crimeRate: 65,
        trend: 'stable',
        recentIncidents: 8,
        coordinates: { x: 30, y: 45 }
    },
    {
        id: '3',
        area: 'Habibganj',
        location: 'Maharana Pratap Nagar, Bhopal',
        crimeRate: 45,
        trend: 'decreasing',
        recentIncidents: 5,
        coordinates: { x: 60, y: 55 }
    },
    {
        id: '4',
        area: 'Arera Colony',
        location: 'Near DB Mall, Bhopal',
        crimeRate: 55,
        trend: 'increasing',
        recentIncidents: 7,
        coordinates: { x: 40, y: 60 }
    }
];

const trendColors = {
    increasing: 'text-red-500',
    decreasing: 'text-green-500',
    stable: 'text-blue-500'
};

export default function CrimeHeatmap() {
    const [selectedHotspot, setSelectedHotspot] = useState<CrimeHotspot | null>(null);

    return (
        <div className="grid grid-cols-2 gap-6">
            {/* Heatmap */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                <h2 className="text-lg font-semibold flex items-center mb-4 dark:text-white">
                    <MapPin className="w-5 h-5 mr-2 text-blue-900 dark:text-blue-500" />
                    Crime Heatmap - Bhopal
                </h2>

                <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1524661135-423995f22d0b"
                        alt="Bhopal Map"
                        className="w-full h-full object-cover opacity-50 dark:opacity-30"
                    />

                    {/* Hotspots */}
                    {hotspots.map((hotspot) => (
                        <button
                            key={hotspot.id}
                            onClick={() => setSelectedHotspot(hotspot)}
                            className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full 
                            ${selectedHotspot?.id === hotspot.id
                                ? 'ring-4 ring-blue-500 ring-opacity-50'
                                : ''}`}
                            style={{
                                left: `${hotspot.coordinates.x}%`,
                                top: `${hotspot.coordinates.y}%`,
                                background: `radial-gradient(circle, rgba(239, 68, 68, ${hotspot.crimeRate / 100}) 0%, transparent 70%)`
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Details Panel */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                <h2 className="text-lg font-semibold flex items-center mb-4 dark:text-white">
                    <AlertTriangle className="w-5 h-5 mr-2 text-blue-900 dark:text-blue-500" />
                    Hotspot Analysis
                </h2>

                {selectedHotspot ? (
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h3 className="text-xl font-semibold mb-2 dark:text-white">{selectedHotspot.area}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{selectedHotspot.location}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <span className="text-sm text-red-600 dark:text-red-400">Crime Rate</span>
                                <p className="text-2xl font-bold text-red-700 dark:text-red-500">{selectedHotspot.crimeRate}%</p>
                            </div>

                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <span className="text-sm text-blue-600 dark:text-blue-400">Recent Incidents</span>
                                <p className="text-2xl font-bold text-blue-700 dark:text-blue-500">{selectedHotspot.recentIncidents}</p>
                            </div>
                        </div>

                        <div className="p-4 border dark:border-gray-700 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium dark:text-white">Trend Analysis</span>
                                <span className={`flex items-center ${trendColors[selectedHotspot.trend]} dark:text-${selectedHotspot.trend === 'increasing' ? 'red' : selectedHotspot.trend === 'decreasing' ? 'green' : 'blue'}-400`}>
                                    <TrendingUp className="w-4 h-4 mr-1" />
                                    {selectedHotspot.trend.charAt(0).toUpperCase() + selectedHotspot.trend.slice(1)}
                                </span>
                            </div>
                            <div className="h-20 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                {/* Placeholder for trend graph */}
                            </div>
                        </div>

                        <div className="p-4 border dark:border-gray-700 rounded-lg">
                            <div className="flex items-center mb-2">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span className="font-medium dark:text-white">Recent Activity</span>
                            </div>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center justify-between dark:text-gray-300">
                                    <span>Last 24 hours</span>
                                    <span className="font-medium">{Math.floor(selectedHotspot.recentIncidents * 0.3)} incidents</span>
                                </li>
                                <li className="flex items-center justify-between dark:text-gray-300">
                                    <span>Last 7 days</span>
                                    <span className="font-medium">{selectedHotspot.recentIncidents} incidents</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                        Select a hotspot on the map to view details
                    </div>
                )}
            </div>
        </div>
    );
}