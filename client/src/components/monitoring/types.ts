export interface Detection {
    id: number;
    timestamp: string;
    confidence: number;
    location: string;
    cameraId: string;
    type: 'match' | 'suspicious' | 'unidentified';
    status: 'pending' | 'reviewing' | 'confirmed' | 'dismissed';
    suspectImage?: string;
    matchedImage?: string;
    personName: string;
} 