import React, { useEffect, useRef, useState } from 'react';
import { getFallbackStream } from '../../utils/streamUtils';

interface RTSPStreamProps {
    streamUrl: string;
    id: string;
    style?: React.CSSProperties;
    fallbackIndex?: number;
}

export default function RTSPStream({ streamUrl, id, style, fallbackIndex = 0 }: RTSPStreamProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaSourceRef = useRef<MediaSource | null>(null);
    const sourceBufferRef = useRef<SourceBuffer | null>(null);
    const [useFallback, setUseFallback] = useState(false);
    const fallbackUrl = getFallbackStream(fallbackIndex);
    const wsRef = useRef<WebSocket | null>(null);
    const retryCountRef = useRef(0);
    const playAttemptRef = useRef<number | null>(null);

    const switchToFallback = async () => {
        if (!videoRef.current) return;
        
        try {
            setUseFallback(true);
            const video = videoRef.current;
            video.src = fallbackUrl;

            // Clear any existing play attempt timeout
            if (playAttemptRef.current) {
                clearTimeout(playAttemptRef.current);
            }

            // Add a small delay before attempting to play
            playAttemptRef.current = window.setTimeout(async () => {
                try {
                    await video.play();
                    console.log(`Fallback video playing for stream ${id}`);
                } catch (error) {
                    console.error(`Error playing fallback video for stream ${id}:`, error);
                }
            }, 100);

        } catch (error) {
            console.error(`Error switching to fallback for stream ${id}:`, error);
        }
    };

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const setupStream = async () => {
            try {
                if (wsRef.current) {
                    wsRef.current.close();
                }

                // Create MediaSource
                mediaSourceRef.current = new MediaSource();
                video.src = URL.createObjectURL(mediaSourceRef.current);

                mediaSourceRef.current.addEventListener('sourceopen', () => {
                    try {
                        if (!mediaSourceRef.current) return;

                        sourceBufferRef.current = mediaSourceRef.current.addSourceBuffer('video/mp4; codecs="avc1.42E01E,mp4a.40.2"');
                        
                        // Connect to WebSocket
                        wsRef.current = new WebSocket(streamUrl);
                        
                        wsRef.current.onmessage = (event) => {
                            // Handle incoming video data
                        };

                        wsRef.current.onerror = () => {
                            console.warn(`WebSocket error for stream ${id}, switching to fallback`);
                            switchToFallback();
                        };

                        wsRef.current.onclose = () => {
                            console.warn(`WebSocket closed for stream ${id}, switching to fallback`);
                            switchToFallback();
                        };
                    } catch (error) {
                        console.error(`Error in sourceopen handler for stream ${id}:`, error);
                        switchToFallback();
                    }
                });
            } catch (error) {
                console.error(`Error setting up stream ${id}:`, error);
                switchToFallback();
            }
        };

        setupStream();

        return () => {
            // Cleanup
            if (wsRef.current) {
                wsRef.current.close();
            }
            if (playAttemptRef.current) {
                clearTimeout(playAttemptRef.current);
            }
            if (video.src) {
                URL.revokeObjectURL(video.src);
            }
        };
    }, [streamUrl, id]);

    return (
        <div className="relative w-full h-full">
            <video
                ref={videoRef}
                id={id}
                className="w-full h-full object-contain"
                autoPlay
                playsInline
                muted
                loop={useFallback}
                controls={false}
                style={{
                    ...style,
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    backgroundColor: 'black'
                }}
            />
        </div>
    );
} 