import { useState, useCallback } from 'react';
import { Maximize, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

interface VideoControlsProps {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onRotate: () => void;
    onFullScreen: () => void;
}

export default function VideoControls({ onZoomIn, onZoomOut, onRotate, onFullScreen }: VideoControlsProps) {
    return (
        <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <button 
                onClick={onZoomIn}
                className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                title="Zoom In"
            >
                <ZoomIn className="w-4 h-4 text-white" />
            </button>
            <button 
                onClick={onZoomOut}
                className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                title="Zoom Out"
            >
                <ZoomOut className="w-4 h-4 text-white" />
            </button>
            <button 
                onClick={onRotate}
                className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                title="Rotate"
            >
                <RotateCw className="w-4 h-4 text-white" />
            </button>
            <button 
                onClick={onFullScreen}
                className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                title="Full Screen"
            >
                <Maximize className="w-4 h-4 text-white" />
            </button>
        </div>
    );
} 