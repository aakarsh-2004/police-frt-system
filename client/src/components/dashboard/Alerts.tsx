import { useState, useEffect } from 'react';
import { AlertTriangle, User, MapPin, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config/config';

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

export default function AlertSystem() {
    const [recognitions, setRecognitions] = useState<Recognition[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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
        const interval = setInterval(fetchRecognitions, 10000);

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return <div className="animate-pulse">Loading alerts...</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow-lg h-[calc(100vh-24rem)]">
            <div className="p-3 border-b bg-blue-900 text-white">
                <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <h2 className="font-semibold">Recent Detections</h2>
                </div>
            </div>

            <div className="overflow-y-auto h-[calc(100%-3rem)]">
                {recognitions.map((recognition) => (
                    <div key={recognition.id} 
                        className="p-3 border-b hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                                <User className="w-3 h-3 text-gray-600" />
                                <span className="font-medium text-sm">
                                    {recognition.person.firstName} {recognition.person.lastName}
                                </span>
                            </div>
                            <span className="text-amber-600 font-medium text-sm">
                                {parseFloat(recognition.confidenceScore).toFixed(1)}%
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                <img
                                    src={recognition.person.personImageUrl}
                                    alt="Database"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                <img
                                    src={recognition.capturedImageUrl}
                                    alt="Captured"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <div className="space-y-1">
                                <div className="flex items-center text-gray-600">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {recognition.camera.location}
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {new Date(recognition.capturedDateTime).toLocaleTimeString()}
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
                ))}

                {recognitions.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                        <AlertTriangle className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="text-sm">No active alerts</p>
                    </div>
                )}
            </div>
        </div>
    );
}