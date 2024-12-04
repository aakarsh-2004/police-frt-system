import React, { useEffect, useRef } from 'react';

interface RTSPStreamProps {
    streamUrl: string;
    id: string;
}

export default function RTSPStream({ streamUrl, id }: RTSPStreamProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const mseQueueRef = useRef<ArrayBuffer[]>([]);
    const mseSourceBufferRef = useRef<SourceBuffer | null>(null);
    const mseStreamingStartedRef = useRef<boolean>(false);
    const mediaSourceRef = useRef<MediaSource | null>(null);
    const webSocketRef = useRef<WebSocket | null>(null);

    const pushPacket = () => {
        if (!mseSourceBufferRef.current) return;

        if (!mseSourceBufferRef.current.updating) {
            if (mseQueueRef.current.length > 0) {
                const packet = mseQueueRef.current.shift();
                if (packet) {
                    mseSourceBufferRef.current.appendBuffer(packet);
                }
            } else {
                mseStreamingStartedRef.current = false;
            }
        }
    };

    const readPacket = (packet: ArrayBuffer) => {
        if (!mseSourceBufferRef.current) return;

        if (!mseStreamingStartedRef.current) {
            mseSourceBufferRef.current.appendBuffer(packet);
            mseStreamingStartedRef.current = true;
            return;
        }

        mseQueueRef.current.push(packet);
        if (!mseSourceBufferRef.current.updating) {
            pushPacket();
        }
    };

    const startPlay = () => {
        if (!videoRef.current) return;

        try {
            const mse = new MediaSource();
            mediaSourceRef.current = mse;
            videoRef.current.src = URL.createObjectURL(mse);

            mse.addEventListener('sourceopen', () => {
                console.log('MediaSource opened');
                
                const ws = new WebSocket(streamUrl);
                webSocketRef.current = ws;
                ws.binaryType = 'arraybuffer';

                ws.onopen = () => {
                    console.log('WebSocket connected to:', streamUrl);
                };

                ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                };

                ws.onclose = () => {
                    console.log('WebSocket closed for:', streamUrl);
                    // Attempt to reconnect after a delay
                    setTimeout(startPlay, 5000);
                };

                ws.onmessage = (event) => {
                    const data = new Uint8Array(event.data);
                    if (data[0] === 9) {
                        const decodedArr = data.slice(1);
                        const mimeCodec = new TextDecoder('utf-8').decode(decodedArr);
                        console.log('Mime codec:', mimeCodec);

                        try {
                            mseSourceBufferRef.current = mse.addSourceBuffer('video/mp4; codecs="' + mimeCodec + '"');
                            mseSourceBufferRef.current.mode = 'segments';
                            mseSourceBufferRef.current.addEventListener('updateend', pushPacket);
                        } catch (e) {
                            console.error('Error adding source buffer:', e);
                        }
                    } else {
                        readPacket(event.data);
                    }
                };
            });

            // Fix for stalled video in Safari
            const handlePause = () => {
                if (!videoRef.current) return;
                const videoEl = videoRef.current;
                if (videoEl.currentTime > videoEl.buffered.end(videoEl.buffered.length - 1)) {
                    videoEl.currentTime = videoEl.buffered.end(videoEl.buffered.length - 1) - 0.1;
                    videoEl.play().catch(console.error);
                }
            };

            videoRef.current.addEventListener('pause', handlePause);

            return () => {
                videoRef.current?.removeEventListener('pause', handlePause);
            };
        } catch (error) {
            console.error('Error starting playback:', error);
        }
    };

    useEffect(() => {
        startPlay();

        return () => {
            // Cleanup
            if (webSocketRef.current) {
                webSocketRef.current.close();
            }
            if (mediaSourceRef.current && mediaSourceRef.current.readyState === 'open') {
                mediaSourceRef.current.endOfStream();
            }
        };
    }, [streamUrl]);

    return (
        <video
            ref={videoRef}
            id={id}
            className="w-full h-full object-contain"
            autoPlay={true}
            playsInline={true}
            muted={true}
            controls={false}
        />
    );
} 