import { useState } from 'react';
import { Camera, ChevronLeft, ChevronRight } from 'lucide-react';
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

const RTSP_STREAMS = [
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
    const [videoControls, setVideoControls] = useState<Record<string, { zoom: number; rotation: number }>>({});
    const [selectedStreamUrl, setSelectedStreamUrl] = useState(RTSP_STREAMS[0]);
    const { t } = useTranslation();
    const { currentLanguage } = useLanguage();

    const getVideoStyle = (videoId: string) => {
        const controls = videoControls[videoId] || { zoom: 100, rotation: 0 };
        return {
            transform: `scale(${controls.zoom / 100}) rotate(${controls.rotation}deg)`,
            transition: 'transform 0.3s ease',
            transformOrigin: 'center',
            width: '100%',
            height: '100%',
            objectFit: 'contain' as const
        };
    };

    const handleZoomIn = (videoId: string) => {
        setVideoControls(prev => ({
            ...prev,
            [videoId]: {
                ...prev[videoId] || { rotation: 0 },
                zoom: Math.min((prev[videoId]?.zoom || 100) + 25, 300)
            }
        }));
    };

    const handleZoomOut = (videoId: string) => {
        setVideoControls(prev => ({
            ...prev,
            [videoId]: {
                ...prev[videoId] || { rotation: 0 },
                zoom: Math.max((prev[videoId]?.zoom || 100) - 25, 50)
            }
        }));
    };

    const handleRotate = (videoId: string) => {
        setVideoControls(prev => ({
            ...prev,
            [videoId]: {
                ...prev[videoId] || { zoom: 100 },
                rotation: ((prev[videoId]?.rotation || 0) + 90) % 360
            }
        }));
    };

    const handleFullScreen = async (videoId: string) => {
        try {
            const videoContainer = document.getElementById(videoId)?.closest('.relative.aspect-video');
            if (!videoContainer) return;

            if (!document.fullscreenElement) {
                if (videoContainer.requestFullscreen) {
                    await videoContainer.requestFullscreen();
                } else if ((videoContainer as any).webkitRequestFullscreen) {
                    await (videoContainer as any).webkitRequestFullscreen();
                } else if ((videoContainer as any).msRequestFullscreen) {
                    await (videoContainer as any).msRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if ((document as any).webkitExitFullscreen) {
                    await (document as any).webkitExitFullscreen();
                } else if ((document as any).msExitFullscreen) {
                    await (document as any).msExitFullscreen();
                }
            }
        } catch (error) {
            console.error('Error toggling fullscreen:', error);
        }
    };

    const handleCameraClick = (feed: VideoFeed, index: number) => {
        setSelectedFeed(feed);
        setSelectedStreamUrl(RTSP_STREAMS[index]);
        setShowGrid(false);
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800 h-[calc(100vh-16rem)]">
            <div className="flex items-center justify-between mb-4">
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

            <div className="h-[calc(100%-3.5rem)]">
                {showGrid ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 h-full">
                        {RTSP_STREAMS.map((streamUrl, index) => (
                            <div 
                                key={index} 
                                className="relative w-full h-[180px] pb-[56.25%] bg-gray-900 rounded-lg overflow-hidden cursor-pointer group hover:ring-2 hover:ring-blue-500/50 transition-all"
                                onClick={() => handleCameraClick(videoFeeds[index], index)}
                            >
                                <div className="absolute inset-0">
                                    <RTSPStream
                                        id={`dashboard-video-${index + 1}`}
                                        streamUrl={streamUrl}
                                        fallbackIndex={index}
                                        style={{
                                            ...getVideoStyle(`dashboard-video-${index + 1}`),
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                    <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-b from-black/50 to-transparent">
                                        <div className="flex items-center justify-between text-white">
                                            <span className="text-sm font-medium">{videoFeeds[index].title}</span>
                                            <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                                                {t('dashboard.liveFeed.live')}
                                            </span>
                                        </div>
                                    </div>
                                    <VideoControls
                                        onZoomIn={() => handleZoomIn(`dashboard-video-${index + 1}`)}
                                        onZoomOut={() => handleZoomOut(`dashboard-video-${index + 1}`)}
                                        onRotate={() => handleRotate(`dashboard-video-${index + 1}`)}
                                        onFullScreen={() => handleFullScreen(`dashboard-video-${index + 1}`)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="relative h-full w-full">
                        <div className="absolute inset-0 rounded-lg overflow-hidden bg-gray-900">
                            <RTSPStream
                                id={selectedFeed.id}
                                streamUrl={selectedStreamUrl}
                                fallbackIndex={videoFeeds.findIndex(f => f.id === selectedFeed.id)}
                                style={{
                                    ...getVideoStyle(selectedFeed.id),
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain'
                                }}
                            />
                            <VideoControls
                                onZoomIn={() => handleZoomIn(selectedFeed.id)}
                                onZoomOut={() => handleZoomOut(selectedFeed.id)}
                                onRotate={() => handleRotate(selectedFeed.id)}
                                onFullScreen={() => handleFullScreen(selectedFeed.id)}
                            />

                        </div>

                        {/* Navigation Buttons */}
                        <button
                            onClick={() => {
                                const currentIndex = videoFeeds.findIndex(f => f.id === selectedFeed.id);
                                const prevIndex = currentIndex === 0 ? videoFeeds.length - 1 : currentIndex - 1;
                                setSelectedFeed(videoFeeds[prevIndex]);
                                setSelectedStreamUrl(RTSP_STREAMS[prevIndex]);
                            }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/75 transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => {
                                const currentIndex = videoFeeds.findIndex(f => f.id === selectedFeed.id);
                                const nextIndex = currentIndex === videoFeeds.length - 1 ? 0 : currentIndex + 1;
                                setSelectedFeed(videoFeeds[nextIndex]);
                                setSelectedStreamUrl(RTSP_STREAMS[nextIndex]);
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/75 transition-colors"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}