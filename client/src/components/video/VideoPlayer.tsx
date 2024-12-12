import React from 'react';
import { X } from 'lucide-react';

interface VideoPlayerProps {
    url: string;
    onClose: () => void;
}

export default function VideoPlayer({ url, onClose }: VideoPlayerProps) {
    return (
        <div className="relative">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/75 z-10"
            >
                <X className="w-6 h-6" />
            </button>
            
            <video
                src={url}
                controls
                autoPlay
                className="w-full h-full"
                style={{ maxHeight: '80vh' }}
            >
                <source src={url} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
} 