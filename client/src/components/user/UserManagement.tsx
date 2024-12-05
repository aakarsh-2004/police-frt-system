import { useState, useEffect } from 'react';
import { Users, UserPlus, Edit2, Trash2 } from 'lucide-react';
import axios from 'axios';
import config from '../../config/config';
import { useAuth } from '../../context/AuthContext';
import UserFormModal from './UserFormModal';
import { toast } from 'react-hot-toast';

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

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/api/users`);
            // Filter out admin users if current user is admin
            const filteredUsers = response.data.filter((user: User) => 
                user.role !== 'admin' || user.id === currentUser?.id
            );
            setUsers(filteredUsers);
        } catch (err) {
            setError('Failed to fetch users');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (id: string, formData: FormData) => {
        try {
            await axios.post(`${config.apiUrl}/api/users`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchUsers();
            setShowCreateModal(false);
        } catch (err) {
            console.error('Error creating user:', err);
            setError('Failed to create user');
        }
    };

    const handleUpdateUser = async (id: string, formData: FormData) => {
        try {
            await axios.put(`${config.apiUrl}/api/users/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchUsers();
            setEditingUser(null);
        } catch (err) {
            console.error('Error updating user:', err);
            setError('Failed to update user');
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        
        try {
            await axios.delete(`${config.apiUrl}/api/users/${id}`);
            fetchUsers();
        } catch (err) {
            console.error('Error deleting user:', err);
            setError('Failed to delete user');
        }
    };

    const handleSubmit = async (id: string, formData: FormData) => {
        try {
            if (id) {
                // Update existing user
                await axios.put(`${config.apiUrl}/api/users/${id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success('User updated successfully');
            } else {
                // Create new user
                await axios.post(`${config.apiUrl}/api/users`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success('User created successfully');
            }
            // Refresh user list
            fetchUsers();
            setShowCreateModal(false);
        } catch (error) {
            console.error('Error submitting user form:', error);
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || 'Failed to process user');
            } else {
                toast.error('An unexpected error occurred');
            }
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="p-6">
            <div className="max-w-[2000px] mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <Users className="w-6 h-6 text-blue-900" />
                        <h1 className="text-2xl font-bold">User Management</h1>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn btn-primary flex items-center"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add New User
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden dark:bg-gray-800">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Designation</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                {user.userImageUrl ? (
                                                    <img
                                                        src={user.userImageUrl}
                                                        alt={user.firstName}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <Users className="w-6 h-6 text-gray-500" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-400">
                                                    {user.firstName} {user.lastName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium dark:text-gray-600
                                            ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {user.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.designation}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => setEditingUser(user)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit User Modal */}
            {(showCreateModal || editingUser) && (
                <UserFormModal
                    user={editingUser}
                    onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
                    onClose={() => {
                        setShowCreateModal(false);
                        setEditingUser(null);
                    }}
                />
            )}
        </div>
    );
}