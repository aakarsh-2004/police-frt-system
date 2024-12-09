import { useState, useRef, useEffect } from 'react';
import { Camera, ChevronLeft, ChevronRight, MapPin, Clock, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import RTSPStream from '../monitoring/RTSPStream';
import VideoControls from '../video/VideoControls';

interface VideoFeed {
    id: string;
    url: string;
    title: string;
    location: string;
    area: string;
    timestamp: string;
    recognitions: {
        id: string;
        confidence: number;
        timestamp: string;
        location: string;
    }[];
}

const videoFeeds: VideoFeed[] = [
    {
        id: '1',
        url: '/SIH-stock-vids/1.mp4',
        title: 'Live Camera',
        location: 'Zone 1, MP Nagar',
        area: 'Bhopal, Madhya Pradesh',
        timestamp: '2024-03-14 10:30:45',
        recognitions: []
    },
    {
        id: '2',
        url: '/SIH-stock-vids/2.mp4',
        title: 'New Market Area',
        location: 'TT Nagar',
        area: 'Bhopal, Madhya Pradesh',
        timestamp: '2024-03-14 10:30:42',
        recognitions: []
    },
    {
        id: '3',
        url: '/SIH-stock-vids/3.mp4',
        title: 'Habibganj Railway Station',
        location: 'Railway Station Area',
        area: 'Bhopal, Madhya Pradesh',
        timestamp: '2024-03-14 10:30:40',
        recognitions: []
    },
    {
        id: '4',
        url: '/SIH-stock-vids/4.mp4',
        title: 'DB Mall Entrance',
        location: 'Arera Colony',
        area: 'Bhopal, Madhya Pradesh',
        timestamp: '2024-03-14 10:30:38',
        recognitions: []
    },
    {
        id: '5',
        url: '/SIH-stock-vids/5.mp4',
        title: 'BHEL Gate',
        location: 'BHEL Township',
        area: 'Bhopal, Madhya Pradesh',
        timestamp: '2024-03-14 10:30:36',
        recognitions: []
    },
    {
        id: '6',
        url: '/SIH-stock-vids/6.mp4',
        title: 'Bittan Market',
        location: 'Bittan Market Area',
        area: 'Bhopal, Madhya Pradesh',
        timestamp: '2024-03-14 10:30:34',
        recognitions: []
    }
];

// Add sample stream URLs
const SAMPLE_STREAMS = [
    'ws://dfe0-137-97-251-78.ngrok-free.app/stream/8622d5bf-afb1-422d-bd15-db23b8acfe87/channel/0/mse?uuid=8622d5bf-afb1-422d-bd15-db23b8acfe87&channel=0',
    'ws://localhost:8083/stream/9421a179-e486-4705-b78d-02967abcb14c/channel/0/mse?uuid=9421a179-e486-4705-b78d-02967abcb14c&channel=0',
    'ws://localhost:8083/stream/52ec5a38-0285-4bbe-bdcc-f0b9b23a5cbe/channel/0/mse?uuid=52ec5a38-0285-4bbe-bdcc-f0b9b23a5cbe&channel=0',
    'ws://localhost:8083/stream/94019b3f-4541-4100-ae81-bd7bc319e3c8/channel/0/mse?uuid=94019b3f-4541-4100-ae81-bd7bc319e3c8&channel=0',
    'ws://localhost:8083/stream/a52feeeb-8cc7-418b-ad88-ae757d5a6433/channel/0/mse?uuid=a52feeeb-8cc7-418b-ad88-ae757d5a6433&channel=0',
    'ws://localhost:8083/stream/c0220694-546b-49dd-8c77-93203ab904d5/channel/0/mse?uuid=c0220694-546b-49dd-8c77-93203ab904d5&channel=0'
];

export default function LiveFeed() {
    const [selectedFeed, setSelectedFeed] = useState<VideoFeed>(videoFeeds[0]);
    const [showGrid, setShowGrid] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const { t } = useTranslation();
    const { currentLanguage } = useLanguage();

    const [videoControls, setVideoControls] = useState<Record<string, {
        zoom: number;
        rotation: number;
    }>>({});

    // Initialize controls for each video
    useEffect(() => {
        const initialControls: Record<string, { zoom: number; rotation: number }> = {};
        videoFeeds.forEach((_, index) => {
            const videoId = `video-${index + 1}`;
            initialControls[videoId] = { zoom: 1, rotation: 0 };
        });
        setVideoControls(initialControls);
    }, []);

    const handleCameraClick = (feed: VideoFeed, index: number) => {
        setSelectedFeed(feed);
        setSelectedIndex(index);
        setShowGrid(false);
    };

    const handlePrevStream = () => {
        const prevIndex = selectedIndex === 0 ? videoFeeds.length - 1 : selectedIndex - 1;
        setSelectedIndex(prevIndex);
        setSelectedFeed(videoFeeds[prevIndex]);
    };

    const handleNextStream = () => {
        const nextIndex = selectedIndex === videoFeeds.length - 1 ? 0 : selectedIndex + 1;
        setSelectedIndex(nextIndex);
        setSelectedFeed(videoFeeds[nextIndex]);
    };

    // Video controls handlers
    const handleZoomIn = (videoId: string) => {
        setVideoControls(prev => ({
            ...prev,
            [videoId]: {
                ...prev[videoId],
                zoom: Math.min((prev[videoId]?.zoom || 1) + 0.1, 2)
            }
        }));
    };

    const handleZoomOut = (videoId: string) => {
        setVideoControls(prev => ({
            ...prev,
            [videoId]: {
                ...prev[videoId],
                zoom: Math.max((prev[videoId]?.zoom || 1) - 0.1, 0.5)
            }
        }));
    };

    const handleRotate = (videoId: string) => {
        setVideoControls(prev => ({
            ...prev,
            [videoId]: {
                ...prev[videoId],
                rotation: ((prev[videoId]?.rotation || 0) + 90) % 360
            }
        }));
    };

    const getVideoStyle = (videoId: string) => {
        const controls = videoControls[videoId] || { zoom: 1, rotation: 0 };
        return {
            transform: `scale(${controls.zoom}) rotate(${controls.rotation}deg)`
        };
    };

    return (
        <div className="card h-[480px]">
            <div className="p-4 border-b flex items-center justify-between dark:border-gray-700">
                <div className="flex items-center space-x-2">
                    <Camera className="w-5 h-5 text-blue-900" />
                    <h2 className="text-lg font-semibold">
                        {currentLanguage === 'en' ? 'Live Surveillance Feed' : t('dashboard.liveFeed.title')}
                    </h2>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setShowGrid(true)}
                        className={`px-3 py-1 rounded-lg text-sm ${
                            showGrid ? 'bg-blue-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        {currentLanguage === 'en' ? 'Grid View' : t('dashboard.liveFeed.gridView')}
                    </button>
                    <button
                        onClick={() => setShowGrid(false)}
                        className={`px-3 py-1 rounded-lg text-sm ${
                            !showGrid ? 'bg-blue-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        {currentLanguage === 'en' ? 'Single View' : t('dashboard.liveFeed.singleView')}
                    </button>
                </div>
            </div>

            {showGrid ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 p-2">
                    {videoFeeds.map((feed, index) => (
                        <div 
                            key={feed.id} 
                            className="relative h-[190px] bg-gray-900 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all" 
                            onClick={() => handleCameraClick(feed, index)}
                        >
                            <RTSPStream
                                id={`grid-video-${index + 1}`}
                                streamUrl={SAMPLE_STREAMS[index]}
                                style={getVideoStyle(`grid-video-${index + 1}`)}
                            />
                            <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-b from-black/50 to-transparent">
                                <div className="flex items-center justify-between text-white">
                                    <span className="text-sm font-medium">{feed.title}</span>
                                    <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                                        {t('dashboard.liveFeed.live')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="relative h-[calc(100%-60px)]">
                    <div 
                        ref={el => containerRefs.current[`video-${selectedIndex + 1}`] = el}
                        className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden group"
                    >
                        <RTSPStream
                            id={`single-video-${selectedIndex + 1}`}
                            streamUrl={SAMPLE_STREAMS[selectedIndex]}
                            style={getVideoStyle(`single-video-${selectedIndex + 1}`)}
                        />
                        
                        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 z-20">
                            <button
                                onClick={handlePrevStream}
                                className="p-2 bg-black/50 rounded-full text-white hover:bg-black/75 transition-colors"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={handleNextStream}
                                className="p-2 bg-black/50 rounded-full text-white hover:bg-black/75 transition-colors"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="absolute bottom-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <VideoControls
                                onZoomIn={() => handleZoomIn(`single-video-${selectedIndex + 1}`)}
                                onZoomOut={() => handleZoomOut(`single-video-${selectedIndex + 1}`)}
                                onRotate={() => handleRotate(`single-video-${selectedIndex + 1}`)}
                                onFullScreen={() => {/* handle fullscreen */}}
                            />
                        </div>

                        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-white font-semibold">{selectedFeed.title}</h2>
                                    <div className="flex items-center text-white/80 text-sm">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        {selectedFeed.location}, {selectedFeed.area}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                                        {t('dashboard.liveFeed.live')}
                                    </span>
                                    <span className="text-white/80 text-sm flex items-center">
                                        <Clock className="w-4 h-4 mr-1" />
                                        {selectedFeed.timestamp}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}