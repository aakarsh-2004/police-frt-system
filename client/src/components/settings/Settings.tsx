import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Shield, User, Bell, Lock, Globe, Moon, HelpCircle, Upload, ChevronRight } from 'lucide-react';
import { useTheme } from '../../context/themeContext';
import axios from 'axios';
import config from '../../config/config';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

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
    const { currentLanguage, changeLanguage } = useLanguage();
    const { t } = useTranslation();
    const navigate = useNavigate();

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
                    <label className="block text-sm font-medium mb-1">
                        {currentLanguage === 'en' ? 'First Name' : 'पहला नाम'}
                    </label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                        required
                    />
                </div> 
                <div>
                    <label className="block text-sm font-medium mb-1">
                        {currentLanguage === 'en' ? 'Last Name' : 'अंतिम नाम'}
                    </label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
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
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
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
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
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
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
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
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                    {currentLanguage === 'en' ? 'Profile Image' : 'प्रोफ़ाइल छवि'}
                </label>
                <div className="flex items-center space-x-4">
                    <label className="btn btn-secondary cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        {currentLanguage === 'en' ? 'Choose Image' : 'छवि चुनें'}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </label>
                    {newImage && (
                        <span className="text-sm text-gray-600">
                            {currentLanguage === 'en' ? 'New image selected' : 'नई छवि चुनी गई'}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex space-x-4">
                <button type="submit" className="btn btn-primary">
                    {currentLanguage === 'en' ? 'Save Changes' : 'परिवर्तन सहेजें'}
                </button>
                <button 
                    type="button" 
                    onClick={() => setIsEditing(false)}
                    className="btn btn-secondary"
                >
                    {currentLanguage === 'en' ? 'Cancel' : 'रद्द करें'}
                </button>
            </div>
        </form>
    );

    const handleLogout = () => {
        if (window.confirm(currentLanguage === 'en' ? 'Are you sure you want to logout?' : 'क्या आप लॉग आउट करना चाहते हैं?')) {
            logout();
        }
    };

    const handleLanguageToggle = () => {
        const newLanguage = currentLanguage === 'en' ? 'hi' : 'en';
        changeLanguage(newLanguage);
        toast.success(newLanguage === 'en' ? 'Language changed to English' : 'भाषा हिंदी में बदल दी गई है');
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-8">
                {currentLanguage === 'en' ? 'Settings' : 'सेटिंग्स'}
            </h1>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    {currentLanguage === 'en' ? 'Profile Settings' : 'प्रफ़ाइल सेटिंग्स'}
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
                        {currentLanguage === 'en' ? 'Update Profile' : 'प्रो़ाइल अपडेट करें'}
                    </button>
                ) : renderUpdateForm()}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                        <Shield className="w-5 h-5 mr-2" />
                        {currentLanguage === 'en' ? 'Security' : 'सुरक्षा'}
                    </h2>
                    <div className="space-y-4">
                        <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between">
                            <div className="flex items-center">
                                <Lock className="w-5 h-5 mr-3 text-gray-400" />
                                <span>{currentLanguage === 'en' ? 'Change Password' : 'पासवर्ड बदलें'}</span>
                            </div>
                        </button>
                        <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between">
                            <div className="flex items-center">
                                <Bell className="w-5 h-5 mr-3 text-gray-400" />
                                <span>{currentLanguage === 'en' ? 'Notification Settings' : 'सूचना सेटिंग्स'}</span>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-lg font-semibold mb-4">
                        {currentLanguage === 'en' ? 'Preferences' : 'प्राथमिकताएं'}
                    </h2>
                    <div className="space-y-4">
                        <button 
                            onClick={toggleTheme}
                            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                        >
                            <div className="flex items-center">
                                <Moon className="w-5 h-5 mr-3 text-gray-400" />
                                <span>{currentLanguage === 'en' ? 'Dark Mode' : 'डार्क मोड'}</span>
                            </div>
                            <div className={`w-11 h-6 rounded-full transition-colors ${isDarkMode ? 'bg-amber-500' : 'bg-gray-200'} relative`}>
                                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                            </div>
                        </button>
                        <button 
                            onClick={handleLanguageToggle}
                            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                        >
                            <div className="flex items-center">
                                <Globe className="w-5 h-5 mr-3 text-gray-400" />
                                <span>{currentLanguage === 'en' ? 'Language' : 'भाषा'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">
                                    {currentLanguage === 'en' ? 'English' : 'हिंदी'}
                                </span>
                                <div className={`w-11 h-6 rounded-full transition-colors ${currentLanguage === 'hi' ? 'bg-amber-500' : 'bg-gray-200'} relative`}>
                                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${currentLanguage === 'hi' ? 'translate-x-6' : 'translate-x-1'}`} />
                                </div>
                            </div>
                        </button>
                        <button 
                            onClick={() => navigate('/settings/help-support')}
                            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                        >
                            <div className="flex items-center">
                                <HelpCircle className="w-5 h-5 mr-3 text-gray-400" />
                                <span>{currentLanguage === 'en' ? 'Help & Support' : 'सहायता और समर्थन'}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
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
                    <span>{currentLanguage === 'en' ? 'Logout' : 'लॉग आउट'}</span>
                </button>
            </div>
        </div>
    );
}