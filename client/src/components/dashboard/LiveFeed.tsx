import { useState } from 'react';
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
        url: '/videos/1.mp4',
        title: 'Live Camera',
        location: 'Zone 1, MP Nagar',
        area: 'Bhopal, Madhya Pradesh',
        timestamp: '2024-03-14 10:30:45',
        recognitions: []
    },
    {
        id: '2',
        url: '/videos/2.mp4',
        title: 'New Market Area',
        location: 'TT Nagar',
        area: 'Bhopal, Madhya Pradesh',
        timestamp: '2024-03-14 10:30:42',
        recognitions: []
    },
    {
        id: '3',
        url: '/videos/3.mp4',
        title: 'Habibganj Railway Station',
        location: 'Railway Station Area',
        area: 'Bhopal, Madhya Pradesh',
        timestamp: '2024-03-14 10:30:40',
        recognitions: []
    },
    {
        id: '4',
        url: '/videos/4.mp4',
        title: 'DB Mall Entrance',
        location: 'Arera Colony',
        area: 'Bhopal, Madhya Pradesh',
        timestamp: '2024-03-14 10:30:38',
        recognitions: []
    },
    {
        id: '5',
        url: '/videos/5.mp4',
        title: 'BHEL Gate',
        location: 'BHEL Township',
        area: 'Bhopal, Madhya Pradesh',
        timestamp: '2024-03-14 10:30:36',
        recognitions: []
    },
    {
        id: '6',
        url: '/videos/6.mp4',
        title: 'Bittan Market',
        location: 'Bittan Market Area',
        area: 'Bhopal, Madhya Pradesh',
        timestamp: '2024-03-14 10:30:34',
        recognitions: []
    }
];

// Add sample stream URLs
const SAMPLE_STREAMS = [
    'ws://localhost:8083/stream/a8d21378-0eac-4db4-a9ff-d73d19054d5e/channel/0/mse?uuid=a8d21378-0eac-4db4-a9ff-d73d19054d5e&channel=0',
    'ws://localhost:8083/stream/f4604be9-bea2-44e1-af7c-609ae9a2f7c1/channel/0/mse?uuid=f4604be9-bea2-44e1-af7c-609ae9a2f7c1&channel=0',
    'ws://localhost:8083/stream/60d0b153-545b-43c1-97ec-797161af2038/channel/0/mse?uuid=60d0b153-545b-43c1-97ec-797161af2038&channel=0',
    'ws://localhost:8083/stream/94019b3f-4541-4100-ae81-bd7bc319e3c8/channel/0/mse?uuid=94019b3f-4541-4100-ae81-bd7bc319e3c8&channel=0',
    'ws://localhost:8083/stream/a52feeeb-8cc7-418b-ad88-ae757d5a6433/channel/0/mse?uuid=a52feeeb-8cc7-418b-ad88-ae757d5a6433&channel=0',
    'ws://localhost:8083/stream/c0220694-546b-49dd-8c77-93203ab904d5/channel/0/mse?uuid=c0220694-546b-49dd-8c77-93203ab904d5&channel=0'
];

