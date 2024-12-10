import { useState } from 'react';
import { User, Calendar, Flag, MapPin, Clock, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';

interface DetectedPerson {
    id: string;
    firstName: string;
    lastName: string;
    age: number;
    type: string;
    personImageUrl: string;
    capturedImageUrl: string;
    capturedDateTime: string;
    confidenceScore: string;
    location: string;
    gender: string;
    nationality: string;
    riskLevel?: string;
    foundStatus?: boolean;
    lastSeenDate?: string;
    lastSeenLocation?: string;
    totalDetections: number;
}

interface DetectedPersonsProps {
    detections: DetectedPerson[];
    onImageClick: (detection: DetectedPerson) => void;
}

export default function DetectedPersons({ detections, onImageClick }: DetectedPersonsProps) {
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState<string>('all');
    const sliderRef = useRef<HTMLDivElement>(null);

    console.log("detections", detections);
    

    const filteredDetections = selectedType === 'all' 
        ? detections 
        : detections.filter(d => d.type === selectedType);

    const slideLeft = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({
                left: -300,
                behavior: 'smooth'
            });
        }
    };

    const slideRight = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({
                left: 300,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold dark:text-white">
                        Detected Persons ({detections.length} unique persons)
                    </h2>
                    <div className="flex items-center space-x-4 mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-medium text-red-600 dark:text-red-400">
                                {detections.filter(d => d.type === 'suspect').length}
                            </span> Suspects
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-medium text-amber-600 dark:text-amber-400">
                                {detections.filter(d => d.type === 'missing-person').length}
                            </span> Missing Persons
                        </p>
                    </div>
                </div>

                <div className="flex space-x-2">
                    <button
                        onClick={() => setSelectedType('all')}
                        className={`px-3 py-1 rounded-full text-sm ${
                            selectedType === 'all'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setSelectedType('suspect')}
                        className={`px-3 py-1 rounded-full text-sm ${
                            selectedType === 'suspect'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                    >
                        Suspects
                    </button>
                    <button
                        onClick={() => setSelectedType('missing-person')}
                        className={`px-3 py-1 rounded-full text-sm ${
                            selectedType === 'missing-person'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                    >
                        Missing Persons
                    </button>
                </div>
            </div>

            <div className="relative">
                <button 
                    onClick={slideLeft}
                    className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                
                <button 
                    onClick={slideRight}
                    className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>

                <div 
                    ref={sliderRef}
                    className="flex overflow-x-auto space-x-4 scrollbar-hide scroll-smooth pb-4"
                >
                    {filteredDetections.map((detection) => (
                        <div 
                            key={detection.id} 
                            className="flex-none w-[400px] border dark:border-gray-700 rounded-lg overflow-hidden"
                        >
                            <div className="grid grid-cols-2 gap-2 p-3">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Database Image</p>
                                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600">
                                        <img
                                            src={detection.personImageUrl}
                                            alt={`${detection.firstName} ${detection.lastName} - Database`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Captured Image</p>
                                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600">
                                        <img
                                            src={detection.capturedImageUrl}
                                            alt={`${detection.firstName} ${detection.lastName} - Captured`}
                                            className="w-full h-full object-cover hover:cursor-pointer"
                                            onClick={() => onImageClick(detection)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold dark:text-white">
                                            {detection.firstName} {detection.lastName}
                                        </h3>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                detection.type === 'suspect'
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                                            }`}>
                                                {detection.type.toUpperCase()}
                                            </span>
                                            {detection.riskLevel && (
                                                <span className="text-amber-600 dark:text-amber-400 text-xs">
                                                    {detection.riskLevel.toUpperCase()} RISK
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                        {detection.confidenceScore}% Match
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center">
                                        <User className="w-4 h-4 mr-2" />
                                        <span>{detection.gender}, {detection.age} years</span>
                                    </div>
                                    {detection.nationality && (
                                        <div className="flex items-center">
                                            <Flag className="w-4 h-4 mr-2" />
                                            <span>{detection.nationality}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        <span>{detection.location}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-2" />
                                        <span>{new Date(detection.capturedDateTime).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="font-medium">{detection.totalDetections}</span> total detections at this camera
                                </div>

                                <button
                                    onClick={() => navigate(`/person/${detection.id}`)}
                                    className="w-full mt-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
                                >
                                    View Full Profile
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredDetections.length === 0 && (
                        <div className="w-full text-center py-8 text-gray-500 dark:text-gray-400">
                            <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
                            <p>No detections found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 