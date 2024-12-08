import React, { useEffect, useRef, useState } from 'react';

interface RTSPStreamProps {
    streamUrl: string;
    id: string;
    style?: React.CSSProperties;
}

const FALLBACK_VIDEOS = [
    '/SIH-stock-vids/1.mp4',
    '/SIH-stock-vids/2.mp4',
    '/SIH-stock-vids/3.mp4',
    '/SIH-stock-vids/4.mp4',
    '/SIH-stock-vids/5.mp4',
    '/SIH-stock-vids/6.mp4'
];

export default function RTSPStream({ streamUrl, id, style }: RTSPStreamProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const mseQueueRef = useRef<ArrayBuffer[]>([]);
    const mseSourceBufferRef = useRef<SourceBuffer | null>(null);
    const mseStreamingStartedRef = useRef<boolean>(false);
    const mediaSourceRef = useRef<MediaSource | null>(null);
    const webSocketRef = useRef<WebSocket | null>(null);
    const [useFallback, setUseFallback] = useState(false);

    const switchToFallback = () => {
        if (!videoRef.current || useFallback) return;
        
        const matches = id.match(/\d+$/);
        const fallbackIndex = matches ? parseInt(matches[0]) - 1 : 0;
        
        console.log("Video ID:", id);
        console.log("Fallback Index:", fallbackIndex);
        
        const safeIndex = Math.max(0, Math.min(fallbackIndex, FALLBACK_VIDEOS.length - 1));
        const fallbackUrl = FALLBACK_VIDEOS[safeIndex];
        
        console.log('Switching to fallback video:', fallbackUrl);
        
        if (fallbackUrl) {
            videoRef.current.src = fallbackUrl;
            videoRef.current.loop = true;
            setUseFallback(true);
            
            videoRef.current.play().catch(error => {
                console.error('Error playing fallback video:', error);
            });
        } else {
            console.error('No fallback video available for index:', fallbackIndex);
        }
    };

    const pushPacket = () => {
        if (!mseSourceBufferRef.current || !mseQueueRef.current.length) return;

        try {
            if (!mseSourceBufferRef.current.updating) {
                const packet = mseQueueRef.current.shift();
                if (packet) {
                    mseSourceBufferRef.current.appendBuffer(packet);
                }
            }
        } catch (error) {
            console.error('Error pushing packet:', error);
            switchToFallback();
        }
    };

    const readPacket = (packet: ArrayBuffer) => {
        if (!mseSourceBufferRef.current) return;

        try {
            if (!mseStreamingStartedRef.current) {
                mseSourceBufferRef.current.appendBuffer(packet);
                mseStreamingStartedRef.current = true;
                return;
            }

            mseQueueRef.current.push(packet);
            if (!mseSourceBufferRef.current.updating) {
                pushPacket();
            }
        } catch (error) {
            console.error('Error reading packet:', error);
            switchToFallback();
        }
    };

    useEffect(() => {
        let mounted = true;

        const startPlay = () => {
            if (!videoRef.current || !mounted) return;

            try {
                const mse = new MediaSource();
                mediaSourceRef.current = mse;
                videoRef.current.src = URL.createObjectURL(mse);

                mse.addEventListener('sourceopen', () => {
                    if (!mounted) return;

                    const ws = new WebSocket(streamUrl);
                    webSocketRef.current = ws;
                    ws.binaryType = 'arraybuffer';

                    let connectionTimeout = setTimeout(() => {
                        console.log('WebSocket connection timeout');
                        switchToFallback();
                    }, 5000);

                    ws.onopen = () => {
                        clearTimeout(connectionTimeout);
                        console.log('WebSocket connected:', streamUrl);
                    };

                    ws.onmessage = (event) => {
                        if (!mounted) return;

                        const data = new Uint8Array(event.data);
                        if (data[0] === 9) {
                            try {
                                if (mseSourceBufferRef.current) {
                                    console.warn('SourceBuffer already exists');
                                    return;
                                }

                                const decodedArr = data.slice(1);
                                const mimeCodec = new TextDecoder('utf-8').decode(decodedArr);
                                mseSourceBufferRef.current = mse.addSourceBuffer(`video/mp4; codecs="${mimeCodec}"`);
                                mseSourceBufferRef.current.mode = 'segments';
                                mseSourceBufferRef.current.addEventListener('updateend', pushPacket);
                            } catch (error) {
                                console.error('Error adding source buffer:', error);
                                switchToFallback();
                            }
                        } else {
                            readPacket(event.data);
                        }
                    };

                    ws.onerror = (error) => {
                        console.error('WebSocket error:', error);
                        switchToFallback();
                    };

                    ws.onclose = () => {
                        console.log('WebSocket closed');
                        switchToFallback();
                    };
                });
            } catch (error) {
                console.error('Error starting playback:', error);
                switchToFallback();
            }
        };

        if (!useFallback) {
            startPlay();
        }

        return () => {
            mounted = false;
            
            if (webSocketRef.current) {
                webSocketRef.current.close();
                webSocketRef.current = null;
            }

            if (mseSourceBufferRef.current && mediaSourceRef.current) {
                try {
                    mediaSourceRef.current.removeSourceBuffer(mseSourceBufferRef.current);
                } catch (error) {
                    console.error('Error removing source buffer:', error);
                }
                mseSourceBufferRef.current = null;
            }

            if (mediaSourceRef.current && mediaSourceRef.current.readyState === 'open') {
                try {
                    mediaSourceRef.current.endOfStream();
                } catch (error) {
                    console.error('Error ending media stream:', error);
                }
            }
            mediaSourceRef.current = null;

            mseQueueRef.current = [];
            mseStreamingStartedRef.current = false;
        };
    }, [streamUrl, useFallback]);

    return (
        <div className="relative w-full h-full overflow-hidden">
            <video
                ref={videoRef}
                id={id}
                className="w-full h-full object-contain"
                autoPlay={true}
                playsInline={true}
                muted={true}
                controls={false}
                loop={useFallback}
                style={{
                    ...style,
                    transition: 'transform 0.3s ease',
                    transformOrigin: 'center',
                    willChange: 'transform'
                }}
            />
        </div>
    );
} 