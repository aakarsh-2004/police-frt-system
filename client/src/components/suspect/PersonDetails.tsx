import { MapPin, AlertTriangle, Clock, Edit2, Trash2, Upload, ArrowRight, ExternalLink } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config/config';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import ImageEnhancer from '../image/ImageEnhancer';
import VideoPlayer from '../video/VideoPlayer';
import RecentVideos from '../video/RecentVideos';
import { formatDateTime, getTimeAgo } from '../../utils/dateUtils';
import MovementFlow from '../person/MovementFlow';

interface Recognition {
    id: number;
    capturedImageUrl: string;
    capturedDateTime: string;
    confidenceScore: string;
    camera: {
        id: string;
        location: string;
        name: string;
    };
    person: {
        firstName: string;
        lastName: string;
        personImageUrl: string;
    };
    videoUrl?: string | null;
}

interface Person {
    id: string;
    firstName: string;
    lastName: string;
    age: number;
    dateOfBirth: string;
    gender: string;
    email: string;
    phone: string;
    address: string;
    personImageUrl: string;
    type: string;
    nationalId: string;
    nationality: string;
    suspect?: {
        id: string;
        riskLevel: string;
        foundStatus: boolean;
        criminalRecord?: {
            crimeType: string;
            crimeDescription: string;
            crimeDate: string;
            crimeLocation: string;
            status: string;
        };
    };
    missingPerson?: {
        lastSeenDate: string;
        lastSeenLocation: string;
        missingSince: string;
        reportBy: string;
        foundStatus: boolean;
    };
    recognizedPerson: Recognition[];
}

interface LocationStat {
    location: string;
    detectionCount: number;
    lastDetected: string;
}

interface LocationStats {
    totalLocations: number;
    locations: LocationStat[];
}

