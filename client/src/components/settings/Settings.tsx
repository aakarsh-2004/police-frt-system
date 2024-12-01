import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Shield, User, Bell, Lock, Globe, Moon, HelpCircle, Upload } from 'lucide-react';
import { useTheme } from '../../context/themeContext';
import axios from 'axios';
import config from '../../config/config';
import { toast } from 'react-hot-toast';

export default function Settings() {
    const { user, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [newImage, setNewImage] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        designation: user?.designation || '',
        username: user?.username || ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setNewImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const submitData = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                submitData.append(key, value);
            });

            if (newImage) {
                submitData.append('userImageUrl', newImage);
            }

            await axios.put(`${config.apiUrl}/api/users/${user?.id}`, submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success('Profile updated successfully');
            setIsEditing(false);
            // Refresh the page or update user context
            window.location.reload();
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        }
    };

    const renderUpdateForm = () => (
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
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
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Designation</label>
                <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Profile Image</label>
                <div className="flex items-center space-x-4">
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
                    {newImage && <span className="text-sm text-gray-600">New image selected</span>}
                </div>
            </div>

            <div className="flex space-x-4">
                <button type="submit" className="btn btn-primary">
                    Save Changes
                </button>
                <button 
                    type="button" 
                    onClick={() => setIsEditing(false)}
                    className="btn btn-secondary"
                >
                    Cancel
                </button>
            </div>
        </form>
    );

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-8">Settings</h1>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Profile Settings
                </h2>
                <div className="flex items-center space-x-4 mb-4">
                    {user?.userImageUrl ? (
                        <img 
                            src={user.userImageUrl}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="w-20 h-20 rounded-full object-cover border-2 border-amber-400"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-amber-500 flex items-center justify-center">
                            <User className="w-10 h-10 text-white" />
                        </div>
                    )}
                    <div>
                        <h3 className="font-medium">{user?.firstName} {user?.lastName}</h3>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                        <p className="text-xs text-amber-500">{user?.role}</p>
                    </div>
                </div>
                {!isEditing ? (
                    <button 
                        className="btn btn-secondary text-sm"
                        onClick={() => setIsEditing(true)}
                    >
                        Update Profile
                    </button>
                ) : renderUpdateForm()}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                        <Shield className="w-5 h-5 mr-2" />
                        Security
                    </h2>
                    <div className="space-y-4">
                        <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between">
                            <div className="flex items-center">
                                <Lock className="w-5 h-5 mr-3 text-gray-400" />
                                <span>Change Password</span>
                            </div>
                        </button>
                        <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between">
                            <div className="flex items-center">
                                <Bell className="w-5 h-5 mr-3 text-gray-400" />
                                <span>Notification Settings</span>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-lg font-semibold mb-4">Preferences</h2>
                    <div className="space-y-4">
                        <button 
                            onClick={toggleTheme}
                            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                        >
                            <div className="flex items-center">
                                <Moon className="w-5 h-5 mr-3 text-gray-400" />
                                <span>Dark Mode</span>
                            </div>
                            <div className={`w-11 h-6 rounded-full transition-colors ${isDarkMode ? 'bg-amber-500' : 'bg-gray-200'} relative`}>
                                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                            </div>
                        </button>
                        <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between">
                            <div className="flex items-center">
                                <Globe className="w-5 h-5 mr-3 text-gray-400" />
                                <span>Language</span>
                            </div>
                            <span className="text-sm text-gray-500">English</span>
                        </button>
                        <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between">
                            <div className="flex items-center">
                                <HelpCircle className="w-5 h-5 mr-3 text-gray-400" />
                                <span>Help & Support</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <button 
                    onClick={handleLogout}
                    className="w-full md:w-auto btn bg-red-500 hover:bg-red-600 text-white flex items-center justify-center space-x-2 px-6"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}