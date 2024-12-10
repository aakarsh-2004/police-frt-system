import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import config from '../../config/config';
import { useTheme } from '../../context/themeContext';
import ImageEnhancer from '../image/ImageEnhancer';
import DetectedPersons from './DetectedPersons';
import { debounce } from 'lodash';
import { toast } from 'react-hot-toast';

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

interface DetectedPerson {
    id: string;
    firstName: string;
    lastName: string;
    age: number;
    type: string;
    personImageUrl: string;
    capturedImageUrl: string;
    capturedDateTime: string;
    confidenceScore: string;
    location: string;
    gender: string;
    nationality: string;
    riskLevel?: string;
    foundStatus?: boolean;
    lastSeenDate?: string;
    lastSeenLocation?: string;
    totalDetections: number;
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

// Add helper functions before the component
const updateMarkerStyle = (el: HTMLElement, camera: CameraDetails, isSelected: boolean) => {
    el.style.backgroundColor = isSelected ? '#EF4444' : (camera.status === 'active' ? '#4CAF50' : '#9E9E9E');
    el.style.width = isSelected ? '28px' : '24px';
    el.style.height = isSelected ? '28px' : '24px';
    el.style.border = isSelected ? '3px solid #FEE2E2' : '2px solid white';
    el.style.boxShadow = isSelected ? '0 0 0 2px rgba(239, 68, 68, 0.3)' : 'none';
    el.style.transform = isSelected ? 'scale(1.1)' : 'scale(1)';
};

const createCustomMarker = (camera: CameraDetails, isSelected: boolean) => {
    const el = document.createElement('div');
    el.className = 'custom-marker transition-all duration-300';
    el.style.borderRadius = '50%';
    el.style.cursor = 'pointer';
    
    // Apply initial styles
    updateMarkerStyle(el, camera, isSelected);
    
    return el;
};

// Add this function to create a marker element with dynamic color
const createMarkerElement = (isSelected: boolean) => {
    const el = document.createElement('div');
    el.className = `camera-marker ${isSelected ? 'selected' : ''}`;
    return el;
};

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
    const sliderRef = useRef<HTMLDivElement>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedDetection, setSelectedDetection] = useState<any>(null);
    const [detectedPersons, setDetectedPersons] = useState<DetectedPerson[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Person[]>([]);
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

    // First, create a ref to store markers
    const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});

    console.log("selected camera", selectedCamera);
    

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

    const fetchCameraDetails = async (cameraId: string) => {
        try {
            const [cameraResponse, detectionsResponse] = await Promise.all([
                axios.get<CameraDetails>(`${config.apiUrl}/api/cameras/${cameraId}`),
                axios.get(`${config.apiUrl}/api/cameras/${cameraId}/detections`)
            ]);

            console.log('Camera Details:', cameraResponse.data);
            console.log('Detections Response:', detectionsResponse.data);

            if (cameraResponse.data) {
                // Merge the stats from detections response with camera details
                const cameraWithStats = {
                    ...cameraResponse.data,
                    stats: detectionsResponse.data.stats
                };
                setSelectedCamera(cameraWithStats);
                
                // Set detected persons
                if (detectionsResponse.data.data) {
                    setDetectedPersons(detectionsResponse.data.data);
                }
            }
        } catch (error) {
            console.error('Error fetching camera data:', error);
        }
    };

    // First, set the access token
    mapboxgl.accessToken = 'pk.eyJ1IjoiYWFrYXJzaC0yMDA0IiwiYSI6ImNtNDhrdXhycjAwb2gycXMyZjljdTl0MnIifQ.6L9i8t_eW3gubSsF7HmXwg';

    // Add useEffect for map initialization
    useEffect(() => {
        if (!mapContainerRef.current) return;

        // Initialize map
        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/dark-v11',
            center: BHOPAL_CENTER,
            zoom: 12,
            maxBounds: [
                [BHOPAL_BOUNDS.west, BHOPAL_BOUNDS.south], // SW
                [BHOPAL_BOUNDS.east, BHOPAL_BOUNDS.north]  // NE
            ]
        });

        // Save map instance to ref
        mapRef.current = map;

        // Add navigation controls
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Load cameras when map is ready
        map.on('load', () => {
            fetchCameraDe();
        });

        // Cleanup
        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Update the useEffect for markers
    useEffect(() => {
        if (!mapRef.current || !cameras.length) return;

        // Clear existing markers
        Object.values(markersRef.current).forEach(marker => marker.remove());
        markersRef.current = {};

        // Add new markers
        cameras.forEach(camera => {
            const el = createMarkerElement(selectedCamera?.id === camera.id);
            
            // Create popup
            const popup = new mapboxgl.Popup({
                offset: 25,
                closeButton: false,
                closeOnClick: false
            })
            .setHTML(`
                <div class="p-3 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-lg min-w-[200px]">
                    <h3 class="font-bold text-sm">${camera.name}</h3>
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
            `);

            // Create marker
            const marker = new mapboxgl.Marker({
                element: el,
                anchor: 'bottom'
            })
            .setLngLat([parseFloat(camera.longitude), parseFloat(camera.latitude)])
            .setPopup(popup)
            .addTo(mapRef.current!);

            // Store marker reference
            markersRef.current[camera.id] = marker;

            // Add hover events
            el.addEventListener('mouseenter', () => {
                marker.getPopup().addTo(mapRef.current!);
            });
            
            el.addEventListener('mouseleave', () => {
                marker.getPopup().remove();
            });

            // Add click handler
            el.addEventListener('click', () => {
                handleCameraClick(camera);
            });
        });
    }, [cameras, isDarkMode, selectedCamera]); // Add selectedCamera to dependencies

    const slideLeft = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({
                left: -200,
                behavior: 'smooth'
            });
        }
    };

    const slideRight = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({
                left: 200,
                behavior: 'smooth'
            });
        }
    };

    const handleImageClick = (detection: any) => {
        setSelectedImage(detection.capturedImageUrl);
        setSelectedDetection({
            person: {
                firstName: detection.personName?.split(' ')[0] || '',
                lastName: detection.personName?.split(' ')[1] || '',
                personImageUrl: detection.personImageUrl
            },
            capturedLocation: detection.location,
            capturedDateTime: detection.capturedDateTime,
            confidenceScore: detection.confidenceScore
        });
    };

    // Update handleCameraClick
    const handleCameraClick = async (camera: CameraDetails) => {
        try {
            await fetchCameraDetails(camera.id);
        } catch (error) {
            console.error('Error handling camera click:', error);
        }
    };

    // Add this new function to handle search
    const handleSearch = useCallback(
        debounce(async (query: string) => {
            if (!query.trim()) {
                setSearchResults([]);
                return;
            }

            try {
                const response = await axios.get(`${config.apiUrl}/api/persons/search`, {
                    params: { query }
                });
                setSearchResults(response.data.data);
            } catch (error) {
                console.error('Error searching persons:', error);
                toast.error('Error searching persons');
            }
        }, 300),
        []
    );

    // Add this function to handle person selection
    const handlePersonSelect = async (person: Person) => {
        try {
            setSelectedPerson(person);
            setSearchQuery(`${person.firstName} ${person.lastName}`);
            setSearchResults([]); // Clear dropdown

            // Fetch cameras where this person was detected
            const response = await axios.get(`${config.apiUrl}/api/persons/${person.id}/cameras`);
            const personCameras = response.data.data;

            // Update cameras state to only show relevant cameras
            setCameras(personCameras);

            // Update markers on the map
            if (mapRef.current) {
                // Remove existing markers
                markers.current.forEach(marker => marker.remove());
                markers.current = [];

                // Add new markers for filtered cameras
                personCameras.forEach(camera => {
                    const marker = createMarker(camera);
                    marker.addTo(mapRef.current!);
                    markers.current.push(marker);
                });
            }
        } catch (error) {
            console.error('Error fetching person cameras:', error);
            toast.error('Error fetching camera locations');
        }
    };

    // Update the search input's onChange handler
    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        handleSearch(query);
    };

    // Add this to clear search and reset view
    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setSelectedPerson(null);
        fetchCameras(); // Your existing function to fetch all cameras
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

                                        </>
                                    )}
                                </div>
                            )}

                            {selectedCamera && (
                                <>
                                    {/* DetectedPersons component - Now first */}
                                    <DetectedPersons 
                                        detections={detectedPersons} 
                                        onImageClick={(detection) => {
                                            setSelectedImage(detection.capturedImageUrl);
                                            setSelectedDetection({
                                                person: {
                                                    firstName: detection.firstName,
                                                    lastName: detection.lastName,
                                                    personImageUrl: detection.personImageUrl
                                                },
                                                capturedLocation: detection.location,
                                                capturedDateTime: detection.capturedDateTime,
                                                confidenceScore: detection.confidenceScore
                                            });
                                        }}
                                    />

                                    {/* Recent Detections - Now second */}
                                    {selectedCamera.stats && (
                                        <div className="mt-6 border-t pt-4">
                                            <h4 className="text-lg font-medium mb-4 dark:text-white">Recent Detections</h4>
                                            
                                            <div className="relative">
                                                {/* Navigation Buttons */}
                                                <button 
                                                    onClick={slideLeft}
                                                    className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors"
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>
                                                
                                                <button 
                                                    onClick={slideRight}
                                                    className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>

                                                {/* Slider Container */}
                                                <div 
                                                    ref={sliderRef}
                                                    className="flex overflow-x-auto space-x-4 scrollbar-hide scroll-smooth"
                                                >
                                                    {selectedCamera.stats.recentDetections.map((detection) => (
                                                        <div 
                                                            key={detection.id}
                                                            className="flex-none w-48"
                                                        >
                                                            <div 
                                                                className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 cursor-pointer"
                                                                onClick={() => handleImageClick(detection)}
                                                            >
                                                                <img
                                                                    src={detection.capturedImageUrl}
                                                                    alt={detection.personName}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="mt-2 space-y-1">
                                                                <p className="font-medium text-sm dark:text-white truncate">
                                                                    {detection.personName}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {new Date(detection.capturedDateTime).toLocaleString()}
                                                                </p>
                                                                <span className={`inline-block px-2 py-1 rounded-full text-xs ${
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
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {selectedImage && selectedDetection && (
                <ImageEnhancer
                    imageUrl={selectedImage}
                    onClose={() => {
                        setSelectedImage(null);
                        setSelectedDetection(null);
                    }}
                    detectionInfo={selectedDetection}
                />
            )}
        </div>
    );
}