import { useState } from 'react';
import { X } from 'lucide-react';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    role: string;
    designation: string;
    userImageUrl?: string;
    phone: string;
}

interface UserFormModalProps {
    user?: User;
    onSubmit: (id: string, data: FormData) => Promise<void>;
    onClose: () => void;
}

export default function UserFormModal({ user, onSubmit, onClose }: UserFormModalProps) {
    const [image, setImage] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const form = e.currentTarget;
            const formData = new FormData();

            // Add all form fields to FormData
            formData.append('firstName', (form.elements.namedItem('firstName') as HTMLInputElement).value);
            formData.append('lastName', (form.elements.namedItem('lastName') as HTMLInputElement).value);
            formData.append('email', (form.elements.namedItem('email') as HTMLInputElement).value);
            formData.append('username', (form.elements.namedItem('username') as HTMLInputElement).value);
            
            // Only append password for new users
            if (!user) {
                formData.append('password', (form.elements.namedItem('password') as HTMLInputElement).value);
            }
            
            formData.append('role', (form.elements.namedItem('role') as HTMLSelectElement).value);
            formData.append('designation', (form.elements.namedItem('designation') as HTMLInputElement).value);
            formData.append('phone', (form.elements.namedItem('phone') as HTMLInputElement).value);

            // Add image if selected
            if (image) {
                formData.append('userImageUrl', image);
            }

            await onSubmit(user?.id || '', formData);
            onClose();
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {user ? 'Edit User' : 'Create New User'}
                    </h2>
                    <button 
                        onClick={onClose}
                        type="button" 
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Content - Scrollable */}
                <div className="overflow-y-auto flex-1 p-4">
                    <form id="userForm" onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    defaultValue={user?.firstName}
                                    required
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    defaultValue={user?.lastName}
                                    required
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
                            <input
                                type="email"
                                name="email"
                                defaultValue={user?.email}
                                required
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Username</label>
                            <input
                                type="text"
                                name="username"
                                defaultValue={user?.username}
                                required
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                            />
                        </div>

                        {!user && (
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Role</label>
                            <select 
                                name="role"
                                defaultValue={user?.role || 'non-admin'}
                                required
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                            >
                                <option value="admin">Admin</option>
                                <option value="non-admin">Non-Admin</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Designation</label>
                            <input
                                type="text"
                                name="designation"
                                defaultValue={user?.designation}
                                required
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                defaultValue={user?.phone}
                                required
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Profile Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImage(e.target.files?.[0] || null)}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                            />
                        </div>
                    </form>
                </div>

                {/* Footer - Fixed at bottom */}
                <div className="border-t dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="userForm"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Processing...' : (user ? 'Update' : 'Create')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 