export default function LiveFeed() {
    const [selectedFeed, setSelectedFeed] = useState(videoFeeds[0]);
    const [showGrid, setShowGrid] = useState(true);
    const [videoControls, setVideoControls] = useState<Record<string, {
        zoom: number;
        rotation: number;
    }>>({});
    const { t } = useTranslation();
    const { currentLanguage } = useLanguage();

    const handleZoomIn = (id: string) => {
        setVideoControls(prev => {
            const currentZoom = prev[id]?.zoom || 1;
            return {
                ...prev,
                [id]: {
                    ...prev[id],
                    zoom: Math.min(currentZoom + 0.2, 3)
                }
            };
        });
    };

    const handleZoomOut = (id: string) => {
        setVideoControls(prev => {
            const currentZoom = prev[id]?.zoom || 1;
            return {
                ...prev,
                [id]: {
                    ...prev[id],
                    zoom: Math.max(currentZoom - 0.2, 0.5)
                }
            };
        });
    };

    const handleRotate = (id: string) => {
        setVideoControls(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                rotation: ((prev[id]?.rotation || 0) + 90) % 360
            }
        }));
    };

    const handleFullScreen = (id: string) => {
        const element = document.getElementById(id)?.parentElement;
        if (element?.requestFullscreen) {
            element.requestFullscreen();
        } else if ((element as any)?.webkitRequestFullscreen) {
            (element as any).webkitRequestFullscreen();
        } else if ((element as any)?.msRequestFullscreen) {
            (element as any).msRequestFullscreen();
        }
    };

    const getVideoStyle = (id: string) => {
        const controls = videoControls[id] || { zoom: 1, rotation: 0 };
        return {
            transform: `scale(${controls.zoom}) rotate(${controls.rotation}deg)`,
            transition: 'transform 0.3s ease',
            transformOrigin: 'center',
            width: '100%',
            height: '100%'
        };
    };

    const handleCameraClick = (feed: VideoFeed, index: number) => {
        setSelectedFeed(feed);
        setShowGrid(false);
    };

    return (
        <div className="card">
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
                            className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all" 
                            onClick={() => handleCameraClick(feed, index)}
                        >
                            <RTSPStream
                                id={`dashboard-video-${index + 1}`}
                                streamUrl={SAMPLE_STREAMS[index]}
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
                <div className="relative">
                    <div className="card">
                        <div className="aspect-video bg-gray-900">
                            <div className="relative w-full h-full">
                                <RTSPStream
                                    id="dashboard-single-video"
                                    streamUrl={SAMPLE_STREAMS[videoFeeds.indexOf(selectedFeed)]}
                                    style={getVideoStyle("dashboard-single-video")}
                                />
                                <div className="absolute bottom-4 right-4 flex space-x-2">
                                    <VideoControls
                                        onZoomIn={() => handleZoomIn("dashboard-single-video")}
                                        onZoomOut={() => handleZoomOut("dashboard-single-video")}
                                        onRotate={() => handleRotate("dashboard-single-video")}
                                        onFullScreen={() => handleFullScreen("dashboard-single-video")}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Overlay Information */}
                        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
                            {/* Top Bar */}
                            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
                                <div className="flex items-center">
                                    <Shield className="w-5 h-5 text-amber-400 mr-2" />
                                    <div>
                                        <h2 className="text-white font-semibold">{selectedFeed.title}</h2>
                                        <div className="flex items-center text-white/80 text-sm">
                                            <MapPin className="w-4 h-4 mr-1" />
                                            {selectedFeed.location}, {selectedFeed.area}
                                        </div>
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

                            {/* Recognition Overlays */}
                            {selectedFeed.recognitions.map((rec) => (
                                <div
                                    key={rec.id}
                                    className="absolute top-1/3 left-1/4 border-2 border-amber-400 rounded-lg p-2 bg-black/50 text-white"
                                >
                                    <div className="flex items-center space-x-2">
                                        <User className="w-4 h-4 text-amber-400" />
                                        <span className="text-xs font-medium">
                                            Match: {rec.confidence}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <button
                        onClick={() => {
                            const currentIndex = videoFeeds.findIndex(f => f.id === selectedFeed.id);
                            const prevIndex = currentIndex === 0 ? videoFeeds.length - 1 : currentIndex - 1;
                            setSelectedFeed(videoFeeds[prevIndex]);
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/75"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => {
                            const currentIndex = videoFeeds.findIndex(f => f.id === selectedFeed.id);
                            const nextIndex = currentIndex === videoFeeds.length - 1 ? 0 : currentIndex + 1;
                            setSelectedFeed(videoFeeds[nextIndex]);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/75"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            )}
        </div>
    );
}