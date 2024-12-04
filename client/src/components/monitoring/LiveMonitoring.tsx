import { useState, useEffect, useRef } from 'react';
import { Camera, Plus } from 'lucide-react';
import FaceApi from '../face-api/FaceApi';
import DetectionList from './DetectionList';
import axios from 'axios';
import config from '../../config/config';
import { v4 as uuidv4 } from 'uuid';
import { Detection } from './types';
import RTSPStream from './RTSPStream';

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
    suspect?: {
        foundStatus: boolean;
        riskLevel: string;
    };
    missingPerson?: {
        foundStatus: boolean;
    };
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

    // MSE refs for video 1
    const videoRef1 = useRef<HTMLVideoElement>(null);
    const mseQueue1 = useRef<ArrayBuffer[]>([]);
    const mseSourceBuffer1 = useRef<SourceBuffer | null>(null);
    const mseStreamingStarted1 = useRef<boolean>(false);

    // MSE refs for video 2
    const videoRef2 = useRef<HTMLVideoElement>(null);
    const mseQueue2 = useRef<ArrayBuffer[]>([]);
    const mseSourceBuffer2 = useRef<SourceBuffer | null>(null);
    const mseStreamingStarted2 = useRef<boolean>(false);

    // Add WebSocket refs to maintain connection
    const ws1Ref = useRef<WebSocket | null>(null);
    const ws2Ref = useRef<WebSocket | null>(null);
    const mseRef1 = useRef<MediaSource | null>(null);
    const mseRef2 = useRef<MediaSource | null>(null);

    const pushPacket = (
        mseQueue: React.MutableRefObject<ArrayBuffer[]>,
        mseSourceBuffer: React.MutableRefObject<SourceBuffer | null>,
        mseStreamingStarted: React.MutableRefObject<boolean>
    ) => {
        if (!mseSourceBuffer.current) return;

        if (!mseSourceBuffer.current.updating) {
            if (mseQueue.current.length > 0) {
                const packet = mseQueue.current.shift();
                if (packet) {
                    mseSourceBuffer.current.appendBuffer(packet);
                }
            } else {
                mseStreamingStarted.current = false;
            }
        }
    };

    const readPacket = (
        packet: ArrayBuffer,
        mseQueue: React.MutableRefObject<ArrayBuffer[]>,
        mseSourceBuffer: React.MutableRefObject<SourceBuffer | null>,
        mseStreamingStarted: React.MutableRefObject<boolean>
    ) => {
        if (!mseSourceBuffer.current) return;

        if (!mseStreamingStarted.current) {
            mseSourceBuffer.current.appendBuffer(packet);
            mseStreamingStarted.current = true;
            return;
        }

        mseQueue.current.push(packet);
        if (!mseSourceBuffer.current.updating) {
            pushPacket(mseQueue, mseSourceBuffer, mseStreamingStarted);
        }
    };

    const startPlay = (
        videoEl: HTMLVideoElement,
        url: string,
        mseQueue: React.MutableRefObject<ArrayBuffer[]>,
        mseSourceBuffer: React.MutableRefObject<SourceBuffer | null>,
        mseStreamingStarted: React.MutableRefObject<boolean>,
        wsRef: React.MutableRefObject<WebSocket | null>,
        mseRef: React.MutableRefObject<MediaSource | null>
    ) => {
        try {
            // Create MediaSource
            const mse = new MediaSource();
            mseRef.current = mse;
            videoEl.src = URL.createObjectURL(mse);

            mse.addEventListener('sourceopen', () => {
                console.log('MediaSource opened');
                
                // Create WebSocket connection
                const ws = new WebSocket(url);
                wsRef.current = ws;
                ws.binaryType = 'arraybuffer';

                ws.onopen = () => {
                    console.log('WebSocket connected to:', url);
                };

                ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                };

                ws.onclose = () => {
                    console.log('WebSocket closed for:', url);
                    // Attempt to reconnect after a delay
                    setTimeout(() => {
                        if (videoEl) {
                            startPlay(videoEl, url, mseQueue, mseSourceBuffer, mseStreamingStarted, wsRef, mseRef);
                        }
                    }, 5000);
                };

                ws.onmessage = (event) => {
                    const data = new Uint8Array(event.data);
                    if (data[0] === 9) {
                        let mimeCodec;
                        const decodedArr = data.slice(1);
                        mimeCodec = new TextDecoder('utf-8').decode(decodedArr);
                        console.log('Mime codec:', mimeCodec);

                        try {
                            mseSourceBuffer.current = mse.addSourceBuffer('video/mp4; codecs="' + mimeCodec + '"');
                            mseSourceBuffer.current.mode = 'segments';
                            mseSourceBuffer.current.addEventListener('updateend', () => {
                                pushPacket(mseQueue, mseSourceBuffer, mseStreamingStarted);
                            });
                        } catch (e) {
                            console.error('Error adding source buffer:', e);
                        }
                    } else {
                        readPacket(event.data, mseQueue, mseSourceBuffer, mseStreamingStarted);
                    }
                };
            });

            mse.addEventListener('sourceended', () => {
                console.log('MediaSource ended');
            });

            mse.addEventListener('sourceclose', () => {
                console.log('MediaSource closed');
            });

        } catch (error) {
            console.error('Error starting playback:', error);
        }
    };

    useEffect(() => {
        if (!videoRef1.current || !videoRef2.current) return;

        const url1 = document.querySelector<HTMLInputElement>('#mse-url1')?.value;
        const url2 = document.querySelector<HTMLInputElement>('#mse-url2')?.value;

        if (url1) {
            startPlay(
                videoRef1.current, 
                url1, 
                mseQueue1, 
                mseSourceBuffer1, 
                mseStreamingStarted1,
                ws1Ref,
                mseRef1
            );
        }

        if (url2) {
            startPlay(
                videoRef2.current, 
                url2, 
                mseQueue2, 
                mseSourceBuffer2, 
                mseStreamingStarted2,
                ws2Ref,
                mseRef2
            );
        }

        // Cleanup function
        return () => {
            // Close WebSocket connections
            if (ws1Ref.current) {
                ws1Ref.current.close();
            }
            if (ws2Ref.current) {
                ws2Ref.current.close();
            }

            // Close MediaSource
            if (mseRef1.current && mseRef1.current.readyState === 'open') {
                mseRef1.current.endOfStream();
            }
            if (mseRef2.current && mseRef2.current.readyState === 'open') {
                mseRef2.current.endOfStream();
            }
        };
    }, []);

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
        cameraId: cameras[0].id,
        type: person.type,
        isSuspect: person.suspect !== null,
        isMissing: person.missingPerson !== null
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
        type: string;
    }) => {
        const person = persons.find(p => p.id === detection.personId);
        if (!person) return;

        const newDetection: Detection = {
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            confidence: detection.confidence,
            location: detection.camera.name,
            cameraId: detection.camera.id,
            type: person.type,
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
            formData.append('type', person.type);
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
                        <Camera className="w-6 h-6 text-blue-900 dark:text-blue-500" />
                        <h1 className="text-2xl font-bold dark:text-white">Live Monitoring</h1>
                    </div>

                    <button className="btn btn-primary flex items-center gap-1">
                        <Plus className="w-4 h-4 mr-2" />
                        <h1>Add Camera</h1>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        <div className="aspect-video relative bg-gray-900">
                            <RTSPStream
                                id="mse-video1"
                                streamUrl="ws://localhost:8083/stream/a8d21378-0eac-4db4-a9ff-d73d19054d5e/channel/0/mse?uuid=a8d21378-0eac-4db4-a9ff-d73d19054d5e&channel=0"
                            />
                        </div>

                        <div className="aspect-video relative bg-gray-900">
                            <RTSPStream
                                id="mse-video2"
                                streamUrl="ws://localhost:8083/stream/f4604be9-bea2-44e1-af7c-609ae9a2f7c1/channel/0/mse?uuid=f4604be9-bea2-44e1-af7c-609ae9a2f7c1&channel=0"
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <DetectionList detections={detections} />
                    </div>
                </div>
            </div>
        </div>
    );
}