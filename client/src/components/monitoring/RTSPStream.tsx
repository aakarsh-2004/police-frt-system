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
    const mseQueueRef = useRef<ArrayBuffer[]>([]);
    const mseSourceBufferRef = useRef<SourceBuffer | null>(null);
    const mseStreamingStartedRef = useRef<boolean>(false);
    const mediaSourceRef = useRef<MediaSource | null>(null);
    const webSocketRef = useRef<WebSocket | null>(null);
    const [useFallback, setUseFallback] = useState(false);
    const fallbackUrl = getFallbackStream(fallbackIndex);

    // Initialize video with fallback immediately
    useEffect(() => {
        if (videoRef.current && fallbackUrl) {
            videoRef.current.src = fallbackUrl;
            videoRef.current.load();
            videoRef.current.play().catch(err => {
                console.error('Error playing fallback video:', err);
            });
        }
    }, [fallbackUrl]);

    // Try to connect to RTSP stream
    useEffect(() => {
        let mounted = true;

        const initializeStream = async () => {
            try {
                if (!videoRef.current) return;

                const ws = new WebSocket(streamUrl);
                webSocketRef.current = ws;
                ws.binaryType = 'arraybuffer';

                ws.onopen = () => {
                    console.log('WebSocket connected:', streamUrl);
                    if (videoRef.current) {
                        const mse = new MediaSource();
                        mediaSourceRef.current = mse;
                        videoRef.current.src = URL.createObjectURL(mse);
                    }
                };

                ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    setUseFallback(true);
                };

                ws.onclose = () => {
                    console.log('WebSocket closed, using fallback');
                    setUseFallback(true);
                };

                // Rest of your WebSocket message handling logic...
                // (Keep your existing WebSocket message handling code)

            } catch (error) {
                console.error('Error initializing stream:', error);
                setUseFallback(true);
            }
        };

        if (!useFallback) {
            initializeStream();
        }

        return () => {
            mounted = false;
            if (webSocketRef.current) {
                webSocketRef.current.close();
            }
            // Rest of your cleanup code...
        };
    }, [streamUrl, useFallback]);

    return (
        <div className="relative w-full h-full overflow-hidden" id={`container-${id}`}>
            <video
                ref={videoRef}
                id={id}
                className="w-full h-full object-contain"
                autoPlay
                playsInline
                muted
                loop={useFallback} // Only loop if using fallback video
                controls={false}
                style={{
                    ...style,
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    transition: 'transform 0.3s ease',
                    transformOrigin: 'center'
                }}
            />
        </div>
    );
} 