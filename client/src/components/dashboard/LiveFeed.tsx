import { useState, useRef, useEffect } from 'react';
import { Camera, ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react';
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
        url: 'https://res.cloudinary.com/dwbr9hz8y/video/upload/v1733857049/video-streams/qxwoko7wc4uw3tmitofu.mp4',
        title: 'Live Camera',
        location: 'Zone 1, MP Nagar',
        area: 'Bhopal, Madhya Pradesh',
        timestamp: '2024-03-14 10:30:45',
        recognitions: []
    },
    {
        id: '2',
        url: 'https://res.cloudinary.com/dwbr9hz8y/video/upload/v1733857048/video-streams/brxmrj94ban8ogy11joz.mp4',
        title: 'New Market Area',
        location: 'TT Nagar',
        area: 'Bhopal, Madhya Pradesh',
        timestamp: '2024-03-14 10:30:42',
        recognitions: []
    },
    {
        id: '3',
        url: 'https://res.cloudinary.com/dwbr9hz8y/video/upload/v1733857067/video-streams/c07yrolk5pgjzzozkav9.mp4',
        title: 'Habibganj Railway Station',
        location: 'Railway Station Area',
        area: 'Bhopal, Madhya Pradesh',
        timestamp: '2024-03-14 10:30:40',
        recognitions: []
    },
    {
        id: '4',
        url: 'https://res.cloudinary.com/dwbr9hz8y/video/upload/v1733857059/video-streams/xtyafumvlaumv1qwx8zi.mp4',
        title: 'DB Mall Entrance',
        location: 'Arera Colony',
        area: 'Bhopal, Madhya Pradesh',
        timestamp: '2024-03-14 10:30:38',
        recognitions: []
    },
    {
        id: '5',
        url: 'https://res.cloudinary.com/dwbr9hz8y/video/upload/v1733857059/video-streams/ooo5zlaghvpaasfkelr7.mp4',
        title: 'BHEL Gate',
        location: 'BHEL Township',
        area: 'Bhopal, Madhya Pradesh',
        timestamp: '2024-03-14 10:30:36',
        recognitions: []
    },
    {
        id: '6',
        url: 'https://res.cloudinary.com/dwbr9hz8y/video/upload/v1733857040/video-streams/of4txl6av0jqrdhgtzmb.mp4',
        title: 'Bittan Market',
        location: 'Bittan Market Area',
        area: 'Bhopal, Madhya Pradesh',
        timestamp: '2024-03-14 10:30:34',
        recognitions: []
    }
];

// Add sample stream URLs
const SAMPLE_STREAMS = [
    'ws://localhost:8083/stream/089d308e-9f69-421a-9126-247b9d10d80b/channel/0/mse?uuid=089d308e-9f69-421a-9126-247b9d10d80b&channel=0',
    'ws://localhost:8083/stream/82a7e76f-8595-4cd2-bd99-4b9e202d3c82/channel/0/mse?uuid=82a7e76f-8595-4cd2-bd99-4b9e202d3c82&channel=0',
    'ws://localhost:8083/stream/812f8675-dbbe-4025-873e-d0897268ec14/channel/0/mse?uuid=812f8675-dbbe-4025-873e-d0897268ec14&channel=0',
    'ws://localhost:8083/stream/a9017d91-845b-4f49-b0c6-9c334f1fe024/channel/0/mse?uuid=a9017d91-845b-4f49-b0c6-9c334f1fe024&channel=0',
    'ws://localhost:8083/stream/d9c94ff9-7edb-4629-8e46-3c3be0ff2b44/channel/0/mse?uuid=d9c94ff9-7edb-4629-8e46-3c3be0ff2b44&channel=0',
    'ws://localhost:8083/stream/c0220694-546b-49dd-8c77-93203ab904d5/channel/0/mse?uuid=c0220694-546b-49dd-8c77-93203ab904d5&channel=0'
];

interface CameraLocation {
    id: string;
    name: string;
    location: string;
}

const CAMERA_LOCATIONS: CameraLocation[] = [
    { id: '1', name: 'Live Camera', location: 'Zone 1, MP Nagar' },
    { id: '2', name: 'New Market Area', location: 'TT Nagar' },
    { id: '3', name: 'Habibganj Railway Station', location: 'Railway Station Area' },
    { id: '4', name: 'DB Mall Entrance', location: 'Arera Colony' },
    { id: '5', name: 'BHEL Gate', location: 'BHEL Township' },
    { id: '6', name: 'Bittan Market', location: 'Bittan Market Area' }
];

