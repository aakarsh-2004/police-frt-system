import { useState, useEffect } from 'react';
import { AlertTriangle, Filter, Clock, MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import axios from 'axios';
import config from '../../config/config';

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
            foundStatus: boolean;
            riskLevel: string;
        };
        missingPerson?: {
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
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const [filters, setFilters] = useState<FilterState>({
        startDate: '',
        endDate: '',
        riskLevel: [],
        locations: []
    });

    const [availableLocations, setAvailableLocations] = useState<string[]>([]);

    const { t } = useTranslation();
    const { currentLanguage } = useLanguage();

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

    const handleResolve = async (personId: string, type: string) => {
        try {
            await axios.put(`${config.apiUrl}/api/persons/${personId}/resolve`, {
                type
            });
            
            setAlerts(prevAlerts => prevAlerts.map(alert => {
                if (alert.person.id === personId) {
                    return {
                        ...alert,
                        person: {
                            ...alert.person,
                            suspect: alert.person.suspect ? {
                                ...alert.person.suspect,
                                foundStatus: true
                            } : undefined,
                            missingPerson: alert.person.missingPerson ? {
                                ...alert.person.missingPerson,
                                foundStatus: true
                            } : undefined
                        }
                    };
                }
                return alert;
            }));
            
            toast.success('Case resolved successfully');
        } catch (error) {
            console.error('Error resolving case:', error);
            toast.error('Failed to resolve case');
        }
    };

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
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">
                        {currentLanguage === 'en' ? 'Alerts & Detections' : 'अलर्ट और पहचान'}
                    </h1>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="btn btn-secondary flex items-center"
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        {currentLanguage === 'en' ? 'Filters' : 'फ़िल्टर'}
                    </button>
                </div>

                {showFilters && (
                    <div className="mb-6 bg-white p-4 rounded-lg shadow dark:bg-gray-800">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    {currentLanguage === 'en' ? 'Start Date' : 'प्रारंभ तिथि'}
                                </label>
                                <input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    {currentLanguage === 'en' ? 'End Date' : 'समाप्त तिथि'}
                                </label>
                                <input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    {currentLanguage === 'en' ? 'Risk Level' : 'जोखा स्तर'}
                                </label>
                                <select
                                    multiple
                                    value={filters.riskLevel}
                                    onChange={(e) => handleFilterChange('riskLevel', 
                                        Array.from(e.target.selectedOptions, option => option.value)
                                    )}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="high">High Risk</option>
                                    <option value="medium">Medium Risk</option>
                                    <option value="low">Low Risk</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 ">
                                    {currentLanguage === 'en' ? 'Locations' : 'स्थान'}
                                </label>
                                <select
                                    multiple
                                    value={filters.locations}
                                    onChange={(e) => handleFilterChange('locations',
                                        Array.from(e.target.selectedOptions, option => option.value)
                                    )}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                                >
                                    {availableLocations.map(location => (
                                        <option key={location} value={location}>{location}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {alerts.map((alert) => (
                        <div key={alert.id} className="bg-white rounded-lg shadow-lg overflow-hidden dark:bg-gray-800">
                            <div className="p-4 border-b">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                                        <h3 className="font-semibold">
                                            {alert.person.firstName} {alert.person.lastName}
                                        </h3>
                                    </div>
                                    <span className="text-amber-600 font-medium">
                                        {parseFloat(alert.confidenceScore).toFixed(1)}%
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 p-4">
                                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                    <img
                                        src={alert.person.personImageUrl}
                                        alt={currentLanguage === 'en' ? 'Database Image' : 'डेटाबेस छवि'}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                    <img
                                        src={alert.capturedImageUrl}
                                        alt={currentLanguage === 'en' ? 'Captured Image' : 'कैप्चर की गई छवि'}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                            <div className="p-4 border-t">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1 text-sm">
                                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                                            <MapPin className="w-3 h-3 mr-1 dark:text-gray-400" />
                                            {alert.capturedLocation}
                                        </div>
                                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                                            <Clock className="w-3 h-3 mr-1 dark:text-gray-400" />
                                            {new Date(alert.capturedDateTime).toLocaleTimeString()}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/alerts/${alert.id}`)}
                                        className="btn btn-primary text-xs py-1 px-2 flex items-center"
                                    >
                                        {currentLanguage === 'en' ? 'View Details' : 'विवरण देखें'}
                                        <ArrowRight className="w-3 h-3 ml-1" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {alerts.length === 0 && (
                        <div className="col-span-2 text-center py-8 text-gray-500 dark:text-gray-400">
                            {loading ? 
                                (currentLanguage === 'en' ? 'Loading alerts...' : 'अलर्ट लोड हो रहे हैं...') :
                                (currentLanguage === 'en' ? 'No alerts found' : 'कोई अलर्ट नहीं')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}