import { useState, useEffect } from 'react';
import { Camera, ChevronLeft, ChevronRight, User, MapPin, Clock, Shield } from 'lucide-react';
import config from '../../config/config';

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

export default function LiveFeed() {
    const [selectedFeed, setSelectedFeed] = useState<VideoFeed>(videoFeeds[0]);
    const [showGrid, setShowGrid] = useState(true);

    return (
        <div className="card">
            <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Camera className="w-5 h-5 text-blue-900" />
                    <h2 className="text-lg font-semibold">Live Surveillance Feed</h2>
                </div>
                <button
                    onClick={() => setShowGrid(!showGrid)}
                    className="btn btn-secondary text-sm"
                >
                    {showGrid ? 'Single View' : 'Grid View'}
                </button>
            </div>

            {showGrid ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    {videoFeeds.map((feed) => (
                        <div
                            key={feed.id}
                            className="relative aspect-video rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500"
                            onClick={() => {
                                setSelectedFeed(feed);
                                setShowGrid(false);
                            }}
                        >
                            <video
                                src={feed.url}
                                autoPlay
                                muted
                                loop
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent">
                                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium text-sm">{feed.title}</h3>
                                            <p className="text-xs opacity-75">{feed.location}</p>
                                        </div>
                                        <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                                            Live
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="relative">
                    <div className="card">
                        <div className="aspect-video bg-gray-900">
                            <video
                                src={selectedFeed.url}
                                autoPlay
                                muted
                                loop
                                className="w-full h-full object-cover"
                            />
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
                                        Live
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