import { useState } from 'react';
import { Users, Shield, UserPlus, Search, Filter, MoreVertical, Edit2, UserMinus, UserCheck } from 'lucide-react';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'supervisor' | 'officer';
    status: 'active' | 'inactive';
    department: string;
    lastActive: string;
    permissions: string[];
}

const mockUsers: User[] = [
    {
        id: 'USR001',
        name: 'Inspector Sharma',
        email: 'sharma@mppolice.gov.in',
        role: 'admin',
        status: 'active',
        department: 'Cyber Crime',
        lastActive: '2024-03-14 10:45:23',
        permissions: ['manage_users', 'manage_cases', 'manage_system']
    },
    {
        id: 'USR002',
        name: 'Officer Kumar',
        email: 'kumar@mppolice.gov.in',
        role: 'supervisor',
        status: 'active',
        department: 'Criminal Investigation',
        lastActive: '2024-03-14 10:30:00',
        permissions: ['manage_cases', 'view_analytics']
    }
];

const roleStyles = {
    admin: 'bg-red-100 text-red-800',
    supervisor: 'bg-blue-100 text-blue-800',
    officer: 'bg-green-100 text-green-800'
};

const statusStyles = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800'
};

export default function UserManagement() {
    const [users] = useState<User[]>(mockUsers);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);

    const handlePromoteUser = (user: User) => {
        // Implement promotion logic
        console.log('Promoting user:', user.id);
    };

    const handleDemoteUser = (user: User) => {
        // Implement demotion logic
        console.log('Demoting user:', user.id);
    };

    return (
        <div className="p-6">
            <div className="max-w-[2000px] mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <Users className="w-6 h-6 text-blue-900" />
                        <h1 className="text-2xl font-bold">User Management</h1>
                    </div>

                    <button
                        onClick={() => setShowUserModal(true)}
                        className="btn btn-primary"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add New User
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="mb-6 flex items-center space-x-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users by name, email, or department..."
                            className="w-full pl-12 pr-4 py-3 bg-white border rounded-lg shadow-sm 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <button className="btn btn-secondary">
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                    </button>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Department
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Last Active
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <Users className="w-6 h-6 text-gray-500" />
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {user.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                                 ${roleStyles[user.role]}`}>
                                            {user.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.department}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                                 ${statusStyles[user.status]}`}>
                                            {user.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.lastActive}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => handlePromoteUser(user)}
                                                className="p-2 hover:bg-blue-100 rounded-full text-blue-600"
                                                title="Promote User"
                                            >
                                                <UserCheck className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDemoteUser(user)}
                                                className="p-2 hover:bg-red-100 rounded-full text-red-600"
                                                title="Demote User"
                                            >
                                                <UserMinus className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowPermissionsModal(true);
                                                }}
                                                className="p-2 hover:bg-gray-100 rounded-full"
                                                title="Manage Permissions"
                                            >
                                                <Shield className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowUserModal(true);
                                                }}
                                                className="p-2 hover:bg-gray-100 rounded-full"
                                                title="Edit User"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 hover:bg-gray-100 rounded-full">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}