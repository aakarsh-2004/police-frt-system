import React, { useEffect, useRef } from 'react';

interface VideoStreamProps {
    url: string;
    id: string;
}

export default function VideoStream({ url, id }: VideoStreamProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const mseQueueRef = useRef<ArrayBuffer[]>([]);
    const mseSourceBufferRef = useRef<SourceBuffer | null>(null);
    const mseStreamingStartedRef = useRef<boolean>(false);

    const pushPacket = () => {
        if (!mseSourceBufferRef.current || !mseQueueRef.current) return;

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

    useEffect(() => {
        if (!videoRef.current) return;

        const videoEl = videoRef.current;
        const mse = new MediaSource();
        videoEl.src = window.URL.createObjectURL(mse);

        mse.addEventListener('sourceopen', () => {
            const ws = new WebSocket(url);
            ws.binaryType = 'arraybuffer';

            ws.onopen = () => {
                console.log('Connected to WebSocket for ' + url);
            };

            ws.onmessage = (event) => {
                const data = new Uint8Array(event.data);
                if (data[0] === 9) {
                    let mimeCodec;
                    const decodedArr = data.slice(1);
                    if (window.TextDecoder) {
                        mimeCodec = new TextDecoder('utf-8').decode(decodedArr);
                    } else {
                        const decoder = new TextDecoder('utf-8');
                        mimeCodec = decoder.decode(decodedArr);
                    }

                    mseSourceBufferRef.current = mse.addSourceBuffer('video/mp4; codecs="' + mimeCodec + '"');
                    mseSourceBufferRef.current.mode = 'segments';
                    mseSourceBufferRef.current.addEventListener('updateend', pushPacket);
                } else {
                    readPacket(event.data);
                }
            };
        });

        // Fix for stalled video in Safari
        const handlePause = () => {
            if (videoEl.currentTime > videoEl.buffered.end(videoEl.buffered.length - 1)) {
                videoEl.currentTime = videoEl.buffered.end(videoEl.buffered.length - 1) - 0.1;
                videoEl.play();
            }
        };

        videoEl.addEventListener('pause', handlePause);

        return () => {
            videoEl.removeEventListener('pause', handlePause);
        };
    }, [url]);

    return (
        <video
            ref={videoRef}
            id={id}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
        />
    );
} 