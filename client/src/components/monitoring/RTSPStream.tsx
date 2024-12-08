import { useEffect, useRef, useState } from 'react';
import FaceDetectionOverlay from './FaceDetectionOverlay';

interface RTSPStreamProps {
    streamUrl: string;
    fallbackIndex?: number;
    style?: React.CSSProperties;
}

export default function RTSPStream({ streamUrl, fallbackIndex = 0, style }: RTSPStreamProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [useFallback, setUseFallback] = useState(false);

    const getFallbackStream = (index: number) => {
        const fallbackStreams = [
            '/vids/1.mp4',
            '/vids/2.mp4',
            '/vids/3.mp4',
            '/vids/4.mp4',
            '/vids/5.mp4',
            '/vids/6.mp4'
        ];
        return fallbackStreams[index % fallbackStreams.length];
    };

    const handleStreamError = () => {
        if (!videoRef.current) return;
        console.log('Stream error, switching to fallback video');
        setUseFallback(true);
        const fallbackUrl = getFallbackStream(fallbackIndex);
        videoRef.current.src = fallbackUrl;
        videoRef.current.play().catch(err => {
            console.error('Error playing fallback video:', err);
        });
    };

    useEffect(() => {
        if (!videoRef.current) return;
        const video = videoRef.current;

        setUseFallback(false);
        setIsPlaying(false);

        const playVideo = async () => {
            try {
                if (streamUrl.startsWith('rtsp://')) {
                    handleStreamError();
                } else {
                    video.src = streamUrl;
                    await video.play();
                    setIsPlaying(true);
                }
            } catch (error) {
                console.error('Error playing video:', error);
                handleStreamError();
            }
        };

        playVideo();

        video.onplay = () => setIsPlaying(true);
        video.onpause = () => setIsPlaying(false);
        video.onerror = handleStreamError;

        return () => {
            video.onplay = null;
            video.onpause = null;
            video.onerror = null;
            video.src = '';
        };
    }, [streamUrl, fallbackIndex]);

    return (
        <div className="relative">
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                loop={useFallback}
                style={style}
                className="w-full h-full object-contain"
            />
            {isPlaying && <FaceDetectionOverlay videoRef={videoRef} />}
        </div>
    );
} 