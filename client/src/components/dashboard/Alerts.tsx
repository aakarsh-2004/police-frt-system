import { useState, useEffect } from 'react';
import { AlertTriangle, User, MapPin, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import axios from 'axios';
import config from '../../config/config';
import ImageEnhancer from '../image/ImageEnhancer';

interface Recognition {
    id: number;
    personId: string;
    capturedImageUrl: string;
    capturedLocation: string;
    capturedDateTime: string;
    type: string;
    confidenceScore: string;
    person: {
        firstName: string;
        lastName: string;
        personImageUrl: string;
    };
    camera: {
        location: string;
    };
}

// Add a utility function to format dates
const formatDateTime = (dateString: string) => {
    try {
        // Split the date string into its components
        const [date, time] = dateString.split('T');
        // Return in a nicely formatted way but with same values
        return `${date}, ${time.split('.')[0]}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
    }
};

export default function AlertSystem() {
    const [recognitions, setRecognitions] = useState<Recognition[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { currentLanguage } = useLanguage();

    useEffect(() => {
        const fetchRecognitions = async () => {
            try {
                const response = await axios.get<{data: Recognition[]}>(`${config.apiUrl}/api/recognitions/recent`);
                setRecognitions(response.data.data);
            } catch (err) {
                console.error('Error fetching recognitions:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecognitions();
        const interval = setInterval(fetchRecognitions, 5000);

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return <div className="animate-pulse">Loading alerts...</div>;
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg h-[calc(100vh-24rem)]">
            <div className="p-3 border-b bg-blue-900 text-white dark:border-gray-700">
                <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <h2 className="font-semibold">
                        {currentLanguage === 'en' ? 'Recent Detections' : t('dashboard.recentDetections.title')}
                    </h2>
                </div>
            </div>

            <div className="overflow-y-auto h-[calc(100%-3rem)]">
                {recognitions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 p-4">
                        <AlertTriangle className="w-8 h-8 mb-2 text-gray-400 dark:text-gray-500" />
                        <p className="text-sm">{t('dashboard.recentDetections.noDetections')}</p>
                    </div>
                ) : (
                    recognitions.map((recognition) => (
                        <div key={recognition.id} 
                            className="p-3 border-b hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors dark:border-gray-700"
                        >
                            <div className="flex items-center space-x-3 mb-3">
                                <div 
                                    className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                                    onClick={() => setSelectedImage(recognition.person.personImageUrl)}
                                >
                                    <img
                                        src={recognition.person.personImageUrl}
                                        alt={`${recognition.person.firstName} ${recognition.person.lastName}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div 
                                    className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                                    onClick={() => setSelectedImage(recognition.capturedImageUrl)}
                                >
                                    <img
                                        src={recognition.capturedImageUrl}
                                        alt="Captured"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-medium dark:text-white">
                                        {recognition.person.firstName} {recognition.person.lastName}
                                    </h3>
                                    <span className="text-xs text-amber-600 dark:text-amber-400">
                                        {parseFloat(recognition.confidenceScore).toFixed(1)}% match
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                                <div className="space-y-1">
                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        {recognition.camera.location}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <Clock className="w-4 h-4 mr-2 text-amber-600 dark:text-amber-400" />
                                        <span>{recognition.capturedDateTime.split('T')[0] + ', ' + recognition.capturedDateTime.split('T')[1].split('.')[0]}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/alerts/${recognition.id}`)}
                                    className="btn btn-primary text-xs py-1 px-2 flex items-center"
                                >
                                    View
                                    <ArrowRight className="w-3 h-3 ml-1" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Image Enhancer Modal */}
            {selectedImage && (
                <ImageEnhancer
                    imageUrl={selectedImage}
                    onClose={() => setSelectedImage(null)}
                />
            )}
        </div>
    );
}