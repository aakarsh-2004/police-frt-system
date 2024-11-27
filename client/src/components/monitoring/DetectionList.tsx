import { format } from 'date-fns';
import { User, MapPin, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

interface Detection {
    id: string;
    timestamp: string;
    confidence: number;
    location: string;
    cameraId: string;
    type: 'match' | 'suspicious' | 'unidentified';
    status: 'pending' | 'reviewing' | 'confirmed' | 'dismissed';
    suspectImage?: string;
    matchedImage?: string;
}

const detections: Detection[] = [
    {
        id: 'det1',
        timestamp: '2024-03-14T10:45:23',
        confidence: 98.5,
        location: 'MP Nagar Gate',
        cameraId: 'cam1',
        type: 'match',
        status: 'confirmed',
        suspectImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
        matchedImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d'
    },
    {
        id: 'det2',
        timestamp: '2024-03-14T10:42:15',
        confidence: 75.8,
        location: 'New Market',
        cameraId: 'cam2',
        type: 'suspicious',
        status: 'reviewing',
        suspectImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e'
    },
    {
        id: 'det3',
        timestamp: '2024-03-14T10:40:00',
        confidence: 88.2,
        location: 'Habibganj Station',
        cameraId: 'cam3',
        type: 'match',
        status: 'pending',
        suspectImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
        matchedImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'
    }
];

const typeStyles = {
    match: 'bg-green-100 text-green-800',
    suspicious: 'bg-amber-100 text-amber-800',
    unidentified: 'bg-gray-100 text-gray-800'
};

const statusStyles = {
    pending: 'bg-blue-100 text-blue-800',
    reviewing: 'bg-purple-100 text-purple-800',
    confirmed: 'bg-green-100 text-green-800',
    dismissed: 'bg-gray-100 text-gray-800'
};

export default function DetectionList() {
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <h3 className="text-lg font-medium">Recent Detections</h3>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-800">
                    View All
                </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(100vh-20rem)]">
                {detections.map((detection) => (
                    <div
                        key={detection.id}
                        className="p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-start space-x-4">
                            {/* Suspect Image */}
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                {detection.suspectImage && (
                                    <img
                                        src={detection.suspectImage}
                                        alt="Suspect"
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <User className="w-4 h-4 text-gray-600" />
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                                 ${typeStyles[detection.type]}`}>
                                            {detection.type.toUpperCase()}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                                 ${statusStyles[detection.status]}`}>
                                            {detection.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="text-lg font-semibold text-amber-600">
                                        {detection.confidence}%
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        <span className="truncate">{detection.location}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Clock className="w-4 h-4 mr-1" />
                                        <span>{format(new Date(detection.timestamp), 'HH:mm:ss')}</span>
                                    </div>
                                </div>

                                {detection.matchedImage && (
                                    <div className="flex items-center space-x-2 mb-2">
                                        <div className="w-12 h-12 rounded overflow-hidden bg-gray-100">
                                            <img
                                                src={detection.matchedImage}
                                                alt="Matched"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500">Database Match</span>
                                    </div>
                                )}

                                <div className="flex justify-end space-x-2">
                                    <button className="btn btn-secondary text-xs py-1 px-3">
                                        Details
                                    </button>
                                    <button className="btn btn-primary text-xs py-1 px-3 flex items-center">
                                        Take Action
                                        <ArrowRight className="w-3 h-3 ml-1" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {detections.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No active detections
                    </div>
                )}
            </div>
        </div>
    );
}