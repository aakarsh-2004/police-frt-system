import { MapPin, AlertTriangle, Clock, Edit2, Trash2, Upload } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config/config';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import ImageEnhancer from '../image/ImageEnhancer';

interface Recognition {
    id: number;
    capturedImageUrl: string;
    capturedLocation: string;
    capturedDateTime: string;
    confidenceScore: string;
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            console.log('Image selected:', file);
            setUploadedImage(file);
        }
    };

    useEffect(() => {
        const fetchPerson = async () => {
            try {
                const response = await axios.get(`${config.apiUrl}/api/persons/${id}`);
                setPerson(response.data.data);
            } catch (error) {
                console.error('Error fetching person:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPerson();
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
                                onChange={handleImageChange}
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

    if (loading) return <div>Loading...</div>;
    if (!person) return <div>Person not found</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <button 
                    onClick={handleBack}
                    className="btn btn-secondary"
                >
                    Back
                </button>
                {renderEditButton()}
            </div>
            <div className="max-w-[2000px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Person Details */}
                    <div className="lg:col-span-2 space-y-6">
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
                            </div>
                            {renderEditForm()}
                        </div>

                        {/* Suspect-specific Information */}
                        {person.type === 'suspect' && person.suspect?.criminalRecord && (
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h2 className="text-xl font-bold mb-4">Criminal History</h2>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-medium">Crime Details</h3>
                                        <div className="space-y-2 mt-2">
                                            <p><span className="text-gray-500">Type:</span> {person.suspect.criminalRecord.crimeType}</p>
                                            <p><span className="text-gray-500">Description:</span> {person.suspect.criminalRecord.crimeDescription}</p>
                                            <p><span className="text-gray-500">Date:</span> {new Date(person.suspect.criminalRecord.crimeDate).toLocaleDateString()}</p>
                                            <p><span className="text-gray-500">Location:</span> {person.suspect.criminalRecord.crimeLocation}</p>
                                        </div>
                                    </div>

                                    {/* Hardcoded Additional Information */}
                                    <div>
                                        <h3 className="font-medium">Case Status</h3>
                                        <div className="space-y-2 mt-2">
                                            <p><span className="text-gray-500">Legal Status:</span> Under Investigation</p>
                                            <p><span className="text-gray-500">Bail Status:</span> Not Eligible</p>
                                            <p><span className="text-gray-500">Next Court Appearance:</span> Pending</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Missing Person-specific Information */}
                        {person.type === 'missing-person' && person.missingPerson && (
                            <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800">
                                <h2 className="text-xl font-bold mb-4">Missing Person Details</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-medium mb-2">Last Known Information</h3>
                                        <div className="space-y-2 text-sm">
                                            <p><span className="text-gray-500">Last Seen:</span> {new Date(person.missingPerson.lastSeenDate).toLocaleDateString()}</p>
                                            <p><span className="text-gray-500">Location:</span> {person.missingPerson.lastSeenLocation}</p>
                                            <p><span className="text-gray-500">Missing Since:</span> {new Date(person.missingPerson.missingSince).toLocaleDateString()}</p>
                                            <p><span className="text-gray-500">Reported By:</span> {person.missingPerson.reportBy}</p>
                                            <p><span className="text-gray-500">Status:</span> {person.missingPerson.foundStatus ? 'Found' : 'Missing'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Detections with fixed height */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800">
                            <h2 className="text-xl font-bold mb-4">Recent Detections</h2>
                            {/* Add max height and scrolling */}
                            <div className="space-y-4 max-h-[600px] overflow-y-auto">
                                {person.recognizedPerson.map((recognition) => (
                                    <div key={recognition.id} className="border rounded-lg p-4 dark:border-gray-700">
                                        {/* Modified image container */}
                                        <div 
                                            className="cursor-pointer relative pt-[75%] bg-gray-100 rounded-lg overflow-hidden mb-3 dark:bg-gray-900 dark:border-gray-700"
                                            onClick={() => setSelectedImage(recognition.capturedImageUrl)}
                                        >
                                            <img 
                                                src={recognition.capturedImageUrl} 
                                                alt="Detection" 
                                                className="absolute inset-0 w-full h-full object-contain"
                                                style={{ 
                                                    objectPosition: 'center',
                                                    transform: 'scale(0.95)'  // Slight padding
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <p className="flex items-center">
                                                <MapPin className="w-4 h-4 mr-2" />
                                                {recognition.capturedLocation}
                                            </p>
                                            <p className="flex items-center">
                                                <Clock className="w-4 h-4 mr-2" />
                                                {new Date(recognition.capturedDateTime).toLocaleString()}
                                            </p>
                                            <p className="flex items-center">
                                                <AlertTriangle className="w-4 h-4 mr-2" />
                                                Confidence: {parseFloat(recognition.confidenceScore).toFixed(2)}%
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {person.recognizedPerson.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        No detections recorded
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
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