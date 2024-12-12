import { useState, useEffect, useRef } from 'react';
import { Camera, Plus } from 'lucide-react';
import DetectionList from './DetectionList';
import axios from 'axios';
import config from '../../config/config';
import { v4 as uuidv4 } from 'uuid';
import { Detection } from './types';
import RTSPStream from './RTSPStream';
import VideoControls from '../video/VideoControls';

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

const SAMPLE_STREAMS = [
    'ws://localhost:8083/stream/089d308e-9f69-421a-9126-247b9d10d80b/channel/0/mse?uuid=089d308e-9f69-421a-9126-247b9d10d80b&channel=0',
    'ws://localhost:8083/stream/82a7e76f-8595-4cd2-bd99-4b9e202d3c82/channel/0/mse?uuid=82a7e76f-8595-4cd2-bd99-4b9e202d3c82&channel=0',
    'ws://localhost:8083/stream/812f8675-dbbe-4025-873e-d0897268ec14/channel/0/mse?uuid=812f8675-dbbe-4025-873e-d0897268ec14&channel=0',
    'ws://localhost:8083/stream/a9017d91-845b-4f49-b0c6-9c334f1fe024/channel/0/mse?uuid=a9017d91-845b-4f49-b0c6-9c334f1fe024&channel=0',
    'ws://localhost:8083/stream/d9c94ff9-7edb-4629-8e46-3c3be0ff2b44/channel/0/mse?uuid=d9c94ff9-7edb-4629-8e46-3c3be0ff2b44&channel=0',
    'ws://localhost:8083/stream/c0220694-546b-49dd-8c77-93203ab904d5/channel/0/mse?uuid=c0220694-546b-49dd-8c77-93203ab904d5&channel=0'
];

export default function LiveMonitoring() {
    const [persons, setPersons] = useState<Person[]>([]);
    const [detections, setDetections] = useState<Detection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const videoRef1 = useRef<HTMLVideoElement>(null);
    const mseQueue1 = useRef<ArrayBuffer[]>([]);
    const mseSourceBuffer1 = useRef<SourceBuffer | null>(null);
    const mseStreamingStarted1 = useRef<boolean>(false);

    const videoRef2 = useRef<HTMLVideoElement>(null);
    const mseQueue2 = useRef<ArrayBuffer[]>([]);
    const mseSourceBuffer2 = useRef<SourceBuffer | null>(null);
    const mseStreamingStarted2 = useRef<boolean>(false);

    const ws1Ref = useRef<WebSocket | null>(null);
    const ws2Ref = useRef<WebSocket | null>(null);
    const mseRef1 = useRef<MediaSource | null>(null);
    const mseRef2 = useRef<MediaSource | null>(null);

    const [videoControls, setVideoControls] = useState<Record<string, {
        zoom: number;
        rotation: number;
    }>>({});

    const containerRefs = useRef<Record<string, HTMLDivElement | null>>({});

    // Initialize controls for each camera
    useEffect(() => {
        const initialControls: Record<string, { zoom: number; rotation: number }> = {};
        SAMPLE_STREAMS.forEach((_, index) => {
            const videoId = `mse-video-${index + 1}`;
            initialControls[videoId] = { zoom: 1, rotation: 0 };
        });
        setVideoControls(initialControls);
    }, []);

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
            const mse = new MediaSource();
            mseRef.current = mse;
            videoEl.src = URL.createObjectURL(mse);

            mse.addEventListener('sourceopen', () => {
                console.log('MediaSource opened');
                
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

        return () => {
            if (ws1Ref.current) {
                ws1Ref.current.close();
            }
            if (ws2Ref.current) {
                ws2Ref.current.close();
            }

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
            const response = await fetch(detection.capturedFrame);
            const blob = await response.blob();
            const file = new File([blob], "capture.jpg", { type: "image/jpeg" });

            const formData = new FormData();
            formData.append('personId', detection.personId);
            formData.append('capturedLocation', detection.camera.name);
            formData.append('capturedDateTime', new Date().toISOString());
            formData.append('cameraId', detection.camera.id);
            formData.append('type', person.type);
            formData.append('confidenceScore', detection.confidence.toString());
            formData.append('capturedImage', file);

            // await axios.post(`${config.apiUrl}/api/recognitions`, formData, {
            //     headers: {
            //         'Content-Type': 'multipart/form-data',
            //     },
            // });

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

    const getVideoStyle = (id: string) => {
        const controls = videoControls[id] || { zoom: 1, rotation: 0 };
        return {
            transform: `scale(${controls.zoom}) rotate(${controls.rotation}deg)`,
            transition: 'transform 0.3s ease',
            width: '100%',
            height: '100%',
            objectFit: 'contain'
        };
    };

    const handleZoomIn = (id: string) => {
        setVideoControls(prev => {
            const currentControls = prev[id] || { zoom: 1, rotation: 0 };
            return {
                ...prev,
                [id]: {
                    ...currentControls,
                    zoom: Math.min(currentControls.zoom + 0.1, 2)
                }
            };
        });
    };

    const handleZoomOut = (id: string) => {
        setVideoControls(prev => {
            const currentControls = prev[id] || { zoom: 1, rotation: 0 };
            return {
                ...prev,
                [id]: {
                    ...currentControls,
                    zoom: Math.max(currentControls.zoom - 0.1, 0.5)
                }
            };
        });
    };

    const handleRotate = (id: string) => {
        setVideoControls(prev => {
            const currentControls = prev[id] || { zoom: 1, rotation: 0 };
            return {
                ...prev,
                [id]: {
                    ...currentControls,
                    rotation: (currentControls.rotation + 90) % 360
                }
            };
        });
    };

    const handleFullScreen = (id: string) => {
        const element = containerRefs.current[id];
        if (!element) return;

        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            element.requestFullscreen().catch(console.error);
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

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {SAMPLE_STREAMS.map((streamUrl, index) => {
                            const videoId = `mse-video-${index + 1}`;
                            return (
                                <div 
                                    key={index} 
                                    ref={el => containerRefs.current[videoId] = el}
                                    className="aspect-video relative bg-gray-900 rounded-lg overflow-hidden group"
                                >
                                    <div className="relative w-full h-full">
                                        <RTSPStream
                                            id={videoId}
                                            streamUrl={streamUrl}
                                            style={getVideoStyle(videoId)}
                                        />
                                        
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="absolute bottom-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <VideoControls
                                                    onZoomIn={() => handleZoomIn(videoId)}
                                                    onZoomOut={() => handleZoomOut(videoId)}
                                                    onRotate={() => handleRotate(videoId)}
                                                    onFullScreen={() => handleFullScreen(videoId)}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-b from-black/50 to-transparent">
                                            <div className="flex items-center justify-between text-white">
                                                <span className="text-sm font-medium">Camera {index + 1}</span>
                                                <div className="flex items-center space-x-2">
                                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                    <span className="text-xs">Live</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="lg:col-span-1">
                        <DetectionList detections={detections} />
                    </div>
                </div>
            </div>
        </div>
    );
}