export default function LiveFeed() {
    const [selectedFeed, setSelectedFeed] = useState<VideoFeed>(videoFeeds[0]);
    const [showGrid, setShowGrid] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const containerRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const { t } = useTranslation();
    const { currentLanguage } = useLanguage();
    const [streamKey, setStreamKey] = useState(0);
    const [view, setView] = useState<'grid' | 'single' | 'priority'>('grid');
    const [priorityCamera, setPriorityCamera] = useState<string>(CAMERA_LOCATIONS[0].id);

    const [videoControls, setVideoControls] = useState<Record<string, {
        zoom: number;
        rotation: number;
    }>>(() => {
        // Initialize controls for all possible videos
        const initialControls: Record<string, { zoom: number; rotation: number }> = {};
        
        // Initialize for grid view
        videoFeeds.forEach((_, index) => {
            initialControls[`grid-video-${index + 1}`] = { zoom: 1, rotation: 0 };
        });
        
        // Initialize for single view
        videoFeeds.forEach((_, index) => {
            initialControls[`single-video-${index + 1}`] = { zoom: 1, rotation: 0 };
        });
        
        return initialControls;
    });

    const handleCameraClick = (feed: VideoFeed, index: number) => {
        setSelectedFeed(feed);
        setSelectedIndex(index);
        setShowGrid(false);
        setStreamKey(prev => prev + 1);
    };

    const handlePrevStream = () => {
        const prevIndex = selectedIndex === 0 ? videoFeeds.length - 1 : selectedIndex - 1;
        setSelectedIndex(prevIndex);
        setSelectedFeed(videoFeeds[prevIndex]);
        setStreamKey(prev => prev + 1);
    };

    const handleNextStream = () => {
        const nextIndex = selectedIndex === videoFeeds.length - 1 ? 0 : selectedIndex + 1;
        setSelectedIndex(nextIndex);
        setSelectedFeed(videoFeeds[nextIndex]);
        setStreamKey(prev => prev + 1);
    };

    // Video controls handlers
    const handleZoomIn = (videoId: string) => {
        setVideoControls(prev => {
            const currentControls = prev[videoId] || { zoom: 1, rotation: 0 };
            return {
                ...prev,
                [videoId]: {
                    ...currentControls,
                    zoom: Math.min(currentControls.zoom + 0.1, 2)
                }
            };
        });
    };

    const handleZoomOut = (videoId: string) => {
        setVideoControls(prev => {
            const currentControls = prev[videoId] || { zoom: 1, rotation: 0 };
            return {
                ...prev,
                [videoId]: {
                    ...currentControls,
                    zoom: Math.max(currentControls.zoom - 0.1, 0.5)
                }
            };
        });
    };

    const handleRotate = (videoId: string) => {
        setVideoControls(prev => {
            const currentControls = prev[videoId] || { zoom: 1, rotation: 0 };
            return {
                ...prev,
                [videoId]: {
                    ...currentControls,
                    rotation: (currentControls.rotation + 90) % 360
                }
            };
        });
    };

    const getVideoStyle = (videoId: string) => {
        const controls = videoControls[videoId] || { zoom: 1, rotation: 0 };
        return {
            transform: `scale(${controls.zoom}) rotate(${controls.rotation}deg)`,
            transition: 'transform 0.3s ease'
        };
    };

    const getSecondaryFeeds = () => {
        const otherFeeds = videoFeeds.filter(feed => feed.id !== priorityCamera);
        return otherFeeds.slice(0, 3); // Get only 3 cameras
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
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setView('grid')}
                            className={`px-3 py-1 rounded-lg text-sm ${
                                view === 'grid' ? 'bg-blue-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {currentLanguage === 'en' ? 'Grid View' : t('dashboard.liveFeed.gridView')}
                        </button>
                        <button
                            onClick={() => setView('single')}
                            className={`px-3 py-1 rounded-lg text-sm ${
                                view === 'single' ? 'bg-blue-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {currentLanguage === 'en' ? 'Single View' : t('dashboard.liveFeed.singleView')}
                        </button>
                        <button
                            onClick={() => setView('priority')}
                            className={`px-3 py-1 rounded-lg text-sm ${
                                view === 'priority' ? 'bg-blue-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            Event View
                        </button>
                    </div>

                    {view === 'priority' && (
                        <select
                            value={priorityCamera}
                            onChange={(e) => setPriorityCamera(e.target.value)}
                            className="px-3 py-1 rounded-lg text-sm border dark:border-gray-700 dark:bg-gray-800"
                        >
                            {CAMERA_LOCATIONS.map(camera => (
                                <option key={camera.id} value={camera.id}>
                                    {camera.name} - {camera.location}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {view === 'priority' ? (
                <div className="p-2 h-[calc(100%-60px)] flex flex-col gap-2">
                    <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden">
                        <RTSPStream
                            key={`priority-main-${priorityCamera}`}
                            id={`priority-video-${priorityCamera}`}
                            streamUrl={SAMPLE_STREAMS[parseInt(priorityCamera) - 1]}
                            style={getVideoStyle(`priority-video-${priorityCamera}`)}
                        />
                    </div>
                    
                    <div className="h-1/4 grid grid-cols-3 gap-2">
                        {getSecondaryFeeds().map((feed, index) => (
                            <div key={feed.id} className="bg-gray-900 rounded-lg overflow-hidden">
                                <RTSPStream
                                    key={`priority-secondary-${feed.id}`}
                                    id={`priority-secondary-${feed.id}`}
                                    streamUrl={SAMPLE_STREAMS[parseInt(feed.id) - 1]}
                                    style={getVideoStyle(`priority-secondary-${feed.id}`)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                showGrid ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 p-2">
                        {videoFeeds.map((feed, index) => (
                            <div 
                                key={feed.id} 
                                className="relative h-[190px] bg-gray-900 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all" 
                                onClick={() => handleCameraClick(feed, index)}
                            >
                                <RTSPStream
                                    key={`grid-${index}`}
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
                                key={`single-${streamKey}`}
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
                                    onFullScreen={() => {
                                        const videoContainer = containerRefs.current[`video-${selectedIndex + 1}`];
                                        if (videoContainer?.requestFullscreen) {
                                            videoContainer.requestFullscreen();
                                        }
                                    }}
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
                )
            )}
        </div>
    );
}