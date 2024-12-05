import React, { useEffect, useRef } from 'react';

interface RTSPStreamProps {
    streamUrl: string;
    id: string;
    style?: React.CSSProperties;
}

export default function RTSPStream({ streamUrl, id, style }: RTSPStreamProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const mseQueueRef = useRef<ArrayBuffer[]>([]);
    const mseSourceBufferRef = useRef<SourceBuffer | null>(null);
    const mseStreamingStartedRef = useRef<boolean>(false);
    const mediaSourceRef = useRef<MediaSource | null>(null);
    const webSocketRef = useRef<WebSocket | null>(null);

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

                    ws.onopen = () => {
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
                            }
                        } else {
                            readPacket(event.data);
                        }
                    };

                    ws.onerror = (error) => {
                        console.error('WebSocket error:', error);
                    };

                    ws.onclose = () => {
                        console.log('WebSocket closed');
                    };
                });
            } catch (error) {
                console.error('Error starting playback:', error);
            }
        };

        startPlay();

        return () => {
            mounted = false;
            
            // Clean up WebSocket
            if (webSocketRef.current) {
                webSocketRef.current.close();
                webSocketRef.current = null;
            }

            // Clean up SourceBuffer
            if (mseSourceBufferRef.current && mediaSourceRef.current) {
                try {
                    mediaSourceRef.current.removeSourceBuffer(mseSourceBufferRef.current);
                } catch (error) {
                    console.error('Error removing source buffer:', error);
                }
                mseSourceBufferRef.current = null;
            }

            // Clean up MediaSource
            if (mediaSourceRef.current) {
                if (mediaSourceRef.current.readyState === 'open') {
                    try {
                        mediaSourceRef.current.endOfStream();
                    } catch (error) {
                        console.error('Error ending media stream:', error);
                    }
                }
                mediaSourceRef.current = null;
            }

            // Clear queue
            mseQueueRef.current = [];
            mseStreamingStartedRef.current = false;
        };
    }, [streamUrl]);

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