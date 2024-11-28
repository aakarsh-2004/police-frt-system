import { useState, useEffect } from 'react';
import { Camera, Plus } from 'lucide-react';
import FaceApi from '../face-api/FaceApi';
import DetectionList from './DetectionList';
import axios from 'axios';
import config from '../../config/config';
import { v4 as uuidv4 } from 'uuid';
import { Detection } from './types';

interface Camera {
    id: string;
    name: string;
    streamUrl: string;
    status: string;
    lastMotion: string;
}

interface Person {
    id: string;
    firstName: string;
    lastName: string;
    personImageUrl: string;
    type: string;
}

interface PersonResponse {
    data: Person[];
    message: string;
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

export default function LiveMonitoring() {
    const [persons, setPersons] = useState<Person[]>([]);
    const [detections, setDetections] = useState<Detection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPersons = async () => {
            try {
                const response = await axios.get<{data: { data: Person[], message: string }}>(`${config.apiUrl}/api/persons`);
                console.log("API Response:", response.data);
                if (response.data && response.data.data) {
                    setPersons(response.data.data || []);
                } else {
                    console.error("Invalid API response structure:", response.data);
                    setPersons([]);
                }
                setError(null);
            } catch (err) {
                console.error('Error fetching persons:', err);
                setError('Failed to fetch persons data');
                setPersons([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPersons();
    }, []);

    // Convert persons to targets format for FaceApi
    const targets = persons?.filter(person => person.personImageUrl).map(person => ({
        name: `${person.firstName} ${person.lastName}`,
        images: [person.personImageUrl],
        personId: person.id,
        cameraId: cameras[0].id
    })) || [];
    
    console.log("Persons from API:", persons);
    console.log("Converted targets:", targets);

    const handleDetection = async (detection: {
        name: string;
        confidence: number;
        personImageUrl: string;
        camera: Camera;
        capturedFrame: string;
        personId: string;
    }) => {
        const newDetection: Detection = {
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            confidence: detection.confidence,
            location: detection.camera.name,
            cameraId: detection.camera.id,
            type: detection.confidence > 80 ? 'match' : 'suspicious',
            status: 'pending',
            suspectImage: detection.personImageUrl,
            matchedImage: detection.capturedFrame,
            personName: detection.name
        };

        try {
            // Convert base64 to file
            const response = await fetch(detection.capturedFrame);
            const blob = await response.blob();
            const file = new File([blob], "capture.jpg", { type: "image/jpeg" });

            // Create FormData
            const formData = new FormData();
            formData.append('personId', detection.personId);
            formData.append('capturedLocation', detection.camera.name);
            formData.append('capturedDateTime', new Date().toISOString());
            formData.append('cameraId', detection.camera.id);
            formData.append('type', detection.confidence > 80 ? 'match' : 'suspicious');
            formData.append('confidenceScore', detection.confidence.toString());
            formData.append('capturedImage', file);

            // Save to database
            await axios.post(`${config.apiUrl}/api/recognitions`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Update local state
            setDetections(prev => {
                const twentySecondsAgo = new Date(Date.now() - 20000);
                const recentDetections = prev.filter(d => 
                    new Date(d.timestamp) > twentySecondsAgo
                );
                return [newDetection, ...recentDetections];
            });
        } catch (error) {
            console.error('Failed to save recognition:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-red-500">
                {error}
            </div>
        );
    }

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
                                        onDetection={(name, confidence, personImageUrl, capturedFrame, personId, cameraId) => 
                                            handleDetection({
                                                name,
                                                confidence,
                                                personImageUrl,
                                                camera,
                                                capturedFrame,
                                                personId,
                                                cameraId
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="lg:col-span-1">
                        <DetectionList detections={detections} />
                    </div>
                </div>
            </div>
        </div>
    );
}