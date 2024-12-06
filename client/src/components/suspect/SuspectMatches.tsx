import { useState } from 'react';
import { Camera, MapPin, Clock, ArrowRight, Share2 } from 'lucide-react';
import { allMatches } from './matches';
import ImageEnhancer from '../image/ImageEnhancer';
import ShareDetectionModal from '../detection/ShareDetectionModal';
import { useNavigate } from 'react-router-dom';

interface SuspectMatchesProps {
    suspectId: string;
    person?: {
        firstName: string;
        lastName: string;
        personImageUrl: string;
    };
}

export default function SuspectMatches({ suspectId, person }: SuspectMatchesProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedMatch, setSelectedMatch] = useState<{
        imageUrl: string;
        confidence: number;
        location: string;
    } | null>(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedDetection, setSelectedDetection] = useState<any>(null);
    const navigate = useNavigate();

    const matches = allMatches.filter(match => match.suspectId === suspectId);

    // Get the current match when an image is selected
    const getCurrentMatch = () => {
        return matches.find(m => m.capturedImage === selectedImage);
    };

    const handleImageClick = (match: MatchType) => {
        navigate(`/detections/${match.id}`);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Recent Matches</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches.map((match) => (
                    <div key={match.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <div 
                            className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                            onClick={() => handleImageClick(match)}
                        >
                            <img
                                src={match.capturedImage}
                                alt="Match"
                                className="w-full h-full object-cover"
                                style={{ objectPosition: 'center' }}
                            />
                        </div>
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <MapPin className="w-4 h-4 mr-2" />
                                {match.location}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <Clock className="w-4 h-4 mr-2" />
                                {new Date(match.timestamp).toLocaleString()}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <Camera className="w-4 h-4 mr-2" />
                                Confidence: {match.confidence.toFixed(2)}%
                            </div>
                            <div className="flex justify-between items-center mt-4">
                                <button
                                    onClick={() => {
                                        setSelectedDetection({
                                            capturedImageUrl: match.capturedImage,
                                            capturedLocation: match.location,
                                            capturedDateTime: match.timestamp,
                                            person: {
                                                firstName: person?.firstName || "Unknown",
                                                lastName: person?.lastName || "Unknown",
                                                personImageUrl: person?.personImageUrl || match.capturedImage
                                            }
                                        });
                                        setShowShareModal(true);
                                    }}
                                    className="btn btn-secondary btn-sm flex items-center"
                                >
                                    <Share2 className="w-4 h-4 mr-1" />
                                    Share
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {matches.length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                        No matches found
                    </div>
                )}
            </div>

            {/* Image Enhancer Modal */}
            {selectedImage && (
                <ImageEnhancer
                    imageUrl={selectedImage}
                    personId={suspectId}
                    onClose={() => setSelectedImage(null)}
                />
            )}

            {/* Share Detection Modal */}
            {showShareModal && selectedDetection && (
                <ShareDetectionModal
                    detection={selectedDetection}
                    onClose={() => {
                        setShowShareModal(false);
                        setSelectedDetection(null);
                    }}
                />
            )}
        </div>
    );
}