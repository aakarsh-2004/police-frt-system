import { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config/config';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { formatDateTime, getTimeAgo } from '../../utils/dateUtils';
import { toast } from 'react-hot-toast';

interface Detection {
    id: string;
    capturedDateTime: string;
    confidenceScore: number;
    capturedImageUrl: string;
    person: {
        id: string;
        firstName: string;
        lastName: string;
        personImageUrl: string;
        type: string;
    };
    camera: {
        name: string;
        location: string;
    };
}

export default function RecentDetections() {
    const [detections, setDetections] = useState<Detection[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { currentLanguage } = useLanguage();

    useEffect(() => {
        fetchDetections();
    }, []);

    const fetchDetections = async () => {
        try {
            setLoading(true);
            const response = await axios.get<{ data: Detection[] }>(`${config.apiUrl}/api/recognitions/recent`);
            
            // Log the raw date to debug
            console.log('Raw detection date:', response.data.data[0]?.capturedDateTime);
            
            setDetections(response.data.data);
        } catch (error) {
            console.error('Error fetching recent detections:', error);
            toast.error('Failed to fetch recent detections');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (personId: string) => {
        navigate(`/person/${personId}`);
    };

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-20 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
                {currentLanguage === 'en' ? 'Recent Detections' : 'हाल की पहचान'}
            </h2>
            <div className="space-y-4">
                {detections.map((detection) => (
                    <div
                        key={detection.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                    >
                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                    src={detection.capturedImageUrl}
                                    alt={`${detection.person.firstName} ${detection.person.lastName}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium truncate dark:text-white">
                                        {detection.person.firstName} {detection.person.lastName}
                                    </h3>
                                    <span className="text-amber-600 font-medium">
                                        {detection.confidenceScore.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                    <div className="flex items-center">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        <span>
                                            {detection.camera.name} ({detection.camera.location})
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        <span>
                                            {formatDateTime(detection.capturedDateTime, currentLanguage)}
                                            <span className="text-sm text-gray-500 ml-1">
                                                ({getTimeAgo(detection.capturedDateTime, currentLanguage)})
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleViewDetails(detection.person.id)}
                                className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                                {currentLanguage === 'en' ? 'View Details' : 'विवरण देखें'}
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </button>
                        </div>
                    </div>
                ))}

                {detections.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        {currentLanguage === 'en' ? 'No recent detections' : 'कोई हाल की पहचान नहीं'}
                    </div>
                )}
            </div>
        </div>
    );
} 