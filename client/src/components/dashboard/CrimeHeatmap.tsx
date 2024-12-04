import { useState, useEffect, useRef } from 'react';
import { MapPin, TrendingUp } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import config from '../../config/config';

interface CameraDetails {
    id: string;
    name: string;
    location: string;
    latitude: string;
    longitude: string;
    status: string;
    streamUrl: string;
    stats?: {
        totalDetections: number;
    };
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

export default function CrimeHeatmap() {
    const [cameras, setCameras] = useState<CameraDetails[]>([]);
    const [selectedCamera, setSelectedCamera] = useState<CameraDetails | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);

    useEffect(() => {
        const fetchCameras = async () => {
            try {
                const response = await axios.get(`${config.apiUrl}/api/cameras`);
                if (response.data) {
                    // Fetch stats for each camera
                    const camerasWithStats = await Promise.all(
                        response.data.map(async (camera: CameraDetails) => {
                            const statsResponse = await axios.get(`${config.apiUrl}/api/cameras/${camera.id}`);
                            return {
                                ...camera,
                                stats: statsResponse.data.stats
                            };
                        })
                    );
                    setCameras(camerasWithStats);
                }
            } catch (error) {
                console.error('Error fetching cameras:', error);
            }
        };

        fetchCameras();
    }, []);

    useEffect(() => {
        if (!mapContainerRef.current || cameras.length === 0) return;

        mapboxgl.accessToken = "pk.eyJ1IjoiYWFrYXJzaC0yMDA0IiwiYSI6ImNtNDhrdXhycjAwb2gycXMyZjljdTl0MnIifQ.6L9i8t_eW3gubSsF7HmXwg";

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: "mapbox://styles/mapbox/light-v11",
            center: BHOPAL_CENTER,
            zoom: 12
        });

        map.on('load', () => {
            // Add the heatmap source
            map.addSource('cameras', {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': cameras.map(camera => ({
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [parseFloat(camera.longitude), parseFloat(camera.latitude)]
                        },
                        'properties': {
                            'weight': camera.stats?.totalDetections || 0
                        }
                    }))
                }
            });

            // Add the heatmap layer
            map.addLayer(
                {
                    'id': 'camera-heat',
                    'type': 'heatmap',
                    'source': 'cameras',
                    'maxzoom': 15,
                    'paint': {
                        // Weight paint property based on the detection count
                        'heatmap-weight': [
                            'interpolate',
                            ['linear'],
                            ['get', 'weight'],
                            0, 0,
                            100, 1
                        ],
                        // Heatmap intensity
                        'heatmap-intensity': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            0, 1,
                            9, 3
                        ],
                        // Heatmap radius
                        'heatmap-radius': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            0, 30,
                            9, 50
                        ],
                        // Heatmap opacity
                        'heatmap-opacity': 0.8,
                        // Color gradient
                        'heatmap-color': [
                            'interpolate',
                            ['linear'],
                            ['heatmap-density'],
                            0, 'rgba(33,102,172,0)',
                            0.2, '#fca5a5',
                            0.4, '#f87171',
                            0.6, '#ef4444',
                            0.8, '#dc2626',
                            1.0, '#991b1b'
                        ]
                    }
                },
                'waterway-label'
            );

            // Add circle layer for high zoom levels
            map.addLayer(
                {
                    'id': 'camera-point',
                    'type': 'circle',
                    'source': 'cameras',
                    'minzoom': 14,
                    'paint': {
                        'circle-radius': 8,
                        'circle-color': '#ef4444',
                        'circle-opacity': 0.5,
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#ffffff'
                    }
                },
                'waterway-label'
            );

            // Add markers last
            cameras.forEach(camera => {
                const el = document.createElement('div');
                el.className = 'custom-marker';
                el.style.backgroundColor = camera.status === 'active' ? '#4CAF50' : '#9E9E9E';

                // Add click handler
                el.addEventListener('click', () => {
                    setSelectedCamera(camera);
                });

                const marker = new mapboxgl.Marker({
                    element: el,
                    anchor: 'bottom'
                })
                    .setLngLat([parseFloat(camera.longitude), parseFloat(camera.latitude)])
                    .setPopup(
                        new mapboxgl.Popup({
                            offset: 25,
                            closeButton: false,
                            closeOnClick: false
                        })
                            .setHTML(`
                                <div class="p-2">
                                    <h3 class="font-bold">${camera.name}</h3>
                                    <p class="text-sm text-gray-600">${camera.location}</p>
                                    <p class="text-sm font-medium mt-1">
                                        Total Detections: ${camera.stats?.totalDetections || 0}
                                    </p>
                                </div>
                            `)
                    )
                    .addTo(map);

                el.addEventListener('mouseenter', () => marker.getPopup()?.addTo(map));
                el.addEventListener('mouseleave', () => marker.getPopup()?.remove());
            });
        });

        return () => {
            map.remove();
        };
    }, [cameras]);

    // Get hotspots sorted by detection count
    const hotspots = cameras
        .map(camera => ({
            area: camera.name,
            location: camera.location,
            detections: camera.stats?.totalDetections || 0,
            trend: getTrend(camera.stats?.totalDetections || 0)
        }))
        .sort((a, b) => b.detections - a.detections)
        .slice(0, 5);

    function getTrend(detections: number): 'increasing' | 'stable' | 'decreasing' {
        if (detections > 50) return 'increasing';
        if (detections > 20) return 'stable';
        return 'decreasing';
    }

    const trendColors = {
        increasing: 'text-red-500',
        stable: 'text-blue-500',
        decreasing: 'text-green-500'
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold flex items-center dark:text-white">
                            <MapPin className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                            Crime Heatmap
                        </h2>
                    </div>
                    <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
                        <div
                            ref={mapContainerRef}
                            className="absolute inset-0"
                        />
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                    {selectedCamera ? (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium dark:text-white">Camera Details</h3>
                                <button
                                    onClick={() => setSelectedCamera(null)}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 border dark:border-gray-700 rounded-lg">
                                    <div className="grid grid-cols-2 gap-4">
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
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Total Detections</span>
                                            <p className="font-medium dark:text-white">
                                                {selectedCamera.stats?.totalDetections || 0}
                                            </p>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Coordinates</span>
                                            <p className="font-medium dark:text-white">
                                                {selectedCamera.latitude}, {selectedCamera.longitude}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 border dark:border-gray-700 rounded-lg">
                                    <h4 className="font-medium mb-3 dark:text-white">Detection Trend</h4>
                                    <div className={`flex items-center ${trendColors[getTrend(selectedCamera.stats?.totalDetections || 0)]}`}>
                                        <TrendingUp className="w-4 h-4 mr-1" />
                                        {getTrend(selectedCamera.stats?.totalDetections || 0).charAt(0).toUpperCase() + 
                                         getTrend(selectedCamera.stats?.totalDetections || 0).slice(1)}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-lg font-medium mb-4 dark:text-white">Crime Hotspots</h3>
                            <div className="space-y-4">
                                {hotspots.map((hotspot, index) => (
                                    <div key={index} className="p-4 border dark:border-gray-700 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium dark:text-white">{hotspot.area}</span>
                                            <span className={`flex items-center ${trendColors[hotspot.trend]}`}>
                                                <TrendingUp className="w-4 h-4 mr-1" />
                                                {hotspot.trend.charAt(0).toUpperCase() + hotspot.trend.slice(1)}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            <p>{hotspot.location}</p>
                                            <p className="mt-1">
                                                <span className="font-medium">{hotspot.detections}</span> detections
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}