export default function PersonDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [person, setPerson] = useState<Person | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const { user } = useAuth();
    const [newImage, setNewImage] = useState<File | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Add form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        age: '',
        dateOfBirth: '',
        gender: '',
        email: '',
        phone: '',
        address: '',
        nationality: '',
        nationalId: '',
        // For suspects
        riskLevel: '',
        foundStatus: false,
        // For missing persons
        lastSeenDate: '',
        lastSeenLocation: '',
        missingSince: '',
        reportBy: '',
        status: ''
    });

    // Add loading state
    const [isSaving, setIsSaving] = useState(false);

    // Add state for location stats
    const [locationStats, setLocationStats] = useState<LocationStats | null>(null);

    // Add state for movement flow
    const [movementFlow, setMovementFlow] = useState<any[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            console.log('Image selected:', file);
            setUploadedImage(file);
        }
    };

    useEffect(() => {
        const fetchPerson = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${config.apiUrl}/api/persons/${id}`);
                setPerson(response.data.data);
            } catch (error) {
                console.error('Error fetching person:', error);
                setError('Failed to load person details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPerson();
        }
    }, [id]);

    useEffect(() => {
        if (person) {
            setFormData({
                firstName: person.firstName,
                lastName: person.lastName,
                age: person.age.toString(),
                dateOfBirth: new Date(person.dateOfBirth).toISOString().split('T')[0],
                gender: person.gender,
                email: person.email || '',
                phone: person.phone || '',
                address: person.address,
                nationality: person.nationality || '',
                nationalId: person.nationalId || '',
                riskLevel: person.suspect?.riskLevel || '',
                foundStatus: person.suspect?.foundStatus || person.missingPerson?.foundStatus || false,
                lastSeenDate: person.missingPerson?.lastSeenDate ? new Date(person.missingPerson.lastSeenDate).toISOString().split('T')[0] : '',
                lastSeenLocation: person.missingPerson?.lastSeenLocation || '',
                missingSince: person.missingPerson?.missingSince ? new Date(person.missingPerson.missingSince).toISOString().split('T')[0] : '',
                reportBy: person.missingPerson?.reportBy || '',
                status: ''
            });
        }
    }, [person]);

    // Add function to fetch location stats
    const fetchLocationStats = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/api/persons/${id}/locations`);
            setLocationStats(response.data.data);
        } catch (error) {
            console.error('Error fetching location stats:', error);
        }
    };

    // Call this in useEffect
    useEffect(() => {
        if (id) {
            fetchLocationStats();
        }
    }, [id]);

    // Add this effect to fetch movement flow
    useEffect(() => {
        if (person?.id) {
            axios.get(`${config.apiUrl}/api/persons/${person.id}/movement-flow`)
                .then(response => {
                    console.log("movement flow => ", response.data.data);
                    
                    if (response.data.success) {
                        setMovementFlow(response.data.data);
                    }
                })
                .catch(error => {
                    console.error('Error fetching movement flow:', error);
                });
        }
    }, [person?.id]);

    const handleBack = () => {
        navigate(-1);
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this person? This action cannot be undone.')) {
            return;
        }

        try {
            await axios.delete(`${config.apiUrl}/api/persons/${id}`);
            toast.success('Person deleted successfully');
            navigate('/suspects');
        } catch (error) {
            console.error('Error deleting person:', error);
            toast.error('Failed to delete person');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true); // Start loading

        try {
            const formDataToSend = new FormData();
            
            // Add all form fields to FormData
            Object.keys(formData).forEach(key => {
                formDataToSend.append(key, formData[key]);
            });

            if (uploadedImage) {
                formDataToSend.append('personImageUrl', uploadedImage);
            }

            const response = await axios.put(
                `${config.apiUrl}/api/persons/${id}`,
                formDataToSend,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.data) {
                setPerson(response.data.data);
                setIsEditing(false);
                setUploadedImage(null);
                toast.success('Person details updated successfully');
            }
        } catch (error: any) {
            console.error('Error updating person:', error);
            toast.error(error.response?.data?.message || 'Failed to update person details');
        } finally {
            setIsSaving(false); // End loading
            navigate(`/suspects`);
        }
    }; 

    // Add this near the top of your JSX, after the Back button
    const renderEditButton = () => {
        if (user?.role === 'admin') {
            return (
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className="btn btn-secondary flex items-center"
                    >
                        <Edit2 className="w-4 h-4 mr-2" />
                        {isEditing ? 'Cancel Edit' : 'Edit Details'}
                    </button>
                    <button 
                        onClick={handleDelete}
                        className="btn bg-red-500 hover:bg-red-600 text-white flex items-center"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Person
                    </button>
                </div>
            );
        }
        return null;
    };

    // Add this form in the Basic Information section
    const renderEditForm = () => {
        if (!isEditing) return null;

        return (
            <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">First Name</label>
                        <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                            className="w-full p-2 border rounded dark:bg-gray-800 dark:text-gray-300 dark:border-gray-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Last Name</label>
                        <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                            className="w-full p-2 border rounded dark:bg-gray-800 dark:text-gray-300 dark:border-gray-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Age</label>
                        <input
                            type="number"
                            value={formData.age}
                            onChange={(e) => setFormData({...formData, age: e.target.value})}
                            className="w-full p-2 border rounded dark:bg-gray-800 dark:text-gray-300 dark:border-gray-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Date of Birth</label>
                        <input
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                            className="w-full p-2 border rounded dark:bg-gray-800 dark:text-gray-300 dark:border-gray-500"
                        />
                    </div>
                </div>

                {person?.type === 'suspect' && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Risk Level</label>
                        <select
                            value={formData.riskLevel}
                            onChange={(e) => setFormData({...formData, riskLevel: e.target.value})}
                            className="w-full p-2 border rounded dark:bg-gray-800 dark:text-gray-300 dark:border-gray-500"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                )}

                {person?.type === 'missing-person' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-1">Last Seen Date</label>
                            <input
                                type="date"
                                value={formData.lastSeenDate}
                                onChange={(e) => setFormData({...formData, lastSeenDate: e.target.value})}
                                className="w-full p-2 border rounded dark:bg-gray-800 dark:text-gray-300 dark:border-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Last Seen Location</label>
                            <input
                                type="text"
                                value={formData.lastSeenLocation}
                                onChange={(e) => setFormData({...formData, lastSeenLocation: e.target.value})}
                                className="w-full p-2 border rounded dark:bg-gray-800 dark:text-gray-300 dark:border-gray-500"
                            />
                        </div>
                    </>
                )}



                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Profile Image</label>
                    <div className="flex items-center space-x-4">
                        {(uploadedImage || person?.personImageUrl) && (
                            <img
                                src={uploadedImage ? URL.createObjectURL(uploadedImage) : person?.personImageUrl}
                                alt="Preview"
                                className="w-24 h-24 rounded-lg object-cover"
                            />
                        )}
                        <label className="btn btn-secondary cursor-pointer">
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Image
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>
                </div>

                {isEditing && (
                    <div className="flex justify-end space-x-3 mt-4">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </span>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const handleImageClick = (recognition: Recognition) => {
        navigate(`/detections/${recognition.id}`);
    };

    const recentVideos = person?.recognizedPerson
        .filter(recognition => recognition.videoUrl)
        .map(recognition => ({
            id: recognition.id.toString(),
            videoUrl: recognition.videoUrl!,
            thumbnailUrl: recognition.capturedImageUrl,
            capturedDateTime: recognition.capturedDateTime,
            location: recognition.camera.location
        })) || [];

    const handleImageSelect = (index: number) => {
        setSelectedImageIndex(index);
    };

    const handleImageChange = (newIndex: number) => {
        setSelectedImageIndex(newIndex);
    };

    if (loading) {
        return <div className="p-6 text-center">Loading...</div>;
    }

    if (error || !person) {
        return <div className="p-6 text-center text-red-500">{error || 'Person not found'}</div>;
    }

    return (
        <div className="max-w-[2000px] mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <button 
                    onClick={handleBack}
                    className="btn btn-secondary"
                >
                    Back
                </button>
                {renderEditButton()}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Person Details */}
                <div className="lg:col-span-2">
                    {/* Basic Information */}
                    <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-6">
                                <div 
                                    className="w-48 h-64 relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200 cursor-pointer dark:bg-gray-900 dark:border-gray-700"
                                    onClick={() => setSelectedImage(person?.personImageUrl || null)}
                                >
                                    <img
                                        src={person?.personImageUrl}
                                        alt={`${person?.firstName} ${person?.lastName}`}
                                        className="w-full h-full object-contain"
                                        style={{ 
                                            objectPosition: 'center',
                                            transform: 'scale(0.95)'
                                        }}
                                    />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">
                                        {person.firstName} {person.lastName}
                                    </h1>
                                    <p className="text-gray-500">ID: {person.id}</p>
                                </div>
                            </div>
                            {/* Status Badges */}
                            <div className="flex flex-col space-y-2">
                                {/* Found Status Badge */}
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    person.type === 'suspect'
                                        ? person.suspect?.foundStatus
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        : person.missingPerson?.foundStatus
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                }`}>
                                    {person.type === 'suspect'
                                        ? person.suspect?.foundStatus ? 'CAUGHT' : 'AT LARGE'
                                        : person.missingPerson?.foundStatus ? 'FOUND' : 'MISSING'
                                    }
                                </span>
                                
                                {/* Risk Level Badge (for suspects only) */}
                                {person.type === 'suspect' && person.suspect?.riskLevel && (
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        person.suspect.riskLevel === 'high' 
                                            ? 'bg-red-100 text-red-800'
                                            : person.suspect.riskLevel === 'medium' 
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-green-100 text-green-800'
                                    }`}>
                                        {person.suspect.riskLevel.toUpperCase()} Risk
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-medium mb-2">Personal Information</h3>
                                <div className="space-y-2 text-sm">
                                    <p><span className="text-gray-500">Age:</span> {person.age}</p>
                                    <p><span className="text-gray-500">Gender:</span> {person.gender}</p>
                                    <p><span className="text-gray-500">Nationality:</span> {person.nationality}</p>
                                    <p><span className="text-gray-500">National ID:</span> {person.nationalId}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium mb-2">Contact Information</h3>
                                <div className="space-y-2 text-sm">
                                    <p><span className="text-gray-500">Email:</span> {person.email}</p>
                                    <p><span className="text-gray-500">Phone:</span> {person.phone}</p>
                                    <p><span className="text-gray-500">Address:</span> {person.address}</p>
                                </div>
                            </div>

                            <div className='detected-directions-flow w-[740px]'>
                                <h3 className="font-medium mb-2">Detected Directions Flow</h3>
                                <MovementFlow movements={movementFlow} person={person} />
                            </div>
                        </div>
                        {renderEditForm()}
                    </div>

                    {/* Recent Videos Section */}
                    <div className="mt-6">
                        <RecentVideos videos={recentVideos} />
                    </div>

                    {/* Location Statistics */}
                    <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4 dark:text-white">Location Statistics</h3>
                        
                        {locationStats && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Total Locations Detected</span>
                                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                                        {locationStats.totalLocations}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-medium dark:text-white">Detection Locations</h4>
                                    <div className="grid gap-3">
                                        {locationStats.locations.map((stat, index) => (
                                            <div 
                                                key={index}
                                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                            >
                                                <div>
                                                    <p className="font-medium dark:text-white">{stat.location}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Last detected: {new Date(stat.lastDetected).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                                                        {stat.detectionCount} detections
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Recent Detections */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800 sticky top-24">
                        <h2 className="text-xl font-semibold mb-4 dark:text-white">Recent Detections</h2>
                        {/* Add max height and scrolling */}
                        <div className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
                            {person.recognizedPerson.map((recognition, index) => (
                                <div 
                                    key={recognition.id} 
                                    className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                                >
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                            <div className="space-y-1">
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block">
                                                    Database Image
                                                </span>
                                                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                                                    <img
                                                        src={person.personImageUrl}
                                                        alt="Database"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block">
                                                    Captured Image
                                                </span>
                                                <div 
                                                    className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                                                    onClick={() => handleImageSelect(index)}
                                                >
                                                    <img
                                                        src={recognition.capturedImageUrl}
                                                        alt="Captured"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-2">
                                                <MapPin className="w-4 h-4 text-blue-500" />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                    {recognition.camera?.location || 'Unknown Location'}
                                                </span>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Clock className="w-4 h-4 text-green-500" />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                    {formatDateTime(recognition.capturedDateTime) + ' ' + '(' + getTimeAgo(recognition.capturedDateTime) + ')'}
                                                </span>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                    Match Confidence: {parseFloat(recognition.confidenceScore).toFixed(2)}%
                                                </span>
                                            </div>

                                            {recognition.videoUrl && (
                                                <button 
                                                    onClick={() => setSelectedVideo(recognition.videoUrl!)}
                                                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                                                >
                                                    <ExternalLink className="w-4 h-4 mr-1" />
                                                    View Detection Video
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {person.recognizedPerson.length === 0 && (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
                                    <p>No detections recorded</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {selectedImage && (
                <ImageEnhancer
                    imageUrl={selectedImage}
                    onClose={() => setSelectedImage(null)}
                />
            )}

            {selectedVideo && (
                <VideoPlayer 
                    videoUrl={selectedVideo}
                    onClose={() => setSelectedVideo(null)}
                />
            )}

            {/* Add ImageEnhancer modal */}
            {selectedImageIndex !== null && (
                <ImageEnhancer
                    imageUrl={person.recognizedPerson[selectedImageIndex].capturedImageUrl}
                    onClose={() => setSelectedImageIndex(null)}
                    images={person.recognizedPerson.map(rec => rec.capturedImageUrl)}
                    currentIndex={selectedImageIndex}
                    onImageChange={handleImageChange}
                    detectionInfo={{
                        person: {
                            firstName: person.firstName,
                            lastName: person.lastName,
                            personImageUrl: person.personImageUrl
                        },
                        capturedLocation: person.recognizedPerson[selectedImageIndex].camera.location,
                        capturedDateTime: person.recognizedPerson[selectedImageIndex].capturedDateTime,
                        confidenceScore: person.recognizedPerson[selectedImageIndex].confidenceScore
                    }}
                />
            )}
        </div>
    );
} 