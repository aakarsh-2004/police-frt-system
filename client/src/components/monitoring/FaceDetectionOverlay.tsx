import { useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';

interface FaceDetectionOverlayProps {
    videoRef: React.RefObject<HTMLVideoElement>;
}

export default function FaceDetectionOverlay({ videoRef }: FaceDetectionOverlayProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const detectionIntervalRef = useRef<number>();
    const isModelLoaded = useRef(false);
    const processingRef = useRef(false);

    useEffect(() => {
        loadModels();
        return () => {
            if (detectionIntervalRef.current) {
                clearInterval(detectionIntervalRef.current);
            }
        };
    }, []);

    const loadModels = async () => {
        try {
            if (!isModelLoaded.current) {
                console.log('Loading face detection models...');
                await Promise.all([
                    faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
                    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
                    faceapi.nets.faceExpressionNet.loadFromUri('/models')
                ]);
                isModelLoaded.current = true;
                console.log('Face detection models loaded successfully');
                startDetection();
            }
        } catch (error) {
            console.error('Error loading face detection models:', error);
        }
    };

    const startDetection = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;

        // Ensure video is ready
        if (video.readyState !== 4) {
            video.addEventListener('loadeddata', () => {
                resizeCanvas();
                requestAnimationFrame(detectFaces);
            });
        } else {
            resizeCanvas();
            requestAnimationFrame(detectFaces);
        }
    };

    const resizeCanvas = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    };

    const detectFaces = async () => {
        if (!videoRef.current || !canvasRef.current || processingRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video.paused || video.ended || !document.hasFocus()) {
            requestAnimationFrame(detectFaces);
            return;
        }

        processingRef.current = true;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        try {
            // Improved detection options
            const options = new faceapi.SsdMobilenetv1Options({
                minConfidence: 0.7, // Increased confidence threshold
                maxResults: 10
            });

            // Full face detection with landmarks and expressions
            const detections = await faceapi.detectAllFaces(
                video, 
                options
            )
            .withFaceLandmarks()
            .withFaceExpressions();

            // Clear previous drawings
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (detections.length > 0) {
                detections.forEach(detection => {
                    const box = detection.detection.box;
                    const score = detection.detection.score;
                    
                    if (score > 0.7) { // Only show very confident detections
                        // Draw box outline only
                        ctx.strokeStyle = '#00ff00';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(
                            Math.floor(box.x),
                            Math.floor(box.y),
                            Math.floor(box.width),
                            Math.floor(box.height)
                        );

                        // Draw confidence score with background
                        const text = `${Math.round(score * 100)}%`;
                        ctx.font = 'bold 16px Arial';
                        const textWidth = ctx.measureText(text).width;

                        // Draw text background
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                        ctx.fillRect(
                            Math.floor(box.x),
                            Math.floor(box.y - 25),
                            textWidth + 10,
                            20
                        );

                        // Draw text
                        ctx.fillStyle = '#ffffff';
                        ctx.fillText(
                            text,
                            Math.floor(box.x + 5),
                            Math.floor(box.y - 10)
                        );

                        // Draw landmarks for better accuracy visualization
                        const landmarks = detection.landmarks;
                        ctx.fillStyle = '#00ff00';
                        for (let i = 0; i < landmarks.positions.length; i++) {
                            const point = landmarks.positions[i];
                            ctx.beginPath();
                            ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
                            ctx.fill();
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Detection error:', error);
        } finally {
            processingRef.current = false;
            requestAnimationFrame(detectFaces);
        }
    };

    return (
        <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{
                width: videoRef.current?.videoWidth || '100%',
                height: videoRef.current?.videoHeight || '100%'
            }}
        />
    );
} 