import { useState } from 'react';
import {
    SlidersHorizontal, ZoomIn, ZoomOut, RotateCcw,
    Sun, Contrast, Focus, Download
} from 'lucide-react';

interface ImageEnhancerProps {
    imageUrl: string;
    onClose: () => void;
}

export default function ImageEnhancer({ imageUrl, onClose }: ImageEnhancerProps) {
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [sharpness, setSharpness] = useState(100);
    const [zoom, setZoom] = useState(100);

    const imageStyle = {
        filter: `brightness(${brightness}%) contrast(${contrast}%)`,
        transform: `scale(${zoom / 100})`
    };

    const handleDownload = () => {
        // In a real app, you'd process the image with the current enhancements
        // and generate a new enhanced image for download
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = 'enhanced-image.jpg';
        link.click();
    };

    const resetEnhancements = () => {
        setBrightness(100);
        setContrast(100);
        setSharpness(100);
        setZoom(100);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold flex items-center">
                        <SlidersHorizontal className="w-5 h-5 mr-2" />
                        Image Enhancement
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        ✕
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Image Preview */}
                    <div className="md:col-span-2 bg-gray-100 rounded-lg overflow-hidden">
                        <div className="relative aspect-video">
                            <img
                                src={imageUrl}
                                alt="Enhancement Preview"
                                className="w-full h-full object-contain transition-all duration-200"
                                style={imageStyle}
                            />
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="flex items-center text-sm font-medium mb-2">
                                    <Sun className="w-4 h-4 mr-2" />
                                    Brightness
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="200"
                                    value={brightness}
                                    onChange={(e) => setBrightness(Number(e.target.value))}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>0%</span>
                                    <span>{brightness}%</span>
                                    <span>200%</span>
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center text-sm font-medium mb-2">
                                    <Contrast className="w-4 h-4 mr-2" />
                                    Contrast
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="200"
                                    value={contrast}
                                    onChange={(e) => setContrast(Number(e.target.value))}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>0%</span>
                                    <span>{contrast}%</span>
                                    <span>200%</span>
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center text-sm font-medium mb-2">
                                    <Focus className="w-4 h-4 mr-2" />
                                    Sharpness
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="200"
                                    value={sharpness}
                                    onChange={(e) => setSharpness(Number(e.target.value))}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>0%</span>
                                    <span>{sharpness}%</span>
                                    <span>200%</span>
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center text-sm font-medium mb-2">
                                    <ZoomIn className="w-4 h-4 mr-2" />
                                    Zoom
                                </label>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setZoom(Math.max(50, zoom - 10))}
                                        className="p-1 rounded-lg hover:bg-gray-100"
                                    >
                                        <ZoomOut className="w-4 h-4" />
                                    </button>
                                    <input
                                        type="range"
                                        min="50"
                                        max="200"
                                        value={zoom}
                                        onChange={(e) => setZoom(Number(e.target.value))}
                                        className="flex-1"
                                    />
                                    <button
                                        onClick={() => setZoom(Math.min(200, zoom + 10))}
                                        className="p-1 rounded-lg hover:bg-gray-100"
                                    >
                                        <ZoomIn className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={resetEnhancements}
                                className="btn btn-secondary flex-1 flex items-center justify-center"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reset
                            </button>
                            <button
                                onClick={handleDownload}
                                className="btn btn-primary flex-1 flex items-center justify-center"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}