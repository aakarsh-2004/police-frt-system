import { useState } from 'react';
import { Camera, MapPin, Clock, ArrowRight } from 'lucide-react';
// import EnhancedImageViewer from '../image/EnhancedImageViewer';
import { allMatches } from './matches';
import ImageEnhancer from '../image/ImageEnhancer';

interface SuspectMatchesProps {
    suspectId: string;
}

export default function SuspectMatches({ suspectId }: SuspectMatchesProps) {
    
    const matches = allMatches.filter(match => match.suspectId === suspectId);
    const [selectedMatch, setSelectedMatch] = useState<{
        imageUrl: string;
        confidence: number;
        location: string;
        timestamp: string;
        cameraId: string;
    } | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    return (
        <div className="bg-white rounded-lg shadow-lg flex flex-col h-[calc(100vh-2rem)]">
            <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">Recent Matches</h2>
                <p className="text-sm text-gray-600">{matches.length} matches found</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                    {matches.map((match) => (
                        <div
                            key={match.id}
                            className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div 
                                    className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                                    onClick={() => setSelectedImage(match.capturedImageUrl)}
                                >
                                    <img
                                        src={match.capturedImageUrl}
                                        alt="Match"
                                        className="w-full h-full object-cover"
                                        style={{ objectPosition: 'center' }}
                                    />
                                </div>

                                <div className="p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2 text-xs">
                                            <Camera className="w-3 h-3 text-gray-500" />
                                            <span className="font-medium">Camera #{match.cameraId}</span>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                                ${match.verified
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-amber-100 text-amber-800'}`}>
                                            {match.verified ? 'VERIFIED' : 'PENDING'}
                                        </span>
                                    </div>

                                    <div className="space-y-1 text-xs text-gray-600">
                                        <div className="flex items-center">
                                            <MapPin className="w-3 h-3 mr-1" />
                                            {match.location}
                                        </div>
                                        <div className="flex items-center">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {match.timestamp}
                                        </div>
                                    </div>

                                    <button className="w-full btn btn-primary text-xs py-1">
                                        View Details
                                        <ArrowRight className="w-3 h-3 ml-1" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {matches.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No matches found for this suspect
                        </div>
                    )}
                </div>
            </div>

            {/* Image Enhancer Modal */}
            {selectedImage && (
                <ImageEnhancer
                    imageUrl={selectedImage}
                    onClose={() => setSelectedImage(null)}
                />
            )}
        </div>
    );
}