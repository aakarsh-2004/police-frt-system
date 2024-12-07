import { useState, useEffect } from 'react';
import { AlertTriangle, Filter, Clock, MapPin, ArrowRight, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import axios from 'axios';
import config from '../../config/config';
import ImageEnhancer from '../../components/image/ImageEnhancer';
import { formatDistanceToNow, format } from 'date-fns';
import { enUS, hi } from 'date-fns/locale';

interface Alert {
    id: string;
    capturedDateTime: string;
    confidenceScore: string;
    capturedImageUrl: string;
    person: {
        id: string;
        firstName: string;
        lastName: string;
        personImageUrl: string;
        type: string;
        status: string;
        lastSeenDate?: string;
        lastSeenLocation?: string;
        missingSince?: string;
    };
    camera: {
        id: string;
        name: string;
        location: string;
    };
}

interface FilterState {
    startDate: string;
    endDate: string;
    riskLevel: string[];
    locations: string[];
    timePeriod: 'daily' | 'weekly' | 'monthly' | 'custom';
}

export default function AlertsPage() {
    const [enhancingImage, setEnhancingImage] = useState<string | null>(null);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const navigate = useNavigate();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const { t } = useTranslation();
    const { currentLanguage } = useLanguage();

    const [filters, setFilters] = useState<FilterState>({
        startDate: '',
        endDate: '',
        riskLevel: [],
        locations: [],
        timePeriod: 'daily'
    });

    const [availableLocations, setAvailableLocations] = useState<string[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalAlerts, setTotalAlerts] = useState(0);
    const pageSize = 10;

    useEffect(() => {
        fetchAlerts(currentPage);
    }, [currentPage, filters]);

    const fetchAlerts = async (page: number) => {
        try {
            setLoading(true);
            const response = await axios.get(`${config.apiUrl}/api/alerts`, {
                params: {
                    page,
                    pageSize,
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                    riskLevel: filters.riskLevel.join(','),
                    locations: filters.locations.join(','),
                    timePeriod: filters.timePeriod
                }
            });
            
            setAlerts(response.data.data);
            setTotalAlerts(response.data.total);
            setTotalPages(Math.ceil(response.data.total / pageSize));
            
            // Update available locations
            const locations = new Set(response.data.data.map((alert: Alert) => alert.camera.location));
            setAvailableLocations(Array.from(locations));
        } catch (error) {
            console.error('Error fetching alerts:', error);
        } finally {
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
            locations: [],
            timePeriod: 'daily'
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

    const getAlertSeverity = (recognition: Alert) => {
        if (recognition.person.type === 'suspect' && recognition.person.suspect?.riskLevel === 'high') {
            return 'critical';
        }
        if (recognition.person.type === 'suspect') {
            return 'high';
        }
        return 'medium';
    };

    const getStatusBadge = (recognition: Alert) => {
        const confidence = parseFloat(recognition.confidenceScore);
        if (confidence >= 90) return 'verified';
        if (confidence >= 75) return 'investigating';
        return 'pending';
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const handleViewDetails = (alert: Alert) => {
        navigate(`/person/${alert.personId}`);
    };

    const handleTimePeriodChange = (period: FilterState['timePeriod']) => {
        const today = new Date();
        let startDate = '';
        let endDate = today.toISOString().split('T')[0];

        switch (period) {
            case 'daily':
                startDate = today.toISOString().split('T')[0];
                break;
            case 'weekly':
                const lastWeek = new Date(today);
                lastWeek.setDate(today.getDate() - 7);
                startDate = lastWeek.toISOString().split('T')[0];
                break;
            case 'monthly':
                const lastMonth = new Date(today);
                lastMonth.setMonth(today.getMonth() - 1);
                startDate = lastMonth.toISOString().split('T')[0];
                break;
            case 'custom':
                startDate = filters.startDate;
                endDate = filters.endDate;
                break;
        }

        setFilters(prev => ({
            ...prev,
            timePeriod: period,
            startDate,
            endDate
        }));
        setCurrentPage(1); // Reset to first page when filter changes
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, 'dd MMM yyyy, hh:mm a', {
            locale: currentLanguage === 'en' ? enUS : hi
        });
    };

    const getTimeAgo = (dateString: string) => {
        return formatDistanceToNow(new Date(dateString), {
            addSuffix: true,
            locale: currentLanguage === 'en' ? enUS : hi
        });
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
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center bg-white rounded-lg shadow p-2 dark:bg-gray-800">
                            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                            <select
                                value={filters.timePeriod}
                                onChange={(e) => handleTimePeriodChange(e.target.value as FilterState['timePeriod'])}
                                className="border-none bg-transparent focus:ring-0 dark:bg-gray-800 dark:text-white"
                            >
                                <option value="daily">{currentLanguage === 'en' ? 'Daily' : 'दैनिक'}</option>
                                <option value="weekly">{currentLanguage === 'en' ? 'Weekly' : 'साप्ताहिक'}</option>
                                <option value="monthly">{currentLanguage === 'en' ? 'Monthly' : 'मासिक'}</option>
                                <option value="custom">{currentLanguage === 'en' ? 'Custom' : 'कस्टम'}</option>
                            </select>
                        </div>
                        
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="btn btn-secondary flex items-center"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            {currentLanguage === 'en' ? 'Filters' : 'फ़िल्टर'}
                        </button>
                    </div>
                </div>

                {showFilters && (
                    <div className="mb-6 bg-white p-4 rounded-lg shadow dark:bg-gray-800">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {filters.timePeriod === 'custom' && (
                                <>
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
                                            {currentLanguage === 'en' ? 'End Date' : 'समाप्ति तिथि'}
                                        </label>
                                        <input
                                            type="date"
                                            value={filters.endDate}
                                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                </>
                            )}
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
                            <div className="p-4 border-b dark:border-gray-700">
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
                                {alert.person.type === 'missing-person' && (
                                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center space-x-2">
                                            <Clock className="w-3 h-3" />
                                            <span>
                                                {currentLanguage === 'en' ? 'Missing since: ' : 'लापता: '}
                                                {alert.person.missingSince && formatDateTime(alert.person.missingSince)}
                                            </span>
                                        </div>
                                        {alert.person.lastSeenLocation && (
                                            <div className="flex items-center space-x-2 mt-1">
                                                <MapPin className="w-3 h-3" />
                                                <span>
                                                    {currentLanguage === 'en' ? 'Last seen at: ' : 'अंतिम बार देखा गया: '}
                                                    {alert.person.lastSeenLocation}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-2 p-4">
                                <div 
                                    className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                                    onClick={() => setSelectedImage(alert.person.personImageUrl)}
                                >
                                    <img
                                        src={alert.person.personImageUrl}
                                        alt={currentLanguage === 'en' ? 'Database Image' : 'डेटाबेस छवि'}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div 
                                    className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                                    onClick={() => setSelectedImage(alert.capturedImageUrl)}
                                >
                                    <img
                                        src={alert.capturedImageUrl}
                                        alt={currentLanguage === 'en' ? 'Captured Image' : 'कैप्चर की गई छवि'}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                            <div className="p-4 border-t dark:border-gray-700">
                                <div className="space-y-2">
                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        <span>
                                            {currentLanguage === 'en' ? 'Detected at: ' : 'यहाँ पहचाना गया: '}
                                            {alert.camera.name} ({alert.camera.location})
                                        </span>
                                    </div>
                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                        <Clock className="w-3 h-3 mr-1" />
                                        <span>
                                            {formatDateTime(alert.capturedDateTime)}
                                            <span className="text-sm text-gray-500 ml-1">
                                                ({getTimeAgo(alert.capturedDateTime)})
                                            </span>
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-3 flex justify-end">
                                    <button
                                        onClick={() => handleViewDetails(alert)}
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

                <div className="mt-6 flex items-center justify-between dark:text-white">
                    <div className="text-sm text-gray-700">
                        Showing {(currentPage - 1) * pageSize + 1} to{' '}
                        {Math.min(currentPage * pageSize, totalAlerts)} of {totalAlerts} alerts
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className={`p-2 rounded ${
                                currentPage === 1
                                    ? 'text-gray-400 cursor-not-allowed dark:text-gray-500'
                                    : 'text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50 dark:text-white'
                            }`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-700/50">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded ${
                                currentPage === totalPages
                                    ? 'text-gray-400 cursor-not-allowed dark:text-gray-500'
                                    : 'text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50 dark:text-white'
                            }`}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {loading && <div className="text-center mt-6">Loading...</div>}
            </div>

            {selectedImage && (
                <ImageEnhancer
                    imageUrl={selectedImage}
                    onClose={() => setSelectedImage(null)}
                />
            )}
        </div>
    );
}