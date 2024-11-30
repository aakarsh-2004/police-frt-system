import React from 'react';
import { MapPin, Calendar, AlertTriangle, User, Info, Clock, FileText, Edit2, Trash2, Upload } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config/config';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

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

    const handleUpdate = async () => {
        try {
            const formData = new FormData();
            
            // Add all form fields
            Object.keys(formData).forEach(key => {
                formData.append(key, formData[key as keyof typeof formData]);
            });

            // Add the new image if selected
            if (newImage) {
                formData.append('personImageUrl', newImage);
            }

            const response = await axios.put(`${config.apiUrl}/api/persons/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setPerson(response.data.data);
            setIsEditing(false);
            setNewImage(null);
            toast.success('Details updated successfully');
        } catch (error) {
            console.error('Error updating person:', error);
            toast.error('Failed to update details');
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
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Last Name</label>
                        <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                            className="w-full p-2 border rounded"
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
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Date of Birth</label>
                        <input
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                </div>

                {person?.type === 'suspect' && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Risk Level</label>
                        <select
                            value={formData.riskLevel}
                            onChange={(e) => setFormData({...formData, riskLevel: e.target.value})}
                            className="w-full p-2 border rounded"
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
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Last Seen Location</label>
                            <input
                                type="text"
                                value={formData.lastSeenLocation}
                                onChange={(e) => setFormData({...formData, lastSeenLocation: e.target.value})}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                    </>
                )}

                <div>
                    <label className="block text-sm font-medium mb-1">Profile Image</label>
                    <div className="flex items-center space-x-4">
                        {(newImage || person?.personImageUrl) && (
                            <img
                                src={newImage ? URL.createObjectURL(newImage) : person?.personImageUrl}
                                alt="Preview"
                                className="w-24 h-24 rounded-lg object-cover"
                            />
                        )}
                        <label className="btn btn-secondary cursor-pointer">
                            <Upload className="w-4 h-4 mr-2" />
                            Choose New Image
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => setNewImage(e.target.files?.[0] || null)}
                            />
                        </label>
                        {newImage && (
                            <button
                                onClick={() => setNewImage(null)}
                                className="text-sm text-red-600 hover:text-red-800"
                            >
                                Remove
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex justify-end space-x-2">
                    <button
                        onClick={() => setIsEditing(false)}
                        className="btn btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpdate}
                        className="btn btn-primary"
                    >
                        Save Changes
                    </button>
                </div>
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
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-4">
                                    <img 
                                        src={person.personImageUrl} 
                                        alt={`${person.firstName} ${person.lastName}`}
                                        className="w-24 h-24 rounded-full object-cover"
                                    />
                                    <div>
                                        <h1 className="text-2xl font-bold">
                                            {person.firstName} {person.lastName}
                                        </h1>
                                        <p className="text-gray-500">ID: {person.id}</p>
                                    </div>
                                </div>
                                {person.type === 'suspect' && (
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium
                                        ${person.suspect?.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                                        person.suspect?.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'}`}>
                                        {person.suspect?.riskLevel.toUpperCase()} Risk
                                    </span>
                                )}
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
                            <div className="bg-white rounded-lg shadow-lg p-6">
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
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-xl font-bold mb-4">Recent Detections</h2>
                            {/* Add max height and scrolling */}
                            <div className="space-y-4 max-h-[600px] overflow-y-auto">
                                {person.recognizedPerson.map((recognition) => (
                                    <div key={recognition.id} className="border rounded-lg p-4">
                                        <img 
                                            src={recognition.capturedImageUrl} 
                                            alt="Detection" 
                                            className="w-full h-32 object-cover rounded-lg mb-3"
                                        />
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
        </div>
    );
} 