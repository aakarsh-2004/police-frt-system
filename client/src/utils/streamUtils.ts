export const getFallbackStream = (index: number): string => {
    const fallbackVideos = [
        '/demo-vids/1.mp4',
        '/demo-vids/2.mp4',
        '/demo-vids/3.mp4',
        '/demo-vids/4.mp4'
    ];
    return fallbackVideos[index % fallbackVideos.length];
};

export const handleStreamError = (videoElement: HTMLVideoElement, fallbackUrl: string) => {
    videoElement.src = fallbackUrl;
    videoElement.play().catch(console.error);
}; 