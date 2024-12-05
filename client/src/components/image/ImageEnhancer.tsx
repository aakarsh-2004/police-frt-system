import { useState } from 'react';
import {
    SlidersHorizontal, ZoomIn, ZoomOut, RotateCcw,
    Sun, Contrast, Focus, Download, Share2, Wand2, X
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface ImageEnhancerProps {
    imageUrl: string;
    onClose: () => void;
}

type Tab = 'enhance' | 'ai' | 'share';

export default function ImageEnhancer({ imageUrl, onClose }: ImageEnhancerProps) {
    const [activeTab, setActiveTab] = useState<Tab>('enhance');
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [sharpness, setSharpness] = useState(100);
    const [zoom, setZoom] = useState(100);
    const [isProcessing, setIsProcessing] = useState(false);
    const [enhancedImageUrl, setEnhancedImageUrl] = useState<string | null>(null);

    const imageStyle = {
        filter: `brightness(${brightness}%) contrast(${contrast}%)`,
        transform: `scale(${zoom / 100})`
    };

    const handleDownload = () => {
        // Create a canvas to apply the current filters
        const canvas = document.createElement('canvas');
        const img = document.createElement('img');
        img.crossOrigin = "anonymous";
        img.src = imageUrl;
        
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Apply filters
            ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
            ctx.drawImage(img, 0, 0, img.width, img.height);

            // Create download link
            const link = document.createElement('a');
            link.download = 'enhanced-image.jpg';
            link.href = canvas.toDataURL('image/jpeg', 0.9);
            link.click();
        };
    };

    const resetEnhancements = () => {
        setBrightness(100);
        setContrast(100);
        setSharpness(100);
        setZoom(100);
    };

    const handleAIEnhance = async () => {
        try {
            setIsProcessing(true);
            // Extract public_id from Cloudinary URL
            const urlParts = imageUrl.split('/');
            const publicId = urlParts[urlParts.length - 1].split('.')[0];

            // Apply Cloudinary's AI enhancement
            const enhancedUrl = imageUrl
                .replace('/upload/', '/upload/e_enhance,e_improve,q_auto:best/')
                .replace('/upload/', '/upload/e_sharpen:100/');

            setEnhancedImageUrl(enhancedUrl);
        } catch (error) {
            console.error('Error enhancing image:', error);
            toast.error('Failed to enhance image');
        } finally {
            setIsProcessing(false);
        }
    };

    const renderEnhanceTab = () => (
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
                        className="w-full dark:bg-gray-900"
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
                            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
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
                            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
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
            </div>
        </div>
    );

    const renderAITab = () => (
        <div className="space-y-4">
            <div className="p-4 border rounded-lg dark:border-gray-700">
                <h3 className="font-medium mb-4">AI Image Enhancement</h3>
                {!enhancedImageUrl ? (
                    <button
                        onClick={handleAIEnhance}
                        disabled={isProcessing}
                        className="w-full btn btn-primary flex items-center justify-center"
                    >
                        {isProcessing ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Wand2 className="w-4 h-4 mr-2" />
                                Enhance with AI
                            </>
                        )}
                    </button>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-green-600">Image enhanced successfully!</p>
                        <button
                            onClick={() => {
                                const link = document.createElement('a');
                                link.href = enhancedImageUrl;
                                link.download = 'ai-enhanced-image.jpg';
                                link.click();
                            }}
                            className="w-full btn btn-primary flex items-center justify-center"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download Enhanced Image
                        </button>
                        <button
                            onClick={() => setEnhancedImageUrl(null)}
                            className="w-full btn btn-secondary flex items-center justify-center mt-2"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Try Again
                        </button>
                    </div>
                )}
            </div>

            {enhancedImageUrl && (
                <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Preview</h4>
                    <a 
                        href={enhancedImageUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block aspect-video rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                    >
                        <img
                            src={enhancedImageUrl}
                            alt="AI Enhanced"
                            className="w-full h-full object-contain"
                        />
                    </a>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                        Click the image to open in new tab
                    </p>
                </div>
            )}
        </div>
    );

    const renderShareTab = () => (
        <div className="space-y-4">
            <div className="p-4 border rounded-lg dark:border-gray-700">
                <h3 className="font-medium mb-4">Download Options</h3>
                <button
                    onClick={handleDownload}
                    className="w-full btn btn-primary flex items-center justify-center"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Download Enhanced Image
                </button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 dark:bg-gray-800">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setActiveTab('enhance')}
                            className={`px-4 py-2 rounded-lg flex items-center ${
                                activeTab === 'enhance' ? 'bg-blue-900 text-white' : 'text-gray-700 dark:text-white'
                            }`}
                        >
                            <SlidersHorizontal className="w-4 h-4 mr-2" />
                            Enhance
                        </button>
                        <button
                            onClick={() => setActiveTab('ai')}
                            className={`px-4 py-2 rounded-lg flex items-center ${
                                activeTab === 'ai' ? 'bg-blue-900 text-white' : 'text-gray-700 dark:text-white'
                            }`}
                        >
                            <Wand2 className="w-4 h-4 mr-2" />
                            AI Enhance
                        </button>
                        <button
                            onClick={() => setActiveTab('share')}
                            className={`px-4 py-2 rounded-lg flex items-center ${
                                activeTab === 'share' ? 'bg-blue-900 text-white' : 'text-gray-700 dark:text-white'
                            }`}
                        >
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-700"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-gray-100 rounded-lg overflow-hidden dark:bg-gray-900">
                        <div className="relative aspect-video">
                            <img
                                src={imageUrl}
                                alt="Enhancement Preview"
                                className="w-full h-full object-contain transition-all duration-200"
                                style={imageStyle}
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        {activeTab === 'enhance' && renderEnhanceTab()}
                        {activeTab === 'ai' && renderAITab()}
                        {activeTab === 'share' && renderShareTab()}
                    </div>
                </div>
            </div>
        </div>
    );
}