import { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import axios from 'axios';
import config from '../../config/config';
import { formatDateTime, getTimeAgo } from '../../utils/dateUtils';

interface Recognition {
    id: string;
    person: {
        id: string;
        firstName: string;
        lastName: string;
        personImageUrl: string;
        type: string;
    };
    capturedDateTime: string;
    confidenceScore: string;
    capturedImageUrl: string;
    camera: {
        name: string;
        location: string;
    };
}

export default function Alerts() {
    const [recognitions, setRecognitions] = useState<Recognition[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { currentLanguage } = useLanguage();

    useEffect(() => {
        fetchRecognitions();
        const interval = setInterval(fetchRecognitions, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchRecognitions = async () => {
        try {
            const response = await axios.get<{ data: Recognition[] }>(`${config.apiUrl}/api/recognitions/recent`);
            setRecognitions(response.data.data);
        } catch (error) {
            console.error('Error fetching recognitions:', error);
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
                        <div key={n} className="h-24 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800 h-[calc(100vh-16rem)]">
            <div className="flex items-center space-x-2 mb-6">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-semibold dark:text-white">
                    {currentLanguage === 'en' ? 'Recent Alerts' : 'हाल के अलर्ट'}
                </h2>
            </div>
            <div className="space-y-4 overflow-y-auto h-[calc(100%-4rem)] pr-2">
                {recognitions.map((recognition) => (
                    <div
                        key={recognition.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                    <img
                                        src={recognition.person.personImageUrl}
                                        alt={`${recognition.person.firstName} ${recognition.person.lastName}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="text-xs text-center mt-1 font-medium text-gray-600 dark:text-gray-400">
                                        Original
                                    </div>
                                </div>
                                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                    <img
                                        src={recognition.capturedImageUrl}
                                        alt="Captured"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="text-xs text-center mt-1 font-medium text-gray-600 dark:text-gray-400">
                                        Captured
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold dark:text-white">
                                        {recognition.person.firstName} {recognition.person.lastName}
                                    </h3>
                                    <span className="text-amber-600 font-medium px-3 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-full">
                                        {parseFloat(recognition.confidenceScore).toFixed(1)}% Match
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                                        <span className="truncate">
                                            {recognition.camera.name} • {recognition.camera.location}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                                        <div>
                                            <span className="font-medium">
                                                {formatDateTime(recognition.capturedDateTime, currentLanguage)}
                                            </span>
                                            <span className="text-gray-500 ml-2">
                                                ({getTimeAgo(recognition.capturedDateTime, currentLanguage)})
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={() => handleViewDetails(recognition.person.id)}
                                        className="inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                    >
                                        {currentLanguage === 'en' ? 'View Details' : 'विवरण देखें'}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {recognitions.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        {currentLanguage === 'en' ? 'No recent alerts' : 'कोई हाल का अलर्ट नहीं'}
                    </div>
                )}
            </div>
        </div>
    );
}
