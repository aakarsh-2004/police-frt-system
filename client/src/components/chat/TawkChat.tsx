import { useEffect } from 'react';

declare global {
    interface Window {
        Tawk_API: any;
        Tawk_LoadStart: Date;
    }
}

export default function TawkChat() {
    useEffect(() => {
        // Initialize Tawk_API
        window.Tawk_API = window.Tawk_API || {};
        window.Tawk_LoadStart = new Date();

        // Create and load the script
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://embed.tawk.to/674f46762480f5b4f5a74750/1ie6qmge3';
        script.charset = 'UTF-8';
        script.setAttribute('crossorigin', '*');

        // Append the script to the document
        document.head.appendChild(script);

        // Cleanup
        return () => {
            document.head.removeChild(script);
        };
    }, []);

    return null; // This component doesn't render anything
} 