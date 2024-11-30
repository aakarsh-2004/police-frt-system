import { useState, useEffect } from 'react';
import { AlertTriangle, Bell, Filter, ChevronDown, MapPin, Clock, ArrowRight } from 'lucide-react';
import ImageEnhancer from '../image/ImageEnhancer';
import axios from 'axios';
import config from '../../config/config';
import { useNavigate } from 'react-router-dom';

interface Recognition {
    id: number;
    personId: string;
    capturedImageUrl: string;
    capturedLocation: string;
    capturedDateTime: string;
    createdAt: string;
    type: string;
    confidenceScore: string;
    person: {
        id: string;
        firstName: string;
        lastName: string;
        personImageUrl: string;
        type: string;
        suspect?: {
            riskLevel: string;
            foundStatus: boolean;
        };
        missingPerson?: {
            lastSeenDate: string;
            lastSeenLocation: string;
            foundStatus: boolean;
        };
    };
    camera: {
        location: string;
    };
}

interface FilterState {
    startDate: string;
    endDate: string;
    riskLevel: string[];
    locations: string[];
}

export default function AlertsPage() {
    const [enhancingImage, setEnhancingImage] = useState<string | null>(null);
    const [alerts, setAlerts] = useState<Recognition[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const navigate = useNavigate();

    const [filters, setFilters] = useState<FilterState>({
        startDate: '',
        endDate: '',
        riskLevel: [],
        locations: []
    });

    const [availableLocations, setAvailableLocations] = useState<string[]>([]);

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 30000);
        return () => clearInterval(interval);
    }, [filters]);

    const fetchAlerts = async () => {
        try {
            let url = `${config.apiUrl}/api/recognitions/recent`;
            const params = new URLSearchParams();

            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.riskLevel.length) params.append('riskLevel', filters.riskLevel.join(','));
            if (filters.locations.length) params.append('locations', filters.locations.join(','));

            const response = await axios.get<{data: Recognition[]}>(`${url}?${params.toString()}`);
            setAlerts(response.data.data);
            
            const locations = new Set(response.data.data.map(alert => alert.camera.location));
            setAvailableLocations(Array.from(locations));
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching alerts:', error);
            setLoading(false);
        }
    };

    const handleFilterChange = (key: keyof FilterState, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            startDate: '',
            endDate: '',
            riskLevel: [],
            locations: []
        });
    };

    const FilterPanel = () => (
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Filter Detections</h3>
                <button 
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800"
                >
                    Clear Filters
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input
                        type="datetime-local"
                        value={filters.startDate}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input
                        type="datetime-local"
                        value={filters.endDate}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Risk Level</label>
                    <select
                        multiple
                        value={filters.riskLevel}
                        onChange={(e) => handleFilterChange('riskLevel', 
                            Array.from(e.target.selectedOptions, option => option.value)
                        )}
                        className="w-full p-2 border rounded"
                    >
                        <option value="high">High Risk</option>
                        <option value="medium">Medium Risk</option>
                        <option value="low">Low Risk</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Locations</label>
                    <select
                        multiple
                        value={filters.locations}
                        onChange={(e) => handleFilterChange('locations',
                            Array.from(e.target.selectedOptions, option => option.value)
                        )}
                        className="w-full p-2 border rounded"
                    >
                        {availableLocations.map(location => (
                            <option key={location} value={location}>{location}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );

    const getAlertSeverity = (recognition: Recognition) => {
        if (recognition.person.type === 'suspect' && recognition.person.suspect?.riskLevel === 'high') {
            return 'critical';
        }
        if (recognition.person.type === 'suspect') {
            return 'high';
        }
        return 'medium';
    };

    const getStatusBadge = (recognition: Recognition) => {
        const confidence = parseFloat(recognition.confidenceScore);
        if (confidence >= 90) return 'verified';
        if (confidence >= 75) return 'investigating';
        return 'pending';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="max-w-[2000px] mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <Bell className="w-6 h-6 text-red-600" />
                        <h1 className="text-2xl font-bold">Recent Detections</h1>
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="btn btn-secondary flex items-center"
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                        <ChevronDown className={`w-4 h-4 ml-1 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {showFilters && <FilterPanel />}

                <div className="grid gap-4">
                    {alerts.map((alert) => (
                        <div
                            key={alert.id}
                            className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                    <AlertTriangle className={`w-5 h-5 ${
                                        alert.person.type === 'suspect' ? 'text-red-600' : 'text-orange-600'
                                    }`} />
                                    <div>
                                        <h3 className="font-medium">
                                            {alert.person.firstName} {alert.person.lastName}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {alert.person.type === 'suspect' ? 'Suspect Detection' : 'Missing Person Detection'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        alert.person.type === 'suspect' && alert.person.suspect?.riskLevel === 'high'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-orange-100 text-orange-800'
                                    }`}>
                                        {alert.person.type === 'suspect' 
                                            ? `${alert.person.suspect?.riskLevel.toUpperCase()} Risk`
                                            : 'MISSING PERSON'
                                        }
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">Database Image</span>
                                    </div>
                                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                                        <img
                                            src={alert.person.personImageUrl}
                                            alt="Database"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">Captured Image</span>
                                        <button
                                            onClick={() => setEnhancingImage(alert.capturedImageUrl)}
                                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                        >
                                            Enhance
                                        </button>
                                    </div>
                                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                                        <img
                                            src={alert.capturedImageUrl}
                                            alt="Captured"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm mt-4">
                                <div className="flex items-center space-x-4">
                                    <span className="flex items-center text-gray-600">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        {alert.camera.location}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="flex items-center text-gray-600">
                                            <Clock className="w-4 h-4 mr-1" />
                                            Detected: {new Date(alert.capturedDateTime).toLocaleString()}
                                        </span>
                                        <span className="text-xs text-gray-500 mt-1">
                                            Entry Added: {new Date(alert.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <span className="flex items-center text-amber-600 font-medium">
                                        {parseFloat(alert.confidenceScore).toFixed(1)}% Match
                                    </span>
                                </div>
                                <button
                                    onClick={() => navigate(`/person/${alert.person.id}`)}
                                    className="btn btn-primary text-sm flex items-center"
                                >
                                    View Full Profile
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {alerts.length === 0 && (
                        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                            <p className="text-gray-500">No recent detections found.</p>
                        </div>
                    )}
                </div>
            </div>

            {enhancingImage && (
                <ImageEnhancer
                    imageUrl={enhancingImage}
                    onClose={() => setEnhancingImage(null)}
                />
            )}
        </div>
    );
}