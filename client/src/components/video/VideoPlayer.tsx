import { useEffect, useRef, useState } from 'react';
import { X, Play, Pause, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import VideoControls from './VideoControls';

interface VideoPlayerProps {
    videoUrl: string;
    onClose: () => void;
    videos?: string[];
    currentIndex?: number;
    onVideoChange?: (index: number) => void;
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function VideoPlayer({ 
    videoUrl, 
    onClose, 
    videos = [], 
    currentIndex = 0,
    onVideoChange 
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(console.error);
        }

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    const handlePlayPause = (e: React.MouseEvent) => {
        e.stopPropagation();
        
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleSpeedChange = (speed: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = speed;
            setPlaybackSpeed(speed);
            setShowSpeedMenu(false);
        }
    };

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 0.1, 2));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 0.1, 0.5));
    };

    const handleRotate = () => {
        setRotation(prev => (prev + 90) % 360);
    };

    const handleFullScreen = async () => {
        try {
            const videoContainer = containerRef.current;
            if (!videoContainer) return;

            if (!document.fullscreenElement) {
                try {
                    if (videoContainer.requestFullscreen) {
                        await videoContainer.requestFullscreen();
                    } else if ((videoContainer as any).webkitRequestFullscreen) {
                        await (videoContainer as any).webkitRequestFullscreen();
                    } else if ((videoContainer as any).msRequestFullscreen) {
                        await (videoContainer as any).msRequestFullscreen();
                    }
                } catch (err) {
                    console.error('Error attempting to enable fullscreen:', err);
                }
            } else {
                try {
                    if (document.exitFullscreen) {
                        await document.exitFullscreen();
                    } else if ((document as any).webkitExitFullscreen) {
                        await (document as any).webkitExitFullscreen();
                    } else if ((document as any).msExitFullscreen) {
                        await (document as any).msExitFullscreen();
                    }
                } catch (err) {
                    console.error('Error attempting to exit fullscreen:', err);
                }
            }
        } catch (error) {
            console.error('Fullscreen error:', error);
        }
    };

    const handlePrevVideo = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onVideoChange && currentIndex > 0) {
            onVideoChange(currentIndex - 1);
        }
    };

    const handleNextVideo = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onVideoChange && currentIndex < videos.length - 1) {
            onVideoChange(currentIndex + 1);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className={`relative ${isFullscreen ? 'w-screen h-screen' : 'w-full max-w-4xl'}`}>
                <button 
                    onClick={onClose}
                    className={`absolute -top-10 right-0 text-white hover:text-gray-300 ${
                        isFullscreen ? 'hidden' : ''
                    }`}
                >
                    <X className="w-6 h-6" />
                </button>
                
                <div 
                    ref={containerRef}
                    className={`relative group bg-black overflow-hidden ${
                        isFullscreen 
                            ? 'fixed inset-0 w-screen h-screen' 
                            : 'rounded-lg w-full h-full'
                    }`}
                    onClick={handlePlayPause}
                >
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        className="w-full h-full object-contain"
                        style={{
                            transform: `scale(${zoom}) rotate(${rotation}deg)`,
                            transition: 'transform 0.3s ease',
                            maxHeight: isFullscreen ? '100vh' : 'auto',
                            maxWidth: isFullscreen ? '100vw' : 'auto'
                        }}
                    >
                        Your browser does not support video playback.
                    </video>

                    {/* Play/Pause Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-black/50 p-4 rounded-full">
                            {isPlaying ? (
                                <Pause className="w-8 h-8 text-white" />
                            ) : (
                                <Play className="w-8 h-8 text-white" />
                            )}
                        </div>
                    </div>

                    {/* Video Navigation Buttons */}
                    {videos.length > 1 && !isFullscreen && (
                        <>
                            <button
                                onClick={handlePrevVideo}
                                className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white 
                                    hover:bg-black/70 transition-colors ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={currentIndex === 0}
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={handleNextVideo}
                                className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white 
                                    hover:bg-black/70 transition-colors ${currentIndex === videos.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={currentIndex === videos.length - 1}
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </>
                    )}

                    {/* Video Controls Container */}
                    <div 
                        className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Speed Control */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                                className="flex items-center space-x-1 bg-black/50 text-white px-3 py-1.5 rounded-lg hover:bg-black/70 transition-colors"
                            >
                                <span>{playbackSpeed}x</span>
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            {/* Speed Menu */}
                            {showSpeedMenu && (
                                <div className="absolute bottom-full mb-2 left-0 bg-black/90 rounded-lg overflow-hidden">
                                    {PLAYBACK_SPEEDS.map(speed => (
                                        <button
                                            key={speed}
                                            onClick={() => handleSpeedChange(speed)}
                                            className={`block w-full px-4 py-2 text-left text-white hover:bg-black/50 transition-colors ${
                                                playbackSpeed === speed ? 'bg-blue-500/50' : ''
                                            }`}
                                        >
                                            {speed}x
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Other Video Controls */}
                        <VideoControls
                            onZoomIn={handleZoomIn}
                            onZoomOut={handleZoomOut}
                            onRotate={handleRotate}
                            onFullScreen={handleFullScreen}
                        />
                    </div>
                </div>

                {/* Video Navigation Thumbnails */}
                {videos.length > 1 && !isFullscreen && (
                    <div className="absolute -bottom-20 left-0 right-0 flex justify-center gap-2 overflow-x-auto">
                        {videos.map((video, index) => (
                            <button
                                key={index}
                                onClick={() => onVideoChange?.(index)}
                                className={`w-24 h-16 rounded overflow-hidden border-2 transition-colors ${
                                    index === currentIndex ? 'border-blue-500' : 'border-transparent'
                                }`}
                            >
                                <video
                                    src={video}
                                    className="w-full h-full object-cover"
                                    preload="metadata"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 