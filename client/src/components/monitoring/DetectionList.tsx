import { format } from 'date-fns';
import { User, MapPin, Clock, AlertTriangle, Camera } from 'lucide-react';
import { Detection } from './types';

interface DetectionListProps {
    detections: Detection[];
}

export default function DetectionList({ detections }: DetectionListProps) {
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[calc(100vh-8rem)]">
            <div className="p-4 border-b bg-blue-900 text-white">
                <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-medium">Live Detections</h3>
                </div>
                <p className="text-sm text-gray-300 mt-1">Showing detections from last 20 seconds</p>
            </div>

            <div className="overflow-y-auto h-full">
                {detections.map((detection) => (
                    <div
                        key={detection.id}
                        className="p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                    >
                        {/* Detection Header */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                                <User className="w-4 h-4 text-gray-600" />
                                <span className="font-medium">{detection.personName}</span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium
                                ${detection.confidence >= 80 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-amber-100 text-amber-800'}`}>
                                {detection.confidence.toFixed(1)}% Match
                            </span>
                        </div>

                        {/* Images Section */}
                        <div className="grid grid-cols-2 gap-4 mb-3">
                            {/* Database Image */}
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-gray-500 block">
                                    Database Image
                                </span>
                                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                    {detection.suspectImage && (
                                        <img
                                            src={detection.suspectImage}
                                            alt="Database"
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Captured Image */}
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-gray-500 block">
                                    Live Capture
                                </span>
                                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                    {detection.matchedImage && (
                                        <img
                                            src={detection.matchedImage}
                                            alt="Captured"
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Detection Details */}
                        <div className="bg-gray-50 rounded-lg p-2 space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                                <Camera className="w-4 h-4 mr-2 text-blue-600" />
                                <span className="font-medium">{detection.location}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="w-4 h-4 mr-2 text-red-600" />
                                <span>Camera #{detection.cameraId}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Clock className="w-4 h-4 mr-2 text-amber-600" />
                                <span>{format(new Date(detection.timestamp), 'HH:mm:ss')}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {detections.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                        <AlertTriangle className="w-12 h-12 mb-2 text-gray-400" />
                        <p className="text-center">No active detections</p>
                        <p className="text-sm text-gray-400">Waiting for face recognition matches...</p>
                    </div>
                )}
            </div>
        </div>
    );
}