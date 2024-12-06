import { Share2 } from 'lucide-react';
import { useState } from 'react';
import ShareDetectionModal from './ShareDetectionModal';

// ... other imports and interface definitions

export default function DetectionCard({ detection }: DetectionCardProps) {
    const [showShareModal, setShowShareModal] = useState(false);

    return (
        <div className="card">
            {/* Existing detection card content */}
            
            <button
                onClick={() => setShowShareModal(true)}
                className="btn btn-secondary flex items-center"
            >
                <Share2 className="w-4 h-4 mr-2" />
                Share
            </button>

            {showShareModal && (
                <ShareDetectionModal
                    detection={detection}
                    onClose={() => setShowShareModal(false)}
                />
            )}
        </div>
    );
} 