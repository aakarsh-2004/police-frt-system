import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import axios from 'axios';
import config from '../../config/config';

interface Detection {
    id: string;
    personId: string;
    person: {
        id: string;
        firstName: string;
        lastName: string;
        personImageUrl: string | null;
    };
    capturedDateTime: string;
    camera: {
        location: string;
    };
}

export default function RecentDetections() {
    const navigate = useNavigate();
    const [detections, setDetections] = useState<Detection[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecentDetections();
    }, []);

    const fetchRecentDetections = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/api/recognitions/recent`);
            setDetections(response.data.data);
            
        } catch (error) {
            console.error('Error fetching recent detections:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (personId: string) => {
        navigate(`/person/${personId}`);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Recent Detections</h2>
            <div className="space-y-2">
                {detections.map((detection) => (
                    <div key={detection.id} className="flex items-center justify-between py-3 border-b last:border-0">
                        <div className="flex items-center space-x-3">
                            {detection.person.personImageUrl && (
                                <img
                                    src={detection.person.personImageUrl}
                                    alt={`${detection.person.firstName} ${detection.person.lastName}`}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            )}
                            <div>
                                <div className="font-medium">
                                    {detection.person.firstName} {detection.person.lastName}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {detection.camera.location}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => handleViewDetails(detection.person.id)}
                            className="btn btn-primary text-xs py-1 px-2 flex items-center"
                        >
                            View Details
                            <ArrowRight className="w-3 h-3 ml-1" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
} 