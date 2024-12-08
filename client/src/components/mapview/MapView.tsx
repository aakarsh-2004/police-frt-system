import { useEffect, useRef, useState } from 'react';
import { MapPin, Search, Filter } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import config from '../../config/config';
import { useTheme } from '../../context/themeContext';

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

interface CameraStats {
    totalDetections: number;
    suspects: number;
    missingPersons: number;
    recentDetections: {
        id: number;
        personName: string;
        personType: string;
        capturedImageUrl: string;
        capturedDateTime: string;
        confidenceScore: string;
    }[];
}

interface CameraDetails {
    id: string;
    name: string;
    location: string;
    latitude: string;
    longitude: string;
    status: string;
    streamUrl: string;
    nearestPoliceStation?: string;
    stats?: CameraStats;
}

const BHOPAL_BOUNDS = {
    north: 23.3300, 
    south: 23.1600, 
    east: 77.5200, 
    west: 77.3500 
};

const BHOPAL_CENTER: [number, number] = [
    (BHOPAL_BOUNDS.east + BHOPAL_BOUNDS.west) / 2,
    (BHOPAL_BOUNDS.north + BHOPAL_BOUNDS.south) / 2
];

const generateRandomLocation = () => {
    const lat = BHOPAL_BOUNDS.south + (Math.random() * (BHOPAL_BOUNDS.north - BHOPAL_BOUNDS.south));
    const lng = BHOPAL_BOUNDS.west + (Math.random() * (BHOPAL_BOUNDS.east - BHOPAL_BOUNDS.west));
    return [lng, lat] as [number, number];
};

const locations = [
    { name: "MP Nagar", coordinates: [77.4353, 23.2315] as [number, number] },
    { name: "New Market", coordinates: [77.4006, 23.2330] as [number, number] },
    { name: "Habibganj Railway Station", coordinates: [77.4349, 23.2337] as [number, number] },
    { name: "DB Mall", coordinates: [77.4173, 23.2332] as [number, number] },
    { name: "BHEL", coordinates: generateRandomLocation() },
    { name: "Bittan Market", coordinates: generateRandomLocation() },
    { name: "Arera Colony", coordinates: generateRandomLocation() },
    { name: "TT Nagar", coordinates: generateRandomLocation() },
    { name: "Shahpura", coordinates: generateRandomLocation() },
    { name: "Kolar", coordinates: generateRandomLocation() }
];

console.log(locations);

