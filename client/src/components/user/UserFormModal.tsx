import { useState } from 'react';
import { X, Upload } from 'lucide-react';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    role: string;
    designation: string;
    userImageUrl?: string;
}

interface UserFormModalProps {
    user?: User | null;
    onSubmit: (id: string, formData: FormData) => Promise<void>;
    onClose: () => void;
}

export default function UserFormModal({ user, onSubmit, onClose }: UserFormModalProps) {
    const [image, setImage] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData();

        // Add form fields to FormData
        const firstName = (form.elements.namedItem('firstName') as HTMLInputElement).value;
        const lastName = (form.elements.namedItem('lastName') as HTMLInputElement).value;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
        const username = (form.elements.namedItem('username') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;
        const role = (form.elements.namedItem('role') as HTMLSelectElement).value;
        const designation = (form.elements.namedItem('designation') as HTMLInputElement).value;

        formData.append('firstName', firstName);
        formData.append('lastName', lastName);
        formData.append('email', email);
        formData.append('username', username);
        formData.append('password', password);
        formData.append('role', role);
        formData.append('designation', designation);

        // Add image if selected
        if (image) {
            formData.append('userImageUrl', image);
        }

        try {
            await onSubmit(user?.id || '', formData);
        } catch (error) {
            console.error('Form submission error:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">
                        {user ? 'Edit User' : 'Create New User'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
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
                                defaultValue={user?.firstName}
                                required
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                defaultValue={user?.lastName}
                                required
                                className="w-full p-2 border rounded"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            defaultValue={user?.email}
                            required
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Username</label>
                        <input
                            type="text"
                            name="username"
                            defaultValue={user?.username}
                            required
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            required={!user}
                            className="w-full p-2 border rounded"
                            placeholder={user ? '(Leave blank to keep current)' : ''}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Role</label>
                        <select
                            name="role"
                            defaultValue={user?.role || 'non-admin'}
                            className="w-full p-2 border rounded"
                        >
                            <option value="non-admin">Non-Admin</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Designation</label>
                        <input
                            type="text"
                            name="designation"
                            defaultValue={user?.designation}
                            required
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Profile Image</label>
                        <div className="flex items-center space-x-4">
                            {(user?.userImageUrl || image) && (
                                <img
                                    src={image ? URL.createObjectURL(image) : user?.userImageUrl}
                                    alt="Preview"
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            )}
                            <label className="btn btn-secondary cursor-pointer">
                                <Upload className="w-4 h-4 mr-2" />
                                Choose Image
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            {user ? 'Update User' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 