import { format } from 'date-fns';
import { User, MapPin, Clock, AlertTriangle, Camera } from 'lucide-react';
import { Detection } from './types';

interface DetectionListProps {
    detections: Detection[];
}

export default function DetectionList({ detections = [] }: DetectionListProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden h-[calc(100vh-8rem)]">
            <div className="p-4 border-b bg-blue-900 text-white dark:border-gray-700">
                <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-medium">Live Detections</h3>
                </div>
                <p className="text-sm text-gray-300">Showing detections from last 20 seconds</p>
            </div>

            <div className="overflow-y-auto h-full">
                {detections.map((detection) => (
                    <div
                        key={detection.id}
                        className="p-4 border-b dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                                <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                <span className="font-medium dark:text-white">{detection.personName}</span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium
                                ${detection.confidence >= 80 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'}`}>
                                {detection.confidence.toFixed(1)}% Match
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block">
                                    Database Image
                                </span>
                                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                                    {detection.suspectImage && (
                                        <img
                                            src={detection.suspectImage}
                                            alt="Database"
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block">
                                    Live Capture
                                </span>
                                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
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

                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 space-y-2">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <Camera className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                                <span className="font-medium">{detection.location}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <MapPin className="w-4 h-4 mr-2 text-red-600 dark:text-red-400" />
                                <span>Camera #{detection.cameraId}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <Clock className="w-4 h-4 mr-2 text-amber-600 dark:text-amber-400" />
                                <span>{format(new Date(detection.timestamp), 'HH:mm:ss')}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {detections.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 p-8">
                        <AlertTriangle className="w-12 h-12 mb-2 text-gray-400 dark:text-gray-500" />
                        <p className="text-center">No active detections</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">Waiting for face recognition matches...</p>
                    </div>
                )}
            </div>
        </div>
    );
}