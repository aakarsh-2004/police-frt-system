import { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "face-api.js";
import VideoControls from "../video/VideoControls";

interface Target {
    name: string;
    images: string[];
}

interface FaceApiProps {
    videoUrl: string;
    targets: Target[];
    onDetection: (
        name: string, 
        confidence: number, 
        personImageUrl: string,
        capturedFrame: string
    ) => void;
}

const FaceApi: React.FC<FaceApiProps> = ({ videoUrl, targets, onDetection }) => {

    const [modelsLoaded, setModelsLoaded] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [detectedName, setDetectedName] = useState<string>("Unknown");
    const [faceMatcher, setFaceMatcher] = useState<faceapi.FaceMatcher | null>(null);
    const [videoPlaying, setVideoPlaying] = useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [greeting, setGreeting] = useState<string>("");
    const [isRecognized, setIsRecognized] = useState<boolean>(false);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    

    // Load models
    useEffect(() => {
        const loadModels = async () => {
            try {
                console.log("Starting to load models...");
                const MODEL_URL = '/models';

                // Load models one by one with verification
                await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
                console.log("SSD Mobilenet model loaded");

                await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
                console.log("Face Recognition model loaded");

                await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
                console.log("Face Landmark model loaded");

                // Verify models are loaded
                if (
                    faceapi.nets.ssdMobilenetv1.isLoaded &&
                    faceapi.nets.faceRecognitionNet.isLoaded &&
                    faceapi.nets.faceLandmark68Net.isLoaded
                ) {
                    console.log("All models loaded successfully");
                    setModelsLoaded(true);
                } else {
                    throw new Error("Models not loaded properly");
                }
            } catch (error) {
                console.error("Error loading models:", error);
                alert("Error loading face detection models. Please refresh the page.");
            }
        };

        loadModels();
    }, []);

    // Modify the loadImages function to handle multiple targets
    useEffect(() => {
        const loadImages = async () => {
            try {
                if (!targets || targets.length === 0) {
                    console.error("No targets data provided");
                    return;
                }

                const labeledDescriptors = await Promise.all(
                    targets.map(async (target) => {
                        const descriptors = await Promise.all(
                            target.images.map(async (imagePath) => {
                                try {
                                    const img = await faceapi.fetchImage(imagePath);
                                    const detection = await faceapi
                                        .detectSingleFace(img)
                                        .withFaceLandmarks()
                                        .withFaceDescriptor();

                                    if (!detection) {
                                        console.warn(`No face detected in ${imagePath}`);
                                        return null;
                                    }
                                    return detection.descriptor;
                                } catch (error) {
                                    console.error(`Error processing image ${imagePath}:`, error);
                                    return null;
                                }
                            })
                        );

                        const validDescriptors = descriptors.filter(desc => desc !== null);

                        if (validDescriptors.length === 0) {
                            console.warn(`No valid faces detected for ${target.name}`);
                            return null;
                        }

                        return new faceapi.LabeledFaceDescriptors(
                            target.name,
                            validDescriptors
                        );
                    })
                );

                const validLabeledDescriptors = labeledDescriptors.filter(desc => desc !== null);
                
                if (validLabeledDescriptors.length > 0) {
                    const faceMatcher = new faceapi.FaceMatcher(validLabeledDescriptors, 0.6);
                    setFaceMatcher(faceMatcher);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error loading images:", error);
                setLoading(false);
            }
        };

        if (modelsLoaded) {
            loadImages();
        }
    }, [modelsLoaded, targets]);

    // Replace webcam-related functions with video functions
    const startVideo = async (): Promise<void> => {
        try {
            if (videoRef.current) {
                await videoRef.current.play();
                setVideoPlaying(true);
                console.log("Video started playing");
            }
        } catch (err) {
            console.error("Error playing video:", err);
        }
    };

    // Modify the recognition useEffect
    useEffect(() => {
        let recognitionInterval;

        const startRecognition = async () => {
            if (!videoRef.current || !canvasRef.current || !faceMatcher) {
                console.log("Missing requirements:", {
                    video: !!videoRef.current,
                    canvas: !!canvasRef.current,
                    matcher: !!faceMatcher
                });
                return;
            }

            const video = videoRef.current;
            const canvas = canvasRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            recognitionInterval = setInterval(async () => {
                try {
                    if (video.paused || video.ended) return;

                    const detections = await faceapi
                        .detectAllFaces(video, new faceapi.SsdMobilenetv1Options({
                            minConfidence: 0.3
                        }))
                        .withFaceLandmarks()
                        .withFaceDescriptors();

                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    if (detections.length > 0) {
                        // Get the display size based on the video element's dimensions
                        const displaySize = {
                            width: video.offsetWidth,
                            height: video.offsetHeight
                        };

                        // Match canvas dimensions to video display size
                        if (canvas.width !== displaySize.width || canvas.height !== displaySize.height) {
                            faceapi.matchDimensions(canvas, displaySize);
                        }

                        // Resize detections to match display size
                        const resizedDetections = faceapi.resizeResults(detections, displaySize);

                        const detectedNames = [];

                        resizedDetections.forEach(detection => {
                            const match = faceMatcher.findBestMatch(detection.descriptor);
                            detectedNames.push(match.label);

                            const box = detection.detection.box;
                            const drawBox = new faceapi.draw.DrawBox(box, {
                                label: `${match.label} (${Math.round((1 - match.distance) * 100)}%)`,
                                lineWidth: 3,
                                boxColor: match.label !== 'unknown' ? 'green' : 'red',
                                drawLabelOptions: {
                                    fontSize: 10,
                                    fontStyle: 'bold',
                                    padding: 10,
                                    backgroundColor: 'rgba(0, 0, 0, 0.7)'
                                }
                            });
                            drawBox.draw(canvas);

                            if (match.label !== 'unknown' && match.distance < 0.6) {
                                const target = targets.find(t => t.name === match.label);
                                if (target) {
                                    // Capture the current frame
                                    const captureCanvas = document.createElement('canvas');
                                    captureCanvas.width = video.videoWidth;
                                    captureCanvas.height = video.videoHeight;
                                    const ctx = captureCanvas.getContext('2d');
                                    ctx?.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
                                    
                                    // Get the frame as data URL
                                    const capturedFrame = captureCanvas.toDataURL('image/jpeg');

                                    onDetection(
                                        match.label,
                                        (1 - match.distance) * 100,
                                        target.images[0],
                                        capturedFrame  // Add captured frame
                                    );
                                }
                            }
                        });

                        // Update detected names and greeting
                        setDetectedName(detectedNames.join(', '));
                        setIsRecognized(detectedNames.some(name => name !== 'unknown'));
                    } else {
                        setDetectedName("Unknown");
                        setIsRecognized(false);
                    }
                } catch (error) {
                    console.error('Detection error:', error);
                }
            }, 100);
        };

        if (modelsLoaded && faceMatcher && videoPlaying) {
            startRecognition();
        }

        return () => {
            if (recognitionInterval) {
                clearInterval(recognitionInterval);
            }
        };
    }, [modelsLoaded, faceMatcher, videoPlaying, targets, onDetection]);

    // Add this effect to start video after models are loaded
    useEffect(() => {
        if (modelsLoaded && videoRef.current) {
            console.log("Models loaded, starting video...");
            startVideo();
        }
    }, [modelsLoaded]);

    useEffect(() => {
        if (modelsLoaded && videoRef.current) {
            console.log("Models loaded, video ready");
            videoRef.current.addEventListener('play', () => setIsPlaying(true));
            videoRef.current.addEventListener('pause', () => setIsPlaying(false));
            videoRef.current.addEventListener('ended', () => {
                setIsPlaying(false);
                videoRef.current.play();  // Automatically restart
            });
        }
    }, [modelsLoaded]);

    const handleZoomIn = useCallback(() => {
        setZoom(prev => Math.min(prev + 0.1, 2));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom(prev => Math.max(prev - 0.1, 0.5));
    }, []);

    const handleRotate = useCallback(() => {
        setRotation(prev => (prev + 90) % 360);
    }, []);

    const handleFullScreen = useCallback(() => {
        if (!containerRef.current) return;

        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            containerRef.current.requestFullscreen();
        }
    }, []);

    return (
        <div 
            ref={containerRef} 
            className="relative w-full h-full"
        >
            <video
                ref={videoRef}
                src={videoUrl}
                playsInline
                muted
                loop
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transition: 'transform 0.3s ease'
                }}
            />
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transition: 'transform 0.3s ease'
                }}
            />
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
                    <div>Loading...</div>
                </div>
            )}
            <VideoControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onRotate={handleRotate}
                onFullScreen={handleFullScreen}
            />
        </div>
    );
};

export default FaceApi;