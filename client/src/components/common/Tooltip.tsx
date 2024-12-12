import React from 'react';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps) {
    return (
        <div className="group relative">
            {children}
            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300
                absolute left-full top-1/2 -translate-y-1/2 ml-2 z-[9999]">
                <div className="relative">
                    {/* Arrow */}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 
                        border-8 border-transparent border-r-gray-800" />
                    
                    {/* Tooltip content */}
                    <div className="bg-gray-800 text-white text-sm rounded-lg py-3 px-4 
                        shadow-lg border border-gray-700/50 min-w-[250px] max-w-[300px]">
                        <p className="leading-relaxed whitespace-normal break-words">
                            {content}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 