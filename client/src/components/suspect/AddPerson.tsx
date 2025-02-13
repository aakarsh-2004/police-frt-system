import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { Upload } from 'lucide-react';
import config from '../../config/config';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../config/axios';

interface LocationState {
    defaultType?: 'suspect' | 'missing-person';
}

export default function AddPerson() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { defaultType } = (location.state as LocationState) || {};
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        age: '',
        dateOfBirth: '',
        address: '',
        type: defaultType || 'suspect' as 'suspect' | 'missing-person',
        riskLevel: 'low',
        lastSeenDate: '',
        lastSeenLocation: '',
        reportBy: '',
        gender: 'male' as 'male' | 'female' | 'other',
        email: '',
        phone: '',
        nationality: '',
        nationalId: ''
    });

    useEffect(() => {
        if (!user) {
            toast.error('Please login to add a person');
            navigate('/login');
        }
    }, [user, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submitData = new FormData();
            
            submitData.append('firstName', formData.firstName);
            submitData.append('lastName', formData.lastName);
            submitData.append('age', formData.age);
            submitData.append('dateOfBirth', formData.dateOfBirth);
            submitData.append('address', formData.address);
            submitData.append('type', formData.type);
            submitData.append('gender', formData.gender);
            submitData.append('email', formData.email);
            submitData.append('phone', formData.phone);
            submitData.append('nationalId', formData.nationalId);
            submitData.append('nationality', formData.nationality);

            if (formData.type === 'suspect') {
                submitData.append('riskLevel', formData.riskLevel);
            }

            if (formData.type === 'missing-person') {
                submitData.append('missingPerson', JSON.stringify({
                    lastSeenDate: formData.lastSeenDate,
                    lastSeenLocation: formData.lastSeenLocation,
                    reportBy: formData.reportBy
                }));
            }

            if (selectedImage) {
                submitData.append('personImage', selectedImage);
            }

            if (user?.role !== 'admin') {
                const response = await axiosInstance.post(
                    '/api/requests',
                    submitData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                toast.success('Request submitted successfully');
                navigate('/requests');
            } else {
                const response = await axios.post(
                    `${config.apiUrl}/api/persons`,
                    submitData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                toast.success(`${formData.type === 'suspect' ? 'Suspect' : 'Missing Person'} added successfully`);
                navigate(`/person/${response.data.data.id}`);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">
                    Add New {formData.type === 'suspect' ? 'Suspect' : 'Missing Person'}
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
                        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Person Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    required
                                >
                                    <option value="suspect">Suspect</option>
                                    <option value="missing-person">Missing Person</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    required
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Age</label>
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Date of Birth</label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    required
                                />
                            </div>

                            {formData.type === 'suspect' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Risk Level</label>
                                    <select
                                        name="riskLevel"
                                        value={formData.riskLevel}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            )}

                            {formData.type === 'missing-person' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Last Seen Date</label>
                                        <input
                                            type="date"
                                            name="lastSeenDate"
                                            value={formData.lastSeenDate}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Last Seen Location</label>
                                        <input
                                            type="text"
                                            name="lastSeenLocation"
                                            value={formData.lastSeenLocation}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Report By</label>
                                        <input
                                            type="text"
                                            name="reportBy"
                                            value={formData.reportBy}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="+91 XXXXX XXXXX"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">National ID</label>
                                <input
                                    type="text"
                                    name="nationalId"
                                    value={formData.nationalId}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="Enter National ID"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Nationality</label>
                                <input
                                    type="text"
                                    name="nationality"
                                    value={formData.nationality}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="Enter Nationality"
                                />
                            </div>

                            <div className="md:col-span-2 mt-4">
                                <label className="block text-sm font-medium mb-1">Profile Image</label>
                                <div className="flex items-center space-x-4">
                                    {selectedImage && (
                                        <img
                                            src={URL.createObjectURL(selectedImage)}
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
                                            onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={() => navigate('/suspects')}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {user?.role === 'admin' ? (loading ? 'Adding...' : `Add ${formData.type === 'suspect' ? 'Suspect' : 'Missing Person'}`) : (loading ? 'Adding...' : 'Submit Request')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 