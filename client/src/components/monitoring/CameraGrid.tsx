import { useState } from 'react';
import { Camera, Settings, Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { cameras } from './cameras';


export default function CameraGrid() {
    const [expandedCamera, setExpandedCamera] = useState<string | null>(null);
    const [cameraSettings, setCameraSettings] = useState<Record<string, {
        zoom: number;
        rotation: number;
    }>>({});

    const handleCameraAction = (cameraId: string, action: 'zoomIn' | 'zoomOut' | 'rotate' | 'reset') => {
        setCameraSettings(prev => {
            const current = prev[cameraId] || { zoom: 100, rotation: 0 };
            switch (action) {
                case 'zoomIn':
                    return { ...prev, [cameraId]: { ...current, zoom: Math.min(200, current.zoom + 10) } };
                case 'zoomOut':
                    return { ...prev, [cameraId]: { ...current, zoom: Math.max(50, current.zoom - 10) } };
                case 'rotate':
                    return { ...prev, [cameraId]: { ...current, rotation: (current.rotation + 90) % 360 } };
                case 'reset':
                    return { ...prev, [cameraId]: { zoom: 100, rotation: 0 } };
                default:
                    return prev;
            }
        });
    };

    const getCameraStyle = (cameraId: string) => {
        const settings = cameraSettings[cameraId] || { zoom: 100, rotation: 0 };
        return {
            transform: `scale(${settings.zoom / 100}) rotate(${settings.rotation}deg)`,
            transition: 'transform 0.3s ease-out'
        };
    };

    const displayedCameras = expandedCamera
        ? cameras.filter(cam => cam.id === expandedCamera)
        : cameras;

    return (
        <div className="overflow-y-auto max-h-[calc(100vh-10rem)]">
            <div className={`grid ${expandedCamera ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-4`}>
                {displayedCameras.map((camera) => (
                    <div
                        key={camera.id}
                        className={`bg-white rounded-lg shadow-lg overflow-hidden ${expandedCamera === camera.id ? 'col-span-full' : ''}`}
                    >
                        <div className="relative">
                            <div className="aspect-video bg-gray-900">
                                <img
                                    src={camera.stream}
                                    alt={camera.name}
                                    className="w-full h-full object-cover"
                                    style={getCameraStyle(camera.id)}
                                />
                            </div>

                            {/* Camera Info Overlay */}
                            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
                                <div className="flex items-center justify-between text-white">
                                    <div className="flex items-center space-x-2">
                                        <Camera className="w-4 h-4" />
                                        <span className="font-medium">{camera.name}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`w-2 h-2 rounded-full ${camera.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                                            }`} />
                                        <span className="text-sm">{camera.status}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Control Buttons */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                                <div className="flex items-center justify-between text-white">
                                    <div className="text-sm">
                                        <div>{camera.location}</div>
                                        <div className="text-xs opacity-75">{camera.area}</div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleCameraAction(camera.id, 'zoomOut')}
                                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                        >
                                            <ZoomOut className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleCameraAction(camera.id, 'zoomIn')}
                                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                        >
                                            <ZoomIn className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleCameraAction(camera.id, 'rotate')}
                                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleCameraAction(camera.id, 'reset')}
                                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                        >
                                            <Settings className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setExpandedCamera(
                                                expandedCamera === camera.id ? null : camera.id
                                            )}
                                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                        >
                                            {expandedCamera === camera.id ? (
                                                <Minimize2 className="w-4 h-4" />
                                            ) : (
                                                <Maximize2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}