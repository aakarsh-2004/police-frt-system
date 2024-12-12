import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface TutorialVideoPlayerProps {
    url: string;
    onClose: () => void;
}

export default function TutorialVideoPlayer({ url, onClose }: TutorialVideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement) return;

        // Reset video element
        videoElement.pause();
        videoElement.currentTime = 0;
        videoElement.src = url;

        // Wait for metadata to load before playing
        const handleLoadedMetadata = () => {
            videoElement.play().catch(error => {
                console.error('Error playing video:', error);
            });
        };

        videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);

        return () => {
            if (videoElement) {
                videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
                videoElement.pause();
                videoElement.src = '';
                videoElement.load();
            }
        };
    }, [url]);

    return (
        <div className="relative bg-black rounded-lg overflow-hidden">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/75 z-10"
            >
                <X className="w-6 h-6" />
            </button>
            
            <video
                ref={videoRef}
                className="w-full aspect-video"
                controls
                playsInline
                crossOrigin="anonymous"
            >
                Your browser does not support the video tag.
            </video>
        </div>
    );
}