import { Camera, Plus } from 'lucide-react';
import FaceApi from '../face-api/FaceApi';
import DetectionList from './DetectionList';

interface Camera {
    id: string;
    name: string;
    streamUrl: string;
    status: string;
    lastMotion: string;
}

interface Target {
    name: string;
    images: string[];
}

const cameras: Camera[] = [
    {
        id: '1',
        name: 'Front Door Camera',
        streamUrl: '/videos/1.mp4',
        status: 'Active',
        lastMotion: '2 mins ago'
    },
    {
        id: '2',
        name: 'Back Door Camera',
        streamUrl: '/videos/2.mp4',
        status: 'Active',
        lastMotion: '5 mins ago'
    },
    {
        id: '3',
        name: 'Garage Camera',
        streamUrl: '/videos/3.mp4',
        status: 'Active',
        lastMotion: '1 min ago'
    },
    {
        id: '4',
        name: 'Side Entrance',
        streamUrl: '/videos/4.mp4',
        status: 'Active',
        lastMotion: '1 min ago'
    },
    {
        id: '5',
        name: 'Parking Area',
        streamUrl: '/videos/5.mp4',
        status: 'Active',
        lastMotion: '1 min ago'
    },
    {
        id: '6',
        name: 'Main Gate',
        streamUrl: '/videos/6.mp4',
        status: 'Active',
        lastMotion: '1 min ago'
    }
];

const targets: Target[] = [
    {
        name: 'Aakarsh',
        images: ['/images/1.jpg']
    },
    {
        name: 'Vansh',
        images: ['/images/2.jpg', '/images/3.jpg']
    },
    {
        name: 'Anuj Garg',
        images: ['/images/Anuj-Garg-TP.jpg']
    },
    {
        name: 'Yogesh',
        images: ['/images/yogesh.png']
    },
];

export default function LiveMonitoring() {
    return (
        <div className="p-6">
            <div className="max-w-[2000px] mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <Camera className="w-6 h-6 text-blue-900" />
                        <h1 className="text-2xl font-bold">Live Monitoring</h1>
                    </div>

                    <button className="btn btn-primary flex items-center gap-1">
                        <Plus className="w-4 h-4 mr-2" />
                        <h1>Add Camera</h1>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {cameras.map((camera) => (
                            <div 
                                key={camera.id} 
                                className="bg-white rounded-lg shadow-lg overflow-hidden"
                            >
                                <div className="p-3 border-b">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium">{camera.name}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                                            ${camera.status === 'Active' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'}`}>
                                            {camera.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500">Last motion: {camera.lastMotion}</p>
                                </div>
                                
                                <div className="aspect-video relative">
                                    <FaceApi 
                                        videoUrl={camera.streamUrl}
                                        targets={targets}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="lg:col-span-1">
                        <DetectionList />
                    </div>
                </div>
            </div>
        </div>
    );
}