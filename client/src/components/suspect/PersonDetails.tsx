import React from 'react';
import { MapPin, Calendar, AlertTriangle, User, Info, Clock, FileText } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config/config';

interface Recognition {
    id: string;
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

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) return <div>Loading...</div>;
    if (!person) return <div>Person not found</div>;

    return (
        <div className="p-6">
            <button 
                onClick={handleBack}
                className="mb-4 btn btn-secondary"
            >
                Back
            </button>
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

                    {/* Right Column - Detections */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-xl font-bold mb-4">Recent Detections</h2>
                            <div className="space-y-4">
                                {person.recognizedPerson.map((recognition) => (
                                    <div key={recognition.id} className="border rounded-lg p-4">
                                        <img 
                                            src={recognition.capturedImageUrl} 
                                            alt="Detection" 
                                            className="w-full h-48 object-cover rounded-lg mb-3"
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