export default function MapView() {
    const [filters, setFilters] = useState<LocationFilter>({
        city: '',
        area: '',
        place: ''
    });
    const [selectedLocation, setSelectedLocation] = useState<SuspectLocation | null>(null);
    const [cameras, setCameras] = useState<CameraDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const [selectedCamera, setSelectedCamera] = useState<CameraDetails | null>(null);
    const { isDarkMode } = useTheme();

    // Fetch cameras from the database
    useEffect(() => {
        const fetchCameras = async () => {
            try {
                const response = await axios.get(`${config.apiUrl}/api/cameras`);
                if (response.data && Array.isArray(response.data)) {
                    setCameras(response.data);
                }
            } catch (error) {
                console.error('Error fetching cameras:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCameras();
    }, []);

    useEffect(() => {
        if (!mapContainerRef.current) return;

        mapboxgl.accessToken = "pk.eyJ1IjoiYWFrYXJzaC0yMDA0IiwiYSI6ImNtNDhrdXhycjAwb2gycXMyZjljdTl0MnIifQ.6L9i8t_eW3gubSsF7HmXwg";

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: isDarkMode ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11",
            center: BHOPAL_CENTER,
            zoom: 12,
            pitch: 45,
            bearing: -17.6,
            antialias: true,
            scrollZoom: true,
            boxZoom: true,
            dragRotate: true,
            dragPan: true,
            keyboard: true,
            doubleClickZoom: true,
            touchZoomRotate: true,
            renderWorldCopies: false,
            maxBounds: [
                [BHOPAL_BOUNDS.west - 0.1, BHOPAL_BOUNDS.south - 0.1],
                [BHOPAL_BOUNDS.east + 0.1, BHOPAL_BOUNDS.north + 0.1]
            ]
        });

        mapRef.current = map;

        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Wait for style to load before adding terrain
        map.on('style.load', () => {
            // Add terrain source
            map.addSource('mapbox-dem', {
                'type': 'raster-dem',
                'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
                'tileSize': 512,
                'maxzoom': 14
            });

            // Add terrain layer
            map.setTerrain({
                'source': 'mapbox-dem',
                'exaggeration': 1.5
            });

            // Add 3D buildings layer
            map.addLayer({
                'id': '3d-buildings',
                'source': 'composite',
                'source-layer': 'building',
                'filter': ['==', 'extrude', 'true'],
                'type': 'fill-extrusion',
                'minzoom': 12,
                'paint': {
                    'fill-extrusion-color': '#242424',
                    'fill-extrusion-height': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        12, 0,
                        12.5, ['get', 'height']
                    ],
                    'fill-extrusion-opacity': 0.6
                }
            });
        });

        // Add markers after map loads
        map.on('load', () => {
            cameras.forEach(camera => {
                const coordinates: [number, number] = [
                    parseFloat(camera.longitude),
                    parseFloat(camera.latitude)
                ];

                const el = document.createElement('div');
                el.className = 'custom-marker';
                el.style.backgroundColor = camera.status === 'active' ? '#4CAF50' : '#9E9E9E';

                el.addEventListener('click', () => {
                    fetchCameraDetails(camera.id);
                });

                const marker = new mapboxgl.Marker({
                    element: el,
                    anchor: 'bottom',
                    offset: [0, -10]
                })
                    .setLngLat(coordinates)
                    .setPopup(
                        new mapboxgl.Popup({
                            offset: 25,
                            closeButton: false,
                            closeOnClick: false
                        })
                            .setHTML(`
                                <div class="p-2 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-lg">
                                    <h3 class="font-bold">${camera.name}</h3>
                                    <p class="text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}">${camera.location}</p>
                                    <p class="text-xs mt-1">
                                        <span class="px-2 py-1 rounded-full ${
                                            camera.status === 'active' 
                                                ? isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
                                                : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                                        }">
                                            ${camera.status.toUpperCase()}
                                        </span>
                                    </p>
                                </div>
                            `)
                    )
                    .addTo(map);

                if (marker && marker.getPopup()) {
                    el.addEventListener('mouseenter', () => marker.getPopup()?.addTo(map));
                    el.addEventListener('mouseleave', () => marker.getPopup()?.remove());
                }
            });
        });

        map.on('dragstart', () => {
            map.getCanvas().style.cursor = 'grabbing';
        });

        map.on('dragend', () => {
            map.getCanvas().style.cursor = '';
        });

        map.on('movestart', () => {
            map.getCanvas().style.imageRendering = 'auto';
        });

        map.on('moveend', () => {
            map.getCanvas().style.imageRendering = 'auto';
        });

        return () => map.remove();
    }, [cameras, isDarkMode]);

    const createCustomMarker = () => {
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.backgroundImage = 'url(/marker-icon.png)';
        el.style.backgroundSize = 'cover';
        el.style.cursor = 'pointer';
        return el;
    };

    const fetchCameraDetails = async (cameraId: string) => {
        try {
            const response = await axios.get(`${config.apiUrl}/api/cameras/${cameraId}`);
            if (response.data) {
                setSelectedCamera(response.data);
            }
        } catch (error) {
            console.error('Error fetching camera details:', error);
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
                            <div className="relative w-full h-[500px] overflow-hidden rounded-lg">
                                <div 
                                    ref={mapContainerRef} 
                                    className="absolute inset-0"
                                    style={{ 
                                        width: '100%', 
                                        height: '100%'
                                    }} 
                                />
                            </div>

                            {selectedCamera && (
                                <div className="mt-4 p-4 border dark:border-gray-700 rounded-lg">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-medium dark:text-white">
                                            Camera Details
                                        </h3>
                                        <button
                                            onClick={() => setSelectedCamera(null)}
                                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Camera Name</span>
                                            <p className="font-medium dark:text-white">{selectedCamera.name}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Location</span>
                                            <p className="font-medium dark:text-white">{selectedCamera.location}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                                            <p className={`font-medium ${
                                                selectedCamera.status === 'active' 
                                                    ? 'text-green-600 dark:text-green-400' 
                                                    : 'text-gray-600 dark:text-gray-400'
                                            }`}>
                                                {selectedCamera.status.toUpperCase()}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Coordinates</span>
                                            <p className="font-medium dark:text-white">
                                                {selectedCamera.latitude}, {selectedCamera.longitude}
                                            </p>
                                        </div>
                                        {selectedCamera.nearestPoliceStation && (
                                            <div>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">Nearest Police Station</span>
                                                <p className="font-medium dark:text-white">{selectedCamera.nearestPoliceStation}</p>
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Stream URL</span>
                                            <p className="font-medium dark:text-white truncate">{selectedCamera.streamUrl}</p>
                                        </div>
                                    </div>

                                    {selectedCamera.stats && (
                                        <>
                                            <div className="mt-6 border-t pt-4">
                                                <h4 className="text-lg font-medium mb-4 dark:text-white">Detection Statistics</h4>
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                                        <span className="text-sm text-blue-600 dark:text-blue-400">Total Detections</span>
                                                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-500">
                                                            {selectedCamera.stats.totalDetections}
                                                        </p>
                                                    </div>
                                                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                                                        <span className="text-sm text-red-600 dark:text-red-400">Suspects</span>
                                                        <p className="text-2xl font-bold text-red-700 dark:text-red-500">
                                                            {selectedCamera.stats.suspects}
                                                        </p>
                                                    </div>
                                                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                                                        <span className="text-sm text-amber-600 dark:text-amber-400">Missing Persons</span>
                                                        <p className="text-2xl font-bold text-amber-700 dark:text-amber-500">
                                                            {selectedCamera.stats.missingPersons}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-6 border-t pt-4">
                                                <h4 className="text-lg font-medium mb-4 dark:text-white">Recent Detections</h4>
                                                <div className="grid grid-cols-5 gap-4">
                                                    {selectedCamera.stats.recentDetections.map((detection) => (
                                                        <div key={detection.id} className="space-y-2">
                                                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                                                                <img
                                                                    src={detection.capturedImageUrl}
                                                                    alt={detection.personName}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="text-xs">
                                                                <p className="font-medium dark:text-white">{detection.personName}</p>
                                                                <p className="text-gray-500 dark:text-gray-400">
                                                                    {new Date(detection.capturedDateTime).toLocaleString()}
                                                                </p>
                                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                                    detection.personType === 'suspect'
                                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                                                                }`}>
                                                                    {detection.personType.toUpperCase()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}