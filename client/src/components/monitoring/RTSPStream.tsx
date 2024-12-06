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
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 2000;

    const closeWebSocket = () => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
    };

    const cleanupMediaSource = () => {
        if (sourceBufferRef.current && mediaSourceRef.current) {
            try {
                mediaSourceRef.current.removeSourceBuffer(sourceBufferRef.current);
            } catch (e) {
                console.warn('Error cleaning up MediaSource:', e);
            }
        }
        sourceBufferRef.current = null;
        mediaSourceRef.current = null;
    };

    const initializeStream = async () => {
        if (!videoRef.current) return;
        
        const videoElement = videoRef.current;

        try {
            // Clean up existing connections
            closeWebSocket();
            cleanupMediaSource();

            // Create new MediaSource
            const mediaSource = new MediaSource();
            mediaSourceRef.current = mediaSource;
            videoElement.src = URL.createObjectURL(mediaSource);

            mediaSource.addEventListener('sourceopen', () => {
                try {
                    // Create WebSocket connection
                    const ws = new WebSocket(streamUrl);
                    wsRef.current = ws;
                    ws.binaryType = 'arraybuffer';

                    ws.onopen = () => {
                        console.log('WebSocket connected:', streamUrl);
                        retryCountRef.current = 0; // Reset retry count on successful connection
                    };

                    ws.onmessage = (event) => {
                        if (!event.data || !(event.data instanceof ArrayBuffer)) return;

                        const data = new Uint8Array(event.data);
                        
                        if (data[0] === 9) {
                            // Handle codec initialization
                            const decoder = new TextDecoder('utf-8');
                            const decodedData = decoder.decode(data.slice(1));
                            
                            if (!sourceBufferRef.current && mediaSource.readyState === 'open') {
                                try {
                                    sourceBufferRef.current = mediaSource.addSourceBuffer(
                                        `video/mp4; codecs="${decodedData}"`
                                    );
                                    sourceBufferRef.current.mode = 'segments';
                                } catch (e) {
                                    console.error('Error adding SourceBuffer:', e);
                                    setUseFallback(true);
                                }
                            }
                        } else if (sourceBufferRef.current && !sourceBufferRef.current.updating) {
                            try {
                                sourceBufferRef.current.appendBuffer(event.data);
                            } catch (e) {
                                console.warn('Error appending buffer:', e);
                            }
                        }
                    };

                    ws.onerror = (error) => {
                        console.error('WebSocket error:', error);
                        handleConnectionError();
                    };

                    ws.onclose = () => {
                        console.log('WebSocket closed:', streamUrl);
                        handleConnectionError();
                    };
                } catch (error) {
                    console.error('Error in sourceopen:', error);
                    handleConnectionError();
                }
            });

        } catch (error) {
            console.error('Error initializing stream:', error);
            handleConnectionError();
        }
    };

    const handleConnectionError = () => {
        if (retryCountRef.current < MAX_RETRIES) {
            retryCountRef.current++;
            console.log(`Retrying connection (${retryCountRef.current}/${MAX_RETRIES})...`);
            setTimeout(initializeStream, RETRY_DELAY);
        } else {
            console.log('Max retries reached, switching to fallback');
            setUseFallback(true);
        }
    };

    useEffect(() => {
        if (!useFallback) {
            initializeStream();
        } else {
            if (videoRef.current) {
                videoRef.current.src = fallbackUrl;
                videoRef.current.load();
                videoRef.current.play().catch(console.error);
            }
        }

        return () => {
            closeWebSocket();
            cleanupMediaSource();
            if (videoRef.current?.src) {
                URL.revokeObjectURL(videoRef.current.src);
            }
        };
    }, [streamUrl, useFallback, fallbackUrl]);

    return (
        <div className="relative w-full h-full overflow-hidden bg-black" id={`container-${id}`}>
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