import { useEffect } from 'react';

declare global {
    interface Window {
        Tawk_API: {
            customize?: {
                chatWidget?: {
                    size?: string;
                    position?: string;
                };
            };
        };
        Tawk_LoadStart: Date;
    }
}

export default function TawkChat() {
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .tawk-min-container {
                transform: scale(0.6) !important;
                transform-origin: bottom right !important;
                margin: 0 12px 12px 0 !important;
                bottom: 12px !important;
            }
            .tawk-text-center.tawk-padding-small {
                display: none !important;
            }

            #tawk-bubble-container {
                bottom: 60px !important;
            }

            .tawk-custom-color {
                background-color: #1a56db !important;
            }

            .tawk-popup-container {
                bottom: 100px !important;
            }

            .tawk-min-container .tawk-button {
                width: 50px !important;
                height: 50px !important;
            }

            .tawk-min-container .tawk-button i {
                font-size: 24px !important;
            }
        `;
        document.head.appendChild(style);

        window.Tawk_API = window.Tawk_API || {};
        window.Tawk_LoadStart = new Date();

        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://embed.tawk.to/674f46762480f5b4f5a74750/1ie6qmge3';
        script.charset = 'UTF-8';
        script.setAttribute('crossorigin', '*');

        document.head.appendChild(script);

        return () => {
            document.head.removeChild(style);
            document.head.removeChild(script);
        };
    }, []);

    return null;
} 