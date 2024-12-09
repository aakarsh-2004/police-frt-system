import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import { formatDateTime, getTimeAgo } from '../../utils/dateUtils';

interface Video {
    id: string;
    videoUrl: string;
    thumbnailUrl: string;
    capturedDateTime: string;
    location: string;
}

interface RecentVideosProps {
    videos: Video[];
}

export default function RecentVideos({ videos }: RecentVideosProps) {
    const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            const newScrollLeft = direction === 'left' 
                ? scrollContainerRef.current.scrollLeft - scrollAmount
                : scrollContainerRef.current.scrollLeft + scrollAmount;
            
            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    const handleVideoSelect = (index: number) => {
        setSelectedVideoIndex(index);
    };

    const handleVideoChange = (newIndex: number) => {
        setSelectedVideoIndex(newIndex);
    };

    if (videos.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mt-6">
                <h2 className="text-lg font-semibold mb-4 dark:text-white">Recent Videos</h2>
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No videos available
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">Recent Videos</h2>
            
            <div className="relative">
                <div className="px-8">
                    <div 
                        ref={scrollContainerRef}
                        className="flex overflow-x-auto space-x-4 scrollbar-hide relative scroll-smooth"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {videos.map((video, index) => (
                            <div 
                                key={video.id}
                                className="flex-none w-56"
                            >
                                <div className="bg-gray-900/90 dark:bg-gray-800 rounded-lg overflow-hidden relative group transition-all duration-200 hover:bg-gray-900">
                                    <div className="aspect-video relative">
                                        <div 
                                            onClick={() => handleVideoSelect(index)}
                                            className="cursor-pointer w-full h-full"
                                        >
                                            <img 
                                                src={video.thumbnailUrl || video.videoUrl} 
                                                alt="Video thumbnail"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 flex items-center justify-center transition-all duration-200">
                                                <div className="bg-white/10 p-3 rounded-full transform transition-all duration-200 group-hover:scale-110 group-hover:bg-white/20">
                                                    <Play className="w-6 h-6 text-white opacity-75 group-hover:opacity-100" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Video Info */}
                                    <div className="p-3 text-white dark:bg-gray-900">
                                        <p className="text-sm">
                                            {formatDateTime(video.capturedDateTime)}
                                        </p>
                                        <p className='text-[10px] text-gray-400/80 group-hover:text-gray-400 transition-colors duration-200'>
                                            {getTimeAgo(video.capturedDateTime)}
                                        </p>
                                        <p className="text-md text-gray-400/80 group-hover:text-gray-400 mt-1 transition-colors duration-200">
                                            {video.location}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full text-white hover:bg-black/70"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                
                <button 
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full text-white hover:bg-black/70"
                >
                </button>
            </div>

            {/* Video Player Modal */}
            {selectedVideoIndex !== null && (
                <VideoPlayer
                    videoUrl={videos[selectedVideoIndex].videoUrl}
                    videos={videos.map(v => v.videoUrl)}
                    currentIndex={selectedVideoIndex}
                    onVideoChange={handleVideoChange}
                    onClose={() => setSelectedVideoIndex(null)}
                />
            )}
        </div>
    );
} 