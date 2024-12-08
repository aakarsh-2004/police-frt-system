import { useState } from 'react';
import { Maximize, RotateCw } from 'lucide-react';
import RTSPStream from './RTSPStream';
import VideoControls from '../video/VideoControls';

interface Camera {
    id: string;
    name: string;
    url: string;
    location: string;
}

interface CameraGridProps {
    cameras: Camera[];
}

export default function CameraGrid({ cameras }: CameraGridProps) {
    const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleCameraClick = (camera: Camera) => {
        setSelectedCamera(camera);
    };

    const handleClose = () => {
        setSelectedCamera(null);
        setIsFullscreen(false);
    };

    const handlePersonDetected = (person: { name: string; confidence: number }) => {
        console.log('Person detected:', person);
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800 h-[calc(100vh-16rem)]">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold dark:text-white">Live Surveillance</h2>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => window.location.reload()}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Refresh feeds"
                    >
                        <RotateCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    {selectedCamera && (
                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Toggle fullscreen"
                        >
                            <Maximize className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-y-auto h-[calc(100%-4rem)] pr-2">
                {selectedCamera ? (
                    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
                        <div className="relative h-full">
                            <RTSPStream
                                streamUrl={selectedCamera.url}
                                onClose={handleClose}
                                isFullscreen={isFullscreen}
                            />
                            <VideoControls
                                onClose={handleClose}
                                onFullscreen={() => setIsFullscreen(!isFullscreen)}
                                isFullscreen={isFullscreen}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {cameras.map((camera) => (
                            <div
                                key={camera.id}
                                onClick={() => handleCameraClick(camera)}
                                className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden cursor-pointer group hover:ring-2 hover:ring-blue-500 transition-all"
                            >
                                <RTSPStream
                                    id={`camera-${camera.id}`}
                                    streamUrl={camera.url}
                                    onPersonDetected={handlePersonDetected}
                                    fallbackIndex={parseInt(camera.id) - 1}
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                    <h3 className="text-white font-medium">{camera.name}</h3>
                                    <p className="text-gray-300 text-sm">{camera.location}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}