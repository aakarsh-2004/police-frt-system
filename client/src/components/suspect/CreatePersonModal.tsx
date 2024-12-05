import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreatePersonModalProps {
    onClose: () => void;
    onSubmit: (formData: FormData) => Promise<void>;
    type: 'suspect' | 'missing-person';
    isSubmitting: boolean;
}

export default function CreatePersonModal({ onClose, onSubmit, type, isSubmitting }: CreatePersonModalProps) {
    const [image, setImage] = useState<File | null>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData();

        // Add all form fields to FormData
        formData.append('firstName', form.firstName.value);
        formData.append('lastName', form.lastName.value);
        formData.append('age', form.age.value);
        formData.append('dateOfBirth', form.dateOfBirth.value);
        formData.append('gender', form.gender.value);
        formData.append('email', form.email.value);
        formData.append('phone', form.phone.value);
        formData.append('address', form.address.value);
        formData.append('type', type);
        formData.append('nationality', form.nationality?.value || '');
        formData.append('nationalId', form.nationalId?.value || '');

        // Add the image file
        const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput?.files?.[0]) {
            formData.append('personImageUrl', fileInput.files[0]);
        }

        // Add type-specific fields
        if (type === 'suspect') {
            formData.append('riskLevel', form.riskLevel.value);
        } else if (type === 'missing-person') {
            formData.append('lastSeenDate', form.lastSeenDate.value);
            formData.append('lastSeenLocation', form.lastSeenLocation.value);
            formData.append('missingSince', form.lastSeenDate.value); // Using same date as lastSeenDate
            formData.append('status', 'active');
            formData.append('reportBy', form.reportBy.value);
        }

        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:text-gray-300">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">
                        Add New {type === 'suspect' ? 'Suspect' : 'Missing Person'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                required
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                required
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Age</label>
                            <input
                                type="number"
                                name="age"
                                required
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Gender</label>
                            <select name="gender" required className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500">
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Date of Birth</label>
                        <input
                            type="date"
                            name="dateOfBirth"
                            required
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Phone</label>
                        <input
                            type="tel"
                            name="phone"
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Address</label>
                        <textarea
                            name="address"
                            required
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Photo</label>
                        <input
                            type="file"
                            name="personImageUrl"
                            accept="image/*"
                            required
                            onChange={(e) => setImage(e.target.files?.[0] || null)}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500"
                        />
                    </div>

                    {type === 'suspect' && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Risk Level</label>
                            <select name="riskLevel" required className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500">
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    )}

                    {type === 'missing-person' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-1">Last Seen Date</label>
                                <input
                                    type="datetime-local"
                                    name="lastSeenDate"
                                    required
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Last Seen Location</label>
                                <input
                                    type="text"
                                    name="lastSeenLocation"
                                    required
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Report By</label>
                                <input
                                    type="text"
                                    name="reportBy"
                                    required
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500"
                                />
                            </div>
                        </>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">National ID</label>
                            <input
                                type="text"
                                name="nationalId"
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Nationality</label>
                            <input
                                type="text"
                                name="nationality"
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating...
                                </span>
                            ) : (
                                `Create ${type === 'suspect' ? 'Suspect' : 'Missing Person'}`
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 